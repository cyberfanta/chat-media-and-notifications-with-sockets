// Global test setup
import 'reflect-metadata';

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.NODE_ENV = 'test';

// Global mocks
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    readdir: jest.fn(),
    unlink: jest.fn(),
    rm: jest.fn(),
  },
  createWriteStream: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  basename: jest.fn((filepath) => filepath.split('/').pop()),
  dirname: jest.fn((filepath) => filepath.split('/').slice(0, -1).join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  extname: jest.fn((filepath) => {
    const parts = filepath.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  }),
}));

// Increase test timeout for integration tests
jest.setTimeout(30000); 