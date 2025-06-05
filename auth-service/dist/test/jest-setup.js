jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
};
//# sourceMappingURL=jest-setup.js.map