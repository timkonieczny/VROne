var video,                                      // HTML5 video element
    videoCanvas,                                // canvas used for marker detection
    context,                                    // 2D canvas for video
    imageData,                                  // video data
    isVideoInitialized = false;                 // true if video canvas has same dimensions as video footage

configuration = {
    speed: 1 / 1000,
    updatesPerSecond: 30,
    imageSamples: 1,
    prediction: false,
    filterSamples: 1,
    filtering: false,
    filterMethod: 1
};

var addHTMLElements = function(){

    // add HTML elements

    video = document.createElement("video");
    video.setAttribute("autoplay", "true");
    video.setAttribute("style", "display:none");
    videoCanvas = document.createElement("canvas");
    document.body.insertBefore(video, document.body.firstChild);
    document.body.insertBefore(videoCanvas, video);

    // initialize camera

    context = videoCanvas.getContext("2d");

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

    var getCamera = function(sourceInfos) {
        var fallBackCamera;
        for (var i = 0; i < sourceInfos.length; i++) {
            if (sourceInfos[i].kind === "video") {
                if (sourceInfos[i].facing !== "environment") {
                    constraints = {
                        video: {
                            optional: [
                                {sourceId: sourceInfos[i].id},
                                {frameRate: 60}
                            ]
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
        console.warn("This browser doesn't support MediaStreamTrack. Back facing camera can't be used.");
        navigator.getUserMedia({audio: false, video:true}, successCallback, errorCallback)
    } else {
        MediaStreamTrack.getSources(getCamera);
    }
};

window.onload = function() {
    addHTMLElements();      // TODO: wrap everything in onload
    updateImageData();
};

var detector,
    posit,
    pose;

var markerPosition = [0.0,0.0,0.0];

var foundMarkers;

var socket = io.connect("http://localhost:3000");


var updateImageData = function(){
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if(!isVideoInitialized){
            videoCanvas.height = video.videoHeight;
            videoCanvas.width = video.videoWidth;
            detector = new AR.Detector(videoCanvas.width, videoCanvas.height);
            posit = new POS.Posit(80, videoCanvas.width);
            isVideoInitialized = true;
        }

        context.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
        imageData = context.getImageData(0, 0, videoCanvas.width, videoCanvas.height).data;

        foundMarkers = detector.detect(imageData);

        imageData = null;

        if(foundMarkers.length > 0){
            for(var i = 0; i < foundMarkers[0].corners.length; i++){
                foundMarkers[0].corners[i].x -= videoCanvas.width / 2;
                foundMarkers[0].corners[i].y = -foundMarkers[0].corners[i].y + videoCanvas.height / 2;
            }

            pose = posit.pose(foundMarkers[0].corners);

            markerPosition[0] = pose.bestTranslation[0];
            markerPosition[1] = pose.bestTranslation[1];
            markerPosition[2] = pose.bestTranslation[2];
        }
        socket.emit('position', markerPosition);
    }
    window.requestAnimationFrame(updateImageData);
};