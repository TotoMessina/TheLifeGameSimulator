// Test setup file
import { vi } from 'vitest';

// Mock global objects
global.state = {
    totalMonths: 0,
    age: 0,
    money: 1000,
    currJobId: 'unemployed',
    workedThisMonth: false,
    stress: 0,
    energy: 100,
    happiness: 50,
    physicalHealth: 100,
    mentalHealth: 100,
    intelligence: 50
};

global.JOBS = [
    { id: 'unemployed', title: 'Desempleado', salary: 0 },
    { id: 'developer', title: 'Desarrollador', salary: 3000, career: 'tech' }
];

global.UI = {
    log: vi.fn(),
    showAlert: vi.fn(),
    render: vi.fn()
};

global.Haptics = {
    error: vi.fn()
};

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
};
global.localStorage = localStorageMock;
