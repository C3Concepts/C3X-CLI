// jest.setup.js - ES Module version
import { jest } from '@jest/globals';

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock process.exit
process.exit = jest.fn();

// Mock fs-extra
jest.mock('fs-extra', () => ({
  readJsonSync: jest.fn(),
  writeJsonSync: jest.fn(),
  existsSync: jest.fn(),
  ensureDirSync: jest.fn(),
}));

// Mock chalk so we can test output
jest.mock('chalk', () => ({
  green: (text) => `GREEN: ${text}`,
  red: (text) => `RED: ${text}`,
  blue: (text) => `BLUE: ${text}`,
  yellow: (text) => `YELLOW: ${text}`,
}));