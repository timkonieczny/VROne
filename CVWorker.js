importScripts(
    "src/third-party/js-aruco/aruco.js",
    "src/third-party/js-aruco/cv.js",
    "src/third-party/js-aruco/posit1.js",
    "src/third-party/js-aruco/posit2.js",
    "src/third-party/js-aruco/svd.js"
);

var foundMarkers = [],
    detector,
    posit,
    pose,
    canvas = {},
    filtering = {
        enabled: false,
        samples: 2,
        function: 0,
        functions: [
            function(position){ // Average of 2 unfiltered samples from previous frames and data from current frame
                filtering.updateSamples();
                filtering.previousPositions[filtering.sampleIndex] = position;
                var averagePosition = [0.0, 0.0, 0.0];
                for(var i = 0; i < filtering.previousPositions.length; i++){
                    averagePosition[0] += filtering.previousPositions[i][0];
                    averagePosition[1] += filtering.previousPositions[i][1];
                    averagePosition[2] += filtering.previousPositions[i][2];
                }
                averagePosition[0] /= filtering.samples;
                averagePosition[1] /= filtering.samples;
                averagePosition[2] /= filtering.samples;
                return averagePosition;
            },
            function(position){ // Average of 2 filtered samples from previous frames and data from current frame
                filtering.updateSamples();
                var averagePosition = position;
                for(var i = 0; i < filtering.previousPositions.length; i++){
                    if(i != filtering.sampleIndex){
                        averagePosition[0] += filtering.previousPositions[i][0];
                        averagePosition[1] += filtering.previousPositions[i][1];
                        averagePosition[2] += filtering.previousPositions[i][2];
                    }
                }
                averagePosition[0] /= filtering.samples;
                averagePosition[1] /= filtering.samples;
                averagePosition[2] /= filtering.samples;
                filtering.previousPositions[filtering.sampleIndex] = averagePosition;
                return averagePosition;
            }
        ],
        updateSamples: function(){
            filtering.sampleIndex = (filtering.sampleIndex + 1) % filtering.samples;

            if (filtering.previousPositions.length == 0) {
                for (var i = 0; i < filtering.samples; i++) {
                    filtering.previousPositions[i] = markerPosition;
                }
            }
        },
        previousPositions: [],
        sampleIndex: 0
    };


var init = function(markerSize, canvasWidth, canvasHeight, numberOfMarkers){
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    detector = new AR.Detector(canvas.width, canvas.height);
    posit = new POS.Posit(markerSize, canvasWidth);
    totalMarkers = numberOfMarkers;
    centerMarkerIndex = Math.floor(numberOfMarkers / 2)
};

var markerPosition = [0.0, 0.0, 0.0];

var totalMarkers;
var isStructureDetected = false;
var primaryMarker;
var secondaryMarkers = [];
var centerMarkerIndex;
var learningFramesNeeded = 1;
var learningFramesFound = 0;

var lowpassEnabled = false;
var lowpassThreshold = 10;
var lastPosition = [];

var learnMarkerStructure = function(imageData){
    foundMarkers = detector.detect(imageData);

    imageData = null;

    if(foundMarkers.length >= totalMarkers){
        for(var i = 0; i < foundMarkers.length; i++){
            for (var j = 0; j < foundMarkers[0].corners.length; j++) {
                foundMarkers[i].corners[j].x -= canvas.width / 2;
                foundMarkers[i].corners[j].y = -foundMarkers[i].corners[j].y + canvas.height / 2;
            }
        }
        if(primaryMarker == undefined) {    // initialize primary and secondary markers
            primaryMarker = {
                id: foundMarkers[centerMarkerIndex].id,
                scale: foundMarkers[centerMarkerIndex].corners[1].x - foundMarkers[centerMarkerIndex].corners[0].x,
                position: foundMarkers[centerMarkerIndex].corners[0]
            };
            for (i = 0; i < foundMarkers.length; i++) {
                if (i != centerMarkerIndex) {
                    secondaryMarkers.push({
                        id: foundMarkers[i].id,
                        distanceToPrimaryMarker: {
                            x: foundMarkers[i].corners[0].x,
                            y: foundMarkers[i].corners[0].y
                        }
                    })
                }
            }
        }else{                                  // improve primary and secondary markers
            for (i = 0; i < foundMarkers.length; i++) {
                if(foundMarkers[i].id == primaryMarker.id){
                    primaryMarker.scale += foundMarkers[centerMarkerIndex].corners[1].x - foundMarkers[centerMarkerIndex].corners[0].x;
                    primaryMarker.position.x += foundMarkers[centerMarkerIndex].corners[0].x;
                    primaryMarker.position.y += foundMarkers[centerMarkerIndex].corners[0].y;
                }else {
                    for (j = 0; j < secondaryMarkers.length; j++) {
                        if (foundMarkers[i].id == secondaryMarkers[j].id) {
                            secondaryMarkers[j].distanceToPrimaryMarker.x += foundMarkers[i].corners[0].x;
                            secondaryMarkers[j].distanceToPrimaryMarker.y += foundMarkers[i].corners[0].y;
                        }
                    }
                }
            }
        }
        learningFramesFound++;
    }else{
        self.postMessage(-2);
    }
    if(learningFramesFound == learningFramesNeeded){
        primaryMarker.scale /= learningFramesNeeded;
        primaryMarker.position.x /= learningFramesNeeded;
        primaryMarker.position.y /= learningFramesNeeded;
        for(i = 0; i < secondaryMarkers.length; i++){
            secondaryMarkers[i].distanceToPrimaryMarker.x /= learningFramesNeeded;
            secondaryMarkers[i].distanceToPrimaryMarker.y /= learningFramesNeeded;
            secondaryMarkers[i].distanceToPrimaryMarker.x = primaryMarker.position.x - secondaryMarkers[i].distanceToPrimaryMarker.x;
            secondaryMarkers[i].distanceToPrimaryMarker.y = primaryMarker.position.y - secondaryMarkers[i].distanceToPrimaryMarker.y;
        }

        isStructureDetected = true;
        self.postMessage(-3);
    }
    self.postMessage(markerPosition);
};

var usedMarkerIndex;

var update = function(imageData){

    foundMarkers = detector.detect(imageData);

    imageData = null;

    if(foundMarkers.length > 0){
        usedMarkerIndex = 0;

        for(var i = 0; i < foundMarkers.length; i++){
            if(foundMarkers[i].id == primaryMarker.id){
                usedMarkerIndex = i;
                break;
            }
        }

        for (i = 0; i < foundMarkers[usedMarkerIndex].corners.length; i++) {
            foundMarkers[usedMarkerIndex].corners[i].x -= canvas.width / 2;
            foundMarkers[usedMarkerIndex].corners[i].y = -foundMarkers[usedMarkerIndex].corners[i].y + canvas.height / 2;
        }

        if(foundMarkers[usedMarkerIndex].id != primaryMarker.id) {
            var currentScale = foundMarkers[0].corners[1].x - foundMarkers[0].corners[0].x;

            for(i = 0; i < secondaryMarkers.length; i++){
                if(secondaryMarkers[i].id == foundMarkers[0].id){
                    for (var j = 0; j < foundMarkers[0].corners.length; j++) {
                        foundMarkers[0].corners[j].x += secondaryMarkers[i].distanceToPrimaryMarker.x * (currentScale / primaryMarker.scale);
                        foundMarkers[0].corners[j].y += secondaryMarkers[i].distanceToPrimaryMarker.y * (currentScale / primaryMarker.scale);
                    }
                    break;
                }
            }
        }
        pose = posit.pose(foundMarkers[usedMarkerIndex].corners);

        if (filtering.enabled) {
            pose.bestTranslation = filtering.functions[filtering.function](pose.bestTranslation);
        }

        // ============== low pass ==============
        if(lowpassEnabled) {
            if (lastPosition.length == 0) {
                lastPosition = [pose.bestTranslation[0], pose.bestTranslation[1], pose.bestTranslation[2]];
            } else {
                if (Math.abs(lastPosition[0] - pose.bestTranslation[0]) > lowpassThreshold)
                    pose.bestTranslation[0] = (lastPosition[0] + pose.bestTranslation[0]) / 2;

                if (Math.abs(lastPosition[1] - pose.bestTranslation[1]) > lowpassThreshold)
                    pose.bestTranslation[1] = (lastPosition[1] + pose.bestTranslation[1]) / 2;

                if (Math.abs(lastPosition[2] - pose.bestTranslation[2]) > lowpassThreshold)
                    pose.bestTranslation[2] = (lastPosition[2] + pose.bestTranslation[2]) / 2;

                lastPosition = [pose.bestTranslation[0], pose.bestTranslation[1], pose.bestTranslation[2]];
            }
        }
        // ======================================

        markerPosition[0] = pose.bestTranslation[0];
        markerPosition[1] = pose.bestTranslation[1];
        markerPosition[2] = -pose.bestTranslation[2];

    }else{
        self.postMessage(-1);
        if(filtering.enabled){
            filtering.previousPositions = [];
        }
    }

    self.postMessage(markerPosition);
};


self.addEventListener('message', function(e) {
    if(e.data.data !== undefined){
        if(isStructureDetected) {
            update(e.data.data);
        }else{
            learnMarkerStructure(e.data.data);
        }
    }else if(e.data.markerSize !== undefined){
        init(e.data.markerSize, e.data.canvasWidth, e.data.canvasHeight, e.data.numberOfMarkers);
    }else if(e.data.filtering !== undefined){
        filtering.enabled = e.data.filtering;
        filtering.samples = e.data.filterSamples;
        filtering.function = e.data.filterMethod;
        lowpassEnabled = e.data.lowpass;
        lowpassThreshold = e.data.lowpassThreshold
    }
}, false);