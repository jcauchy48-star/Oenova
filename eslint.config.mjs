const browserGlobals = {
  Blob: "readonly",
  FileReader: "readonly",
  Image: "readonly",
  Response: "readonly",
  caches: "readonly",
  crypto: "readonly",
  document: "readonly",
  fetch: "readonly",
  localStorage: "readonly",
  module: "readonly",
  navigator: "readonly",
  self: "readonly",
  window: "readonly"
};

export default [
  {
    files: ["app.js", "service-worker.js", "cloud-config-loader.js", "src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: browserGlobals
    },
    rules: {
      "no-dupe-func": "error",
      "no-unreachable": "error",
      "no-unused-vars": "warn"
    }
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        require: "readonly",
        __dirname: "readonly"
      }
    },
    rules: {
      "no-dupe-func": "error",
      "no-unreachable": "error",
      "no-unused-vars": "warn"
    }
  }
];
