/** @type {import('ts-jest').JestConfigWithTsJest} **/
import '@testing-library/jest-dom';
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};