module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["src"],
  collectCoverage: true,
  setupFiles: ["jest-canvas-mock"],
};
