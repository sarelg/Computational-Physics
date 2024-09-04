import numpy as np
from scipy.integrate import solve_ivp

def ode_system(t, y, params):
    # Unpack state variables
    r1 = y[0:3]
    r2 = y[3:6]
    r3 = y[6:9]
  
    
    r12 = np.linalg.norm(r1 - r2)
    r31 = np.linalg.norm(r3 - r1)
    r23 = np.linalg.norm(r2 - r3)

    # Unpack parameters
    G, m1, m2, m3 = params[:4]
    
    # Example: gravitational force between Sun and Earth

    a_sun = G * np.array([- (m2/r12**3 + m3/r31**3) * r1 + m2/r12**3 * r2 + m3/r31**3 * r3])
    a_earth = G * np.array([- (m1/r12**3 + m3/r23**3) * r2 + m1/r12**3 * r1 + m3/r23**3 * r3])
    a_moon = G * np.array([- (m1/r31**3 + m2/r23**3) * r3 + m1/r31**3 * r1 + m2/r23**3 * r2])
        
    # Combine all derivatives
    dydt = np.concatenate([y[9:18], a_sun.flatten(), a_earth.flatten(), a_moon.flatten()])
    return dydt

def next_state(current_state, dt, params):
    sol = solve_ivp(ode_system, [0, dt], current_state, args=(params,), method='RK45', rtol=1e-9, atol=1e-12)
    return sol.y[:, -1]  # Return the last state

# if __name__ == "__main__":
#     # This section is for testing the Python script independently
#     initial_state = np.zeros(18)  # Example initial state
#     params = [6.67430e-11, 1.9884e30, 5.9723e24, 7.349e22]  # Example parameters
#     dt = 0.1
    
#     next_state_value = next_state(initial_state, dt, params)
#     print(f"Next state: {next_state_value}")
