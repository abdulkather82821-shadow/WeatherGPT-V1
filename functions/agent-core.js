/*
 * WeatherGPT agent core.
 *
 * Shared by the browser (window.WeatherGPTAgentCore) and the server AI gateway
 * (require("./agent-core")). Contains the agent's tool schemas, the Open-Meteo
 * tool executors and the pure scoring / briefing helpers. Everything here is
 * data-source-grounded: tools only return numbers that Open-Meteo returned or
 * values derived from them with documented formulas.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.WeatherGPTAgentCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const URLS = {
    forecast: "https://api.open-meteo.com/v1/forecast",
    geocode: "https://geocoding-api.open-meteo.com/v1/search",
    air: "https://air-quality-api.open-meteo.com/v1/air-quality",
    archive: "https://archive-api.open-meteo.com/v1/archive",
    marine: "https://marine-api.open-meteo.com/v1/marine"
  };
  const REQUEST_TIMEOUT_MS = 10000;

  const WEATHER_CODES = {
    0: ["Clear sky", "☀"], 1: ["Mostly clear", "🌤"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁"],
    45: ["Foggy", "🌫"], 48: ["Icy fog", "🌫"], 51: ["Light drizzle", "☂"], 53: ["Drizzle", "☂"],
    55: ["Heavy drizzle", "☂"], 56: ["Freezing drizzle", "☂"], 57: ["Freezing drizzle", "☂"],
    61: ["Light rain", "☂"], 63: ["Rain", "☂"], 65: ["Heavy rain", "☂"], 66: ["Freezing rain", "☂"],
    67: ["Heavy freezing rain", "☂"], 71: ["Light snow", "❄"], 73: ["Snow", "❄"], 75: ["Heavy snow", "❄"],
    77: ["Snow grains", "❄"], 80: ["Light showers", "☂"], 81: ["Rain showers", "☂"],
    82: ["Heavy showers", "☂"], 85: ["Snow showers", "❄"], 86: ["Heavy snow showers", "❄"],
    95: ["Thunderstorm", "⚡"], 96: ["Thunderstorm with hail", "⚡"], 99: ["Thunderstorm with hail", "⚡"]
  };

  function describeCode(code) {
    const entry = WEATHER_CODES[code];
    return { text: entry ? entry[0] : "Variable conditions", icon: entry ? entry[1] : "☁" };
  }

  const isNum = (value) => typeof value === "number" && Number.isFinite(value);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const round = (value, digits = 0) => {
    if (!isNum(value)) return null;
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  };
  const sum = (values) => values.reduce((total, value) => total + (isNum(value) ? value : 0), 0);
  const max = (values) => values.reduce((best, value) => (isNum(value) && value > best ? value : best), -Infinity);

  /* ---------- formatting ---------- */

  function toUnits(celsius, units) {
    if (!isNum(celsius)) return null;
    return units === "fahrenheit" ? (celsius * 9) / 5 + 32 : celsius;
  }
  function fmtTemp(celsius, units) {
    const value = toUnits(celsius, units);
    return value === null ? "--" : `${Math.round(value)}°${units === "fahrenheit" ? "F" : "C"}`;
  }
  function fmtTempBare(celsius, units) {
    const value = toUnits(celsius, units);
    return value === null ? "--" : `${Math.round(value)}°`;
  }
  function hourLabel(iso) {
    const match = /T(\d{2}):(\d{2})/.exec(iso || "");
    if (!match) return "";
    const hour = Number(match[1]) % 24;
    const suffix = hour >= 12 ? "PM" : "AM";
    const twelve = hour % 12 === 0 ? 12 : hour % 12;
    return match[2] === "00" ? `${twelve} ${suffix}` : `${twelve}:${match[2]} ${suffix}`;
  }
  function plusHour(iso) {
    const match = /^(.*T)(\d{2})(:\d{2})/.exec(iso || "");
    if (!match) return iso;
    return `${match[1]}${String((Number(match[2]) + 1) % 24).padStart(2, "0")}${match[3]}`;
  }
  function weekdayOf(dateString) {
    const date = new Date(`${String(dateString).slice(0, 10)}T12:00:00Z`);
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getUTCDay()];
  }
  function compass(degrees) {
    if (!isNum(degrees)) return "";
    return ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"][Math.round(degrees / 22.5) % 16];
  }

  /* ---------- derived weather science ---------- */

  // NWS Rothfusz regression; only meaningful above ~27 °C. Inputs °C and %.
  function heatIndexC(tempC, humidity) {
    if (!isNum(tempC) || !isNum(humidity)) return null;
    const t = (tempC * 9) / 5 + 32;
    if (t < 80) return tempC;
    const h = humidity;
    let hi = -42.379 + 2.04901523 * t + 10.14333127 * h - 0.22475541 * t * h - 0.00683783 * t * t -
      0.05481717 * h * h + 0.00122874 * t * t * h + 0.00085282 * t * h * h - 0.00000199 * t * t * h * h;
    if (h < 13 && t >= 80 && t <= 112) hi -= ((13 - h) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
    if (h > 85 && t >= 80 && t <= 87) hi += ((h - 85) / 10) * ((87 - t) / 5);
    return ((hi - 32) * 5) / 9;
  }
  function comfortLabel(apparentC, dewPointC) {
    if (isNum(dewPointC) && dewPointC >= 24) return "Oppressive";
    if (isNum(apparentC)) {
      if (apparentC >= 41) return "Dangerous heat";
      if (apparentC >= 35) return "Very hot";
      if (apparentC >= 30) return "Hot & sticky";
      if (apparentC >= 24) return "Warm";
      if (apparentC >= 16) return "Comfortable";
      if (apparentC >= 8) return "Cool";
      if (apparentC >= 0) return "Cold";
      return "Freezing";
    }
    return "Unknown";
  }
  function uvCategory(index) {
    if (!isNum(index)) return "Unknown";
    if (index < 3) return "Low";
    if (index < 6) return "Moderate";
    if (index < 8) return "High";
    if (index < 11) return "Very high";
    return "Extreme";
  }
  // Rough guide: MED for fair skin (~200 J/m²) at UVI x (x*25 mW/m²).
  function uvBurnMinutes(index) {
    if (!isNum(index) || index < 1) return null;
    return Math.round(clamp(133 / index, 8, 120));
  }
  function aqiCategory(aqi) {
    if (!isNum(aqi)) return "Unknown";
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for sensitive groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very unhealthy";
    return "Hazardous";
  }
  function windCategory(kmh) {
    if (!isNum(kmh)) return "Unknown";
    if (kmh < 6) return "Calm";
    if (kmh < 20) return "Light breeze";
    if (kmh < 39) return "Breezy";
    if (kmh < 62) return "Strong wind";
    if (kmh < 89) return "Gale";
    return "Storm-force wind";
  }

  /* ---------- index helpers over Open-Meteo payloads ---------- */

  function nowIndex(data) {
    const hourly = data?.hourly?.time;
    if (!hourly?.length) return 0;
    const currentHour = String(data.current?.time || hourly[0]).slice(0, 13);
    const index = hourly.findIndex((time) => time.slice(0, 13) >= currentHour);
    return index < 0 ? 0 : index;
  }
  function hourAt(data, index) {
    const h = data.hourly;
    const pick = (key) => (Array.isArray(h[key]) ? h[key][index] : undefined);
    return {
      time: h.time[index],
      temperature: pick("temperature_2m"), apparent: pick("apparent_temperature"),
      humidity: pick("relative_humidity_2m"), rainProbability: pick("precipitation_probability"),
      precipitation: pick("precipitation"), code: pick("weather_code"), wind: pick("wind_speed_10m"),
      gust: pick("wind_gusts_10m"), uv: pick("uv_index"), cloud: pick("cloud_cover"),
      visibility: pick("visibility"), isDay: pick("is_day")
    };
  }
  function dayHourRange(data, dayOffset) {
    const date = data?.daily?.time?.[dayOffset];
    if (!date) return null;
    const indices = [];
    data.hourly.time.forEach((time, index) => { if (time.startsWith(date)) indices.push(index); });
    return indices.length ? { date, indices } : null;
  }

  /* ---------- activity scoring ---------- */

  // band: [hardMin, idealMin, idealMax, hardMax] → 0..1
  function band(value, [hardMin, idealMin, idealMax, hardMax]) {
    if (!isNum(value)) return 1;
    if (value >= idealMin && value <= idealMax) return 1;
    if (value <= hardMin || value >= hardMax) return 0;
    return value < idealMin ? (value - hardMin) / (idealMin - hardMin) : (hardMax - value) / (hardMax - idealMax);
  }
  const ACTIVITIES = {
    running: { label: "Running", icon: "🏃", daylight: true, temp: [2, 8, 21, 34], wind: [25, 55], rain: 1, uv: 8, humidity: [10, 20, 70, 98], gust: 45 },
    cycling: { label: "Cycling", icon: "🚴", daylight: true, temp: [3, 10, 27, 38], wind: [18, 40], rain: 1.1, uv: 9, humidity: [5, 15, 80, 100], gust: 35 },
    walking: { label: "Walking", icon: "🚶", daylight: true, temp: [0, 12, 28, 38], wind: [30, 60], rain: 0.9, uv: 9, humidity: [5, 15, 85, 100], gust: 55 },
    picnic: { label: "Picnic / outdoor meal", icon: "🧺", daylight: true, temp: [10, 20, 30, 38], wind: [18, 40], rain: 1.3, uv: 8, humidity: [5, 20, 75, 100], gust: 40, cloudMax: 85 },
    cricket: { label: "Cricket / football", icon: "🏏", daylight: true, temp: [8, 18, 31, 40], wind: [25, 50], rain: 1.3, uv: 9, humidity: [5, 20, 80, 100], gust: 45 },
    photography: { label: "Photography (golden hour)", icon: "📷", daylight: true, temp: [-5, 8, 32, 42], wind: [30, 60], rain: 1, uv: 12, humidity: [0, 10, 90, 100], gust: 55, cloud: [10, 25, 70, 95], golden: true },
    stargazing: { label: "Stargazing", icon: "🔭", night: true, temp: [-10, 5, 30, 42], wind: [30, 60], rain: 1.2, uv: 99, humidity: [0, 10, 85, 100], gust: 55, cloud: [-1, 0, 15, 60] },
    laundry: { label: "Drying laundry outside", icon: "👕", daylight: true, temp: [10, 22, 40, 50], wind: [60, 90], rain: 1.5, uv: 99, humidity: [0, 10, 55, 90], gust: 65 },
    commute: { label: "Commute / driving", icon: "🚗", waking: true, temp: [-15, -2, 40, 50], wind: [35, 70], rain: 1, uv: 99, humidity: [0, 0, 100, 101], gust: 60, visibility: 2000 },
    spraying: { label: "Crop spraying", icon: "🌾", daylight: true, temp: [5, 15, 30, 38], wind: [10, 20], rain: 1.6, uv: 99, humidity: [15, 40, 90, 100], gust: 20 },
    beach: { label: "Beach / swimming", icon: "🏖", daylight: true, temp: [18, 27, 35, 42], wind: [25, 45], rain: 1.3, uv: 11, humidity: [0, 20, 90, 100], gust: 40 },
    wedding: { label: "Outdoor event", icon: "🎪", waking: true, temp: [12, 20, 32, 40], wind: [22, 45], rain: 1.6, uv: 10, humidity: [5, 20, 80, 100], gust: 40 }
  };
  const ACTIVITY_ALIASES = [
    [/\b(run|running|jog|jogging|marathon)\b/, "running"],
    [/\b(cycl|bike|biking|bicycle)/, "cycling"],
    [/\b(walk|walking|hike|hiking|trek|trekking|stroll)/, "walking"],
    [/\b(picnic|barbecue|bbq|outdoor (?:meal|lunch|dinner))/, "picnic"],
    [/\b(cricket|football|soccer|match|badminton|tennis|sports?|play(?:ing)? outside|kids? play)/, "cricket"],
    [/\b(photo|photograph|golden hour|sunset shoot|shoot)/, "photography"],
    [/\b(star ?gaz|stars?|milky way|telescope|astronomy|meteor)/, "stargazing"],
    [/\b(laundry|dry (?:my )?clothes|clothes dry|drying clothes)/, "laundry"],
    [/\b(commute|driving|drive|road trip|traffic|ride to work|to work|to office)/, "commute"],
    [/\b(spray|spraying|pesticide|fertili[sz]er)/, "spraying"],
    [/\b(beach|swim|swimming|pool)/, "beach"],
    [/\b(wedding|event|party|function|festival|concert|puja|barat)/, "wedding"]
  ];
  function matchActivity(text) {
    const lowered = String(text || "").toLowerCase();
    for (const [pattern, id] of ACTIVITY_ALIASES) if (pattern.test(lowered)) return id;
    return null;
  }

  function scoreHour(activityId, hour, options = {}) {
    const profile = ACTIVITIES[activityId];
    if (!profile) return null;
    const factors = [];
    const apparent = isNum(hour.apparent) ? hour.apparent : hour.temperature;
    factors.push(band(apparent, profile.temp));
    if (isNum(hour.wind) && profile.wind) factors.push(1 - clamp((hour.wind - profile.wind[0]) / (profile.wind[1] - profile.wind[0]), 0, 1));
    if (isNum(hour.gust) && profile.gust) factors.push(1 - clamp((hour.gust - profile.gust) / profile.gust, 0, 1));
    const rainProb = isNum(hour.rainProbability) ? hour.rainProbability / 100 : 0;
    const rainAmount = isNum(hour.precipitation) ? clamp(hour.precipitation / 3, 0, 1) : 0;
    factors.push(1 - clamp((rainProb * 0.55 + rainAmount * 0.75) * (profile.rain || 1), 0, 1));
    if (isNum(hour.code) && hour.code >= 95) factors.push(0.05);
    if (profile.uv && isNum(hour.uv) && profile.uv < 50) factors.push(1 - clamp((hour.uv - profile.uv) / 4, 0, 0.6));
    if (profile.humidity) factors.push(band(hour.humidity, profile.humidity));
    if (profile.cloud) factors.push(band(hour.cloud, profile.cloud));
    if (profile.cloudMax && isNum(hour.cloud)) factors.push(1 - clamp((hour.cloud - profile.cloudMax) / 30, 0, 0.5));
    if (profile.visibility && isNum(hour.visibility)) factors.push(clamp(hour.visibility / profile.visibility, 0.1, 1));
    if (profile.daylight && hour.isDay === 0) factors.push(0.08);
    if (profile.night && hour.isDay === 1) factors.push(0.02);
    if (profile.waking && (hour.hourOfDay < 6 || hour.hourOfDay >= 22)) factors.push(0.12);
    if (profile.golden && isNum(options.sunriseHour) && isNum(options.sunsetHour) && isNum(hour.hourOfDay)) {
      const distance = Math.min(Math.abs(hour.hourOfDay - options.sunriseHour), Math.abs(hour.hourOfDay - options.sunsetHour));
      factors.push(distance <= 1 ? 1 : clamp(1 - (distance - 1) / 5, 0.35, 1));
    }
    if (options.aqi && profile.daylight && !profile.night && options.aqi > 100) {
      factors.push(1 - clamp((options.aqi - 100) / 200, 0, 0.6));
    }
    const minimum = Math.min(...factors);
    const mean = factors.reduce((total, value) => total + value, 0) / factors.length;
    const blended = 100 * (0.6 * minimum + 0.4 * mean);
    // A single blocking factor (darkness, thunderstorm, downpour) caps the score.
    return Math.round(minimum < 0.15 ? Math.min(blended, minimum * 100 + 20) : blended);
  }
  // Hours worth displaying for an activity (daylight activities skip the dark hours).
  function relevantHours(activityId, hours) {
    const profile = ACTIVITIES[activityId];
    if (!profile) return hours;
    const filtered = hours.filter((hour) => {
      const h = Number(hour.time.slice(11, 13));
      if (profile.night) return h >= 17 || h <= 5;
      if (profile.daylight && hour.isDay === 1) return true;
      if (profile.daylight) return false;
      return h >= 5 && h <= 22;
    });
    return filtered.length ? filtered : hours;
  }
  function scoreVerdict(score) {
    if (score >= 80) return "Excellent";
    if (score >= 65) return "Good";
    if (score >= 45) return "Fair";
    if (score >= 25) return "Poor";
    return "Avoid";
  }
  function hourFraction(iso, sunIso) {
    const match = /T(\d{2}):(\d{2})/.exec(sunIso || "");
    return match ? Number(match[1]) + Number(match[2]) / 60 : null;
  }

  /**
   * Score an activity over a window of hours in a forecast payload.
   * dayOffset 0 starts from the current hour; later days use the full 24 hours.
   */
  function rateActivity(data, activityId, { dayOffset = 0, aqi = null, windowHours = 2 } = {}) {
    if (!ACTIVITIES[activityId]) return null;
    const start = nowIndex(data);
    const range = dayHourRange(data, dayOffset);
    if (!range) return null;
    const indices = range.indices.filter((index) => dayOffset > 0 || index >= start);
    if (!indices.length) return null;
    const sunriseHour = hourFraction(range.date, data.daily.sunrise?.[dayOffset]);
    const sunsetHour = hourFraction(range.date, data.daily.sunset?.[dayOffset]);
    const hours = indices.map((index) => {
      const hour = hourAt(data, index);
      hour.hourOfDay = Number(hour.time.slice(11, 13));
      const score = scoreHour(activityId, hour, { sunriseHour, sunsetHour, aqi });
      return { time: hour.time, score, temperature: hour.temperature, rainProbability: hour.rainProbability, wind: hour.wind, code: hour.code, isDay: hour.isDay };
    });
    const size = Math.min(windowHours, hours.length);
    let best = null;
    for (let i = 0; i + size <= hours.length; i += 1) {
      const slice = hours.slice(i, i + size);
      const average = slice.reduce((total, item) => total + item.score, 0) / size;
      if (!best || average > best.score) best = { start: slice[0].time, end: plusHour(slice[size - 1].time), score: Math.round(average) };
    }
    const peakHour = hours.reduce((top, item) => (item.score > top.score ? item : top), hours[0]);
    const worst = hours.reduce((low, item) => (item.score < low.score ? item : low), hours[0]);
    return {
      activity: activityId, label: ACTIVITIES[activityId].label, date: range.date, weekday: weekdayOf(range.date),
      scoreNow: hours[0].score, verdict: scoreVerdict(best.score), best, peak: peakHour, worst, hours
    };
  }

  /* ---------- summaries used by the briefing card, the local agent and tools ---------- */

  function nowcast(data) {
    const values = data?.minutely_15?.precipitation;
    const times = data?.minutely_15?.time;
    if (!Array.isArray(values) || !times?.length) return null;
    const currentMinute = String(data.current?.time || times[0]).slice(0, 16);
    const start = times.findIndex((time) => time.slice(0, 16) >= currentMinute);
    if (start < 0) return null;
    const window = values.slice(start, start + 8).map((value) => (isNum(value) ? value : 0));
    if (window.length < 4) return null;
    const firstWet = window.findIndex((value) => value >= 0.1);
    const total = round(sum(window), 1);
    if (firstWet === -1) return { state: "dry", minutes: null, totalMm: total, text: "No rain expected in the next 2 hours." };
    if (firstWet === 0) return { state: "raining", minutes: 0, totalMm: total, text: `Rain is falling or imminent — about ${total} mm expected in the next 2 hours.` };
    return { state: "soon", minutes: firstWet * 15, totalMm: total, text: `Rain may begin in about ${firstWet * 15} minutes (${total} mm over the next 2 hours).` };
  }

  function nextRain(data, hoursAhead = 48) {
    const start = nowIndex(data);
    const precipitation = data.hourly?.precipitation || [];
    const probability = data.hourly?.precipitation_probability || [];
    for (let offset = 0; offset < hoursAhead && start + offset < precipitation.length; offset += 1) {
      const amount = precipitation[start + offset];
      const chance = probability[start + offset];
      if ((isNum(amount) && amount >= 0.2) || (isNum(chance) && chance >= 60 && (amount ?? 0) > 0)) {
        return { inHours: offset, time: data.hourly.time[start + offset], amount: round(amount, 1), probability: chance ?? null };
      }
    }
    return null;
  }

  function rainNext24(data) {
    const start = nowIndex(data);
    const slice = (data.hourly?.precipitation || []).slice(start, start + 24);
    return { totalMm: round(sum(slice), 1), peakProbability: max((data.hourly?.precipitation_probability || []).slice(start, start + 24)) };
  }

  function clothingAdvice(apparentC, rainChance, wind, uv) {
    const parts = [];
    if (apparentC >= 34) parts.push("very light, loose cotton or linen clothing");
    else if (apparentC >= 26) parts.push("light, breathable clothing");
    else if (apparentC >= 18) parts.push("a t-shirt with an optional light layer");
    else if (apparentC >= 10) parts.push("a jumper or light jacket");
    else if (apparentC >= 3) parts.push("a warm coat and layers");
    else parts.push("heavy winter layers, gloves and a hat");
    if (rainChance >= 45) parts.push("a compact umbrella or rain jacket");
    if (wind >= 35) parts.push("a wind-resistant outer layer");
    if (uv >= 6) parts.push("sunglasses, a hat and sunscreen");
    return parts;
  }

  /**
   * Build the "today's briefing" items from a forecast payload (and optional air payload).
   * Returns [{ id, icon, title, text, tone }] with tone in ok | info | warn | alert.
   */
  function buildBriefing(data, air, { units = "celsius" } = {}) {
    if (!data?.current || !data?.daily?.time?.length) return [];
    const items = [];
    const current = data.current;
    const daily = data.daily;
    const start = nowIndex(data);
    const condition = describeCode(current.weather_code);
    const hi = daily.temperature_2m_max?.[0];
    const lo = daily.temperature_2m_min?.[0];
    const rainChance = daily.precipitation_probability_max?.[0] ?? 0;

    items.push({
      id: "headline", icon: condition.icon, tone: "info", title: "The day in one line",
      text: `${condition.text} now at ${fmtTemp(current.temperature_2m, units)} (feels ${fmtTemp(current.apparent_temperature, units)}). Today ${fmtTempBare(lo, units)} → ${fmtTempBare(hi, units)}${units === "fahrenheit" ? "F" : "C"}, ${rainChance}% peak rain chance.`
    });

    const now = nowcast(data);
    const later = nextRain(data, 30);
    if (now?.state === "raining") items.push({ id: "rain", icon: "☔", tone: "warn", title: "Rain right now", text: `${now.text} Take an umbrella and allow extra travel time.` });
    else if (now?.state === "soon") items.push({ id: "rain", icon: "☔", tone: "warn", title: "Rain is close", text: `${now.text} Plan to be indoors or covered.` });
    else if (later) items.push({ id: "rain", icon: "🌦", tone: rainChance >= 60 ? "warn" : "info", title: "Next rain", text: `Rain looks likely around ${hourLabel(later.time)}${later.inHours ? ` (in ~${later.inHours} h)` : ""}${later.probability ? `, ${later.probability}% chance` : ""}. Keep an umbrella handy.` });
    else items.push({ id: "rain", icon: "🌤", tone: "ok", title: "Staying dry", text: "No meaningful rain signal for the next 30 hours. Leave the umbrella at home." });

    const wearParts = clothingAdvice(current.apparent_temperature, rainChance, current.wind_speed_10m, daily.uv_index_max?.[0] ?? current.uv_index);
    items.push({ id: "wear", icon: "👕", tone: "info", title: "What to wear", text: `${wearParts[0][0].toUpperCase()}${wearParts[0].slice(1)}${wearParts.length > 1 ? `, plus ${wearParts.slice(1).join(", ")}` : ""}.` });

    const walk = rateActivity(data, "walking", { aqi: air?.us_aqi });
    if (walk) {
      items.push({
        id: "outdoor", icon: "🌿", tone: walk.best.score >= 65 ? "ok" : walk.best.score >= 45 ? "info" : "warn", title: "Best time outside",
        text: walk.best.score < 25
          ? "Conditions are poor for outdoor time for the rest of today. Consider indoor plans."
          : `${hourLabel(walk.best.start)}–${hourLabel(walk.best.end)} scores ${walk.best.score}/100 (${walk.verdict.toLowerCase()}) for a walk or light exercise.`
      });
    }

    const uv = daily.uv_index_max?.[0] ?? current.uv_index;
    if (isNum(uv)) {
      const burn = uvBurnMinutes(uv);
      items.push({
        id: "uv", icon: "🧴", tone: uv >= 8 ? "alert" : uv >= 6 ? "warn" : uv >= 3 ? "info" : "ok", title: `UV: ${uvCategory(uv)}`,
        text: uv >= 3 ? `Peak UV ${round(uv, 1)}${burn ? `; unprotected fair skin may burn in roughly ${burn} min` : ""}. Use SPF 30+ and shade around midday.` : `Peak UV ${round(uv, 1)}. Sun protection is optional for most people.`
      });
    }

    if (air && isNum(air.us_aqi)) {
      const aqi = Math.round(air.us_aqi);
      items.push({
        id: "air", icon: "🫁", tone: aqi > 150 ? "alert" : aqi > 100 ? "warn" : aqi > 50 ? "info" : "ok", title: `Air quality: ${aqiCategory(aqi)}`,
        text: aqi > 150 ? `US AQI ${aqi}. Limit strenuous outdoor activity and consider an N95/FFP2 mask outdoors.` : aqi > 100 ? `US AQI ${aqi}. Sensitive groups should reduce prolonged outdoor exertion.` : aqi > 50 ? `US AQI ${aqi}. Acceptable; unusually sensitive people may notice symptoms.` : `US AQI ${aqi}. Fresh air — great for windows open and outdoor exercise.`
      });
    }

    const gust = max((data.hourly?.wind_gusts_10m || []).slice(start, start + 24));
    if (isNum(gust) && (gust >= 45 || current.wind_speed_10m >= 30)) {
      items.push({ id: "wind", icon: "💨", tone: gust >= 70 ? "alert" : "warn", title: `${windCategory(Math.max(current.wind_speed_10m || 0, gust * 0.7))}`, text: `Wind ${Math.round(current.wind_speed_10m)} km/h from the ${compass(current.wind_direction_10m)}, gusts to ${Math.round(gust)} km/h today. Secure loose items and take care cycling or driving high-sided vehicles.` });
    }

    const heat = heatIndexC(current.temperature_2m, current.relative_humidity_2m);
    if (isNum(hi) && (hi >= 38 || (isNum(heat) && heat >= 38))) {
      items.push({ id: "heat", icon: "🥵", tone: hi >= 42 ? "alert" : "warn", title: "Heat stress", text: `High of ${fmtTemp(hi, units)}${isNum(heat) && heat > current.temperature_2m + 1 ? `, heat index ${fmtTemp(heat, units)}` : ""}. Hydrate often, avoid 11 AM–4 PM exertion and check on children and older relatives.` });
    } else if (isNum(lo) && lo <= 6) {
      items.push({ id: "cold", icon: "🥶", tone: lo <= 0 ? "alert" : "warn", title: "Cold conditions", text: `Low of ${fmtTemp(lo, units)}. Layer up in the morning and evening${lo <= 0 ? " and protect pipes, plants and pets from frost" : ""}.` });
    }

    if (daily.time.length > 1) {
      const delta = daily.temperature_2m_max[1] - hi;
      const tomorrow = describeCode(daily.weather_code?.[1]);
      const change = Math.abs(delta) >= 3 ? `${Math.abs(delta) >= 6 ? "much " : ""}${delta > 0 ? "warmer" : "cooler"} (${delta > 0 ? "+" : "−"}${Math.abs(round(units === "fahrenheit" ? delta * 1.8 : delta, 0))}°)` : "similar temperatures";
      items.push({ id: "tomorrow", icon: "📅", tone: "info", title: "Looking to tomorrow", text: `${tomorrow.text}, ${change}, ${daily.precipitation_probability_max?.[1] ?? 0}% rain chance.` });
    }
    return items;
  }

  /* ---------- Open-Meteo tools ---------- */

  function fetchWithTimeout(fetchImpl, url) {
    const options = {};
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") options.signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    return fetchImpl(url, options);
  }
  async function getJson(fetchImpl, base, params) {
    const response = await fetchWithTimeout(fetchImpl, `${base}?${new URLSearchParams(params)}`);
    if (!response.ok) {
      const error = new Error(`Open-Meteo returned ${response.status}.`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }
  const cleanText = (value, limit = 100) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, limit);

  async function searchPlaces(fetchImpl, query, { count = 5, language = "en" } = {}) {
    const text = cleanText(query, 100);
    if (text.length < 2) return [];
    const attempt = async (name) => {
      const data = await getJson(fetchImpl, URLS.geocode, { name, count: String(count), language, format: "json" });
      return Array.isArray(data.results) ? data.results : [];
    };
    let results = await attempt(text);
    if (!results.length && text.includes(",")) {
      const [head, ...tail] = text.split(",").map((part) => part.trim()).filter(Boolean);
      results = await attempt(head);
      const hints = tail.join(" ").toLowerCase();
      const filtered = results.filter((item) => [item.admin1, item.country, item.country_code].some((field) => field && hints.includes(String(field).toLowerCase())));
      if (filtered.length) results = filtered;
    }
    return results.map((item) => ({
      name: item.name, country: item.country || item.admin1 || "", region: item.admin1 || "",
      latitude: item.latitude, longitude: item.longitude, timezone: item.timezone || "auto", population: item.population ?? null
    }));
  }

  const COORDINATES = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;
  const HERE = /^(?:|here|current|current location|my location|my city|me|home|this place|selected|default)$/i;

  async function resolvePlace(fetchImpl, place, fallback, options = {}) {
    const text = cleanText(place, 100);
    if (HERE.test(text)) {
      if (!fallback) throw new Error("No default location is available; provide a place name.");
      return { ...fallback, source: "current" };
    }
    const coordinates = COORDINATES.exec(text);
    if (coordinates) {
      const latitude = Number(coordinates[1]);
      const longitude = Number(coordinates[2]);
      if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error("Coordinates are out of range.");
      return { name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`, country: "", latitude, longitude, timezone: "auto", source: "coordinates" };
    }
    if (fallback && fallback.name && text.toLowerCase() === String(fallback.name).toLowerCase()) return { ...fallback, source: "current" };
    const alias = typeof options.alias === "function" ? options.alias(text) : null;
    const results = await searchPlaces(fetchImpl, alias || text, { count: 3, language: options.language || "en" });
    if (!results.length) {
      const error = new Error(`No place matched "${text}".`);
      error.code = "place-not-found";
      throw error;
    }
    return { ...results[0], source: "search" };
  }

  const FORECAST_CURRENT = "temperature_2m,relative_humidity_2m,apparent_temperature,dew_point_2m,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,uv_index";
  const FORECAST_HOURLY = "temperature_2m,relative_humidity_2m,apparent_temperature,dew_point_2m,precipitation_probability,precipitation,weather_code,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day";
  const FORECAST_DAILY = "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max";

  function forecastParams(location, days) {
    return {
      latitude: String(location.latitude), longitude: String(location.longitude), timezone: location.timezone || "auto",
      forecast_days: String(clamp(Math.round(days) || 7, 1, 16)), temperature_unit: "celsius", wind_speed_unit: "kmh", precipitation_unit: "mm",
      current: FORECAST_CURRENT, hourly: FORECAST_HOURLY, daily: FORECAST_DAILY,
      minutely_15: "precipitation", forecast_minutely_15: "192"
    };
  }
  async function getForecast(fetchImpl, location, days = 7) {
    const data = await getJson(fetchImpl, URLS.forecast, forecastParams(location, days));
    if (!data.current || !data.daily?.time?.length) throw new Error("Open-Meteo returned incomplete forecast data.");
    return data;
  }
  async function getAir(fetchImpl, location) {
    const data = await getJson(fetchImpl, URLS.air, {
      latitude: String(location.latitude), longitude: String(location.longitude), timezone: location.timezone || "auto",
      current: "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,dust,uv_index",
      hourly: "us_aqi,pm2_5", forecast_days: "2"
    });
    if (!isNum(data.current?.us_aqi)) throw new Error("Air-quality data is unavailable for this location.");
    return data;
  }

  const placeLabel = (place) => [place.name, place.country].filter(Boolean).join(", ");

  function summarizeForecast(data, place, { days = 5, units = "celsius" } = {}) {
    const start = nowIndex(data);
    const current = data.current;
    const daily = data.daily;
    const out = {
      place: placeLabel(place), coordinates: { latitude: place.latitude, longitude: place.longitude }, timezone: data.timezone,
      source: "Open-Meteo", observedAt: current.time,
      now: {
        summary: describeCode(current.weather_code).text, temperatureC: round(current.temperature_2m, 1), feelsLikeC: round(current.apparent_temperature, 1),
        humidityPct: round(current.relative_humidity_2m), dewPointC: round(current.dew_point_2m, 1), cloudCoverPct: round(current.cloud_cover),
        windKmh: round(current.wind_speed_10m), windFrom: compass(current.wind_direction_10m), gustsKmh: round(current.wind_gusts_10m),
        pressureHpa: round(current.pressure_msl), visibilityKm: isNum(current.visibility) ? round(current.visibility / 1000, 1) : null,
        uvIndex: round(current.uv_index, 1), precipitationMm: round(current.precipitation, 1), isDay: current.is_day === 1,
        heatIndexC: round(heatIndexC(current.temperature_2m, current.relative_humidity_2m), 1),
        comfort: comfortLabel(current.apparent_temperature, current.dew_point_2m)
      },
      rainNext2Hours: nowcast(data)?.text || null,
      nextRain: nextRain(data, 48),
      rainNext24h: rainNext24(data),
      units_note: `User prefers ${units}. Values above are metric; convert when replying.`
    };
    const hours = [];
    for (let offset = 0; offset < 24 && start + offset < data.hourly.time.length; offset += 3) {
      const hour = hourAt(data, start + offset);
      hours.push({ time: hour.time, summary: describeCode(hour.code).text, tempC: round(hour.temperature, 1), rainChancePct: hour.rainProbability, rainMm: round(hour.precipitation, 1), windKmh: round(hour.wind), uv: round(hour.uv, 1) });
    }
    out.next24hEvery3h = hours;
    out.daily = daily.time.slice(0, clamp(days, 1, 16)).map((date, index) => ({
      date, weekday: weekdayOf(date), summary: describeCode(daily.weather_code?.[index]).text,
      highC: round(daily.temperature_2m_max?.[index], 1), lowC: round(daily.temperature_2m_min?.[index], 1),
      rainChancePct: daily.precipitation_probability_max?.[index] ?? null, rainMm: round(daily.precipitation_sum?.[index], 1),
      maxWindKmh: round(daily.wind_speed_10m_max?.[index]), maxGustKmh: round(daily.wind_gusts_10m_max?.[index]),
      uvMax: round(daily.uv_index_max?.[index], 1), sunrise: daily.sunrise?.[index]?.slice(11, 16), sunset: daily.sunset?.[index]?.slice(11, 16)
    }));
    return out;
  }

  function summarizeAir(data, place) {
    const air = data.current;
    return {
      place: placeLabel(place), source: "Open-Meteo Air Quality (CAMS model)", observedAt: air.time,
      usAqi: Math.round(air.us_aqi), category: aqiCategory(air.us_aqi),
      pm25: round(air.pm2_5, 1), pm10: round(air.pm10, 1), ozone: round(air.ozone, 1), no2: round(air.nitrogen_dioxide, 1),
      so2: round(air.sulphur_dioxide, 1), dust: round(air.dust, 1), uvIndex: round(air.uv_index, 1),
      guidance: air.us_aqi > 150 ? "Avoid strenuous outdoor exertion; consider a well-fitted N95/FFP2 mask." : air.us_aqi > 100 ? "Sensitive groups should limit prolonged outdoor exertion." : "Air quality is acceptable for most people."
    };
  }

  async function getHistory(fetchImpl, location, year) {
    const thisYear = new Date().getUTCFullYear();
    const target = Number.isInteger(year) && year >= 1950 && year < thisYear + 1 ? year : thisYear - 1;
    const end = target === thisYear ? new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10) : `${target}-12-31`;
    const data = await getJson(fetchImpl, URLS.archive, {
      latitude: String(location.latitude), longitude: String(location.longitude), start_date: `${target}-01-01`, end_date: end,
      daily: "temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum", timezone: location.timezone || "auto"
    });
    const daily = data.daily;
    const means = (daily?.temperature_2m_mean || []).filter(isNum);
    const rain = (daily?.precipitation_sum || []).filter(isNum);
    if (!means.length) throw new Error("Historical data is unavailable for that period.");
    const byMonth = Array.from({ length: 12 }, () => ({ rain: 0, temperatures: [] }));
    daily.time.forEach((date, index) => {
      const month = Number(date.slice(5, 7)) - 1;
      if (isNum(daily.precipitation_sum[index])) byMonth[month].rain += daily.precipitation_sum[index];
      if (isNum(daily.temperature_2m_mean[index])) byMonth[month].temperatures.push(daily.temperature_2m_mean[index]);
    });
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hottestIndex = daily.temperature_2m_max.reduce((best, value, index) => (isNum(value) && (best < 0 || value > daily.temperature_2m_max[best]) ? index : best), -1);
    const wettestIndex = daily.precipitation_sum.reduce((best, value, index) => (isNum(value) && (best < 0 || value > daily.precipitation_sum[best]) ? index : best), -1);
    return {
      source: "Open-Meteo Historical Weather (ERA5 reanalysis)", year: target, daysCovered: means.length,
      meanTemperatureC: round(sum(means) / means.length, 1), totalRainMm: round(sum(rain)),
      hottestDay: hottestIndex >= 0 ? { date: daily.time[hottestIndex], maxC: round(daily.temperature_2m_max[hottestIndex], 1) } : null,
      wettestDay: wettestIndex >= 0 ? { date: daily.time[wettestIndex], mm: round(daily.precipitation_sum[wettestIndex], 1) } : null,
      months: byMonth.map((month, index) => month.temperatures.length ? { month: names[index], meanC: round(sum(month.temperatures) / month.temperatures.length, 1), rainMm: round(month.rain) } : null).filter(Boolean),
      caveat: "Reanalysis describes that period only; it is not an official climate record."
    };
  }

  async function getMarine(fetchImpl, location) {
    const data = await getJson(fetchImpl, URLS.marine, {
      latitude: String(location.latitude), longitude: String(location.longitude), timezone: location.timezone || "auto",
      current: "wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_period,wind_wave_height,sea_surface_temperature", forecast_days: "3",
      hourly: "wave_height,wave_period"
    });
    const marine = data.current;
    if (!marine || !isNum(marine.wave_height)) throw new Error("No marine grid cell is near this location; it may be inland.");
    const nextHours = (data.hourly?.wave_height || []).slice(0, 48).filter(isNum);
    return {
      source: "Open-Meteo Marine (model)", observedAt: marine.time,
      waveHeightM: round(marine.wave_height, 1), waveDirectionDeg: round(marine.wave_direction), wavePeriodS: round(marine.wave_period),
      swellHeightM: round(marine.swell_wave_height, 1), windWaveHeightM: round(marine.wind_wave_height, 1), seaSurfaceTempC: round(marine.sea_surface_temperature, 1),
      peakWaveHeightNext48hM: nextHours.length ? round(Math.max(...nextHours), 1) : null,
      caveat: "Model guidance, not an official marine or cyclone warning. Follow the local coast guard / met office."
    };
  }

  function activityForModelTools(data, place, activity, dayOffset, air, units) {
    const rating = rateActivity(data, activity, { dayOffset, aqi: air?.us_aqi ?? null });
    if (!rating) return null;
    return {
      place: placeLabel(place), activity: rating.label, date: rating.date, weekday: rating.weekday,
      overall: { bestScore: rating.best.score, verdict: rating.verdict, bestWindow: `${hourLabel(rating.best.start)}–${hourLabel(rating.best.end)}` },
      scoreRightNow: rating.scoreNow,
      hours: rating.hours.filter((_, index) => index % 2 === 0).map((hour) => ({ time: hourLabel(hour.time), score: hour.score, tempC: round(hour.temperature, 1), rainChancePct: hour.rainProbability, windKmh: round(hour.wind) })),
      scoring: "0–100 heuristic from apparent temperature, rain chance/amount, wind, gusts, UV, humidity, cloud and daylight; not a safety guarantee.",
      units
    };
  }

  /* ---------- tool registry (schemas used by LLM providers and by the local agent) ---------- */

  const TOOL_SCHEMAS = [
    {
      name: "get_weather",
      description: "Get live current conditions, a 2-hour rain nowcast, next-24-hour outlook and a daily forecast (up to 16 days) for any place on Earth from Open-Meteo. Omit place for the user's selected location.",
      parameters: {
        type: "object",
        properties: {
          place: { type: "string", description: "City, town or district (e.g. 'Pune' or 'Thanjavur, Tamil Nadu'), or 'lat,lon'. Omit for the user's current location." },
          days: { type: "integer", description: "Number of forecast days to include (1-16). Default 5." }
        }
      }
    },
    {
      name: "get_air_quality",
      description: "Get current US AQI, PM2.5, PM10, ozone and other pollutants for a place, with health guidance.",
      parameters: { type: "object", properties: { place: { type: "string", description: "Place name or 'lat,lon'. Omit for the user's location." } } }
    },
    {
      name: "compare_places",
      description: "Compare current conditions and today's outlook for 2-4 places side by side (temperature, feels-like, rain chance, wind, air quality).",
      parameters: { type: "object", properties: { places: { type: "array", items: { type: "string" }, description: "2 to 4 place names." } }, required: ["places"] }
    },
    {
      name: "rate_activity",
      description: "Score how suitable the weather is for an activity hour-by-hour (0-100) and find the best 2-hour window on a given day. Activities: running, cycling, walking, picnic, cricket, photography, stargazing, laundry, commute, spraying, beach, wedding.",
      parameters: {
        type: "object",
        properties: {
          activity: { type: "string", enum: Object.keys(ACTIVITIES), description: "Activity to score." },
          place: { type: "string", description: "Place name; omit for the user's location." },
          day_offset: { type: "integer", description: "0 = today, 1 = tomorrow, up to 15." }
        },
        required: ["activity"]
      }
    },
    {
      name: "get_climate_history",
      description: "Get a full calendar year of historical (ERA5) weather for a place: mean temperature, total rainfall, hottest and wettest days and month-by-month figures.",
      parameters: { type: "object", properties: { place: { type: "string" }, year: { type: "integer", description: "Calendar year, 1950 or later. Default: last year." } } }
    },
    {
      name: "get_marine_conditions",
      description: "Get modelled sea state (wave height, period, swell, sea temperature) near a coastal place. Fails for inland locations.",
      parameters: { type: "object", properties: { place: { type: "string", description: "Coastal place name." } } }
    },
    {
      name: "search_place",
      description: "Look up a place name and return matching locations with coordinates and timezone. Use when a place is ambiguous.",
      parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
    }
  ];

  const TOOL_LABELS = {
    get_weather: "Forecast", get_air_quality: "Air quality", compare_places: "Compare places", rate_activity: "Activity planner",
    get_climate_history: "Climate history", get_marine_conditions: "Marine", search_place: "Place search"
  };

  function describeToolArgs(name, args) {
    const parts = [];
    if (args.place) parts.push(String(args.place));
    if (args.places) parts.push(args.places.join(" vs "));
    if (args.query) parts.push(String(args.query));
    if (args.activity) parts.push(String(args.activity));
    if (args.day_offset) parts.push(`+${args.day_offset}d`);
    if (args.year) parts.push(String(args.year));
    return parts.join(" · ");
  }

  /**
   * Create an executor bound to a fetch implementation and default context.
   * context: { location, units, language, alias(text), cache: { weather, air } }
   * executor.run(name, args) resolves to { result, summary } or throws.
   */
  function createToolExecutor({ fetchImpl = (typeof fetch === "function" ? fetch.bind(globalThis) : null), context = {} } = {}) {
    if (!fetchImpl) throw new Error("A fetch implementation is required.");
    const units = context.units === "fahrenheit" ? "fahrenheit" : "celsius";
    const forecastCache = new Map();

    async function place(name) {
      return resolvePlace(fetchImpl, name, context.location, { alias: context.alias, language: context.language });
    }
    const keyOf = (loc) => `${Number(loc.latitude).toFixed(2)},${Number(loc.longitude).toFixed(2)}`;
    async function forecastFor(loc, days) {
      const key = keyOf(loc);
      const hit = forecastCache.get(key);
      if (hit && hit.days >= days) return hit.data;
      if (context.cache?.weather && context.location && keyOf(context.location) === key && (context.cache.weather.daily?.time?.length || 0) >= days && context.cache.weather.hourly?.wind_gusts_10m) {
        forecastCache.set(key, { days, data: context.cache.weather });
        return context.cache.weather;
      }
      const data = await getForecast(fetchImpl, loc, Math.max(days, 7));
      forecastCache.set(key, { days: Math.max(days, 7), data });
      return data;
    }
    async function airFor(loc) {
      if (context.cache?.air && context.location && keyOf(context.location) === keyOf(loc)) return { current: context.cache.air };
      return getAir(fetchImpl, loc);
    }
    const intArg = (value, fallback, low, high) => (Number.isFinite(Number(value)) && value !== null && value !== undefined && value !== "" ? clamp(Math.round(Number(value)), low, high) : fallback);

    const handlers = {
      async get_weather(args) {
        const loc = await place(args.place);
        const days = intArg(args.days, 5, 1, 16);
        const data = await forecastFor(loc, days);
        const result = summarizeForecast(data, loc, { days, units });
        return { result, raw: { data, place: loc }, summary: `${describeCode(data.current.weather_code).text}, ${fmtTemp(data.current.temperature_2m, units)} in ${loc.name}` };
      },
      async get_air_quality(args) {
        const loc = await place(args.place);
        const data = await airFor(loc);
        const result = summarizeAir(data, loc);
        return { result, raw: { air: data.current, place: loc }, summary: `AQI ${result.usAqi} (${result.category}) in ${loc.name}` };
      },
      async compare_places(args) {
        const list = Array.isArray(args.places) ? args.places.map((item) => cleanText(item)).filter(Boolean).slice(0, 4) : [];
        if (list.length < 2) throw new Error("compare_places needs at least two places.");
        const rows = await Promise.all(list.map(async (name) => {
          try {
            const loc = await place(name);
            const [data, airData] = await Promise.all([forecastFor(loc, 2), airFor(loc).catch(() => null)]);
            const s = summarizeForecast(data, loc, { days: 2, units });
            return {
              place: s.place, summary: s.now.summary, tempC: s.now.temperatureC, feelsLikeC: s.now.feelsLikeC, humidityPct: s.now.humidityPct, windKmh: s.now.windKmh,
              todayHighC: s.daily[0].highC, todayLowC: s.daily[0].lowC, rainChanceTodayPct: s.daily[0].rainChancePct, rainTodayMm: s.daily[0].rainMm,
              tomorrow: s.daily[1] ? { summary: s.daily[1].summary, highC: s.daily[1].highC, rainChancePct: s.daily[1].rainChancePct } : null,
              usAqi: airData?.current ? Math.round(airData.current.us_aqi) : null, _loc: loc, _data: data
            };
          } catch (error) {
            return { place: name, error: error.code === "place-not-found" ? "Place not found." : "Weather data unavailable." };
          }
        }));
        const ok = rows.filter((row) => !row.error);
        if (!ok.length) throw new Error("None of those places could be loaded.");
        const result = { source: "Open-Meteo", places: rows.map(({ _loc, _data, ...rest }) => rest) };
        return { result, raw: { rows }, summary: `${ok.length} places compared` };
      },
      async rate_activity(args) {
        const activity = ACTIVITIES[args.activity] ? args.activity : matchActivity(args.activity);
        if (!activity) throw new Error(`Unknown activity. Choose one of: ${Object.keys(ACTIVITIES).join(", ")}.`);
        const loc = await place(args.place);
        const dayOffset = intArg(args.day_offset, 0, 0, 15);
        const data = await forecastFor(loc, dayOffset + 1);
        const airData = await airFor(loc).catch(() => null);
        const rating = rateActivity(data, activity, { dayOffset, aqi: airData?.current?.us_aqi ?? null });
        if (!rating) throw new Error("No forecast hours are left for that day.");
        const result = activityForModelTools(data, loc, activity, dayOffset, airData?.current, units);
        return { result, raw: { rating, place: loc, data }, summary: `${rating.label}: best ${hourLabel(rating.best.start)}–${hourLabel(rating.best.end)} (${rating.best.score}/100)` };
      },
      async get_climate_history(args) {
        const loc = await place(args.place);
        const result = await getHistory(fetchImpl, loc, Number.isInteger(args.year) ? args.year : Number(args.year) || undefined);
        result.place = placeLabel(loc);
        return { result, raw: { place: loc }, summary: `${result.year}: ${result.meanTemperatureC}°C mean, ${result.totalRainMm} mm rain` };
      },
      async get_marine_conditions(args) {
        const loc = await place(args.place);
        const result = await getMarine(fetchImpl, loc);
        result.place = placeLabel(loc);
        return { result, raw: { place: loc }, summary: `Waves ${result.waveHeightM} m near ${loc.name}` };
      },
      async search_place(args) {
        const results = await searchPlaces(fetchImpl, args.query, { count: 4, language: context.language });
        if (!results.length) throw new Error(`No place matched "${cleanText(args.query)}".`);
        return { result: { matches: results }, raw: { results }, summary: `${results.length} match${results.length === 1 ? "" : "es"} for "${cleanText(args.query, 40)}"` };
      }
    };

    return {
      names: Object.keys(handlers),
      async run(name, args = {}) {
        if (!Object.hasOwn(handlers, name)) throw new Error(`Unknown tool: ${name}`);
        if (!args || typeof args !== "object" || Array.isArray(args)) throw new Error("Tool arguments must be an object.");
        return handlers[name](args);
      }
    };
  }

  return {
    ACTIVITIES, TOOL_SCHEMAS, TOOL_LABELS, WEATHER_CODES, URLS, dayHourRange, cleanText,
    aqiCategory, buildBriefing, clamp, clothingAdvice, comfortLabel, compass, createToolExecutor, describeCode, describeToolArgs,
    fmtTemp, fmtTempBare, forecastParams, getAir, getForecast, heatIndexC, hourAt, hourLabel, plusHour, matchActivity, nextRain, nowIndex,
    nowcast, placeLabel, rainNext24, rateActivity, relevantHours, resolvePlace, scoreHour, scoreVerdict, searchPlaces, summarizeAir, summarizeForecast,
    uvBurnMinutes, uvCategory, weekdayOf, windCategory, isNum, round, max, sum
  };
});
