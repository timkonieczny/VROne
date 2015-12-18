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

// Configuration to be populated by menu
var startConfiguration = {};

// Initialize scene
function init() {
    // Plug into HTML elements and create new scene using HTML canvas
    frameCounter.display = document.getElementById("rendererFrameRate");
    canvas = document.getElementById("Canvas");
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
    scene.usePositionalCardboard(startConfiguration.distorted, startConfiguration.markerSize,
        startConfiguration.numberOfMarkers, startConfiguration.videoWidth, startConfiguration.showVideo,
        startConfiguration.multiThreaded);

    // Adjust positional tracking configuration
    if(startConfiguration.multiThreaded) {
        var config = scene.getPositionalConfig();
        config.speed = startConfiguration.speed;
        config.updatesPerSecond = startConfiguration.updatesPerSecond;
        config.prediction = startConfiguration.prediction;
        config.filtering = startConfiguration.filtering;
        config.filterSamples = startConfiguration.filterSamples;
        config.filterMethod = startConfiguration.filterMethod;
        config.lowPass = startConfiguration.lowPass;
        config.lowPassThreshold = startConfiguration.lowPassThreshold;
        scene.updatePositionalConfig(config);
    }

    // Set Light Properties
    var light = new VROne.Light();
    light.position.x = 5;
    light.position.y = 5;
    light.position.z = 0;
    scene.addToScene(light);

    // Add objects to the scene
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

// Apply config menu and start scene initialization
window.onload = function(){
    var startButton = document.getElementById("Start");
    var advancedButton = document.getElementById("AdvancedButton");
    var advancedOptions = document.getElementsByClassName("Advanced");
    var filteringCheckbox = document.getElementById("filtering");
    var filterSamplesInput = document.getElementById("filterSamples");
    var filterMethodInput = document.getElementById("FilterMethodInput");
    var lowPassCheckbox = document.getElementById("lowPass");
    var lowPassThresholdInput = document.getElementById("lowPassThreshold");
    var filterMethods = document.getElementsByName("filterMethod");
    var threading = document.getElementsByName("threading");
    var numberOfMarkersInput = document.getElementById("numberOfMarkers");
    var predictionInput = document.getElementById("prediction");
    var updatesPerSecondInput = document.getElementById("updatesPerSecond");
    var speedInput = document.getElementById("speed");
    advancedButton.onclick = function(){
        for(var i = 0; i < advancedOptions.length; i++){
            if(advancedOptions[i].style.display == "table-row"){
                advancedOptions[i].style.display = "none";
            }else{
                advancedOptions[i].style.display = "table-row"
            }
        }
    };
    filteringCheckbox.onclick = function () {
        filterSamplesInput.disabled = !filteringCheckbox.checked;
        filterMethodInput.disabled = !filteringCheckbox.checked;
    };
    lowPassCheckbox.onclick = function () {
        lowPassThresholdInput.disabled = !lowPassCheckbox.checked;
    };
    threading[0].onclick = threading[1].onclick = function () {
        for(var i = 0; i < threading.length; i++){
            if(threading[i].checked){
                numberOfMarkersInput.disabled = threading[i].value !== "true";
                filteringCheckbox.disabled = threading[i].value !== "true";
                filterSamplesInput.disabled = threading[i].value !== "true";
                filterMethodInput.disabled = threading[i].value !== "true";
                lowPassCheckbox.disabled = threading[i].value !== "true";
                lowPassThresholdInput.disabled = threading[i].value !== "true";
                predictionInput.disabled = threading[i].value !== "true";
                updatesPerSecondInput.disabled = threading[i].value !== "true";
                speedInput.disabled = threading[i].value !== "true";
                lowPassCheckbox.onclick();
                filteringCheckbox.onclick();
                break;
            }
        }
    };
    startButton.onclick = function(){
        document.getElementById("OuterContainer").style.display = "none";
        var hiddenElements = document.getElementsByClassName("HideOnStartup");
        for(i = 0; i < hiddenElements.length; i++){
            hiddenElements[i].style.display = "inline";
        }
        startConfiguration.markerSize = Math.abs(parseInt(document.getElementById("markerSize").value));
        startConfiguration.numberOfMarkers = Math.abs(parseInt(numberOfMarkersInput.value));
        startConfiguration.speed = Math.abs(parseFloat(speedInput.value));
        startConfiguration.videoWidth = Math.abs(parseInt(document.getElementById("videoWidth").value));
        startConfiguration.updatesPerSecond = Math.abs(parseInt(updatesPerSecondInput.value));
        startConfiguration.prediction = predictionInput.checked;
        startConfiguration.filtering = filteringCheckbox.checked;
        startConfiguration.filterSamples = Math.abs(parseInt(filterSamplesInput.value));
        startConfiguration.lowPass = lowPassCheckbox.checked;
        startConfiguration.lowPassThreshold = Math.abs(parseInt(lowPassThresholdInput.value));
        startConfiguration.distorted = document.getElementById("distorted").checked;
        startConfiguration.showVideo = document.getElementById("showVideo").checked;
        for(var i = 0; i < filterMethods.length; i++){
            if(filterMethods[i].checked){
                startConfiguration.filterMethod = parseInt(filterMethods[i].value);
                break;
            }
        }
        for(i = 0; i < threading.length; i++){
            if(threading[i].checked){
                startConfiguration.multiThreaded = threading[i].value === "true";
                break;
            }
        }
        init();
    }
};

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