let data;
let currentIndex = 0;
let cellSize;

function preload() {
  data = loadJSON('solution_heat.json');
}

function setup() {
  createCanvas(400, 400);
  cellSize = width / 20;
  frameRate(60); // Change frame every second
}

function draw() {
  background(220);
  
  if (data && data.solution) {
    // Use a higher resolution for smoother color transitions
    let resolution = 4 // Increase this for even smoother transitions
    let subCellSize = cellSize / resolution;
    
    for (let i = 0; i < 20 * resolution; i++) {
      for (let j = 0; j < 20 * resolution; j++) {
        // Calculate the fractional position in the grid
        let x = i / resolution;
        let y = j / resolution;
        
        // Bilinear interpolation
        let x0 = Math.floor(x);
        let x1 = Math.min(x0 + 1, 19);
        let y0 = Math.floor(y);
        let y1 = Math.min(y0 + 1, 19);
        
        let tl = data.solution[y0 * 20 + x0][currentIndex];
        let tr = data.solution[y0 * 20 + x1][currentIndex];
        let bl = data.solution[y1 * 20 + x0][currentIndex];
        let br = data.solution[y1 * 20 + x1][currentIndex];
        
        let fx = x - x0;
        let fy = y - y0;
        
        let top = tl * (1 - fx) + tr * fx;
        let bottom = bl * (1 - fx) + br * fx;
        let temp = top * (1 - fy) + bottom * fy;
        
        let t = map(temp, -100, 100, 0, 1); // Normalize temperature to 0-1 range
        let col = highContrastColormap(t);
        fill(col);
        noStroke();
        rect(i * subCellSize, height - j * subCellSize, subCellSize, subCellSize);
      }
    }
    
    currentIndex = (currentIndex + 1) % data.time.length;
  }
}

// High contrast colormap function
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