/** @type {WebGLRenderingContext} */
var gl;
let program;
let canvas;
let aspect;

let time = 0;

const VELOCITY_LIMIT = 5;
const WHEEL_TURN_LIMIT = 30;
const NUMBER_OF_CUBES = 10;

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
const WHEELBASE = VAN_BOX_LENGTH / 2;

let currentMode = WIREFRAME;
let mode = false;
let position = vec3(0, 0, 0);
let velocity = 0;
let acceleration = vec3(0, 0, 0);

let wheelYRotation = 0;

let mProjectionLoc, mModelViewLoc;
let colorModeLoc, colorLoc;

let armRotationZ = 0;
let armRotationY = 0;
let wheelRotation = 0;
let currentRotationAngle = 0;
let camera = TOP;

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
            camera = TOP;
            console.log("Top view");
            break;
        case "2":
            camera = LATERAL;
            console.log("Side view");
            break;
        case "3":
            camera = FRONT;
            console.log("Front view");
            break;
        case "0":
            camera = CUSTOM;
            console.log("Custom view");
            break;
        case " ":
            mode = !mode;
            console.log("Color change");
            break;
        case "W":
            velocity += 50;
            console.log("Move forwards");
            break;
        case "S":
            velocity -= 50;
            console.log("Move backwards");
            break;
        case "A":
            if (wheelRotation > -WHEEL_TURN_LIMIT) {
                wheelRotation -= 5;
            }
            console.log("Steer left");
            break;
        case "D":
            if (wheelRotation < WHEEL_TURN_LIMIT) {
                wheelRotation += 5;
            }
            console.log("Steer right");
            break;
        case "I":
            armRotationZ += 5;
            if (armRotationZ > 165) {
                armRotationZ = 165;
                console.error("Can't go further.")
            }
            console.log("Lift arm");
            break;
        case "K":
            armRotationZ -= 5;
            if (armRotationZ < 0) {
                armRotationZ = 0;
                console.error("Can't go further.")
            }
            console.log("Lower arm");
            break;
        case "J":
            armRotationY += 5;
            console.log("Rotate arm left");
            break;
        case "L":
            armRotationY -= 5;
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

function drawFloor() {
    for (let i = -NUMBER_OF_CUBES / 4; i < NUMBER_OF_CUBES / 4; i++) {
        for (let j = -NUMBER_OF_CUBES / 4; j < NUMBER_OF_CUBES / 4; j++) {
            pushMatrix();
            multTranslation([i * (canvas.width / 4), -VAN_HEIGHT / 2 - WHEEL_DIAMETER / 2, j * (canvas.width / 4)]);
            multScale([canvas.width / 4, 0, canvas.width / 4]);
            gl.uniform4fv(colorLoc, [1.0, 1.0, 1.0, 1.0]);
            drawPrimitive(CUBE);
            popMatrix();
        }
    }
}

window.onresize = function () {
    fit_canvas_to_window();
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Configure WebGL
    fit_canvas_to_window();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
    colorModeLoc = gl.getUniformLocation(program, 'isSolid');
    colorLoc = gl.getUniformLocation(program, 'solidColor');

    render();
}

function drawPrimitive(shape) {
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    switch (shape) {
        case CUBE:
            cubeDrawWireFrame(gl, program);
            break;
        case SPHERE:
            sphereDrawWireFrame(gl, program);
            break;
        case CYLINDER:
            cylinderDrawWireFrame(gl, program);
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
    gl.uniform4fv(colorLoc, [.9, .2, .6, 1.0]);
    drawPrimitive(CUBE);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Front() {
    multScale([VAN_COCKPIT, 2 * VAN_HEIGHT / 3.0, VAN_WIDTH]);
    gl.uniform4fv(colorLoc, [.4, .5, .6, 1.0]);
    drawPrimitive(CUBE);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Wheel() {
    wheelYRotation += calculateWheelRotation(velocity);
    multRotationY(-wheelYRotation);
    multScale([WHEEL_DIAMETER, WHEEL_WIDTH, WHEEL_DIAMETER]);
    gl.uniform4fv(colorLoc, [1.0, 0.0, 1.0, 1.0]);
    drawPrimitive(CYLINDER);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Axle() {
    multScale([10, VAN_WIDTH + WHEEL_WIDTH, 10]);
    gl.uniform4fv(colorLoc, [0.0, 0.7, 0.7, 1.0]);
    drawPrimitive(CYLINDER);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Support() {
    multScale([SUPPORT_DIAMETER, SUPPPORT_HEIGHT, SUPPORT_DIAMETER]);
    gl.uniform4fv(colorLoc, [.0, 1.0, 1.0, 1.0]);
    drawPrimitive(CYLINDER);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Elbow() {
    multScale([SUPPORT_DIAMETER, SUPPORT_DIAMETER, SUPPORT_DIAMETER]);
    gl.uniform4fv(colorLoc, [.6, .0, .9, 1.0]);
    drawPrimitive(SPHERE, currentMode);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Arm() {
    multRotationZ(90);
    multScale([SUPPORT_DIAMETER, HORIZONTAL_ROD_LENGTH, SUPPORT_DIAMETER]);
    gl.uniform4fv(colorLoc, [.0, .9, .6, 1.0]);
    drawPrimitive(CYLINDER);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function Antenna() {
    // multRotationX(time);
    multTranslation([0, -40, 0]);
    multScale([ANTENNA_DIAMETER, ANTENNA_DIAMETER, ANTENNA_DIAMETER]);
    gl.uniform4fv(colorLoc, [.5, .0, .5, 1.0]);
    drawPrimitive(PARABOLOID);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
}

function calculateWheelRotation(dx) {
    // alfa = length / r;
    const r = WHEEL_DIAMETER / 2;
    return dx * Math.PI / r;
}

function computeMovement() {
    // arch
    let angle = radians(-wheelRotation + currentRotationAngle);
    let offsetX = velocity * Math.cos(-angle) * (1 / 60);
    let offsetZ = velocity * Math.sin(-angle) * (1 / 60);

    let offset = velocity * (1 / 60);

    let r = WHEELBASE / Math.tan(radians(-wheelRotation));
    let alpha = 0;
    if (r != Infinity) {
        alpha = (offset / r) * (180 / Math.PI);
    }

    currentRotationAngle += alpha;
    currentRotationAngle %= 360;

    position[0] += offsetX;
    position[2] += offsetZ;

    multTranslation(position);

    multTranslation
    multRotationY(currentRotationAngle);
}

function sceneGraph() {
    drawFloor();

    computeMovement();

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
    multTranslation([0, -VAN_HEIGHT / 2, 0]);
    multRotationX(90);
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
            modelView = lookAt([0, 40, 0], [0, 0, 0], [1, 0, 0]);
            break;
        case LATERAL:
            modelView = lookAt([20, 0, 40], [20, 0, 0], [0, 1, 0]);
            break;
        case FRONT:
            modelView = lookAt([40, 0, 0], [0, 0, 0], [0, 1, 0]);
            break;
        case CUSTOM:
            modelView = lookAt([20, 20, 40], [0, 0, 0], [0, 1, 0]);
            break;
    }
}

function render() {
    time += 1 / 60;

    gl.uniform1i(colorModeLoc, mode);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projection = ortho(-300 * aspect, 300 * aspect, -300, 300, -900, 900);

    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

    setView();
    // multScale([500, 500, 500]);
    // multRotationX(time);
    // multRotationX(90)
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));

    // paraboloidDrawFilled(gl, program);

    sceneGraph();

    requestAnimationFrame(render);
}
