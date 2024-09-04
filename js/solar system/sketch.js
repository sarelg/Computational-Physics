let solarSystemData;
let timeIndex = 0;
const scaleFactor = 1.5e-9; // Adjust this to fit the objects on screen
const moonDistanceMultiplier = 50; // Increase moon's distance from Earth
const traceLength = 200; // Number of frames to keep in the trace

let earthTrace = [];
let moonTrace = [];
let spaceshipTrace = [];

function preload() {
  solarSystemData = loadJSON('solution.json');
}

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  if (solarSystemData && solarSystemData.solution) {
    const sunX = solarSystemData.solution[0][timeIndex] * scaleFactor;
    const sunY = solarSystemData.solution[1][timeIndex] * scaleFactor;
    const earthX = solarSystemData.solution[3][timeIndex] * scaleFactor;
    const earthY = solarSystemData.solution[4][timeIndex] * scaleFactor;
    
    // Adjust moon's position relative to Earth
    const moonRelativeX = (solarSystemData.solution[6][timeIndex] - solarSystemData.solution[3][timeIndex]) * scaleFactor * moonDistanceMultiplier;
    const moonRelativeY = (solarSystemData.solution[7][timeIndex] - solarSystemData.solution[4][timeIndex]) * scaleFactor * moonDistanceMultiplier;
    const moonX = earthX + moonRelativeX;
    const moonY = earthY + moonRelativeY;

    // Add spaceship coordinates
    const spaceshipX = solarSystemData.solution[9][timeIndex] * scaleFactor;
    const spaceshipY = solarSystemData.solution[10][timeIndex] * scaleFactor;
    const spaceshipZ = solarSystemData.solution[11][timeIndex] * scaleFactor;

    // Update traces
    earthTrace.push({x: earthX, y: earthY, age: 0});
    moonTrace.push({x: moonX, y: moonY, age: 0});
    spaceshipTrace.push({x: spaceshipX, y: spaceshipY, age: 0});

    // Increase age of all trace points and remove old ones
    earthTrace = updateTrace(earthTrace);
    moonTrace = updateTrace(moonTrace);
    spaceshipTrace = updateTrace(spaceshipTrace);

    // Draw traces
    drawTrace(earthTrace, 0, 0, 255);
    drawTrace(moonTrace, 200, 200, 200);
    drawTrace(spaceshipTrace, 128, 0, 128);

    // Draw Sun
    fill(255, 255, 0);
    ellipse(sunX, sunY, 20, 20);

    // Draw Earth
    fill(0, 0, 255);
    ellipse(earthX, earthY, 10, 10);

    // Draw Moon
    fill(200);
    ellipse(moonX, moonY, 5, 5);

    // Draw Spaceship
    fill(128, 0, 128);  // Purple color
    ellipse(spaceshipX, spaceshipY, 10, 10);

    timeIndex = (timeIndex + 1) % solarSystemData.time.length;
  }
}

function updateTrace(trace) {
  return trace.filter(point => {
    point.age++;
    return point.age < traceLength;
  });
}

function drawTrace(trace, r, g, b) {
  const traceThickness = 2; // Add a variable for trace thickness
  noFill();
  for (let i = 1; i < trace.length; i++) {
    const alpha = map(trace[i].age, 0, traceLength, 100, 0);
    stroke(r, g, b, alpha);
    strokeWeight(traceThickness); // Set the stroke weight using the new variable
    line(trace[i-1].x, trace[i-1].y, trace[i].x, trace[i].y);
  }
  strokeWeight(1); // Reset stroke weight to default after drawing the trace
}