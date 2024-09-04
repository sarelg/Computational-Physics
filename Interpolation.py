import numpy as np
import matplotlib.pyplot as plt


def expTaylor(x, x0, n):
    t = 0
    for i in range(n+1):
        t = t + np.exp(x0) * (x - x0)**i / np.math.factorial(i)
    return t


def sinTaylor(x, n):
    t = 0
    for i in range(n+1):
        t = t + (-1)**i * x**(2*i+1) / np.math.factorial(2*i+1)
    return t


def derivative(f, x, h):
    return (f(x+h) - f(x)) / h


def nDerivative(f, x, h, n):
    sum = 0
    for k in range(n+1):
        sum = sum + (-1)**(k+n) * np.math.factorial(n) / (np.math.factorial(k) * np.math.factorial(n-k)) * f(x + k*h)
    return sum / h**n


def correctFunction(x):
    return -2 + 2.4*x - 0.5*x**2 - 0.35*x**3


def PolynomialModel(x, a):
    t = 0
    for k in range(len(a)):
        t = t + a[k]*x**k
    return t


def errorFit(f, a, data):
    error = 0
    for i in range(len(data[0])):
        error = error + (data[1, i] - f(data[0, i], a))**2
        # print(error)
    return error


def gradak(f, a, data, k):
    grad = 0
    for i in range(len(data[0])):
        grad = grad + (data[1, i] - f(data[0, i], a)) * data[0, i]**k
    return -2*grad


def getCoeff(f, a, data):
    initgrad = np.inf
    grada = np.zeros(len(a))
    h = 0.00001
    iterations = 100000

    # while 0 < 1:
    for i in range(iterations):
        for k in range(len(a)):
            grada[k] = gradak(PolynomialModel, a, data, k)
        print(np.linalg.norm(grada))
        if np.linalg.norm(grada) < initgrad:
            a = a - grada*h
            initgrad = np.linalg.norm(grada)
        else:
            break
    return a


if __name__ == "__main__":

    npoints = 21
    x_list = np.linspace(-5, 5, npoints)
    data0 = np.array([x_list, correctFunction(x_list)])

    data = np.array([data0[0] + 0.25*(2*np.random.rand(npoints) - 1), data0[1] + 5*(2*np.random.rand(npoints) - 1)])
    a0 = np.array([1, 1, 1, 1])

    print(getCoeff(PolynomialModel, a0, data))


