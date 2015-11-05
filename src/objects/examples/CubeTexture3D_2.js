/*jslint browser: true*/

VROne.CubeTexture3D_2 = function () {

    VROne.CubeTexture3D.call(this);
    this.imageSrc = "textures/head.gif";
    this.textureCoords = [
          // Back face
          1.0, 0.0,
          1.0, 0.5,
          0.5, 0.5,
          0.5, 0.0,

          // Front face
          0.0, 0.5,
          0.0, 1.0,
          0.5, 1.0,
          0.5, 0.5,

          // Top face
          0.5, 0.5,
          0.5, 0.0,
          0.0, 0.0,
          0.0, 0.5,

          // Bottom face
          1.0, 0.0,
          1.0, 0.5,
          0.5, 0.5,
          0.5, 0.0,

          // Right face
          0.5, 0.5,
          0.5, 1.0,
          1.0, 1.0,
          1.0, 0.5,

          // Left face
          1.0, 0.5,
          1.0, 1.0,
          0.5, 1.0,
          0.5, 0.5
    ];
    
    this.normals = [
        // Front face
         0.0, 0.0, 1.0,
         0.0, 0.0, 1.0,
         0.0, 0.0, 1.0,
         0.0, 0.0, 1.0,

        // Back face
         0.0, 0.0, -1.0,
         0.0, 0.0, -1.0,
         0.0, 0.0, -1.0,
         0.0, 0.0, -1.0,

        // Top face
         0.0, 1.0, 0.0,
         0.0, 1.0, 0.0,
         0.0, 1.0, 0.0,
         0.0, 1.0, 0.0,

        // Bottom face
         0.0, -1.0, 0.0,
         0.0, -1.0, 0.0,
         0.0, -1.0, 0.0,
         0.0, -1.0, 0.0,

        // Right face
         1.0, 0.0, 0.0,
         1.0, 0.0, 0.0,
         1.0, 0.0, 0.0,
         1.0, 0.0, 0.0,

        // Left face
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0
    ];
};

VROne.CubeTexture3D_2.prototype = VROne.CubeTexture3D.prototype;