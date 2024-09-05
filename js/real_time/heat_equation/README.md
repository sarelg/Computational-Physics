# Heat Equation Simulation

This project simulates the heat equation in real-time using p5.js and Pyodide. The simulation allows you to adjust the grid size and resolution using sliders, and it visualizes the temperature distribution on a canvas.

## Features

- Real-time heat equation simulation
- Adjustable grid size and resolution
- High contrast colormap for temperature visualization
- Pyodide integration for running Python code in the browser

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sarelg/Computational-Physics.git
   cd js/real_time/heat\ equation/
   ```

2. Ensure you have the following files in your project directory:
   - `app.py`
   - `index.html`
   - `sketch.js`
   - `solver.py`

3. Install the required Python Packages
    ```bash
    pip install -r requirements.txt
    ```

4. Run the server
    ```bash
    python app.py
    ```

5. Open the indicated URL in your web browser to run the simulation.

## Usage

- Use the sliders to adjust the grid size and resolution.
- The current values of the grid size and resolution are displayed next to the sliders.
- The canvas will update in real-time to reflect the changes.

## File Structure

- `app.py`: The main Python file that sets up the simulation and runs the heat equation solver.
- `index.html`: The main HTML file that sets up the canvas and includes the p5.js library.
- `sketch.js`: The main JavaScript file that handles user interactions and updates the simulation.
- `solver.py`: The Python file that contains the heat equation solver.

