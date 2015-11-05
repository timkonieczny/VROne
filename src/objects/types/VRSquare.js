/**
 * jslint browser: true
 */

/**
 * Creates square to be used as a framebuffer by the vr renderer
 * @class
 * @constructor
 */
VROne.VRSquare = function () {

    VROne.Object3D.call(this);

    this.shader = "vr-canvas";

    this.vertices = [
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        -1.0,  1.0, 1.0,
        1.0,  1.0, 1.0
    ];

    this.textureCoords = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];
};

VROne.VRSquare.prototype = new VROne.Object3D();