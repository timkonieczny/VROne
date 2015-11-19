/**
 * Creates new VR device configuration for Google Cardboard (and similar viewers) with experimental positional tracking. Fiducial foundMarkers need to be placed in environment.
 * @class
 * @constructor
 */
VROne.PositionalCardboardOI = function () {

    VROne.CameraModifier.call(this);

    var scope = this,
        orientation = new VROne.Quaternion(),
        position = new VROne.Vector3(),             // current position
        alpha = 0,
        beta = 0,
        gamma = 0,
        alphaOffset = 0,                            // offset used for sensor calibration
        gammaOffset = 0;                            // offset used for sensor calibration

    var socket = io.connect("http://192.168.3.64:3000");

    socket.on("position", function(pos){
        position.set(
            -pos[0] * scope.configuration.speed,
            pos[1] * scope.configuration.speed,
            pos[2] * scope.configuration.speed
        );
    });

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

    this.update = function(){

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