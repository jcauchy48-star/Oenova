const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const { sanitizeCsvFormula, formatCsvValue } = require(path.join(root, "src", "shared-helpers.js"));

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function countMatches(source, pattern) {
  return (source.match(pattern) || []).length;
}

assert.equal(sanitizeCsvFormula("=IMPORTXML(...)"), "'=IMPORTXML(...)");
assert.equal(sanitizeCsvFormula("+SUM(A1:A2)"), "'+SUM(A1:A2)");
assert.equal(sanitizeCsvFormula("-10"), "'-10");
assert.equal(sanitizeCsvFormula("@cmd"), "'@cmd");
assert.equal(formatCsvValue('=HYPERLINK("x")'), "\"'=HYPERLINK(\"\"x\"\")\"");

const app = read("app.js");
const landingHtml = read("index.html");
const appHtml = read("app.html");
const manifest = JSON.parse(read("manifest.webmanifest"));

assert.match(landingHtml, /href="\.\/app\.html"/, "landing page must link to app.html");
assert.match(appHtml, /src="cloud-config-loader\.js"/, "app.html must load cloud config");
assert.match(appHtml, /src="src\/shared-helpers\.js"/, "app.html must load shared helpers");
assert.match(appHtml, /src="app\.js"/, "app.html must load the application script");
assert.equal(manifest.start_url, "./app.html", "PWA must start on app.html");

assert.equal(countMatches(app, /function renderSyncStatus\(/g), 1, "renderSyncStatus must be unique");
assert.equal(countMatches(app, /async function syncWineLibrary\(/g), 1, "syncWineLibrary must be unique");
assert.doesNotMatch(app, /authState\.accessToken|authState\.refreshToken/);
assert.doesNotMatch(app, /localStorage\.setItem\([^)]*(accessToken|refreshToken)/);
assert.match(app, /function installRuntimeGuards\(/);
assert.match(app, /function showStartupError\(/);
assert.match(app, /serviceWorker[\s\S]*\.catch\(\(error\) => logError\(error, "serviceWorker\.register"\)\)/);
assert.match(app, /function isScanApiConfigured\(/);
assert.match(app, /IA non configurée/);
assert.match(app, /function hasKnownUserProfile\(/);
assert.match(app, /function hasUsableCloudSession\(/);

const serviceWorker = read("service-worker.js");
const precacheBlock = serviceWorker.match(/const cachedFiles = \[([\s\S]*?)\];/);
assert.ok(precacheBlock, "service worker must define cachedFiles");
assert.doesNotMatch(precacheBlock[1], /cloud-config\.js/);
assert.match(precacheBlock[1], /\.\/index\.html/, "landing page must be cached");
assert.match(precacheBlock[1], /\.\/app\.html/, "application page must be cached");
assert.match(serviceWorker, /response\.ok/);
assert.doesNotMatch(serviceWorker, /catch\(\(\) => caches\.match\("\.\/index\.html"\)\)/);

console.log("Oenova verification OK");
