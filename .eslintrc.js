module.exports = {
  "plugins": [
    "prettier",
    "react",
  ],
  "extends": [
    "xo",

    "plugin:react/recommended",
    "xo-react",

    "prettier",
    "prettier/react"
  ],
  "parser": "babel-eslint",
  "globals": {
    "window": false
  },
  "rules": {
    "prettier/prettier": "error",

    /**
     * Not really useful
     */
    "react/require-default-props": "off",
    "react/destructuring-assignment": "off",

    "capitalized-comments": "off",
    "new-cap": ["error", {
      "newIsCap": true,
      "capIsNew": false
    }],
    // Prettier does this
    "no-return-assign": ["off", "except-parens"],
  }
};
