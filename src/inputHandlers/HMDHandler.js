/**
 * Handles Oculus Rift input
 * @class
 * @constructor
 */
VROne.HMDHandler = function(){};

var vrDevice = null;
var eyeParamsL = null;
var eyeParamsR = null;
var positionDevice = null;
var foundHMD = false;


/**
 * Description
 * @return ArrayExpression
 */
VROne.HMDHandler.getHMDData = function(){
    if(!eyeParamsL || !eyeParamsR){
        return null;
    }
    return [eyeParamsL, eyeParamsR];
};

/**
 * Description
 * @return CallExpression
 */
VROne.HMDHandler.getPositionalData = function(){
    if(positionDevice === null){return;}

    return positionDevice.getState();
};

/**
 * Description
 */
VROne.HMDHandler.isPositionDevice = function(){
    if(vrDevice === null && positionDevice !== null){
        return true;
    }else if(vrDevice !== null && positionDevice === null){
        return false;
    }
};

/**
 * Description
 */
VROne.HMDHandler.resetSensor = function () {
    if ( positionDevice === undefined ) return;

    if ( 'resetSensor' in positionDevice) {
        positionDevice.resetSensor();
    } else if ( 'zeroSensor' in positionDevice) {
        positionDevice.zeroSensor();
    }else{
        console.log("Can't reset position sensor.");
    }

};

var onVRDevices = function(devices){
    for(var i in devices){
        if(devices[i] instanceof HMDVRDevice && vrDevice === null){
            vrDevice = devices[i];
            eyeParamsL = vrDevice.getEyeParameters( 'left' );
            eyeParamsR = vrDevice.getEyeParameters( 'right' );
            foundHMD = true;
        }
        else if(devices[i] instanceof PositionSensorVRDevice && positionDevice === null){
            positionDevice = devices[i];
        }
    }
};

if (navigator.getVRDevices !== undefined ) {
    navigator.getVRDevices().then( onVRDevices );
}

/**
 * Description
 * @return BinaryExpression
 */
VROne.HMDHandler.isWebVRReady = function(){
    return (navigator.getVRDevices !== undefined);
};

VROne.HMDHandler.prototype = {

};