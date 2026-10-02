const CACHE_NAME = "weathergpt-shell-v4";
const APP_FILES = [
  "./",
  "./index.html",
  "./firebase-config.js",
  "./firebase-client.js",
  "./styles.css",
  "./app.js",
  "./agent-core.js",
  "./local-agent.js",
  "./offline-cache.js",
  "./site.webmanifest",
  "./icon.svg",
  "./node_modules/leaflet/dist/leaflet.js",
  "./node_modules/leaflet/dist/leaflet.css",
  "./node_modules/leaflet/dist/images/layers.png",
  "./node_modules/leaflet/dist/images/layers-2x.png",
  "./node_modules/leaflet/dist/images/marker-icon.png",
  "./node_modules/leaflet/dist/images/marker-icon-2x.png",
  "./node_modules/leaflet/dist/images/marker-shadow.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("weathergpt-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).catch((error) => {
      if (event.request.mode === "navigate") return caches.match("./index.html");
      throw error;
    });
  }));
});
