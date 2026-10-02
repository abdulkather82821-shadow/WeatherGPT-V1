const assert = require("node:assert/strict");
const test = require("node:test");
const cache = require("../offline-cache");

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, value); }
}

function weather(label) {
  return { current: { temperature_2m: 21 }, daily: { time: ["2026-10-01"], label } };
}

function location(name, latitude, longitude) {
  return { name, country: "India", latitude, longitude, timezone: "Asia/Kolkata" };
}

test("offline weather snapshots are keyed by precise coordinates and preserve air quality", () => {
  const storage = new MemoryStorage();
  const pune = location("Pune", 18.5204, 73.8567);
  const delhi = location("Delhi", 28.6139, 77.209);

  assert.equal(cache.saveWeather(pune, weather("Pune forecast"), 100, storage), true);
  assert.equal(cache.saveAir(pune, { us_aqi: 42, pm2_5: 8 }, 120, storage), true);
  assert.equal(cache.saveWeather(delhi, weather("Delhi forecast"), 150, storage), true);

  assert.equal(cache.read(pune, storage).weather.daily.label, "Pune forecast");
  assert.deepEqual(cache.read(pune, storage).air, { us_aqi: 42, pm2_5: 8 });
  assert.equal(cache.read(pune, storage).weatherSavedAt, 100);
  assert.equal(cache.read(delhi, storage).weather.daily.label, "Delhi forecast");
  assert.equal(cache.read(location("nearby", 18.52041, 73.85671), storage).weather.daily.label, "Pune forecast");
});

test("offline cache ignores invalid coordinates and malformed or unsupported storage", () => {
  const storage = new MemoryStorage();
  assert.equal(cache.locationKey(location("bad", 91, 0)), null);
  assert.equal(cache.saveWeather(location("bad", 91, 0), weather("bad"), 100, storage), false);
  storage.setItem(cache.STORAGE_KEY, "not json");
  assert.equal(cache.read(location("Pune", 18.52, 73.86), storage), null);
  assert.equal(cache.saveAir(location("Pune", 18.52, 73.86), { us_aqi: 12 }, 100, storage), false);
});

test("offline cache retains only the eight most recently updated places", () => {
  const storage = new MemoryStorage();
  for (let index = 0; index < 10; index += 1) {
    const place = location(`Place ${index}`, index, index);
    assert.equal(cache.saveWeather(place, weather(`forecast ${index}`), index + 1, storage), true);
  }
  assert.equal(cache.read(location("Place 9", 9, 9), storage).weather.daily.label, "forecast 9");
  assert.equal(cache.read(location("Place 0", 0, 0), storage), null);
  const entries = JSON.parse(storage.getItem(cache.STORAGE_KEY)).entries;
  assert.equal(Object.keys(entries).length, cache.MAX_LOCATIONS);
});
