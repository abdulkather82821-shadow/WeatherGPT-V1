import { cpSync, mkdirSync, rmSync, copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "www");
const shellFiles = ["index.html", "app.js", "local-agent.js", "offline-cache.js", "styles.css", "site.webmanifest", "icon.svg", "sw.js"];

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const file of shellFiles) copyFileSync(resolve(root, file), resolve(output, file));
copyFileSync(resolve(root, "functions", "agent-core.js"), resolve(output, "agent-core.js"));
const firebaseConfig = existsSync(resolve(root, "firebase-config.js")) ? "firebase-config.js" : "firebase-config.example.js";
copyFileSync(resolve(root, firebaseConfig), resolve(output, "firebase-config.js"));
await build({
  entryPoints: [resolve(root, "scripts", "firebase-client.js")],
  bundle: true,
  format: "iife",
  target: "es2020",
  outfile: resolve(output, "firebase-client.js")
});

// Leaflet is vendored in the repository (refresh with `npm run vendor:leaflet`) so the
// map library ships with every build output instead of relying on a runtime
// node_modules path that static hosts such as Vercel do not serve.
const leafletSource = resolve(root, "vendor", "leaflet");
if (!existsSync(resolve(leafletSource, "leaflet.js"))) {
  throw new Error("vendor/leaflet/leaflet.js is missing. Run `npm run vendor:leaflet` (requires `npm install`) and rebuild.");
}
cpSync(leafletSource, resolve(output, "vendor", "leaflet"), { recursive: true });

console.log("Built the WeatherGPT web app and Android WebView assets in www/.");
