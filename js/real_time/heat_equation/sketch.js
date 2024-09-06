let pyodide;
let state;
let params;
let cellSize;
let pyodideReady = false;
let gridSize = 20;  // Number of cells in each dimension
let resolution = 4; // Number of subcells per cell for smoother rendering
let leftTemp = 100;
let rightTemp = -100;
let topTemp = -200;
let bottomTemp = 200;
let gridSizeSlider, resolutionSlider;
let leftTempInput, rightTempInput, topTempInput, bottomTempInput, updateButton;

async function setup() {
  let canvas = createCanvas(600, 600).parent('canvas-container');
  cellSize = width / gridSize;
  frameRate(60);
  noLoop();  // Stop the draw loop initially

  // Create sliders
  let rightSetupContainer = select('#right-setup-container');

  gridSizeSlider = createSlider(10, 30, gridSize, 1).parent(rightSetupContainer);
  createP(`Grid Size: ${gridSize}`).id('gridSizeText').parent(rightSetupContainer).style('color', 'white');

  resolutionSlider = createSlider(1, 8, resolution, 1).parent(rightSetupContainer);
  createP(`Resolution: ${resolution}`).id('resolutionText').parent(rightSetupContainer).style('color', 'white');

  // Create input fields and button for temperature values
  let leftSetupContainer = select('#left-setup-container');

  let leftTempContainer = createDiv().parent(leftSetupContainer).style('display', 'flex').style('justify-content', 'space-between').style('width', '90%');
  createP('Left Temperature:').parent(leftTempContainer).style('color', 'white').style('margin', '10px');
  leftTempInput = createInput(leftTemp.toString()).parent(leftTempContainer).style('background', 'black').style('color', 'white').style('width', '40px').style('text-align', 'center');

  let rightTempContainer = createDiv().parent(leftSetupContainer).style('display', 'flex').style('justify-content', 'space-between').style('width', '90%');
  createP('Right Temperature:').parent(rightTempContainer).style('color', 'white').style('margin', '10px');
  rightTempInput = createInput(rightTemp.toString()).parent(rightTempContainer).style('background', 'black').style('color', 'white').style('width', '40px').style('text-align', 'center');

  let topTempContainer = createDiv().parent(leftSetupContainer).style('display', 'flex').style('justify-content', 'space-between').style('width', '90%');
  createP('Top Temperature:').parent(topTempContainer).style('color', 'white').style('margin', '10px');
  topTempInput = createInput(topTemp.toString()).parent(topTempContainer).style('background', 'black').style('color', 'white').style('width', '40px').style('text-align', 'center');

  let bottomTempContainer = createDiv().parent(leftSetupContainer).style('display', 'flex').style('justify-content', 'space-between').style('width', '90%');
  createP('Bottom Temperature:').parent(bottomTempContainer).style('color', 'white').style('margin', '10px');
  bottomTempInput = createInput(bottomTemp.toString()).parent(bottomTempContainer).style('background', 'black').style('color', 'white').style('width', '40px').style('text-align', 'center');
  
  updateButton = createButton('Update Values').parent(leftSetupContainer);
  updateButton.mousePressed(updateValues);

  // Initialize parameters:
  params = [2.0, 1.0, 1.0, gridSize, gridSize];
  state = initializeState(gridSize, leftTemp, rightTemp, topTemp, bottomTemp);

  // Load Pyodide
  try {
    console.log("Loading Pyodide...");
    pyodide = await loadPyodide();
    console.log("Pyodide loaded successfully");

    console.log("Loading numpy and scipy...");
    await pyodide.loadPackage("numpy");
    await pyodide.loadPackage("scipy");
    console.log("numpy and scipy loaded successfully");

    console.log("Fetching solver.py...");
    const response = await fetch('solver.py');
    const solverCode = await response.text();
    console.log("solver.py fetched successfully");

    console.log("Executing solver code...");
    pyodide.runPython(solverCode);
    console.log("Solver code executed successfully");

    pyodideReady = true;
    console.log("Setup complete, pyodideReady =", pyodideReady);
    loop();  // Start the draw loop once Pyodide is ready
  } catch (error) {
    console.error("Error during setup:", error);
  }
}

async function draw() {
  // Check if grid size or resolution has changed
  let newGridSize = gridSizeSlider.value();
  let newResolution = resolutionSlider.value();
  let sliderChanged = newGridSize !== gridSize || newResolution !== resolution;
  
  if (sliderChanged) {
    // Update text elements with new values
    select('#gridSizeText').html(`Grid Size: ${newGridSize}`);
    select('#resolutionText').html(`Resolution: ${newResolution}`);
  }
  
  if (pyodideReady) {
    // Call Python function to get next state
    try {
      if (sliderChanged) {
        gridSize = newGridSize;
        resolution = newResolution;
        // Reinitialize state and params here if needed
        state = initializeState(gridSize, leftTemp, rightTemp, topTemp, bottomTemp);
        params = [2.0, 1.0, 1.0, gridSize, gridSize];
      }
      
      const updateState = JSON.stringify(state);
      const updateParams = JSON.stringify(params);
      
      state = await pyodide.runPython(`
        import numpy as np
        import js
        np.array(next_state(${updateState}, 0.1, ${updateParams})).tolist()
      `);
      
      // Convert the returned Python object to a JavaScript array
      state = state.toJs();
      
      // Draw the solution only after the state has been updated
      drawSolution();
    } catch (error) {
      console.error("Error running Python code:", error);
      pyodideReady = false;  // Prevent further attempts if there's an error
    }
  } else {
    // If Pyodide is not ready, show a gray loading screen
    background(200);  // Set background to gray
    fill(0);  // Set text color to black
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Loading...", width / 2, height / 2);
  }
}

function initializeState(gridSize, leftTemp, rightTemp, topTemp, bottomTemp) {
  // Define initial conditions as a 2D array
  let initialConditions = Array(gridSize).fill().map(() => Array(gridSize).fill(0));

  // Set heat bath at the edges
  for (let i = 0; i < gridSize; i++) {
    initialConditions[i][0] = leftTemp;
    initialConditions[i][gridSize-1] = rightTemp;
    initialConditions[0][i] = bottomTemp;
    initialConditions[gridSize-1][i] = topTemp;
  }

  // Flatten the 2D array into the state array
  return initialConditions.flat();
}

function updateValues() {
  // Get the new temperature values from the input fields
  leftTemp = parseFloat(leftTempInput.value());
  rightTemp = parseFloat(rightTempInput.value());
  topTemp = parseFloat(topTempInput.value());
  bottomTemp = parseFloat(bottomTempInput.value());

  // Reinitialize the state with the new temperature values
  state = initializeState(gridSize, leftTemp, rightTemp, topTemp, bottomTemp);
  params = [2.0, 1.0, 1.0, gridSize, gridSize];

  // Redraw the canvas with the updated state
  drawSolution();
}

function drawSolution() {
  let subCellSize = width / ((gridSize - 2) * resolution);

  for (let i = 0; i < (gridSize - 2) * resolution; i++) {
    for (let j = 0; j < (gridSize - 2) * resolution; j++) {
      // Calculate the fractional position in the grid, offset by 1 to skip the edges
      let x = (i / resolution) + 1;
      let y = (j / resolution) + 1;
      
      // Bilinear interpolation
      let x0 = Math.floor(x);
      let x1 = Math.min(x0 + 1, gridSize - 1);
      let y0 = Math.floor(y);
      let y1 = Math.min(y0 + 1, gridSize - 1);
      
      let tl = state[y0 * gridSize + x0];
      let tr = state[y0 * gridSize + x1];
      let bl = state[y1 * gridSize + x0];
      let br = state[y1 * gridSize + x1];
      
      let fx = x - x0;
      let fy = y - y0;
      
      let top = tl * (1 - fx) + tr * fx;
      let bottom = bl * (1 - fx) + br * fx;
      let temp = top * (1 - fy) + bottom * fy;
      
      let t = map(temp, -100, 100, 0, 1); // Normalize temperature to 0-1 range
      let col = highContrastColormap(t);
      fill(col);
      noStroke();
      rect(i * subCellSize, height - (j + 1) * subCellSize, subCellSize, subCellSize);
    }
  }
}

function highContrastColormap(t) {
  // Define color stops for a high contrast colormap
  let colorStops = [
    {t: 0.0, r: 0, g: 0, b: 255},    // Blue (for coldest temperatures)
    {t: 0.2, r: 0, g: 255, b: 255},  // Cyan
    {t: 0.4, r: 0, g: 255, b: 0},    // Green
    {t: 0.5, r: 255, g: 255, b: 0},  // Yellow (for temperatures around 0)
    {t: 0.6, r: 255, g: 128, b: 0},  // Orange
    {t: 0.8, r: 255, g: 0, b: 0},    // Red
    {t: 1.0, r: 128, g: 0, b: 0}     // Dark Red (for hottest temperatures)
  ];

  // Find the two color stops that our t value falls between
  let lower, upper;
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (t >= colorStops[i].t && t <= colorStops[i+1].t) {
      lower = colorStops[i];
      upper = colorStops[i+1];
      break;
    }
  }

  // Handle edge cases
  if (!lower || !upper) {
    if (t < colorStops[0].t) {
      return color(colorStops[0].r, colorStops[0].g, colorStops[0].b);
    } else if (t > colorStops[colorStops.length - 1].t) {
      let last = colorStops[colorStops.length - 1];
      return color(last.r, last.g, last.b);
    }
  }

  // If t is exactly 1.0, use the last color stop
  if (t === 1.0) {
    let last = colorStops[colorStops.length - 1];
    return color(last.r, last.g, last.b);
  }

  // Interpolate between the two color stops
  let range = upper.t - lower.t;
  let factor = (t - lower.t) / range;

  let r = lerp(lower.r, upper.r, factor);
  let g = lerp(lower.g, upper.g, factor);
  let b = lerp(lower.b, upper.b, factor);

  return color(r, g, b);
}
