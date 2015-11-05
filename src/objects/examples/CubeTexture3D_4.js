/*jslint browser: true*/

VROne.CubeTexture3D_4 = function () {
    VROne.CubeTexture3D_2.call(this);
    this.shininess = 1.0;

    this.useFragmentLighting = true;
    this.imageSrc = "blue.png";
    this.transparent = false;
    this.normalMap = "blue-normal.png";

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
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];

};

VROne.CubeTexture3D_4.prototype = new VROne.CubeTexture3D_2();