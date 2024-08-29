/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['.dist/*'],
  collectCoverageFrom: ['**/*.ts', '!**/node_modules/**'],
};
