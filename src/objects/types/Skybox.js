/**
 * Creates new skybox object
 * @param front
 * @param back
 * @param top
 * @param bottom
 * @param right
 * @param left
 * @param prefix
 * @param camera
 * @param farPlane
 * @class
 * @constructor
 */
VROne.Skybox = function (front, back, top, bottom, right, left, prefix, camera, farPlane) {

    VROne.CubeTexture3D.call(this);
    this.isSkybox = true;
    this.imageSrc = [prefix+front, prefix+back, prefix+top, prefix+bottom, prefix+right, prefix+left];
    this.parent = camera;
    this.parentRotationWeight = new VROne.Vector3(0.0,0.0,0.0);
    this.parentPositionWeight = new VROne.Vector3(1.0,1.0,1.0);
    var scale = (farPlane*2)/Math.sqrt(3);
    this.scale = new VROne.Vector3(
        scale,
        scale,
        scale);

    this.textureCoords = [

        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Left face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0
    ];

    this.textureIndices = [
        0, 0, 0, 0,
        1, 1, 1, 1,
        2, 2, 2, 2,
        3, 3, 3, 3,
        4, 4, 4, 4,
        5, 5, 5, 5
    ];

    this.normals = null;

    this.indices.reverse();
};

VROne.Skybox.prototype = new VROne.Object3D();