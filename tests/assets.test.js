// Guards the deploy bug that left the map blank: a file that the app loads at runtime was
// missing from the deployed output (Leaflet lived at "node_modules/leaflet/dist/..." and
// static hosts such as Vercel never serve node_modules).
//
// This test builds the web output and checks that every locally referenced asset really
// exists in it, including the service-worker shell list.
const assert = require("node:assert/strict");
const test = require("node:test");
const { execFileSync } = require("node:child_process");
const { existsSync, readFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");

const root = resolve(dirname(__filename), "..");
const output = resolve(root, "www");

function localReferences(html) {
  const references = [];
  const pattern = /\b(?:src|href)\s*=\s*"([^"]+)"/g;
  let match;
  while ((match = pattern.exec(html))) {
    const value = match[1];
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|data:)/i.test(value)) continue;
    references.push(value.split(/[?#]/)[0]);
  }
  return references;
}

function serviceWorkerShell(script) {
  const block = script.match(/const APP_FILES = \[([\s\S]*?)\];/);
  assert.ok(block, "sw.js should declare the offline shell files in APP_FILES");
  return [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]).filter((file) => file !== "./");
}

test("every asset the app loads at runtime exists in the built web output", () => {
  execFileSync(process.execPath, [resolve(root, "scripts", "build.mjs")], { cwd: root, stdio: "pipe" });

  const mapLibrary = resolve(root, "vendor", "leaflet", "leaflet.js");
  assert.ok(existsSync(mapLibrary), "Leaflet must be vendored in vendor/leaflet so static hosts can serve it");

  const missing = [];
  for (const reference of localReferences(readFileSync(resolve(root, "index.html"), "utf8"))) {
    if (!existsSync(resolve(output, reference))) missing.push(reference);
  }
  for (const reference of serviceWorkerShell(readFileSync(resolve(root, "sw.js"), "utf8"))) {
    if (!existsSync(resolve(output, reference))) missing.push(`sw.js shell: ${reference}`);
  }

  assert.deepEqual(missing, [], `the web build is missing referenced files: ${missing.join(", ")}`);
  assert.ok(existsSync(resolve(output, "vendor", "leaflet", "leaflet.js")), "the build must ship vendor/leaflet");
  assert.ok(existsSync(resolve(output, "agent-core.js")), "the build must ship agent-core.js");
  assert.ok(existsSync(resolve(output, "firebase-client.js")), "the build must bundle firebase-client.js");
});
