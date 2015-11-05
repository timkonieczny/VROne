/**
 * Creates new camera modifier which should be used as the base for all modifiers
 * @class
 * @constructor
 */
VROne.CameraModifier = function(){

    this.position = new VROne.Vector3();
    this.orientation = new VROne.Quaternion();
    
    this.update = function(){
        
    };
    
    /**
     * Returns orientation from device configuration
     * @return {VROne.Quaternion} orientation
     */
    this.getOrientation = function(){
        return this.orientation;
    };

    /**
     * Returns position from device configuration
     * @return {VROne.Vector3} position
     */
    this.getPosition = function(){
        return this.position;
    };

    this.getHMDData = function(){
        return null;
    };
};