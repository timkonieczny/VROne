/**
 * jslint browser: true
 */
VROne.Pyramid3D = function () {

    VROne.Object3D.call(this);

    this.vertices = [
        // Tip
        0.0, 1.0, 0.0,

        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0
    ];

    //this.colors = [
    //    1.0, 0.0, 0.0, 1.0,
    //    0.0, 1.0, 0.0, 1.0,
    //    0.0, 0.0, 1.0, 1.0,
    //    0.0, 0.0, 1.0, 1.0,
    //    0.0, 1.0, 0.0, 1.0
    //];

    this.colors = [
        1.0, 0.0, 0.0, 0.5,
        0.0, 1.0, 0.0, 0.5,
        0.0, 0.0, 1.0, 0.5,
        0.0, 0.0, 1.0, 0.5,
        0.0, 1.0, 0.0, 0.5
    ];

    this.indices = [
        0, 2, 1,
        0, 3, 2,
        0, 4, 3,
        0, 1, 4,
        1, 2, 3,
        1, 3, 4
    ];

    this.transparent = true;
};

VROne.Pyramid3D.prototype = VROne.Object3D.prototype;