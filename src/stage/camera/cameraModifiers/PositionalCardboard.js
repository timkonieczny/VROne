/**
 * Creates new VR device configuration for Google Cardboard (and similar viewers) with experimental positional tracking. Fiducial foundMarkers need to be placed in environment.
 * @class
 * @constructor
 */
VROne.PositionalCardboard = function (markerSize, showVideo) {

    VROne.CameraModifier.call(this);

    var scope = this,
        video,                                      // HTML5 video element
        arucoCanvas,                                // canvas used for marker detection
        context,                                    // 2D canvas for video
        imageData,                                  // video data
        needNewData = true,
        orientation = new VROne.Quaternion(),
        position = new VROne.Vector3(),             // current position
        detectionInProcess = false,                     // indicates if worker is currently processing image data
        workerRunning = false,                      // indicates if worker is currently running
        cvWorker = new Worker("CVWorker.js"),       // worker that handles image processing
        alpha = 0,
        beta = 0,
        gamma = 0,
        alphaOffset = 0,                            // offset used for sensor calibration
        gammaOffset = 0,                            // offset used for sensor calibration
        timeSinceLastMarker = 0,                    // counter to determine when new marker frame is needed
        lastPosition = new VROne.Vector3(),         // last valid position obtained through marker used for prediction
        predictedTranslation = new VROne.Vector3(); // translation calculated for prediction

    var time = {
        now: Date.now(),
        last: Date.now(),
        delta: 0
    };

    this.configuration = {
        speed: 1 / 1000,
        updatesPerSecond: 30,
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

    var addHTMLElements = function(){
        video = document.createElement("video");
        video.setAttribute("autoplay", "true");
        video.setAttribute("style", "display:none");
        arucoCanvas = document.createElement("canvas");
        var display = "";
        if(!showVideo)
            display = "; display:none";
        arucoCanvas.setAttribute("style", "position: fixed; z-index: 2; width: 320px; height: 240px; top: 0px" + display);
        arucoCanvas.width = parseInt(arucoCanvas.style.width);
        arucoCanvas.height = parseInt(arucoCanvas.style.height);
        document.body.insertBefore(video, document.body.firstChild);
        document.body.insertBefore(arucoCanvas, video);
    };

    addHTMLElements();

    var initCamera = function(){
        context = arucoCanvas.getContext("2d");

        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
        window.URL =
            window.URL ||
            window.webkitURL ||
            window.mozURL ||
            window.msURL;

        var constraints;
        var successCallback = function(stream) {
            if (window.URL) {
                video.src = window.URL.createObjectURL(stream);
            } else if (video.mozSrcObject !== undefined) {
                video.mozSrcObject = stream;
            } else {
                video.src = stream;
            }
        };
        var errorCallback = function(error) {
            console.error(error);
        };

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

                navigator.getUserMedia(constraints, successCallback, errorCallback);
            }
        };

        if (typeof MediaStreamTrack === 'undefined' || typeof MediaStreamTrack.getSources === 'undefined') {
            alert("This browser doesn't support MediaStreamTrack. Back facing camera can't be used.");
            //navigator.getUserMedia({audio: false, video:true}, successCallback, errorCallback)
            navigator.getUserMedia({audio: false, video:true}, successCallback, errorCallback)
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

    var updatePosition = function(currentPosition){

        position.set(
            -currentPosition[0] * scope.configuration.speed,
            -currentPosition[1] * scope.configuration.speed,
            -currentPosition[2] * scope.configuration.speed
        );

        if(scope.configuration.prediction) {
            predictedTranslation.set(
                -lastPosition.x + position.x,
                -lastPosition.y + position.y,
                -lastPosition.z + position.z
            );

            lastPosition.set(position.x, position.y, position.z);
        }

        detectionInProcess = false;
    };

    this.update = function(){

        console.log(detectionInProcess);

        time.now = Date.now();
        time.delta = time.now - time.last;
        time.last = time.now;
        timeSinceLastMarker += time.delta;

        if(timeSinceLastMarker>=1000 / scope.configuration.updatesPerSecond && !detectionInProcess){
            timeSinceLastMarker = 0;
            updateImageData();
            if(imageData!==undefined) {                                             // from now on camera delivers a continuous data stream
                cvWorker.postMessage({'command': 'update', 'data': imageData});
                detectionInProcess = true;
                needNewData = false;
            }
        }else if(scope.configuration.prediction){
            position.add(
                predictedTranslation.x * time.delta / (1000 / scope.configuration.updatesPerSecond),
                predictedTranslation.y * time.delta / (1000 / scope.configuration.updatesPerSecond),
                predictedTranslation.z * time.delta / (1000 / scope.configuration.updatesPerSecond));
        }

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

        orientation.set(
            s1*s2*c3 +c1*c2*s3,
            s1*c2*c3 + c1*s2*s3,
            -(c1*s2*c3 - s1*c2*s3),
            c1*c2*c3 - s1*s2*s3
        );
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