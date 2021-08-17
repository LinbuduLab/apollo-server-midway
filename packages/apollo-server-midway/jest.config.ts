module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/tests/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/tests/'],
};
