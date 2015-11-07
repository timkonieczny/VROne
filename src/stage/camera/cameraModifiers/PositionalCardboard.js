/**
 * jslint browser: true
 */

/**
 * Creates new VR device configuration for Google Cardboard (and similar viewers) with experimental positional tracking. Fiducial foundMarkers need to be placed in environment.
 * @class
 * @constructor
 */
VROne.PositionalCardboard = function (markerSize) {

    VROne.CameraModifier.call(this);

    var video,                                      // HTML5 video element
        arucoCanvas,                                // canvas used for marker detection
        context,                                    // 2D canvas for video
        imageData,                                  // video data
        movement = new VROne.Vector3(),
        needNewData = true,
        orientation = new VROne.Quaternion(),
        lastUpdate = Date.now(),
        position = new VROne.Vector3(),             // current position
        frameCounter = 0,                           // counter for frame drop
        processingData = false,                     // indicates if worker is currently processing image data
        workerRunning = false,                      // indicates if worker is currently running
        cvWorker = new Worker("CVWorker.js"),       // worker that handles image processing
        alpha = 0,
        beta = 0,
        gamma = 0,
        alphaOffset = 0,                            // offset used for sensor calibration
        gammaOffset = 0,                            // offset used for sensor calibration
        predictedTranslation = [0, 0, 0];

    var scope = this;

    this.configuration = {
        speed: 1 / 50,
        dropFrames: 1,
        imageSamples: 1,
        prediction: false,
        filterSamples: 1,
        filtering: false,
        filterMethod: 1
    };

    var degToRad = function(degrees){
        return degrees * Math.PI / 180;
    };

    document.getElementById("setDefaultOrientation").onclick = function(){
        alphaOffset = degToRad(-VROne.SensorsHandler.getRoll()+180);
        gammaOffset = degToRad(VROne.SensorsHandler.getYaw()+90);
    };

    cvWorker.addEventListener('message', function(e) {
        if(Array.isArray(e.data)){
            updatePosition(e.data);
        }else{
            console.log(e.data);
        }
    }, false);

    var initCamera = function(){
        video = document.getElementById("video");
        arucoCanvas = document.getElementById("cameraCanvas");
        context = arucoCanvas.getContext("2d");
        arucoCanvas.width = parseInt(arucoCanvas.style.width);
        arucoCanvas.height = parseInt(arucoCanvas.style.height);

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        var constraints;

        var getEnvironmentCamera = function(sourceInfos) {
            var fallBackCamera;
            for (var i = 0; i < sourceInfos.length; i++) {
                if (sourceInfos[i].kind === "video") {
                    if (sourceInfos[i].facing === "environment") {
                        constraints = {
                            video: {
                                optional: [{
                                    sourceId: sourceInfos[i].id
                                }]
                            }
                        };
                    }else{
                        fallBackCamera = sourceInfos[i].id;
                    }
                }
            }

            if(fallBackCamera === undefined){
                console.error("No camera detected");
            }else if(constraints === undefined){
                console.warn("No back-facing camera detected, using front-facing camera.");
                constraints = {
                    video: {
                        optional: [{
                            sourceId: fallBackCamera.id
                        }]
                    }
                };
            }
            if(constraints !== undefined){
                console.log("getting front facing camera");
                var successCallback = function(stream) {
                    if (window.webkitURL) {
                        video.src = window.webkitURL.createObjectURL(stream);
                    } else if (video.mozSrcObject !== undefined) {
                        video.mozSrcObject = stream;
                    } else {
                        video.src = stream;
                    }
                };
                var errorCallback = function(error) {
                    console.error(error);
                };
                navigator.getUserMedia(constraints, successCallback, errorCallback);
            }
        };

        if (typeof MediaStreamTrack === 'undefined' ||
            typeof MediaStreamTrack.getSources === 'undefined') {
            alert("This browser doesn't support MediaStreamTrack. Back facing camera can't be used.");
        } else {
            MediaStreamTrack.getSources(getEnvironmentCamera);
        }
    };

    initCamera();

    var initWorker = function(){
        cvWorker.postMessage({'markerSize': markerSize, 'canvasWidth': arucoCanvas.width, 'canvasHeight': arucoCanvas.height});
    };

    initWorker();

    this.updateConfiguration = function(){
        cvWorker.postMessage({'filtering': scope.configuration.filtering, 'filterMethod': scope.configuration.filterMethod, 'filterSamples': scope.configuration.filterSamples});
    };

    var updateImageData = function(){
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            imageData = [];
            for(var i = 0; i < scope.configuration.imageSamples; i++){
                context.drawImage(video, 0, 0, arucoCanvas.width, arucoCanvas.height);              // TODO: interval is too short. video outputs same frame twice
                imageData.push(context.getImageData(0, 0, arucoCanvas.width, arucoCanvas.height))
            }

            if(!workerRunning) {
                cvWorker.postMessage({'command': 'update', 'data': imageData});
                workerRunning = true;
            }
        }
    };

    var lastPosition = [0,0,0];

    var updatePosition = function(currentPosition){
        //console.log(currentPosition[0] + "\t" + currentPosition[1] + "\t" + currentPosition[2]);
        movement.x = (lastPosition[0] - currentPosition[0]) * scope.configuration.speed;
        movement.y = (lastPosition[1] - currentPosition[1]) * scope.configuration.speed;
        movement.z = (lastPosition[2] - currentPosition[2]) * scope.configuration.speed;
        //console.log(movement.x + "\t" + movement.y + "\t" + movement.z);
        lastPosition = currentPosition;
    };

    this.update = function(){
        frameCounter = (frameCounter + 1) % scope.configuration.dropFrames;
        if(frameCounter == scope.configuration.dropFrames - 1){
            updateImageData();
            if(imageData!==undefined) {                                             // from now on camera delivers a continuous data stream
                cvWorker.postMessage({'command': 'update', 'data': imageData});
                processingData = true;
                needNewData = false;
            }
        }

        var p = (Date.now()-lastUpdate)/1000;
        position.add(movement.x * p, movement.y * p, movement.z * p);

        movement.nullVector();

        lastUpdate = Date.now();

        alpha = degToRad(-VROne.SensorsHandler.getRoll()+180);
        beta = degToRad(-VROne.SensorsHandler.getPitch());
        gamma = degToRad(VROne.SensorsHandler.getYaw()+90);
        if(gammaOffset > Math.PI / 2) {
            gamma += Math.PI - gammaOffset;
            alpha += Math.PI - alphaOffset;
        }else{
            gamma -= gammaOffset;
            alpha -= alphaOffset;
        }
        var c1 = Math.cos(alpha/2);
        var c2 = Math.cos(beta/2);
        var c3 = Math.cos(gamma/2);
        var s1 = Math.sin(alpha/2);
        var s2 = Math.sin(beta/2);
        var s3 = Math.sin(gamma/2);
        orientation.x = s1*s2*c3 +c1*c2*s3;
        orientation.y = s1*c2*c3 + c1*s2*s3;
        orientation.z = -(c1*s2*c3 - s1*c2*s3);
        orientation.w = c1*c2*c3 - s1*s2*s3;
    };

    /**
     * Returns current orientation of the device based on accelerometer / gyroscope as a quaternion
     * @return {VROne.Quaternion} orientation
     */
    this.getOrientation = function(){
        return orientation;
    };

    /**
     * Returns current position
     * @return {VROne.Vector3} orientation
     */
    this.getPosition = function(){
        return position;
    };
};

VROne.Cardboard.prototype = new VROne.CameraModifier();