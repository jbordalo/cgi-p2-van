/** @type {WebGLRenderingContext} */
var gl;
let program;

let time = 0;

const CUBE = 0;
const SPHERE = 1;
const CYLINDER = 2;
const WIREFRAME = 0;
const FULL = 1;

const VAN_HEIGHT = 180;
const VAN_WIDTH = 160;
const VAN_BOX_LENGTH = 300;
const VAN_COCKPIT = 100;
const WHEEL_PLACEMENT = 90;
const WHEEL_DIAMETER = 60;
const WHEEL_WIDTH = 25;
const SUPPORT_DIAMETER = 10;
const SUPPPORT_HEIGHT = 25;
const ANTENNA_DIAMETER = 75;
const HORIZONTAL_ROD_LENGTH = 150;


let currentMode = WIREFRAME;
let currentShape = CUBE;
let currentForward = 0;
let tx = 0.0, ty = 0.0, tz = 0.0;
let xr = 0.0, yr = 0.0, zr = 0.0;
let sx = 1.0, sy = 1.0, sz = 1.0;
let mProjectionLoc, mModelViewLoc;

let armRotationZ =0;
let armRotationY = 0;
let mProjection, modelView;

var matrixStack = [];

// Stack related operations
function pushMatrix() {
    var m = mat4(modelView[0], modelView[1],
        modelView[2], modelView[3]);
    matrixStack.push(m);
}
function popMatrix() {
    modelView = matrixStack.pop();
}
// Append transformations to modelView
function multMatrix(m) {
    modelView = mult(modelView, m);
}
function multTranslation(t) {
    modelView = mult(modelView, translate(t));
}
function multScale(s) {
    modelView = mult(modelView, scalem(s));
}
function multRotationX(angle) {
    modelView = mult(modelView, rotateX(angle));
}
function multRotationY(angle) {
    modelView = mult(modelView, rotateY(angle));
}
function multRotationZ(angle) {
    modelView = mult(modelView, rotateZ(angle));
}

let $txSlider = document.getElementById("tx-slider");
let $tySlider = document.getElementById("ty-slider");
let $tzSlider = document.getElementById("tz-slider");
let $sxSlider = document.getElementById("sx-slider");
let $sySlider = document.getElementById("sy-slider");
let $szSlider = document.getElementById("sz-slider");
let $xrSlider = document.getElementById("xr-slider");
let $yrSlider = document.getElementById("yr-slider");
let $zrSlider = document.getElementById("zr-slider");
let $saveButton = document.getElementById("save-button");
let $resetTransformationButton = document.getElementById("reset-transformation-button");
let $resetProgramButton = document.getElementById("reset-program-button");
let $newCubeButton = document.getElementById("new-cube");
let $newSphereButton = document.getElementById("new-sphere");
let $newCylinderButton = document.getElementById("new-cylinder");

function resetSliders() {
    $txSlider.value = 0.0;
    $tySlider.value = 0.0;
    $tzSlider.value = 0.0;
    $sxSlider.value = 1.0;
    $sySlider.value = 1.0;
    $szSlider.value = 1.0;
    $xrSlider.value = 0.0;
    $yrSlider.value = 0.0;
    $zrSlider.value = 0.0;
}

$txSlider.addEventListener("input", () => {
    tx = parseFloat($txSlider.value, 10);
    console.log("tx:" + tx);
});

$tySlider.addEventListener("input", () => {
    ty = parseFloat($tySlider.value, 10);
    console.log("ty:" + ty);
});

$tzSlider.addEventListener("input", () => {
    tz = parseFloat($tzSlider.value, 10);
    console.log("tz:" + tz);
});

$sxSlider.addEventListener("input", () => {
    sx = parseFloat($sxSlider.value, 10);
    console.log("sx:" + sx);
});

$sySlider.addEventListener("input", () => {
    sy = parseFloat($sySlider.value, 10);
    console.log("sy:" + sy);
});

$szSlider.addEventListener("input", () => {
    sz = parseFloat($szSlider.value, 10);
    console.log("sz:" + sz);
});

$xrSlider.addEventListener("input", () => {
    xr = parseFloat($xrSlider.value, 10);
    console.log("xr:" + xr);
});

$yrSlider.addEventListener("input", () => {
    yr = parseFloat($yrSlider.value, 10);
    console.log("yr:" + yr);
});

$zrSlider.addEventListener("input", () => {
    zr = parseFloat($zrSlider.value, 10);
    console.log("zr:" + zr);
});

$saveButton.addEventListener("click", () => {
    instances.push(mModel);
    objectInfo.push(currentShape);
    console.log("Saved current transformation");
});

$resetTransformationButton.addEventListener("click", () => {
    tx = 0.0, ty = 0.0, tz = 0.0, sx = 1.0, sy = 1.0, sz = 1.0, xr = 0.0, yr = 0.0, zr = 0.0;
    resetSliders();
    console.log("Reset current transformation");
});

$resetProgramButton.addEventListener("click", e = () => {
    instances = [];
    objectInfo = [];
    tx = 0.0, ty = 0.0, tz = 0.0, sx = 1.0, sy = 1.0, sz = 1.0, xr = 0.0, xy = 0.0, zr = 0.0;
    resetSliders();
    console.log("Reset program");
});

$newCubeButton.addEventListener("click", () => {
    instances.push(mModel);
    objectInfo.push(currentShape);
    currentShape = CUBE;
    resetSliders();
    console.log("New cube");
});

$newSphereButton.addEventListener("click", () => {
    instances.push(mModel);
    objectInfo.push(currentShape);
    currentShape = SPHERE;
    resetSliders();
    console.log("New sphere");
});

$newCylinderButton.addEventListener("click", () => {
    instances.push(mModel);
    objectInfo.push(currentShape);
    currentShape = CYLINDER;
    resetSliders();
    console.log("New cylinder");
});



document.addEventListener('keydown', e => {
    const keyName = e.key;
    // console.log(keyName);
    switch (keyName.toUpperCase()) {
        case "1":
            // topView();
            console.log("Top view");
            break;
        case "2":
            // sideView();
            console.log("Side view");
            break;
        case "3":
            // frontView():
            console.log("Front view");
            break;
        case "0":
            // customView();
            console.log("Custom view");
            break;
        case " ":
            // changeColors();
            console.log("Color change");
            break;
        case "W":
            // goForwards();
            currentForward += 0.1;
            console.log("Move forwards");
            break;
        case "S":
            // goBackwards();
            currentForward -= 0.1;
            console.log("Move backwards");
            break;
        case "A":
            // steerLeft();
            console.log("Steer left");
            break;
        case "D":
            // steerRight();
            console.log("Steer right");
            break;
        case "I":
            // liftArm();
            armRotationZ+=5;
            if(armRotationZ>165){
                armRotationZ = 165;
                console.error("Can't go further.")
            }
            console.log("LiftArm");
            break;
        case "K":
            // lowerArm();
            armRotationZ-=5;
            if(armRotationZ<0){
                armRotationZ = 0;
                console.error("Can't go further.")
            }
            console.log("Lower arm");
            break;
        case "J":
            // rotateArmLeft();
            armRotationY+=5;
            console.log("Rotate arm left");
            break;
        case "L":
            // rotateArmRight();
            armRotationY-=5;
            console.log("Rotate arm right");
            break;
        default:
            console.error("Unrecognized key");
            break;
    }
});

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // var at = [0, 0, 0];
    // var eye = [1, 1, 1];
    // var up = [0, 1, 0];

    // mView = lookAt(eye, at, up);
    // mProjection = ortho(-2, 2, -2, 2, 10, -10);

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);

    mModelViewLoc = gl.getUniformLocation(program, 'mModelView');
    mProjectionLoc = gl.getUniformLocation(program, 'mProjection');

    // gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));

    render();
}

function drawPrimitive(shape, mode) {
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));

    switch (shape) {
        case CUBE:
            if (mode == WIREFRAME) {
                cubeDrawWireFrame(gl, program);
            } else {
                cubeDrawFilled(gl, program);
            }
            break;
        case SPHERE:
            if (mode == WIREFRAME) {
                sphereDrawWireFrame(gl, program);
            } else {
                sphereDrawFilled(gl, program);
            }
            break;
        case CYLINDER:
            if (mode == WIREFRAME) {
                cylinderDrawWireFrame(gl, program);
            } else {
                cylinderDrawFilled(gl, program);
            }
            break;
        default:
            break;
    }
}

function Chassis() {
    multScale([VAN_BOX_LENGTH, VAN_HEIGHT, VAN_WIDTH]);
    drawPrimitive(CUBE, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Front() {
    multScale([VAN_COCKPIT, 2* VAN_HEIGHT/3.0, VAN_WIDTH]);
    drawPrimitive(CUBE, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Wheel() {
    multScale([WHEEL_DIAMETER, WHEEL_WIDTH, WHEEL_DIAMETER]);
    drawPrimitive(CYLINDER, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Axle() {
    multScale([10, VAN_WIDTH+WHEEL_WIDTH, 10]);
    drawPrimitive(CYLINDER, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Support(){
    multScale([SUPPORT_DIAMETER, SUPPPORT_HEIGHT, SUPPORT_DIAMETER]);
    drawPrimitive(CYLINDER, currentMode);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Elbow(){
    multScale([SUPPORT_DIAMETER, SUPPORT_DIAMETER, SUPPORT_DIAMETER]);
    drawPrimitive(SPHERE, currentMode);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Arm(){
    multRotationZ(90);
    multScale([SUPPORT_DIAMETER, HORIZONTAL_ROD_LENGTH, SUPPORT_DIAMETER]);
    drawPrimitive(CYLINDER, currentMode);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Antenna(){
    multScale([ANTENNA_DIAMETER, ANTENNA_DIAMETER, ANTENNA_DIAMETER]);
    drawPrimitive(SPHERE, currentMode);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function sceneGraph() {
    pushMatrix();
    Chassis();
    popMatrix();
    pushMatrix();
    multTranslation([VAN_BOX_LENGTH/2+VAN_COCKPIT/2, -VAN_HEIGHT/3 + VAN_HEIGHT/6, 0]);
    Front();
    popMatrix();
    pushMatrix();
    multTranslation([VAN_BOX_LENGTH/4, 0, 0]);
    pushMatrix();
    pushMatrix();
    multTranslation([0, -VAN_HEIGHT/2, 0]);
    multRotationX(90);
    //multRotationY(-time);
    Axle();
    popMatrix();
    multTranslation([0, -VAN_HEIGHT/2, -VAN_WIDTH/2]);
    multRotationX(90);
    //multRotationY(-time);
    Wheel();
    popMatrix();
    pushMatrix();
    multTranslation([0, -VAN_HEIGHT/2, VAN_WIDTH/2]);
    multRotationX(90);
    //multRotationY(-time);
    Wheel();
    popMatrix();
    popMatrix();
    pushMatrix();
    multTranslation([-VAN_BOX_LENGTH/4, 0, 0]);
    pushMatrix();
    pushMatrix();
    multTranslation([0, -VAN_HEIGHT/2, 0]);
    multRotationX(90);
    //multRotationY(-time);
    Axle();
    popMatrix();
    multTranslation([0, -VAN_HEIGHT/2, VAN_WIDTH/2]);
    multRotationX(90);
    //multRotationY(-time);
    Wheel();
    popMatrix();
    pushMatrix();
    multTranslation([0, -VAN_HEIGHT/2, -VAN_WIDTH/2]);
    multRotationX(90);
    //multRotationY(-time);
    Wheel();
    popMatrix();
    popMatrix();
    //TODO this translation can take the elements to the top of the van
    // and then other translations specific to the elements are done in their place
    multTranslation([0, VAN_HEIGHT/2+SUPPPORT_HEIGHT/2, 0]);
    pushMatrix();
    Support();
    popMatrix();
    multTranslation([0, SUPPPORT_HEIGHT/2, 0]);
    multRotationY(armRotationY);
    multRotationZ(armRotationZ);
    pushMatrix();
    Elbow();
    popMatrix();
    pushMatrix();
    multTranslation([HORIZONTAL_ROD_LENGTH/2,0,0]);
    Arm();
    popMatrix();
    pushMatrix();
    multTranslation([HORIZONTAL_ROD_LENGTH,2*SUPPPORT_HEIGHT,0]);
    Antenna();
    popMatrix();
    pushMatrix();
    multTranslation([HORIZONTAL_ROD_LENGTH,0,0]);
    Support();
    popMatrix();
    popMatrix();
    

}

function render() {
    time += 1;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projection = ortho(-300, 300, -300, 300, 900, -900);

    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

    modelView =  lookAt([20,0,40], [20,0,0], [0,1,0]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));

    sceneGraph();

    requestAnimationFrame(render);
}
