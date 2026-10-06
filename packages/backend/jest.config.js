module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/**/*.spec.js', '!src/server.js'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },
  restoreMocks: true,
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).js'],
  roots: ['<rootDir>/src']
};
