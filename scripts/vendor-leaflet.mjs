// Copies the Leaflet map library from the installed npm package into ./vendor/leaflet,
// which is committed so every deploy target serves the map library itself:
// the Vercel static deployment, the `www/` web build and the Capacitor Android assets.
// Usage: npm run vendor:leaflet
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "node_modules", "leaflet", "dist");
const destination = resolve(root, "vendor", "leaflet");
// Only the files the app loads at runtime; source maps and the -src/ESM builds are not needed.
const runtimeFiles = ["leaflet.js", "leaflet.css"];

if (!existsSync(resolve(source, "leaflet.js"))) {
  console.error("node_modules/leaflet is missing. Run `npm install` first.");
  process.exit(1);
}

rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
for (const file of runtimeFiles) cpSync(resolve(source, file), resolve(destination, file));
cpSync(resolve(source, "images"), resolve(destination, "images"), { recursive: true });

const version = JSON.parse(readFileSync(resolve(root, "node_modules", "leaflet", "package.json"), "utf8")).version;
console.log(`Vendored Leaflet ${version} into vendor/leaflet/ (${runtimeFiles.length} files + images).`);
