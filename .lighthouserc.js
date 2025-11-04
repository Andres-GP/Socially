module.exports = {
  ci: {
    collect: {
      url: ["https://socially-mu-ten.vercel.app/"],
      startServerCommand: "npm run start",
      numberOfRuns: 3,
    },
    assert: {
      preset: "lighthouse:recommended",
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
