/**
 * jslint browser: true
 */
VROne.Square = function () {

    VROne.Object3D.call(this);

    this.vertices = [
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0
    ];

    this.colors = [
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];

    this.indices = [
        0, 1, 2, 0, 2, 3
    ];
};

VROne.Square.prototype = VROne.Object3D.prototype;