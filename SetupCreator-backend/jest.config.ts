/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  modulePaths: ["<rootDir>"],
  testMatch: ["**/*.test.ts"],
  // detectOpenHandles: true,
  moduleNameMapper: {
    "^@lib/(.*)$": "<rootDir>/lib/$1",
  },
};
