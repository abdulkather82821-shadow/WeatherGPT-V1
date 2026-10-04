const CACHE_NAME = "weathergpt-shell-v5";
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
  "./vendor/leaflet/leaflet.js",
  "./vendor/leaflet/leaflet.css",
  "./vendor/leaflet/images/layers.png",
  "./vendor/leaflet/images/layers-2x.png",
  "./vendor/leaflet/images/marker-icon.png",
  "./vendor/leaflet/images/marker-icon-2x.png",
  "./vendor/leaflet/images/marker-shadow.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache each shell file separately: one missing file (for example a build
    // output that was not deployed) must not abort the whole offline shell and
    // with it the map library.
    await Promise.all(APP_FILES.map(async (file) => {
      try {
        await cache.add(new Request(file, { cache: "reload" }));
      } catch (error) {
        console.warn("WeatherGPT offline shell could not cache", file, error);
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("weathergpt-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Serve the cached shell immediately, then refresh it in the background so a
  // new deployment is picked up on the next visit instead of being pinned
  // forever by the cache.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const network = fetch(request).then((response) => {
      if (response && response.ok && response.type === "basic") cache.put(request, response.clone());
      return response;
    }).catch((error) => {
      if (cached) return cached;
      if (request.mode === "navigate") return cache.match("./index.html");
      throw error;
    });
    return cached || network;
  })());
});
