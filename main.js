const canvas = document.getElementById('canvas');
const spinInput = document.getElementById('spin');
const spinButton = document.getElementById('spinButton');
const lineDistanceLabel = document.getElementById('lineDistance');
let isGrabbing = false;
let lineFromCenterLength = 0;
let roundWindowCenter = [];
let startGrabAngle = 0;
let endGrabAngle = 0;

document.addEventListener('DOMContentLoaded', () => {
  roundWindowCenter = [canvas.offsetLeft + 200, canvas.offsetTop + 200];
});

let grabX = 0;
let grabY = 0;
let initialGrabX = 0;
let initialGrabY = 0;

const context = canvas.getContext('2d');
let spinCount = 0;
calculateSpinCount(spinInput.value);

const roundSize = 400;
const roundCenter = roundSize / 2;

const colors = [
  '#ff3949',
  '#59ff5c',
  '#5253ff',
  '#f9ff48',
  '#5dfffa',
  '#f84cff'
]

setCanvasSize(roundSize, roundSize);
drawSegments();

function setCanvasSize (width = 400, height = 400) {
  context.canvas.width = width;
  context.canvas.height = height;
}

function getPoint (x, y, radius, angle) {
  return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
}

function drawSegments (count = 5) {
  const segmentSize = Math.PI * 2 / count;
  for (let i = 0; i < count; i++) {
    drawSegment(segmentSize * i + spinCount, segmentSize * (i + 1) + spinCount, colors[i]);
  }
}

function drawSegment (startAngle, endAngle, color) {
  const [startArcPointX, startArcPointY] = getPoint(startAngle);
  //const [endArcPointX, endArcPointY] = getPoint(endAngle);
  context.beginPath();
  context.moveTo(roundCenter, roundCenter);
  context.lineTo(startArcPointX, startArcPointY);
  context.arc(roundCenter, roundCenter, roundCenter, startAngle, endAngle);
  context.lineTo(roundCenter, roundCenter);
  context.closePath();
  context.fillStyle = color;
  context.strokeStyle = '#000';
  context.strokeWidth = 5;
  context.fill('evenodd');
  context.stroke();
}

function drawGrabbingLine () {
  if (isGrabbing === false)
    return;
  const distance = getLineDistance({ x: 200, y: 200}, { x: grabX, y: grabY });
  context.beginPath();
  context.moveTo(roundCenter, roundCenter);
  context.strokeStyle = '#000';
  context.arc(roundCenter,
    roundCenter,
    distance,
    angleFromPoint(200, 200, initialGrabX, initialGrabY),
    angleFromPoint(200, 200, grabX, grabY));
  //context.lineTo(roundCenter + distance * Math.cos(theta), roundCenter + distance * Math.sin(theta));
  //context.lineTo(grabX, grabY);
  context.closePath();
  context.fillStyle = 'rgba(255, 255, 255, 0.8)';
  context.fill("evenodd");
  context.stroke();
}

function calculateArcDifferenceTheHardWay () {
  spinCount = endGrabAngle - startGrabAngle;
}

function clearCanvas () {
  context.clearRect(0, 0, roundSize, roundSize);
}

function calculateSpinCount (spinPercentage) {
  spinCount = spinPercentage * (Math.PI * 2) / 100;
}

spinInput.addEventListener('input', () => {
  calculateSpinCount(spinInput.value);
});

canvas.addEventListener('mousedown', (e) => {
  isGrabbing = true;
  initialGrabX = e.x - roundWindowCenter[0] + 200;
  initialGrabY = e.y - roundWindowCenter[1] + 200;
});

window.addEventListener('mousemove', (e) => {
  if (isGrabbing) {
    grabX = e.x - roundWindowCenter[0] + 200;
    grabY = e.y - roundWindowCenter[1] + 200;
  }
})

window.addEventListener('mouseup', () => {
  isGrabbing = false;
  initialGrabX = 200;
  initialGrabY = 200;
  grabX = 200;
  grabY = 200;
});

let isLaunched = false;

spinButton.addEventListener("click", () => {
  isLaunched = true;
});

window.requestAnimationFrame(loop);

let oldTimeStamp = 0;
let timePassed = 0;

function loop(timeStamp) {
  const secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;
  update(secondsPassed);
  window.requestAnimationFrame(loop);
}

function update(secondsPassed) {
  const timeToAnimate = 10;
  timePassed += secondsPassed;
  if (isGrabbing) {
    lineFromCenterLength = getLineDistance([200, 200], [grabX, grabY]);
    lineDistanceLabel.innerHTML = lineFromCenterLength;
  }
  if (isLaunched) {
    spinCount = easeOutQuint(timePassed, 0, 130, timeToAnimate);
  }
  startGrabAngle = angleFromPoint(200, 200, initialGrabX, initialGrabY);
  endGrabAngle = angleFromPoint(200, 200, grabX, grabY);
  calculateArcDifferenceTheHardWay();
  draw();
}

function draw() {
  clearCanvas();
  drawSegments();
  drawGrabbingLine();
}

function easeOutQuint (t, b, c, d) {
  return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
}

function getLineDistance (p1, p2) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y)
}


function angleFromPoint (centerX, centerY, pointX, pointY) {
  const dy = pointY - centerY;
  const dx = pointX - centerX;
  let theta = Math.atan2(dy, dx); // range (-PI, PI]
  //theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}

