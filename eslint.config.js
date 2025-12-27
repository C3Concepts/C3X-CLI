// eslint.config.js - Flat config for ESLint 8+
export default [
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "semi": ["error", "always"],
      "quotes": ["error", "double", { "avoidEscape": true }],
      "no-console": "off"
    }
  }
];