const config: import('@jest/types').Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: [
    "<rootDir>/packages/taskx/"
  ],
  testMatch: [
    "**/?(*.)+(spec|test).ts"
  ],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  collectCoverageFrom: [
    "**/*.ts",
    "!**/*.d.ts",
    "!packages/taskx/index.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: [
    "text",
    "lcov",
    "html"
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  moduleFileExtensions: [
    "ts",
    "js",
    "json"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/packages/example"
  ]
}

module.exports = config;
