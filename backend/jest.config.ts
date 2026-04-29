import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "ESNext",
          moduleResolution: "bundler",
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFilesAfterFramework: [],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/cli/**",
    "!src/server.ts",
    "!src/config/cloudinary.ts",
  ],
  coverageThreshold: {
    global: { lines: 70 },
  },
  testTimeout: 30000,
};

export default config;
