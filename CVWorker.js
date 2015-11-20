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


var init = function(markerSize, canvasWidth, canvasHeight){
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    detector = new AR.Detector(canvas.width, canvas.height);
    posit = new POS.Posit(markerSize, canvasWidth);
    console.log("init done");
};

var markerPosition = [0.0, 0.0, 0.0];

var update = function(imageData){

    foundMarkers = detector.detect(imageData);

    imageData = null;

    if(foundMarkers.length > 0){
        for(var i = 0; i < foundMarkers[0].corners.length; i++){
            foundMarkers[0].corners[i].x -= canvas.width / 2;
            foundMarkers[0].corners[i].y = -foundMarkers[0].corners[i].y + canvas.height / 2;
        }

        pose = posit.pose(foundMarkers[0].corners);

        if (filtering.enabled) {
            pose.bestTranslation = filtering.functions[filtering.function](pose.bestTranslation);
        }

        markerPosition[0] = pose.bestTranslation[0];
        markerPosition[1] = pose.bestTranslation[1];
        markerPosition[2] = -pose.bestTranslation[2];

    }else{
        self.postMessage(false);
        if(filtering.enabled){
            filtering.previousPositions = [];
        }
    }

    self.postMessage(markerPosition);
};


self.addEventListener('message', function(e) {
    if(e.data.data !== undefined){
        update(e.data.data);
    }else if(e.data.markerSize !== undefined){
        init(e.data.markerSize, e.data.canvasWidth, e.data.canvasHeight);
    }else if(e.data.filtering !== undefined){
        filtering.enabled = e.data.filtering;
        filtering.samples = e.data.filterSamples;
        filtering.function = e.data.filterMethod;
    }
}, false);


var log = function(message){
    self.postMessage("log:\t" + message);
};