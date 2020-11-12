/** @type {WebGLRenderingContext} */
var gl;
let program;
let canvas;

let time = 0;

const VELOCITY_LIMIT = 5;

const CUBE = 0;
const SPHERE = 1;
const CYLINDER = 2;
const PARABOLOID = 3;
const WIREFRAME = 0;
const FULL = 1;

const CUSTOM = 0;
const TOP = 1;
const LATERAL = 2;
const FRONT = 3;

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
let dx = 0;
let xPos = 0;
let wheelYRotation = 0;

let mProjectionLoc, mModelViewLoc;

let armRotationZ = 0;
let armRotationY = 0;
let wheelRotation = 0;
let camera = CUSTOM;

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

document.addEventListener('keydown', e => {
    const keyName = e.key;
    // console.log(keyName);
    switch (keyName.toUpperCase()) {
        case "1":
            // topView();
            camera = TOP;
            console.log("Top view");
            break;
        case "2":
            camera = LATERAL;
            console.log("Side view");
            break;
        case "3":
            // frontView():
            camera = FRONT;
            console.log("Front view");
            break;
        case "0":
            // customView();
            camera = CUSTOM;
            console.log("Custom view");
            break;
        case " ":
            // changeColors();
            currentMode = currentMode == WIREFRAME ? FULL : WIREFRAME;
            console.log("Color change");
            break;
        case "W":
            // goForwards();
            dx = dx + 1 < VELOCITY_LIMIT ? dx += 1 : dx;
            console.log("Move forwards");
            break;
        case "S":
            // goBackwards();
            dx = Math.abs(dx - 1) < VELOCITY_LIMIT ? dx -= 1 : dx;
            console.log("Move backwards");
            break;
        case "A":
            // steerLeft();
            if (wheelRotation < 40) {
                wheelRotation += 5;
            }
            console.log("Steer left");
            break;
        case "D":
            // steerRight();
            if (wheelRotation > -40) {
                wheelRotation -= 5;
            }
            console.log("Steer right");
            break;
        case "I":
            // liftArm();
            armRotationZ += 5;
            if (armRotationZ > 165) {
                armRotationZ = 165;
                console.error("Can't go further.")
            }
            console.log("Lift arm");
            break;
        case "K":
            // lowerArm();
            armRotationZ -= 5;
            if (armRotationZ < 0) {
                armRotationZ = 0;
                console.error("Can't go further.")
            }
            console.log("Lower arm");
            break;
        case "J":
            // rotateArmLeft();
            armRotationY -= 5;
            console.log("Rotate arm left");
            break;
        case "L":
            // rotateArmRight();
            armRotationY += 5;
            console.log("Rotate arm right");
            break;
        default:
            console.error("Unrecognized key");
            break;
    }
});

function fit_canvas_to_window() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    aspect = canvas.width / canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);

}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Configure WebGL
    fit_canvas_to_window();
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    paraboloidInit(gl);

    mModelViewLoc = gl.getUniformLocation(program, 'mModelView');
    mProjectionLoc = gl.getUniformLocation(program, 'mProjection');

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
        case PARABOLOID:
            paraboloidDrawWireFrame(gl, program);
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
    multScale([VAN_COCKPIT, 2 * VAN_HEIGHT / 3.0, VAN_WIDTH]);
    drawPrimitive(CUBE, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Wheel() {
    wheelYRotation += calculateWheelRotation(dx);
    multRotationY(-wheelYRotation);
    multScale([WHEEL_DIAMETER, WHEEL_WIDTH, WHEEL_DIAMETER]);
    drawPrimitive(CYLINDER, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Axle() {
    multScale([10, VAN_WIDTH + WHEEL_WIDTH, 10]);
    drawPrimitive(CYLINDER, currentMode);

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Support() {
    multScale([SUPPORT_DIAMETER, SUPPPORT_HEIGHT, SUPPORT_DIAMETER]);
    drawPrimitive(CYLINDER, currentMode);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Elbow() {
    multScale([SUPPORT_DIAMETER, SUPPORT_DIAMETER, SUPPORT_DIAMETER]);
    drawPrimitive(SPHERE, currentMode);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Arm() {
    multRotationZ(90);
    multScale([SUPPORT_DIAMETER, HORIZONTAL_ROD_LENGTH, SUPPORT_DIAMETER]);
    drawPrimitive(CYLINDER, currentMode);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Antenna() {
    // multRotationX(time);
    multTranslation([0, -40, 0]);
    multScale([ANTENNA_DIAMETER, ANTENNA_DIAMETER, ANTENNA_DIAMETER]);
    drawPrimitive(PARABOLOID, currentMode);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function calculateWheelRotation(dx) {
    // alfa = length / r;
    const r = WHEEL_DIAMETER / 2;
    return dx * Math.PI / r;
}

function sceneGraph() {
    pushMatrix();
    multTranslation([0, -VAN_HEIGHT / 2 - WHEEL_DIAMETER / 2, 0]);
    multScale([canvas.width, 0, canvas.height]);
    drawPrimitive(CUBE, WIREFRAME);
    popMatrix();

    xPos += dx;
    multTranslation([xPos, 0, 0]);



    pushMatrix();
    Chassis();
    popMatrix();
    pushMatrix();
    multTranslation([VAN_BOX_LENGTH / 2 + VAN_COCKPIT / 2, -VAN_HEIGHT / 3 + VAN_HEIGHT / 6, 0]);
    Front();
    popMatrix();
    pushMatrix();
    multTranslation([VAN_BOX_LENGTH / 4, 0, 0]);

    pushMatrix();
    // pushMatrix();
    multTranslation([0, -VAN_HEIGHT / 2, 0]);
    multRotationX(90);
    //multRotationY(-time);
    Axle();
    popMatrix();
    pushMatrix();
    multTranslation([0, -VAN_HEIGHT / 2, -VAN_WIDTH / 2]);
    multRotationX(90);
    multRotationZ(wheelRotation);
    Wheel();
    popMatrix();
    pushMatrix();
    multTranslation([0, -VAN_HEIGHT / 2, VAN_WIDTH / 2]);
    multRotationX(90);
    multRotationZ(wheelRotation);
    Wheel();
    popMatrix();
    popMatrix();
    pushMatrix();
    multTranslation([-VAN_BOX_LENGTH / 4, 0, 0]);
    pushMatrix();
    pushMatrix();
    multTranslation([0, -VAN_HEIGHT / 2, 0]);
    multRotationX(90);
    //multRotationY(-time);
    Axle();
    popMatrix();
    multTranslation([0, -VAN_HEIGHT / 2, VAN_WIDTH / 2]);
    multRotationX(90);
    Wheel();
    popMatrix();
    pushMatrix();
    multTranslation([0, -VAN_HEIGHT / 2, -VAN_WIDTH / 2]);
    multRotationX(90);
    Wheel();
    popMatrix();
    popMatrix();
    //TODO this translation can take the elements to the top of the van
    // and then other translations specific to the elements are done in their place
    multTranslation([0, VAN_HEIGHT / 2 + SUPPPORT_HEIGHT / 2, 0]);
    pushMatrix();
    Support();
    popMatrix();
    multTranslation([0, SUPPPORT_HEIGHT / 2, 0]);
    multRotationY(armRotationY);
    multRotationZ(armRotationZ);
    pushMatrix();
    Elbow();
    popMatrix();
    pushMatrix();
    multTranslation([HORIZONTAL_ROD_LENGTH / 2, 0, 0]);
    Arm();
    popMatrix();
    pushMatrix();
    multTranslation([HORIZONTAL_ROD_LENGTH, 2 * SUPPPORT_HEIGHT, 0]);
    Antenna();
    popMatrix();
    pushMatrix();
    multTranslation([HORIZONTAL_ROD_LENGTH, 0, 0]);
    Support();
    popMatrix();
    popMatrix();
}

function setView() {
    switch (camera) {
        case TOP:
            modelView = lookAt([20, -40, 0], [20, 0, 0], [1, 0, 0]);
            break;
        case LATERAL:
            modelView = lookAt([20, 0, 40], [20, 0, 0], [0, 1, 0]);
            break;
        case FRONT:
            modelView = lookAt([40, 0, 0], [0, 0, 0], [0, 1, 0]);
            break;
        case CUSTOM:
            modelView = lookAt([-20, -20, 40], [0, 0, 0], [0, 1, 0]);
            break;
    }
}

function render() {
    time += 1;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projection = ortho(-300, 300, -300, 300, 900, -900);

    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

    setView();
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));

    sceneGraph();

    requestAnimationFrame(render);
}
