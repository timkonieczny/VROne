var scene;
var canvas;
function init() {
    canvas = document.getElementById("canvas");
    scene = new VROne.Scene(canvas);

    var vr = true;

    if(vr) {
        var webVRSuccess = scene.useWebVR();
        if (!webVRSuccess) {
            scene.usePositionalCardboard(80, false, true, 120, 4);

            var config = scene.getPositionalConfig();

            //config.speed = 1 / 50;
            config.updatesPerSecond = 30;
            //config.imageSamples = 1;
            config.prediction = false;
            config.filtering = true;
            config.filterSamples = 3;
            config.filterMethod = 0;

            scene.updatePositionalConfig(config);
        }
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
    }else{
        scene.setRendererDesktop();
        scene.getCamera().getManager().modifiers.push(new VROne.MouseKeyboard(canvas, canvas));
    }

    var cameraModifier = new VROne.CameraModifier();
    scene.getCamera().getManager().modifiers.push(cameraModifier);
    scene.getCamera().farPlane = 1000;
    scene.getCamera().updateProjectionMatrix();

    //Set Light Properties
    var light = new VROne.Light();
    light.position.x = 5;
    light.position.y = 5;
    light.position.z = 0;
    scene.addToScene(light);

    skybox = new VROne.Skybox(
        "alpine_back.jpg",
        "alpine_front.jpg",
        "alpine_top.jpg",
        "alpine_top.jpg",
        "alpine_right.jpg",
        "alpine_left.jpg",
        "assets/",
        scene.getCamera().getManager(),
        scene.getCamera().farPlane);
    scene.addToScene(skybox);

    //var icosahedron = new VROne.Geometry.Icosahedron(2).getO3D();
    //icosahedron.position.z = -2;
    //scene.addToScene(icosahedron);
    //
    //var icosahedron2 = new VROne.Geometry.Icosahedron(2).getO3D();
    //icosahedron2.position.y = -10;
    //scene.addToScene(icosahedron2);

    var cubeHeight = 0.1;
    var cubeWidth = 0.1;
    var cubeDepth = 0.1;

    var cube = new VROne.Geometry.Box(cubeWidth, cubeHeight, cubeDepth).getO3D(false);
    cube.position.z = -0.3 - cubeDepth;
    cube.position.x = -cubeWidth / 2;
    cube.position.y = -cubeHeight / 2;
    scene.addToScene(cube);

    var floor = new VROne.OBJLoader("assets/floor.obj")[0];
    floor.position.y = -1;
    floor.imageSrc = "assets/floor.png";
    floor.transparent = true;
    scene.addToScene(floor);

    //var sphere = new VROne.Geometry.Sphere(.5).getO3D(false,10, 10);
    //sphere.position.z = - 1

    renderingFrameDisplay = document.getElementById("rendererFrameRate");

    tick();
}
window.onload = init;


var skybox;
var tslf = 0;

var initDone = false;

////////////////////////////////////////////////////////////////////
var timeObject = {
    time: 0,
    startTime: Date.now()
};

var frameStart = Date.now();
var frameCount = 0;
var renderingFrameDisplay;
//canvas = document.getElementById("canvas");

console.log(renderingFrameDisplay);

var update = function (){
    if(!initDone) {
        timeObject.startTime = Date.now();
        initDone = true;
    }else{
        scene.render = true;
    }

    timeObject.time = Date.now() - timeObject.startTime;

    tslf = timeObject.time - tslf;

    tslf = timeObject.time;

    frameCount++;
    if(Date.now() - frameStart > 1000){
        frameStart = Date.now();
        renderingFrameDisplay.innerText = frameCount;
        frameCount = 0;
    }
};


var tick = function () {
    VROne.requestAnimFrame(tick);
    update();
    scene.updateScene();
    scene.drawScene();
};