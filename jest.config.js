const path = require("path");

module.exports = {
  projects: [
    // Backend (Node)
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

    // Frontend (React / Next.js)
    {
      displayName: "jsdom",
      testEnvironment: "jsdom",
      preset: "ts-jest/presets/js-with-ts",
      testMatch: ["**/__tests__/**/*.test.tsx"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.jsdom.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },

      transform: {
        "^.+\\.(ts|tsx|js|jsx|mjs)$": [
          "babel-jest",
          {
            presets: [
              ["@babel/preset-env", { targets: { node: "current" } }],
              "@babel/preset-typescript",
              "@babel/preset-react",
            ],
          },
        ],
      },

      transformIgnorePatterns: [
        "/node_modules/(?!(lucide-react|@radix-ui|uploadthing|@clerk/nextjs|@clerk/backend)/)",
      ],

      // 👇 quitamos '.mjs'
      extensionsToTreatAsEsm: [".ts", ".tsx"],

      globals: {
        "ts-jest": {
          useESM: true,
        },
      },
    },
  ],
};
