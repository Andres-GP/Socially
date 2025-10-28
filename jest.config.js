const path = require("path");

module.exports = {
  projects: [
    //Backend
    {
      displayName: "node",
      testEnvironment: "node",
      preset: "ts-jest",
      testMatch: ["**/__tests__/**/*.(spec|test).ts"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.node.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },

    //Frontend
    {
      displayName: "jsdom",
      testEnvironment: "jsdom",
      preset: "ts-jest/presets/js-with-ts",
      testMatch: ["**/__tests__/**/*.test.tsx"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.jsdom.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      transformIgnorePatterns: [
        "/node_modules/(?!@clerk/backend|@clerk/nextjs|lucide-react|@radix-ui|uploadthing)",
      ],
      transform: {
        "^.+\\.(ts|tsx|js|jsx|mjs)$": "ts-jest",
      },
    },
  ],
};
