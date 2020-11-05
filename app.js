/** @type {WebGLRenderingContext} */
var gl;
let program;

let time = 0;

const CUBE = 0;
const SPHERE = 1;
const CYLINDER = 2;
const WIREFRAME = 0;
const FULL = 1;

let currentMode = WIREFRAME;
let currentShape = CUBE;
let currentForward = 0;
let tx = 0.0, ty = 0.0, tz = 0.0;
let xr = 0.0, yr = 0.0, zr = 0.0;
let sx = 1.0, sy = 1.0, sz = 1.0;
let mProjectionLoc, mModelViewLoc;

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
            console.log("Lift arm");
            break;
        case "K":
            // lowerArm();
            console.log("Lower arm");
            break;
        case "J":
            // rotateArmLeft();
            console.log("Rotate arm left");
            break;
        case "L":
            // rotateArmRight();
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
    multRotationX(90);
    multScale([.8, 2, .8]);
    drawPrimitive(CUBE, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Front() {
    multRotationX(90);
    multScale([.7, .5, .5]);
    drawPrimitive(CUBE, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Wheel() {
    multScale([.5, .1, .5]);
    drawPrimitive(CYLINDER, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Axle() {
    multScale([.1, 1, .1]);
    drawPrimitive(CYLINDER, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function sceneGraph() {
    pushMatrix();
    Chassis();
    popMatrix();
    pushMatrix();
    multTranslation([0, -.15, 1.25]);
    Front();
    popMatrix();
    pushMatrix();
    multTranslation([0, 0, 2]);
    pushMatrix();
    multTranslation([-0.15, -.15, -2.4]);
    multRotationZ(90);
    multRotationY(-time);
    Wheel();
    popMatrix();
    pushMatrix();
    multTranslation([.65, -.15, -2.4]);
    multRotationZ(90);
    multRotationY(-time);
    Wheel();
    popMatrix();
    pushMatrix();
    multTranslation([.65, -.15, -1.2]);
    multRotationZ(90);
    multRotationY(-time);
    Wheel();
    popMatrix();
    pushMatrix();
    multTranslation([-.15, -.15, -1.2]);
    multRotationZ(90);
    multRotationY(-time);
    Wheel();
    popMatrix();
    pushMatrix();
    multTranslation([.25, -.15, -2.4]);
    multRotationZ(90);
    multRotationY(-time);
    Axle();
    popMatrix();
    pushMatrix();
    multTranslation([.25, -.15, -1.2]);
    multRotationZ(90);
    multRotationY(-time);
    Axle();
    popMatrix();
    popMatrix();

}

function render() {
    time += 1;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projection = ortho(-2, 2, -2, 2, 10, -10);

    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

    modelView = lookAt([0, 0, 0], [1, 1, 1], [0, 1, 0]);

    // sphereDrawWireFrame(gl, program);

    // gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));

    multTranslation([0, 0, currentForward]);

    sceneGraph();

    requestAnimationFrame(render);
}
