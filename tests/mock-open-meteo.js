// Deterministic Open-Meteo stand-in used by the agent tests (no network required).
const PLACES = {
  mumbai: { name: "Mumbai", country: "India", admin1: "Maharashtra", latitude: 19.07, longitude: 72.88, timezone: "Asia/Kolkata", temp: 31, rainy: true },
  delhi: { name: "Delhi", country: "India", admin1: "Delhi", latitude: 28.65, longitude: 77.23, timezone: "Asia/Kolkata", temp: 36, rainy: false },
  pune: { name: "Pune", country: "India", admin1: "Maharashtra", latitude: 18.52, longitude: 73.86, timezone: "Asia/Kolkata", temp: 28, rainy: false },
  goa: { name: "Goa", country: "India", admin1: "Goa", latitude: 15.49, longitude: 73.82, timezone: "Asia/Kolkata", temp: 30, rainy: true },
  thanjavur: { name: "Thanjavur", country: "India", admin1: "Tamil Nadu", latitude: 10.78, longitude: 79.13, timezone: "Asia/Kolkata", temp: 33, rainy: false }
};

function pad(value) { return String(value).padStart(2, "0"); }

function forecastFor(place, params) {
  const days = Number(params.get("forecast_days") || 7);
  const start = new Date("2026-09-29T00:00:00Z");
  const hours = [];
  const dates = [];
  for (let d = 0; d < days; d += 1) {
    const date = new Date(start.getTime() + d * 864e5).toISOString().slice(0, 10);
    dates.push(date);
    for (let h = 0; h < 24; h += 1) hours.push(`${date}T${pad(h)}:00`);
  }
  const temp = (i) => place.temp - 6 + 8 * Math.sin(((i % 24) - 9) / 24 * 2 * Math.PI);
  const rain = (i) => (place.rainy && i % 24 >= 15 && i % 24 <= 18 ? 2.2 : 0);
  const hourly = {
    time: hours,
    temperature_2m: hours.map((_, i) => Math.round(temp(i) * 10) / 10),
    apparent_temperature: hours.map((_, i) => Math.round((temp(i) + 2) * 10) / 10),
    relative_humidity_2m: hours.map(() => 70),
    dew_point_2m: hours.map(() => 20),
    precipitation_probability: hours.map((_, i) => (rain(i) ? 80 : 10)),
    precipitation: hours.map((_, i) => rain(i)),
    weather_code: hours.map((_, i) => (rain(i) ? 63 : 2)),
    cloud_cover: hours.map(() => 40),
    visibility: hours.map(() => 20000),
    wind_speed_10m: hours.map(() => 12),
    wind_direction_10m: hours.map(() => 240),
    wind_gusts_10m: hours.map(() => 24),
    uv_index: hours.map((_, i) => Math.max(0, Math.round(9 * Math.sin(((i % 24) - 6) / 12 * Math.PI)))),
    is_day: hours.map((_, i) => (i % 24 >= 6 && i % 24 < 18 ? 1 : 0))
  };
  const daily = {
    time: dates,
    weather_code: dates.map(() => (place.rainy ? 63 : 2)),
    temperature_2m_max: dates.map(() => place.temp + 2),
    temperature_2m_min: dates.map(() => place.temp - 8),
    apparent_temperature_max: dates.map(() => place.temp + 4),
    apparent_temperature_min: dates.map(() => place.temp - 9),
    sunrise: dates.map((date) => `${date}T06:10`),
    sunset: dates.map((date) => `${date}T18:05`),
    daylight_duration: dates.map(() => 43500),
    uv_index_max: dates.map(() => 9),
    precipitation_sum: dates.map(() => (place.rainy ? 9 : 0)),
    precipitation_probability_max: dates.map(() => (place.rainy ? 80 : 10)),
    wind_speed_10m_max: dates.map(() => 18),
    wind_gusts_10m_max: dates.map(() => 34)
  };
  const times15 = [];
  const rain15 = [];
  for (let i = 0; i < 16; i += 1) {
    const minutes = 10 * 60 + i * 15;
    times15.push(`2026-09-29T${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`);
    rain15.push(place.rainy && i >= 2 && i < 6 ? 0.6 : 0);
  }
  return {
    timezone: place.timezone,
    current: {
      time: "2026-09-29T10:00", temperature_2m: place.temp - 2, relative_humidity_2m: 70, apparent_temperature: place.temp, dew_point_2m: 21,
      is_day: 1, precipitation: 0, weather_code: place.rainy ? 61 : 1, cloud_cover: 35, pressure_msl: 1008, surface_pressure: 1000,
      wind_speed_10m: 12, wind_direction_10m: 240, wind_gusts_10m: 24, visibility: 20000, uv_index: 6.4
    },
    hourly, daily, minutely_15: { time: times15, precipitation: rain15 }
  };
}

function createMockFetch() {
  const calls = [];
  const fetchImpl = async (url) => {
    const parsed = new URL(String(url));
    calls.push(parsed.href);
    const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
    if (parsed.hostname === "geocoding-api.open-meteo.com") {
      const query = parsed.searchParams.get("name").toLowerCase();
      const match = PLACES[query];
      return json(match ? { results: [{ ...match }] } : {});
    }
    const lat = Number(parsed.searchParams.get("latitude"));
    const lon = Number(parsed.searchParams.get("longitude"));
    const place = Object.values(PLACES).find((item) => Math.abs(item.latitude - lat) < 0.05 && Math.abs(item.longitude - lon) < 0.05) || PLACES.pune;
    if (parsed.hostname === "api.open-meteo.com") return json(forecastFor(place, parsed.searchParams));
    if (parsed.hostname === "air-quality-api.open-meteo.com") {
      return json({ current: { time: "2026-09-29T10:00", us_aqi: place.name === "Delhi" ? 168 : 62, pm2_5: 21.5, pm10: 40, ozone: 50, nitrogen_dioxide: 10, sulphur_dioxide: 4, dust: 5, uv_index: 6 } });
    }
    if (parsed.hostname === "archive-api.open-meteo.com") {
      const dates = [];
      for (let d = 0; d < 365; d += 1) dates.push(new Date(Date.UTC(2025, 0, 1 + d)).toISOString().slice(0, 10));
      return json({ daily: { time: dates, temperature_2m_mean: dates.map(() => 27), temperature_2m_max: dates.map((_, i) => 30 + (i === 120 ? 12 : 0)), temperature_2m_min: dates.map(() => 20), precipitation_sum: dates.map((date) => (date.startsWith("2025-07") ? 10 : 0.5)) } });
    }
    if (parsed.hostname === "marine-api.open-meteo.com") {
      if (place.name !== "Mumbai" && place.name !== "Goa") return json({ current: {}, hourly: {} });
      return json({ current: { time: "2026-09-29T10:00", wave_height: 1.6, wave_direction: 250, wave_period: 8, swell_wave_height: 1.2, wind_wave_height: 0.6, sea_surface_temperature: 29 }, hourly: { wave_height: [1.6, 2.1, 1.9] } });
    }
    return json({}, 404);
  };
  fetchImpl.calls = calls;
  return fetchImpl;
}

module.exports = { createMockFetch, PLACES };
