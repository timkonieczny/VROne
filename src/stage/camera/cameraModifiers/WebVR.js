/**
 * jslint browser: true
 */

/**
 * Creates device configuration for the Oculus Rift. Only works in WebVR compatible browsers
 * @class
 * @constructor
 */
VROne.WebVR = function () {

    var scope = this;
    var position = new VROne.Vector3();
    var orientation = new VROne.Quaternion();

    /**
     * Description
     * @return CallExpression
     */
    this.getHMDData = function(){
        return VROne.HMDHandler.getHMDData();
    };
    
    var o = new VROne.Quaternion();
    var p = new VROne.Vector3();
    this.update = function(playerRotation){
        if (VROne.KeyboardHandler.isKeyDown("R"))VROne.HMDHandler.resetSensor();
        var data = VROne.HMDHandler.getPositionalData();
        
        if(data){
            if(data.position){
                position.x = data.position.x;
                position.y = data.position.y;
                position.z = data.position.z;
                position.w = data.position.w;
            }
            orientation.x = data.orientation.x;
            orientation.y = data.orientation.y;
            orientation.z = data.orientation.z;
            orientation.w = data.orientation.w;
        }
        
        position = o.multiply(playerRotation, orientation.getConjugate()).rotatePoint(p);
        orientation = orientation.getConjugate();
    };

    /**   //TODO: remove if HMD still works
     * Description
     * @return position
     */
    this.getPosition = function () {
        return position;
    };
    
    /**
     * Description
     * @return CallExpression
     */
    this.getOrientation = function(){
        return orientation;
    };
};

VROne.WebVR.prototype = new VROne.CameraModifier();