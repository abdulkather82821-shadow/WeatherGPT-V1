(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WeatherGPTOfflineCache = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STORAGE_KEY = "wg-weather-snapshots-v1";
  const VERSION = 1;
  const MAX_LOCATIONS = 8;

  function storageOrDefault(storage) {
    if (storage) return storage;
    try { return typeof localStorage !== "undefined" ? localStorage : null; }
    catch (_) { return null; }
  }

  function locationKey(location) {
    const latitude = Number(location?.latitude);
    const longitude = Number(location?.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null;
    return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  }

  function validWeather(weather) {
    return Boolean(weather && typeof weather === "object" && weather.current &&
      Array.isArray(weather.daily?.time) && weather.daily.time.length > 0);
  }

  function readEntries(storage) {
    const target = storageOrDefault(storage);
    if (!target) return {};
    try {
      const saved = JSON.parse(target.getItem(STORAGE_KEY) || "null");
      return saved?.version === VERSION && saved.entries && typeof saved.entries === "object"
        ? saved.entries
        : {};
    } catch (_) {
      return {};
    }
  }

  function read(location, storage) {
    const key = locationKey(location);
    if (!key) return null;
    const entry = readEntries(storage)[key];
    if (!entry || !validWeather(entry.weather) || !Number.isFinite(entry.weatherSavedAt)) return null;
    return {
      weather: entry.weather,
      air: entry.air && typeof entry.air === "object" ? entry.air : null,
      weatherSavedAt: entry.weatherSavedAt,
      airSavedAt: Number.isFinite(entry.airSavedAt) ? entry.airSavedAt : null
    };
  }

  function write(location, patch, storage, now = Date.now()) {
    const target = storageOrDefault(storage);
    const key = locationKey(location);
    if (!target || !key) return false;
    const entries = readEntries(target);
    const existing = entries[key] || {};
    const entry = {
      ...existing,
      location: {
        name: String(location.name || "Weather location").slice(0, 100),
        country: String(location.country || "").slice(0, 100),
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        timezone: String(location.timezone || "auto").slice(0, 80)
      },
      updatedAt: now
    };
    if (validWeather(patch.weather)) {
      entry.weather = patch.weather;
      entry.weatherSavedAt = Number.isFinite(patch.weatherSavedAt) ? patch.weatherSavedAt : now;
    }
    if (patch.air && typeof patch.air === "object") {
      entry.air = patch.air;
      entry.airSavedAt = Number.isFinite(patch.airSavedAt) ? patch.airSavedAt : now;
    }
    if (!validWeather(entry.weather) || !Number.isFinite(entry.weatherSavedAt)) return false;
    entries[key] = entry;
    const keep = Object.entries(entries)
      .sort(([, left], [, right]) => (Number(right?.updatedAt) || 0) - (Number(left?.updatedAt) || 0))
      .slice(0, MAX_LOCATIONS);
    try {
      target.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, entries: Object.fromEntries(keep) }));
      return true;
    } catch (_) {
      return false;
    }
  }

  function saveWeather(location, weather, savedAt = Date.now(), storage) {
    return write(location, { weather, weatherSavedAt: savedAt }, storage, savedAt);
  }

  function saveAir(location, air, savedAt = Date.now(), storage) {
    const existing = read(location, storage);
    if (!existing) return false;
    return write(location, { weather: existing.weather, weatherSavedAt: existing.weatherSavedAt, air, airSavedAt: savedAt }, storage, savedAt);
  }

  return { MAX_LOCATIONS, STORAGE_KEY, locationKey, read, saveAir, saveWeather };
});
