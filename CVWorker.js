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
    movement,
    filterCounter = 0,
    pose,
    i, j, k,
    filterSamples = 1,
    filtering = false,
    filterMethod = 0,
    pastPositions = [],
    previousPosition = {
        x: 0,
        y: 0,
        z: 0
    },
    goodDataThresholdX = 1,  // TODO: Find threshold dynamically: calculate average of dismissed data. Probably not a good idea
    goodDataThresholdY = 1,
    goodDataThresholdZ = 1,
    invalidCount = 0,
    invalidValues = false,
    debug = {
        invalidData: 0,
        validData: 0
    },
    canvas = {};


var init = function(markerSize, canvasWidth, canvasHeight){
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    detector = new AR.Detector();
    posit = new POS.Posit(markerSize, canvasWidth);
    self.postMessage("init done");
};


var filterResults0 = function(position){  // 3 samples, each averaged in the frames before, distance from last averaged position

    pastPositions[filterCounter] = position;

    var averagePosition = {
        x: 0,
        y: 0,
        z: 0
    };

    for(j = 0; j < pastPositions.length; j++){
        averagePosition.x += pastPositions[j].x;
        averagePosition.y += pastPositions[j].y;
        averagePosition.z += pastPositions[j].z;
    }

    averagePosition.x /= filterSamples;
    averagePosition.y /= filterSamples;
    averagePosition.z /= filterSamples;

    return averagePosition;

};


var filterResults1 = function(position){  // 3 samples of raw data from the frames before, distance from last averaged position
    // TODO: yields unusable results
    var averagePosition = position;
    for(j = filterCounter + 1; j < filterCounter; j = (j + 1)%filterCounter){
        averagePosition.x += pastPositions[j].x;
        averagePosition.y += pastPositions[j].y;
        averagePosition.z += pastPositions[j].z;
    }

    averagePosition.x /= filterSamples;
    averagePosition.y /= filterSamples;
    averagePosition.z /= filterSamples;

    pastPositions[filterCounter] = averagePosition;

    return averagePosition;
};

var markerPosition = {
    x: 0,
    y: 0,
    z: 0
};

var update = function(imageData){

    foundMarkers = detector.detect(imageData[0]);

    if(foundMarkers.length > 0){

        for(var i = 0; i < foundMarkers[0].corners.length; i++){
            foundMarkers[0].corners[i].x -= canvas.width / 2;
            foundMarkers[0].corners[i].y = -foundMarkers[0].corners[i].y + canvas.height / 2;
        }
        //console.log(foundMarkers[0].corners[0].x);

        pose = posit.pose(foundMarkers[0].corners);

        markerPosition.x = pose.bestTranslation[0];
        markerPosition.y = pose.bestTranslation[1];
        markerPosition.z = pose.bestTranslation[2];

        //if(previousPosition.init){
        //    previousPosition.x = markerPosition.x;
        //    previousPosition.y = markerPosition.y;
        //    previousPosition.z = markerPosition.z;
        //    previousPosition.init = false;
        //}
        //
        //invalidValues = false;
        //
        //if(Math.abs(previousPosition.x - markerPosition.x) > goodDataThresholdX) {  // set x if valid
        //    invalidValues = true;
        //}else{
        //    previousPosition.x = markerPosition.x;
        //}
        //
        //if(Math.abs(previousPosition.y - markerPosition.y) > goodDataThresholdY) {  // set y if valid
        //    invalidValues = true;
        //}else{
        //    previousPosition.y = markerPosition.y;
        //}
        //
        //if(Math.abs(previousPosition.z - markerPosition.z) > goodDataThresholdZ) {  // set z if valid
        //    invalidValues = true;
        //}else{
        //    previousPosition.z = markerPosition.z;
        //}
        //
        //if(invalidValues){  // adjust reference value if errors occur too often
        //    debug.invalidData++;
        //    invalidCount++;
        //    if(invalidCount == 3){       // after 3 invalid frames, those frames are considered the new reference
        //        previousPosition = markerPosition;  // set formerly invalid frame as valid frame
        //        invalidCount = 0;
        //    }
        //}else{
        //    debug.validData++;
        //}
        //
        //log(Math.round((debug.validData / (debug.validData + debug.invalidData)) * 100) + " %");
        //
        //if (filtering) {
        //    filterCounter = (filterCounter + 1) % filterSamples;
        //
        //    if (pastPositions.length == 0) {
        //        for (j = 0; j < filterSamples; j++) {
        //            pastPositions[j] = markerPosition;
        //        }
        //    }
        //
        //    switch (filterMethod) {
        //        case 0:
        //            previousPosition = filterResults0(previousPosition);
        //            break;
        //        case 1:
        //            previousPosition = filterResults1(previousPosition);
        //            break;
        //    }
        //}
    }

    //self.postMessage([previousPosition.x, previousPosition.y, -previousPosition.z]);
    self.postMessage([markerPosition.x, markerPosition.y, -markerPosition.z]);
};


self.addEventListener('message', function(e) {
    if(e.data.data !== undefined){
        update(e.data.data);
    }else if(e.data.markerSize !== undefined){
        init(e.data.markerSize, e.data.canvasWidth, e.data.canvasHeight);
    }else if(e.data.filtering !== undefined){
        filtering = e.data.filtering;
        filterSamples = e.data.filterSamples;
        filterMethod = e.data.filterMethod;
    }
}, false);


var log = function(message){
    self.postMessage("log:\t" + message);
};