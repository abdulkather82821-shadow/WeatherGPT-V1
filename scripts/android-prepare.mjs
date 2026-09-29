// Prepares the Capacitor Android project for building: creates it when it is not checked in,
// makes sure the permissions the app needs are declared, and installs optional Firebase files.
// Usage: node scripts/android-prepare.mjs   (run `npm run build:web` first)
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

export const REQUIRED_PERMISSIONS = [
  "android.permission.INTERNET",
  "android.permission.ACCESS_NETWORK_STATE",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.RECORD_AUDIO",
  "android.permission.POST_NOTIFICATIONS"
];

const QUERIES = `    <queries>
        <intent><action android:name="android.intent.action.TTS_SERVICE" /></intent>
        <intent><action android:name="android.speech.RecognitionService" /></intent>
    </queries>
`;

export function patchManifest(xml) {
  const eol = xml.includes("\r\n") ? "\r\n" : "\n";
  let out = xml.replace(/\r\n/g, "\n");
  const missing = REQUIRED_PERMISSIONS.filter((name) => !out.includes(`"${name}"`));
  let block = missing.map((name) => `    <uses-permission android:name="${name}" />\n`).join("");
  if (!/<queries[\s>]/.test(out)) block += QUERIES;
  if (block) {
    if (!out.includes("</manifest>")) throw new Error("AndroidManifest.xml has no closing </manifest> tag.");
    out = out.replace("</manifest>", `\n${block}</manifest>`);
  }
  return out.replace(/\n/g, eol);
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const run = (command) => execSync(command, { cwd: root, stdio: "inherit" });
  if (!existsSync(resolve(root, "www", "index.html"))) throw new Error("Run `npm run build:web` first.");
  if (!existsSync(resolve(root, "android"))) run("npx cap add android");

  const manifestPath = resolve(root, "android", "app", "src", "main", "AndroidManifest.xml");
  writeFileSync(manifestPath, patchManifest(readFileSync(manifestPath, "utf8")));
  console.log("AndroidManifest.xml declares the permissions WeatherGPT needs.");

  const services = process.env.GOOGLE_SERVICES_JSON_BASE64;
  if (services) {
    const target = resolve(root, "android", "app", "google-services.json");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, Buffer.from(services, "base64"));
    console.log("Installed google-services.json from GOOGLE_SERVICES_JSON_BASE64.");
  } else if (!existsSync(resolve(root, "android", "app", "google-services.json"))) {
    console.log("No google-services.json: the APK builds, but native Google sign-in stays unavailable.");
  }
  run("npx cap sync android");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
