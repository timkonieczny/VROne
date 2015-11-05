/**
 * jslint browser: true
 */

/**
 * Creates a new timer
 * @class
 * @constructor
 */
VROne.Timer = function () {

};

VROne.Timer.prototype = {

};

/**
 * Returns current time
 * @return {Number} time
 */
VROne.Timer.prototype.getCurrentTimeMs = function(){
    return new Date().getTime();
};