let pyodide;
let state;
let params;
let setupComplete = false;

let moonDistanceScale = 50; // Default scale (no change)

// Add arrays to store trajectory points
let sunTrajectory = [];
let earthTrajectory = [];
let moonTrajectory = [];
const maxTrajectoryPoints = 200; // Reduced number of points to keep in the trajectory

async function setup() {
  createCanvas(800, 600);
  
  // Constants in SI units
  const G = 6.67430e-11; // Gravitational constant (m^3 / (kg * s^2))

  // Masses
  const msun = 1.9884e30; // Sun mass (kg)
  const mearth = 5.9723e24; // Earth mass (kg)
  const mmoon = 7.349e22; // Moon mass (kg)

  // Distances (average)
  const rSunEarth = 1.4960e11; // Sun-Earth distance (m)
  const rEarthMoon = 3.850e8; // Earth-Moon distance (m)

  // Velocities (average)
  const vEarth = 29780; // Earth's velocity around Sun (m/s)
  const vMoon = 1022; // Moon's velocity around Earth (m/s)

  // Initialize parameters
  params = [G, msun, mearth, mmoon, rSunEarth, rEarthMoon, vEarth, vMoon];
  
  // Initialize state for Sun, Earth, and Moon
  state = [
    // Sun position
    0, 0, 0,
    // Earth position
    rSunEarth, 0, 0,
    // Moon position
    rSunEarth, rEarthMoon, 0,
    // Sun velocity
    0, 0, 0,
    // Earth velocity
    0, vEarth, 0,
    // Moon velocity
    -vMoon, vEarth, 0
  ];
  
  // Initialize Pyodide
  pyodide = await loadPyodide();
  await pyodide.loadPackage("numpy");
  await pyodide.loadPackage("scipy");
  
  // Load Python script
  await pyodide.runPythonAsync(await (await fetch('solver.py')).text());

  setupComplete = true;
}

function draw() {
  if (!setupComplete) {
    // Display loading message
    background(155);
    fill(0);
    textAlign(CENTER, CENTER);
    text("Loading...", width/2, height/2);
    return;
  }
  
  // Call Python function to get next state
  // Use a day's worth of seconds for dt (86400 seconds in a day)
  pyodide.runPythonAsync(`
    import numpy as np
    next_state(np.array(${JSON.stringify(state)}), 86400, np.array(${JSON.stringify(params)})).tolist()
  `).then(result => {
    state = result.toJs();

    // Draw the solution
    drawSolution();
    
    // Update any other visual elements
    updateVisuals();
  });
}

function drawSolution() {
  // Define scale factor to map astronomical distances to canvas size
  const scaleFactor = width / (3.5 * params[4]); // Assuming params[4] is rSunEarth
  
  // Extract positions from state
  let sunX = (state[0] * scaleFactor + width/2) % width;
  let sunY = (state[1] * scaleFactor + height/2) % height;
  let earthX = (state[3] * scaleFactor + width/2) % width;
  let earthY = (state[4] * scaleFactor + height/2) % height;
  
  // Apply moonDistanceScale to Moon's position relative to Earth
  let moonRelativeX = (state[6] - state[3]) * scaleFactor * moonDistanceScale;
  let moonRelativeY = (state[7] - state[4]) * scaleFactor * moonDistanceScale;
  let moonX = (earthX + moonRelativeX + width) % width;
  let moonY = (earthY + moonRelativeY + height) % height;
  
  background(0);

  // Update trajectories
  sunTrajectory.push({x: sunX, y: sunY, age: 0});
  earthTrajectory.push({x: earthX, y: earthY, age: 0});
  moonTrajectory.push({x: moonX, y: moonY, age: 0});

  // Update age of trajectory points and remove old ones
  updateTrajectory(sunTrajectory);
  updateTrajectory(earthTrajectory);
  updateTrajectory(moonTrajectory);

  // Draw trajectories
  drawTrajectory(sunTrajectory, color(255, 255, 0));
  drawTrajectory(earthTrajectory, color(0, 0, 255));
  drawTrajectory(moonTrajectory, color(200, 200, 200));

  // Draw Sun (yellow)
  fill(255, 255, 0);
  ellipse(sunX, sunY, 20, 20);
  
  // Draw Earth (blue)
  fill(0, 0, 255);
  ellipse(earthX, earthY, 10, 10);
  
  // Draw Moon (gray)
  fill(200);
  ellipse(moonX, moonY, 5, 5);
}

function updateTrajectory(trajectory) {
  for (let i = trajectory.length - 1; i >= 0; i--) {
    trajectory[i].age++;
    if (trajectory[i].age > maxTrajectoryPoints) {
      trajectory.splice(i, 1);
    }
  }
}

function drawTrajectory(trajectory, color) {
  noFill();
  for (let i = 1; i < trajectory.length; i++) {
    let alpha = map(trajectory[i].age, 0, maxTrajectoryPoints, 255, 0);
    stroke(red(color), green(color), blue(color), alpha);
    line(trajectory[i-1].x, trajectory[i-1].y, trajectory[i].x, trajectory[i].y);
  }
}

function updateVisuals() {
  // Update any other visual elements, such as text displays or controls
  // For example, display the current time
  let days = frameCount;
  fill(255);
  textAlign(LEFT, TOP);
  text(`Days elapsed: ${days}`, 10, 10);
}
