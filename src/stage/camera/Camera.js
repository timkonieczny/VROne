/**
 * lsint browser: true
 */

/**
 * Creates new camera object
 * @param {VROne.CameraManager} cameraManager
 * @constructor
 */
VROne.Camera = function (cameraManager) {
    var scope = this;
    this.useVR = false;
    var isFullscreen = false;

    var position = new VROne.Vector3();     //local position
    var rotation = new VROne.Quaternion();

    var viewMatrixPool = new VROne.Matrix4();
    var viewMatrix = new VROne.Matrix4();
    var viewMatrixLeft = new VROne.Matrix4();
    var viewMatrixRight = new VROne.Matrix4();

    var perspectiveMatrix = null;
    var perspectiveMatrixLeft = null;
    var perspectiveMatrixRight = null;

    this.fieldOfView = 60;
    this.nearPlane = 0.1;
    this.farPlane = 200.0;

    this.width = 1;
    this.height = 1;

    this.isOrtho = false;

    var forwardVector = new VROne.Vector3();

    /**
     * Updates camera
     */
    this.update = function(){
        //update cameraController
        cameraManager.update();
        
        //update camera position and orientation from cameraController
        position = cameraManager.getGlobalPosition();
        rotation = cameraManager.getGlobalRotation().getConjugate();
        
        calculateViewMatrix();
    };

    /**
     * Updates projection matrix
     */
    this.updateProjectionMatrix = function (){
        var aspectRatio = this.width/this.height;
        if(cameraManager && cameraManager.isInputVR() && cameraManager.cameraProperties.eyeFOVL){
            perspectiveMatrixLeft = VROne.Matrix4.makeVRPerspective(cameraManager.cameraProperties.eyeFOVL, this.nearPlane, this.farPlane);
            perspectiveMatrixRight = VROne.Matrix4.makeVRPerspective(cameraManager.cameraProperties.eyeFOVR, this.nearPlane, this.farPlane);
        }else{
            if(!this.isOrtho) {
                perspectiveMatrix = VROne.Matrix4.makePerspective(this.fieldOfView, aspectRatio, this.nearPlane, this.farPlane);
            }else{
                perspectiveMatrix = VROne.Matrix4.makeOrthoPerspective(-1.0, 1.0, 1.0, -1.0, 0.5, 1.5);
            }
        }
    };

    /**
     * Sets canvas to full screen
     * @param {Boolean} boolean
     */
    this.setFullscreen = function (boolean, canvas) {
        if ( isFullscreen === boolean ) return;
        isFullscreen = boolean;
        
        //Exit Fullscreen
        if(!boolean){
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
            return;
        }
 
        var vr = {};
        if ( cameraManager.cameraProperties.vrDevice !== undefined ){
            vr = {
                vrDisplay: cameraManager.cameraProperties.vrDevice,
                vrTimewarp: true
            };
        }
        
        if (canvas.requestFullscreen) {
          canvas.requestFullscreen(vr);
        } else if (canvas.msRequestFullscreen) {
          canvas.msRequestFullscreen(vr);
        } else if (canvas.mozRequestFullScreen) {
          canvas.mozRequestFullScreen(vr);
        } else if (canvas.webkitRequestFullscreen) {
          canvas.webkitRequestFullscreen(vr);
        }
    };

    /**
     * Calculates view matrices for both eyes
     */
    var calculateViewMatrix = function (){
        if(scope.useVR){
            var eyeL = cameraManager.cameraProperties.eyeTranslationL;
            var eyeR = cameraManager.cameraProperties.eyeTranslationR;
            
            //Left View Matrix
            viewMatrixLeft.identity();
            viewMatrixLeft.applyTranslation(-position.x, -position.y, -position.z);
            rotation.toRotationMatrix(viewMatrixPool);
            viewMatrixLeft.apply(viewMatrixPool);
            viewMatrixLeft.applyTranslation(-eyeL, 0, 0);
            
            //Right View Matrix
            viewMatrixRight.identity();
            viewMatrixRight.applyTranslation(-position.x, -position.y, -position.z);
            rotation.toRotationMatrix(viewMatrixPool);
            viewMatrixRight.apply(viewMatrixPool);
            viewMatrixRight.applyTranslation(-eyeR, 0, 0);
        } else{
            viewMatrix.identity();
            viewMatrix.applyTranslation(-position.x, -position.y, -position.z);
            rotation.toRotationMatrix(viewMatrixPool);
            viewMatrix.apply(viewMatrixPool);
        }
    };

    /**
     * Returns camera controller
     * @return {VROne.CameraManager} cameraController
     */
    this.getManager = function(){
        return cameraManager;
    };

    /**
     * Returns view matrix for respective eye
     * @return {VROne.Matrix4} viewMatrix
     */
    this.getViewMatrix = function(eye){
        if(eye === "left"){
            return viewMatrixLeft;
        }
        else if(eye === "right"){
            return viewMatrixRight;
        }
        else{
            return viewMatrix;
        }
    };

    /**
     * Returns perspective matrix for respective eye
     * @param {String} eye
     * @return {VROne.Matrix4} perspectiveMatrix
     */
    this.getPerspectiveMatrix = function(eye){
        if(eye === "left" && perspectiveMatrixLeft !== null){
            return perspectiveMatrixLeft;
        }
        else if(eye === "right" && perspectiveMatrixRight !== null){
            return perspectiveMatrixRight;
        }
        else{
            return perspectiveMatrix;
        }
    };

    /**
     * Returns x eye distance from center for respective eye
     * @param {String} eye
     * @return {Number} distance
     */
    this.getEyeTranslation = function(eye){
        if(eye === "left"){
            return cameraManager.cameraProperties.eyeTranslationL;
        }
        else if(eye === "right"){
            return cameraManager.cameraProperties.eyeTranslationR;
        }
        else{
            return null;
        }
    };

    /**
     * Returns camera forvard vector
     * @return {VROne.Vector3} forwardVector
     */
    this.getForwardVector = function(){
        if(scope.useVR){
            forwardVector.x = -viewMatrixLeft.data[2];
            forwardVector.y = -viewMatrixLeft.data[6];
            forwardVector.z = -viewMatrixLeft.data[10];
            return forwardVector;
        }else {
            forwardVector.x = -viewMatrix.data[2];
            forwardVector.y = -viewMatrix.data[6];
            forwardVector.z = -viewMatrix.data[10];
            return forwardVector;
        }
    };
    
    this.isFullscreen = function(){
        return isFullscreen;
    };
};

VROne.Camera.prototype = {

};