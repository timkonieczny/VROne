/**
 * jslint browser: true
 */

/**
 * Creates new matrix3 as identity matrix
 * @class
 * @constructor
 */
VROne.Matrix3 = function () {
    this.data = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]);
};

VROne.Matrix3.prototype = {

};