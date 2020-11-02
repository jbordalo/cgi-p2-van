/** @type {WebGLRenderingContext} */
var gl;
let program;

const CUBE = 0;
const SPHERE = 1;
const CYLINDER = 2;

let instances = [];
let objectInfo = [];
let currentShape = CUBE;
let tx = 0.0, ty = 0.0, tz = 0.0;
let xr = 0.0, yr = 0.0, zr = 0.0;
let sx = 1.0, sy = 1.0, sz = 1.0;
let mModelLoc, mProjectionLoc, mViewLoc;

let mModel, mProjection, mView;

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

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    var at = [0, 0, 0];
    var eye = [1, 1, 1];
    var up = [0, 1, 0];

    mView = lookAt(eye, at, up);
    mProjection = ortho(-2, 2, -2, 2, 10, -10);

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);

    mModelLoc = gl.getUniformLocation(program, "mModel");
    mViewLoc = gl.getUniformLocation(program, 'mView');
    mProjectionLoc = gl.getUniformLocation(program, 'mProjection');

    gl.uniformMatrix4fv(mViewLoc, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));

    generateMModel();
    render();
}

function generateMModel() {
    let mT = translate([tx, ty, tz]);
    let mR = mult(rotateZ(zr), mult(rotateY(yr), rotateX(xr)));
    let mS = scalem([sx, sy, sz]);
    mModel = mult(mult(mT, mR), mS);
}

function drawShape(currentInstance, currentShape) {
    gl.uniformMatrix4fv(mModelLoc, false, flatten(currentInstance));

    switch (currentShape) {
        case CUBE:
            cubeDrawWireFrame(gl, program);
            break;
        case SPHERE:
            sphereDrawWireFrame(gl, program);
            break;
        case CYLINDER:
            cylinderDrawWireFrame(gl, program);
            break;
        default:
            break;
    }
}

function render() {
    generateMModel();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(mModelLoc, false, flatten(mModel));

    drawShape(mModel, currentShape);

    for (let i = 0; i < instances.length; i++) {
        console.log("Drawing instance: " + i);
        drawShape(instances[i], objectInfo[i]);
    }

    requestAnimationFrame(render);
}
