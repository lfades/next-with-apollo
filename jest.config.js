module.exports = {
  "roots": [
    "<rootDir>/src"
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
