import numpy as np
from scipy.integrate import solve_ivp

def solve_ode(t, y, params):
    # Unpack parameters
    a, dx, dy, sizex, sizey = params
    
    # Reshape the input
    u = y.reshape(sizex, sizey)
    
    # Initialize the new state
    unew = np.zeros([sizex, sizey])
    
    # Apply the finite difference method
    unew[1:-1, 1:-1] = (u[2:, 1:-1] - 2*u[1:-1, 1:-1] + u[:-2, 1:-1]) * a/dx**2 + \
                       (u[1:-1, 2:] - 2*u[1:-1, 1:-1] + u[1:-1, :-2]) * a/dy**2
    
    dydt = unew.flatten()
    
    return dydt

def next_state(current_state, dt, params):    
    # Extract grid sizes from params
    sizex, sizey = int(params[-2]), int(params[-1])  # Assuming the last two parameters are grid sizes

    # Reshape the current_state into a 2D array using the grid sizes
    u0 = np.array(current_state).reshape((sizex, sizey))

    # Solve the ODE
    solution = solve_ivp(solve_ode, [0, dt], u0.flatten(), args=(params,), method='RK45')
    
    # Return the last state of the solution
    return solution.y[:, -1].tolist()
