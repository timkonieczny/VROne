/**
 * jslint browser: true
 */

/**
 * Handles Accelerometer / Gyroscope input
 * @class
 * @constructor
 */
VROne.SensorsHandler = function () {

    var scope = this;

    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;

    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", function (event) {
            scope.alpha = event.alpha;
            scope.beta = event.beta;
            scope.gamma = event.gamma;
        }, true);
    }
};

var sensorsHandler = null;

/**
 * Returns roll value (alpha) from accelerometer / gyroscope
 * @return Number
 */
VROne.SensorsHandler.getRoll = function(){
    if(sensorsHandler == null){
        sensorsHandler = new VROne.SensorsHandler();
    }
    return sensorsHandler.alpha;
};

/**
 * Returns pitch value (beta) from accelerometer / gyroscope
 * @return Number
 */
VROne.SensorsHandler.getPitch = function(){
    if(sensorsHandler == null){
        sensorsHandler = new VROne.SensorsHandler();
    }
    return sensorsHandler.beta;
};

/**
 * Returns yaw value (gamma) from accelerometer / gyroscope
 * @return Number
 */
VROne.SensorsHandler.getYaw = function(){
    if(sensorsHandler == null){
        sensorsHandler = new VROne.SensorsHandler();
    }
    return sensorsHandler.gamma;
};

VROne.SensorsHandler.prototype = {

};