var scene;
var canvas;

var icosahedron;
var icoRotation = new VROne.Vector3();
var icoRotationScale = new VROne.Vector3(Math.random() * 0.0001, Math.random() * 0.0001, Math.random() * 0.0001);

// Used to create animation frames
var timeObject = {
    time: 0,
    startTime: Date.now(),
    tslf: 0,
    initDone: false,
    startAnimation: function(){
        if(!this.initDone) {
            this.startTime = Date.now();
            this.initDone = true;
        }
        this.time = Date.now() - this.startTime;
        this.tslf = this.time - this.tslf;
    },
    endAnimation: function(){
        this.tslf = this.time;
    }
};

// Frame counter
var frameCounter = {
    startTime: Date.now(),
    count: 0,
    display: undefined,
    update: function(){
        this.count++;
        if(Date.now() - this.startTime > 1000){
            this.startTime = Date.now();
            this.display.innerText = this.count;
            this.count = 0;
        }
    }
};

// Initialize scene
function init() {
    // Connect to HTML elements and create new scene using HTML canvas
    frameCounter.display = document.getElementById("rendererFrameRate");
    canvas = document.getElementById("canvas");
    canvas.onclick = function () {
        var camera = scene.getCamera();
        camera.setFullscreen(!camera.isFullscreen(), canvas);

        if ('orientation' in screen) {
            if(camera.isFullscreen()){
                screen.orientation.lock('landscape-primary');
            }
            else{
                screen.orientation.unlock();
            }
        }

    };
    scene = new VROne.Scene(canvas);

    // Set up VR view for Google Cardboard with positional tracking
    // Arguments: distorted, markerSize (mm), numberOfMarkers, videoWidth (pixels), showVideo
    scene.usePositionalCardboard(false, 80, 1, 120, true);
    // Adjust positional tracking configuration
    var config = scene.getPositionalConfig();
    //config.speed = 1 / 50;
    config.updatesPerSecond = 30;
    config.prediction = false;
    config.filtering = false;
    config.filterSamples = 3;
    config.filterMethod = 0;
    config.lowpass = true;
    config.lowpassThreshold = 10;
    scene.updatePositionalConfig(config);

    // Set Light Properties
    var light = new VROne.Light();
    light.position.x = 5;
    light.position.y = 5;
    light.position.z = 0;
    scene.addToScene(light);

    // Add objects to the scene
    scene.addToScene(new VROne.Skybox(
        "alpine_back.jpg",
        "alpine_front.jpg",
        "alpine_top.jpg",
        "alpine_top.jpg",
        "alpine_right.jpg",
        "alpine_left.jpg",
        "assets/",
        scene.getCamera().getManager(),
        scene.getCamera().farPlane));

    var floor = new VROne.OBJLoader("assets/floor.obj")[0];
    floor.position.y = -1;
    floor.imageSrc = "assets/floor.png";
    floor.transparent = true;
    scene.addToScene(floor);

    icosahedron = new VROne.Geometry.Icosahedron(2).getO3D(false);
    icosahedron.position.set(0.0, 0.0, -2.0);
    icosahedron.scale.set(0.5, 0.5, 0.5);
    icosahedron.colors = [];
    for(var i = 0; i < (icosahedron.vertices.length/3)*4; i+=4){
        icosahedron.colors[i] = 1.0;
        icosahedron.colors[i + 1] = 0.211;
        icosahedron.colors[i + 2] = 0.0;
        icosahedron.colors[i + 3] = 1.0;
    }
    scene.addToScene(icosahedron);

    tick();
}
window.onload = init;

// Update 3D object properties
var update = function (){
    timeObject.startAnimation();
    icoRotation.x += timeObject.tslf * icoRotationScale.x;
    icoRotation.y += timeObject.tslf * icoRotationScale.y;
    icoRotation.z += timeObject.tslf * icoRotationScale.z;
    icosahedron.rotation.fromEulerAngles(icoRotation.x, icoRotation.y, icoRotation.z);
    timeObject.endAnimation();

    frameCounter.update();
};

var tick = function () {
    VROne.requestAnimFrame(tick);
    update();
    scene.updateScene();
    scene.drawScene();
};