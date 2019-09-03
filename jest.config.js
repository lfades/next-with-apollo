module.exports = {
  "roots": [
    "<rootDir>/src",
    "<rootDir>/integration"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json"
  ],
  "coverageDirectory": "coverage",
  "collectCoverageFrom": [
    "src/**.ts",
    "!src/app.d.ts"
  ]
}
