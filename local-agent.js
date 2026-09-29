/*
 * WeatherGPT local agent.
 *
 * A tool-using weather agent that runs entirely in the browser / Android WebView with
 * no API key. It plans (intent, place, time), calls the shared Open-Meteo tools from
 * agent-core.js, observes the results and composes an answer. Every step is reported
 * through hooks.onStep so the UI can show exactly which tools ran.
 *
 * When the server AI gateway is available the LLM agent (functions/ai-agent.js) uses
 * the very same tools; this local agent is the offline / no-account path.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./functions/agent-core"));
  else root.WeatherGPTLocalAgent = factory(root.WeatherGPTAgentCore);
})(typeof self !== "undefined" ? self : this, function (core) {
  "use strict";

  const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const PLACE_STOP = new Set([
    "the", "a", "an", "my", "your", "our", "this", "that", "these", "those", "next", "some", "any", "case", "general", "advance", "time", "order",
    "night", "morning", "evening", "afternoon", "noon", "day", "days", "week", "weekend", "hour", "hours", "minute", "minutes", "rain", "weather",
    "summer", "winter", "monsoon", "spring", "autumn", "fall", "today", "tomorrow", "tonight", "yesterday", "now", "future", "past", "general", "fact",
    "half", "front", "terms", "detail", "brief", "short", "long", "mind", "case", "it", "us", "me", "you", "them", "there", "here", "which", "what",
    "how", "when", "why", "who", "whether", "if", "January", "february", "march", "april", "may", "june", "july", "august", "september", "october",
    "november", "december", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "early", "late", "good", "bad", "best", "will", "would", "should", "could", "can", "is", "are", "do", "does", "did", "has", "have", "was", "were", "please", "tell", "show", "give", "whats", "what's", "get", "need", "any", "let", "lets", "let's", "look", "check", "find", "compare", "plan", "and", "or", "but", "so", "then", "also", "about", "windy", "hot", "cold", "warm", "cool", "sunny", "cloudy", "rainy", "humid", "dry", "wet", "safe", "raining"
  ].map((word) => word.toLowerCase()));

  function normalize(question) {
    return String(question || "").replace(/\s+/g, " ").trim();
  }

  /* ---------- planning: places ---------- */

  function tidyPlace(raw) {
    let text = String(raw || "").replace(/[?!.;:]+$/g, "").trim();
    text = text.replace(/\s+(?:today|tomorrow|tonight|this (?:week|weekend|morning|afternoon|evening)|next (?:week|weekend)|on (?:the )?weekend|right now|now|please|thanks?|(?:on|this|next) (?:mon|tues|wednes|thurs|fri|satur|sun)day|(?:in|for) (?:the )?(?:morning|afternoon|evening|night)|in \d+ days?)\b.*$/i, "").trim();
    text = text.replace(/\s+(?:weather|forecast|temperature|climate)$/i, "").trim();
    return text;
  }
  function plausiblePlace(text) {
    if (!text || text.length < 2 || text.length > 60) return false;
    if (!/^[\p{L}]/u.test(text)) return false;
    const first = text.split(/[\s,]+/)[0].toLowerCase();
    if (PLACE_STOP.has(first)) return false;
    if (core.matchActivity(text) && text.split(" ").length <= 2 && !/^[A-Z]/.test(text)) return false;
    if (/\b(?:running|cycling|walking|driving|working|picnic|jogging|hiking|trekking|farming|spraying|swimming|stargazing|photography|drying|laundry|wedding|cricket|football|play|go|going|be|do|have|get|see|know|wear|carry|take|bring)\b/i.test(text.split(/\s+/)[0])) return false;
    return true;
  }
  function splitList(text) {
    return text.split(/\s*(?:,|&|\band\b|\bvs\.?\b|\bversus\b|\bor\b|\bwith\b|\bagainst\b)\s*/i).map(tidyPlace).filter(plausiblePlace);
  }

  function extractPlaces(question) {
    const q = normalize(question);
    let match = /\b(?:compare|comparison(?: of| between)?|between)\s+(.+?)(?:\s+(?:weather|forecast|temperature|today|tomorrow|this|right now|now)\b.*)?$/i.exec(q);
    if (match) {
      const list = splitList(match[1]);
      if (list.length >= 2) return { places: list.slice(0, 4), compare: true };
    }
    match = /^(.+?)\s+(?:vs\.?|versus|or|and)\s+(.+?)(?:\s+(?:which|weather|forecast|today|tomorrow|is|are)\b.*)?[?.!]*$/i.exec(q.replace(/^(?:which is (?:hotter|cooler|wetter|better)[:,]?\s*)/i, ""));
    if (match && /\b(?:vs\.?|versus|hotter|cooler|wetter|warmer|colder|better)\b|\bor\b/i.test(q)) {
      const list = splitList(`${match[1].replace(/^.*\b(?:in|at|for|near)\s+/i, "")} vs ${match[2].replace(/^.*\b(?:in|at|for|near)\s+/i, "")}`);
      if (list.length >= 2) return { places: list.slice(0, 4), compare: true };
    }
    match = /\b(?:from)\s+([A-Za-z][A-Za-z .'-]{1,40}?)\s+to\s+([A-Za-z][A-Za-z .'-]{1,40}?)(?:\s+(?:today|tomorrow|on|this|next|by|in)\b.*|[?.!,]*)$/i.exec(q);
    if (match) {
      const list = [tidyPlace(match[1]), tidyPlace(match[2])].filter(plausiblePlace);
      if (list.length === 2) return { places: list, compare: false, route: true };
    }
    const found = [];
    const weak = new Set();
    const pattern = /\b(in|for|at|near|around|from)\s+([\p{L}][\p{L} .'-]{1,45}?(?:,\s*[\p{L}][\p{L} .'-]{1,30})?)(?=\s+(?:today|tomorrow|tonight|this|next|on|by|at|for|right|now|please|weather|forecast|be|is|are|will|or|and)\b|[?.!,;:]|$)/giu;
    let m;
    while ((m = pattern.exec(q))) {
      const candidate = tidyPlace(m[2]);
      if (plausiblePlace(candidate)) {
        found.push(candidate);
        if (/^(?:for|from)$/i.test(m[1])) weak.add(candidate);
      }
    }
    const unique = [...new Set(found)];
    if (unique.length) return { places: unique.slice(0, 1), compare: false, weak: unique.slice(0, 1).filter((name) => weak.has(name)) };
    // "Mumbai weather", "weather Mumbai", "Mumbai tomorrow?", "what about Mumbai?", "Mumbai"
    match = /^([\p{Lu}][\p{L} .'-]{1,30}?)\s+(?:weather|forecast|temperature|rain|climate|tomorrow|today|now)\b/u.exec(q) ||
      /\b(?:weather|forecast|temperature|climate)\s+([\p{Lu}][\p{L} .'-]{1,30})[?.!]*$/u.exec(q) ||
      /^(?:and |what about |how about |also |then |same for )\s*([\p{L}][\p{L} .'-]{1,30}?)(?:\s+(?:today|tomorrow|tonight|this weekend|next week))?[?.!]*$/iu.exec(q) ||
      (q.split(" ").length <= 3 ? /^([\p{Lu}][\p{L} .'-]{1,30}?)[?.!]*$/u.exec(q) : null);
    if (match) {
      const candidate = tidyPlace(match[1]);
      if (plausiblePlace(candidate)) return { places: [candidate], compare: false, weak: [candidate], bare: true };
    }
    return { places: [], compare: false };
  }

  /* ---------- planning: time ---------- */

  function extractTime(question) {
    const q = normalize(question).toLowerCase();
    const spec = { kind: "today", label: "today" };
    let match;
    if (/\bday after tomorrow\b/.test(q)) Object.assign(spec, { kind: "offset", offset: 2, label: "the day after tomorrow" });
    else if (/\btomorrow\b/.test(q)) Object.assign(spec, { kind: "offset", offset: 1, label: "tomorrow" });
    else if ((match = /\bin (\d{1,2}) days?\b/.exec(q))) Object.assign(spec, { kind: "offset", offset: Math.min(15, Number(match[1])), label: `in ${match[1]} days` });
    else if (/\bweekend\b/.test(q)) Object.assign(spec, { kind: "weekend", label: "this weekend" });
    else if (/\bnext week\b/.test(q)) Object.assign(spec, { kind: "range", from: 0, to: 6, label: "the next 7 days" });
    else if (/\b(?:this week|week ahead|7.?day|seven.?day|coming days|next few days|next days)\b/.test(q)) Object.assign(spec, { kind: "range", from: 0, to: 6, label: "the next 7 days" });
    else if (/\b(?:10.?day|ten.?day|two weeks|15.?day|16.?day)\b/.test(q)) Object.assign(spec, { kind: "range", from: 0, to: 13, label: "the next two weeks" });
    else if ((match = new RegExp(`\\b(next\\s+)?(${WEEKDAYS.join("|")})\\b`).exec(q))) Object.assign(spec, { kind: "weekday", weekday: WEEKDAYS.indexOf(match[2]), next: Boolean(match[1]), label: match[2][0].toUpperCase() + match[2].slice(1) });
    if (/\btonight\b/.test(q)) Object.assign(spec, { part: "night", label: spec.kind === "today" ? "tonight" : spec.label });
    else if (/\b(?:morning|sunrise|dawn|early)\b/.test(q)) spec.part = "morning";
    else if (/\bafternoon\b/.test(q)) spec.part = "afternoon";
    else if (/\b(?:evening|sunset|dusk)\b/.test(q)) spec.part = "evening";
    else if (/\bnight\b/.test(q)) spec.part = "night";
    return spec;
  }

  function resolveOffsets(spec, data) {
    const days = data.daily.time.length;
    const todayWeekday = new Date(`${data.daily.time[0]}T12:00:00Z`).getUTCDay();
    let offsets;
    if (spec.kind === "offset") offsets = [spec.offset];
    else if (spec.kind === "range") offsets = Array.from({ length: spec.to - spec.from + 1 }, (_, i) => spec.from + i);
    else if (spec.kind === "weekend") {
      const saturday = (6 - todayWeekday + 7) % 7;
      offsets = todayWeekday === 0 ? [0] : todayWeekday === 6 ? [0, 1] : [saturday, saturday + 1];
    } else if (spec.kind === "weekday") {
      let delta = (spec.weekday - todayWeekday + 7) % 7;
      if (delta === 0 && spec.next) delta = 7;
      offsets = [delta];
    } else offsets = [0];
    return offsets.filter((offset) => offset >= 0 && offset < days);
  }

  const PARTS = {
    morning: [5, 11], afternoon: [12, 16], evening: [17, 21], night: [21, 28]
  };
  function inPart(hourOfDay, part) {
    if (!part) return true;
    const [from, to] = PARTS[part];
    return part === "night" ? hourOfDay >= 21 || hourOfDay <= 4 : hourOfDay >= from && hourOfDay <= to;
  }
  const PART_TEXT = { morning: "in the morning", afternoon: "in the afternoon", evening: "in the evening", night: "at night" };

  /* ---------- planning: intents ---------- */

  const INTENT_RULES = [
    ["help", /\b(?:help|what can you do|capabilit|features?|how do you work|your tools|what do you know)\b/],
    ["history", /\b(?:climate|histor\w*|last year|past \d+ years?|(?:19|20)\d\d\b|trend|on average|average (?:rain|temperature|temp)|record)\b/],
    ["marine", /\b(?:marine|waves?|sea|ocean|fisher\w*|surf\w*|swell|tides?|boat|ship|sailing|cyclone)\b/],
    ["aviation", /\b(?:aviation|airport|pilot|drone|metar|taf|runway|take.?off|landing|flight weather)\b/],
    ["farm", /\b(?:farm\w*|crops?|irrigat\w*|harvest\w*|sow\w*|paddy|wheat|rice|cotton|fertili[sz]\w*|pesticide|agricultur\w*|kisan|field work)\b/],
    ["alert", /\b(?:alerts?|warnings?|danger\w*|dangerous|severe|storms?|flood\w*|thunder\w*|lightning|hail|emergency|is it safe|safe to)\b/],
    ["air", /\b(?:air quality|aqi|pollution|polluted|smog|pm ?2\.?5|mask|asthma|allerg\w*|breath\w*|dust)\b/],
    ["uv", /\b(?:uv|sun ?screen|sun ?burn|sun protection|spf|tan)\b/],
    ["wind", /\b(?:wind\w*|breez\w*|gusts?)\b/],
    ["sun", /\b(?:sun ?rise|sun ?set|daylight|golden hour|dawn|dusk|when does the sun|when will it get dark|how long is the day)\b/],
    ["rain", /\b(?:rain\w*|showers?|drizzle|umbrella|wet|monsoon|precip\w*|downpour|will it pour|dry)\b/],
    ["wear", /\b(?:wear|dress|jackets?|sweaters?|clothes|outfit|coat|pack|layers?)\b/],
    ["temp", /\b(?:temperature|temp|hot|cold|warm|cool|chill\w*|heat|humid\w*|degrees?|feels? like|sweaty|muggy)\b/],
    ["briefing", /\b(?:plan my day|brief\w*|summary|summari[sz]e|overview|day ahead|morning update|what.?s up|how.?s the weather|how is the weather|weather (?:like|update|report)|what.?s the weather|catch me up)\b/],
    ["forecast", /\b(?:forecast|week|weekend|next (?:few )?days|coming days|weather|outlook)\b/]
  ];

  function detectIntents(question, placeInfo) {
    const q = normalize(question).toLowerCase();
    const intents = [];
    if (placeInfo.compare) intents.push("compare");
    for (const [id, pattern] of INTENT_RULES) if (pattern.test(q) && !intents.includes(id)) intents.push(id);
    const activity = core.matchActivity(q);
    const explicitDay = /\b(?:tomorrow|today|tonight|tonight|day after tomorrow|(?:mon|tues|wednes|thurs|fri|satur|sun)day|weekend|in \d+ days?)\b/.test(q);
    const wantsBestDay = (/\b(?:best|ideal|perfect|good|nicest|better) days?\b|\bwhich day\b|\bwhen (?:should|can|shall|is (?:it )?best|would be)\b/.test(q) && !/\b(?:tomorrow|today|tonight|day after tomorrow|in \d+ days?)\b/.test(q)) || (/\bbest (?:time|window|hours?)\b/.test(q) && false && explicitDay);
    if (activity && !["history", "marine", "aviation", "help", "compare"].includes(intents[0])) {
      intents.unshift(wantsBestDay ? "bestDay" : "activity");
    } else if (wantsBestDay) intents.unshift("bestDay");
    if (/\b(?:travel\w*|trip|journey|road|highway|drive|driving|commute|train|bus|road trip)\b/.test(q) && !intents.includes("activity") && !intents.includes("bestDay")) intents.unshift("travel");
    if (placeInfo.route && !intents.includes("travel")) intents.unshift("travel");
    return { intents, activity };
  }

  const CHAIN_LIMIT = 3;
  function chooseIntents(intents) {
    const dominant = ["help", "compare", "history", "marine", "aviation", "farm", "bestDay", "activity", "travel", "briefing"];
    const first = intents.find((id) => dominant.includes(id));
    if (first) {
      if (first === "activity" || first === "bestDay" || first === "travel") return [first, ...intents.filter((id) => ["air", "alert"].includes(id))].slice(0, 2);
      return [first];
    }
    const rest = intents.filter((id) => id !== "forecast");
    if (rest.length) return rest.slice(0, CHAIN_LIMIT);
    return intents.includes("forecast") ? ["forecast"] : [];
  }

  /* ---------- text helpers ---------- */

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dateLabel(dateString) {
    const [, month, day] = dateString.split("-").map(Number);
    return `${core.weekdayOf(dateString).slice(0, 3)} ${day} ${MONTHS[month - 1]}`;
  }
  function dayWord(offset, dateString) {
    if (offset === 0) return "today";
    if (offset === 1) return "tomorrow";
    return `on ${core.weekdayOf(dateString)} ${dateLabel(dateString).split(" ").slice(1).join(" ")}`;
  }
  function shiftTime(text, minutes) {
    const [hour, minute] = text.split(":").map(Number);
    const total = (((hour * 60 + minute + minutes) % 1440) + 1440) % 1440;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }
  function dayTitle(offset, dateString) {
    if (offset === 0) return "Today";
    if (offset === 1) return "Tomorrow";
    return `${core.weekdayOf(dateString)} ${dateLabel(dateString).split(" ").slice(1).join(" ")}`;
  }
  function cap(text) { return text.charAt(0).toUpperCase() + text.slice(1); }
  function bullets(lines) { return lines.filter(Boolean).map((line) => `• ${line}`).join("\n"); }
  function joinRuns(hours) {
    // hours: sorted list of "YYYY-MM-DDTHH:MM"; returns readable ranges
    const runs = [];
    let run = null;
    for (const time of hours) {
      const hour = Number(time.slice(11, 13));
      if (run && hour === run.end + 1) run.end = hour;
      else { run = { start: hour, end: hour }; runs.push(run); }
    }
    const label = (hour) => core.hourLabel(`T${String(hour).padStart(2, "0")}:00`);
    return runs.map((item) => (item.start === item.end ? label(item.start) : `${label(item.start)}–${label(item.end + 1)}`));
  }

  function daySnapshot(data, offset, part) {
    const d = data.daily;
    const range = core.dayHourRange(data, offset);
    const start = core.nowIndex(data);
    const indices = (range?.indices || []).filter((index) => (offset > 0 || index >= start) && inPart(Number(data.hourly.time[index].slice(11, 13)), part));
    const hours = indices.map((index) => core.hourAt(data, index));
    return {
      offset, date: d.time[offset], code: d.weather_code?.[offset], hi: d.temperature_2m_max?.[offset], lo: d.temperature_2m_min?.[offset],
      apparentHi: d.apparent_temperature_max?.[offset], rainProb: d.precipitation_probability_max?.[offset] ?? 0, rainMm: d.precipitation_sum?.[offset] ?? 0,
      wind: d.wind_speed_10m_max?.[offset], gust: d.wind_gusts_10m_max?.[offset], uv: d.uv_index_max?.[offset],
      sunrise: d.sunrise?.[offset], sunset: d.sunset?.[offset], hours
    };
  }
  function rainWindows(hours) {
    const wet = hours.filter((hour) => (core.isNum(hour.precipitation) && hour.precipitation >= 0.2) || (core.isNum(hour.rainProbability) && hour.rainProbability >= 60 && (hour.precipitation ?? 0) > 0));
    if (!wet.length) return null;
    const peak = wet.reduce((top, hour) => ((hour.precipitation ?? 0) > (top.precipitation ?? 0) ? hour : top), wet[0]);
    return { windows: joinRuns(wet.map((hour) => hour.time)), peak, totalMm: core.round(core.sum(wet.map((hour) => hour.precipitation)), 1) };
  }

  /* ---------- the agent ---------- */

  function createLocalAgent({ fetchImpl } = {}) {
    const memory = { placeNames: [], intents: [], time: null, activity: null };

    async function run(question, ctx, hooks = {}) {
      const q = normalize(question);
      const units = ctx.units === "fahrenheit" ? "fahrenheit" : "celsius";
      const F = (celsius) => core.fmtTemp(celsius, units);
      const B = (celsius) => core.fmtTempBare(celsius, units);
      const unitLetter = units === "fahrenheit" ? "F" : "C";
      const R = (low, high) => `${B(low)}–${B(high)}${unitLetter}`;
      const steps = [];
      let stepId = 0;
      const executor = core.createToolExecutor({ fetchImpl, context: { location: ctx.location, units, language: ctx.language || "en", cache: ctx.cache || {}, alias: ctx.alias } });

      function emit(step) { try { hooks.onStep?.(step, steps); } catch (error) { console.warn("Agent step listener failed:", error); } }
      async function tool(name, args, options = {}) {
        const step = { id: ++stepId, tool: name, label: options.label || core.TOOL_LABELS[name] || name, args: options.display || core.describeToolArgs(name, args), status: "running", summary: "", ms: 0 };
        if (!options.silent) { steps.push(step); emit(step); }
        const started = Date.now();
        try {
          const output = await executor.run(name, args);
          step.status = "done";
          step.summary = output.summary;
          if (options.silent) { steps.push(step); }
          return output;
        } catch (error) {
          step.status = "error";
          step.summary = error.message;
          throw error;
        } finally {
          step.ms = Date.now() - started;
          emit(step);
        }
      }
      function localStep(label, display, work) {
        const step = { id: ++stepId, tool: "compute", label, args: display, status: "running", summary: "", ms: 0 };
        steps.push(step);
        emit(step);
        const started = Date.now();
        try {
          const { value, summary } = work();
          step.status = "done";
          step.summary = summary;
          return value;
        } catch (error) {
          step.status = "error";
          step.summary = error.message;
          throw error;
        } finally {
          step.ms = Date.now() - started;
          emit(step);
        }
      }

      /* --- plan --- */
      let placeInfo = extractPlaces(q);
      const detected = detectIntents(q, placeInfo);
      let intents = chooseIntents(detected.intents);
      let time = extractTime(q);
      const short = q.split(/\s+/).length <= 5;
      const followUp = /^(?:and|what about|how about|also|then|same for)\b/i.test(q) || short;
      if (!intents.length && followUp && memory.intents.length && (placeInfo.places.length || time.kind !== "today" || time.part)) intents = memory.intents.slice();
      let inferredForecast = false;
      if (!intents.length && placeInfo.places.length) { intents = ["forecast"]; inferredForecast = true; }
      if (!intents.length) return { handled: false, steps, text: "" };
      if (!placeInfo.places.length && /\b(?:there|same place|that (?:city|place)|same city)\b/i.test(q) && memory.placeNames.length) placeInfo = { places: memory.placeNames.slice(0, 1), compare: false };
      if (time.kind === "today" && !time.part && followUp && memory.time && !/\b(?:today|now|currently|right now)\b/i.test(q) && (placeInfo.places.length && !detected.intents.length)) time = memory.time;
      const reusedMemory = !detected.intents.length && intents.length && memory.intents.length;
      const activityId = detected.activity || (intents.includes("farm") && /spray/i.test(q) ? "spraying" : null) || (reusedMemory ? memory.activity : null);
      const effectiveIntents = intents.slice();

      const planStep = { id: ++stepId, tool: "plan", label: "Plan", args: "", status: "done", ms: 0, summary: `${effectiveIntents.join(" + ")}${placeInfo.places.length ? ` · ${placeInfo.places.join(" vs ")}` : ` · ${ctx.location.name}`} · ${time.label}${time.part ? ` (${time.part})` : ""}` };
      steps.push(planStep);
      emit(planStep);

      /* --- shared loaders (cached, each visible as a step) --- */
      const forecastCache = new Map();
      const airCache = new Map();
      const noteLines = [];
      async function resolveTarget(name, silent = false) {
        if (!name) return ctx.location;
        const probe = await tool("search_place", { query: name }, { silent });
        const match = probe.raw.results[0];
        return { name: match.name, country: match.country, latitude: match.latitude, longitude: match.longitude, timezone: match.timezone || "auto" };
      }
      async function forecast(loc, days = 7) {
        const key = `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`;
        if (forecastCache.has(key)) return forecastCache.get(key);
        const promise = tool("get_weather", { place: loc === ctx.location ? "" : `${loc.latitude},${loc.longitude}`, days }, { display: loc.name }).then((output) => output.raw.data);
        forecastCache.set(key, promise);
        return promise;
      }
      async function air(loc) {
        const key = `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`;
        if (airCache.has(key)) return airCache.get(key);
        const promise = tool("get_air_quality", { place: loc === ctx.location ? "" : `${loc.latitude},${loc.longitude}` }, { display: loc.name }).then((output) => output.raw.air).catch(() => null);
        airCache.set(key, promise);
        return promise;
      }

      /* --- resolve places --- */
      const targets = [];
      const unresolved = [];
      const weakNames = new Set(placeInfo.weak || []);
      if (placeInfo.places.length) {
        for (const name of placeInfo.places) {
          try {
            const alias = ctx.alias?.(name);
            const found = await resolveTarget(alias || name, weakNames.has(name));
            if (!targets.some((item) => item.latitude === found.latitude && item.longitude === found.longitude)) targets.push(found);
          } catch (error) {
            if (!weakNames.has(name)) unresolved.push(name);
          }
        }
        if (!targets.length && placeInfo.places.length && placeInfo.places.every((name) => weakNames.has(name)) && (inferredForecast || placeInfo.bare)) return { handled: false, steps: [], text: "" };
        if (!targets.length && (placeInfo.compare || placeInfo.route)) {
          return { handled: true, steps, text: `I couldn't find ${unresolved.map((name) => `“${name}”`).join(" or ")}. Try the city name with its state or country, for example “Pune, Maharashtra”.`, followUps: [], places: [] };
        }
        if (unresolved.length) noteLines.push(`I couldn't find ${unresolved.map((name) => `“${name}”`).join(", ")}${targets.length ? "" : `, so I used your selected location (${ctx.location.name})`}.`);
      }
      const primary = targets[0] || ctx.location;
      if (placeInfo.compare && targets.length < 2) placeInfo = { ...placeInfo, compare: false };

      const primaryData = await forecast(primary, 16);
      const offsets = resolveOffsets(time, primaryData);
      const mainOffset = offsets[0] ?? 0;
      const partText = time.part ? ` ${PART_TEXT[time.part]}` : "";
      const placeName = primary.name;
      if (time.kind !== "today" && !offsets.length) noteLines.push("That date is beyond the 16-day forecast window, so I used today instead.");
      const useOffsets = offsets.length ? offsets : [0];

      /* --- composers --- */
      const composers = {
        async help() {
          return `I’m the WeatherGPT agent. I plan, call live tools, then answer from real Open-Meteo data. Try:\n${bullets([
            "“Best time to run tomorrow in Pune?” — activity planner scores every hour",
            "“Compare Mumbai and Delhi” — side-by-side weather and air quality",
            "“Do I need an umbrella this weekend in Goa?” — rain timing",
            "“Plan my day” — a full briefing with UV, air, clothing and rain",
            "“Is it safe to fly a drone tonight?” · “Spray window for cotton?”",
            "“How hot was last year in Chennai?” — climate history"
          ])}\nEvery answer lists the tools it used. Forecasts are guidance, not official warnings.`;
        },

        async briefing() {
          const data = primaryData;
          const airData = await air(primary);
          const items = localStep("Briefing", placeName, () => {
            const list = core.buildBriefing(data, airData, { units });
            return { value: list, summary: `${list.length} insights` };
          });
          return `**Your day in ${placeName}**\n${bullets(items.map((item) => `${item.icon} **${item.title}** — ${item.text}`))}`;
        },

        async forecast() {
          const data = primaryData;
          const lines = useOffsets.map((offset) => {
            const s = daySnapshot(data, offset, time.part);
            const cond = core.describeCode(s.code).text;
            const label = dayTitle(offset, s.date);
            const pieces = [`${cond}, ${B(s.hi)}/${B(s.lo)}${unitLetter}`, `${s.rainProb}% rain chance${s.rainMm >= 0.5 ? ` (${core.round(s.rainMm, 1)} mm)` : ""}`];
            if (core.isNum(s.gust) && s.gust >= 35) pieces.push(`gusts to ${Math.round(s.gust)} km/h`);
            if (core.isNum(s.uv) && s.uv >= 6) pieces.push(`UV ${core.round(s.uv, 1)}`);
            return `**${label}** — ${pieces.join(" · ")}`;
          });
          const now = data.current;
          const nowLine = useOffsets[0] === 0 && useOffsets.length > 0 ? `Right now in ${placeName}: ${core.describeCode(now.weather_code).text.toLowerCase()}, ${F(now.temperature_2m)} (feels ${F(now.apparent_temperature)}), humidity ${Math.round(now.relative_humidity_2m)}%, wind ${Math.round(now.wind_speed_10m)} km/h ${core.compass(now.wind_direction_10m)}.\n` : "";
          const nowcast = useOffsets[0] === 0 ? core.nowcast(data) : null;
          return `**${placeName} · ${time.kind === "today" ? "weather" : time.label}${partText}**\n${nowLine}${bullets(lines.slice(0, 10))}${nowcast ? `\n${nowcast.text}` : ""}`;
        },

        async rain() {
          const data = primaryData;
          const lines = useOffsets.slice(0, 7).map((offset) => {
            const s = daySnapshot(data, offset, time.part);
            const windows = rainWindows(s.hours);
            const label = dayTitle(offset, s.date);
            if (!windows && s.rainProb < 30) return `**${label}${partText}:** dry — ${s.rainProb}% peak chance, ${core.round(s.rainMm, 1)} mm.`;
            if (!windows) return `**${label}${partText}:** ${s.rainProb}% chance of a shower somewhere in the day but no wet hours stand out; a light umbrella is optional.`;
            return `**${label}${partText}:** rain around ${windows.windows.slice(0, 3).join(", ")}, heaviest near ${core.hourLabel(windows.peak.time)} (${core.round(windows.peak.precipitation, 1)} mm/h); about ${windows.totalMm} mm in that window, ${s.rainProb}% peak chance.`;
          });
          const nowcast = useOffsets[0] === 0 && !time.part ? core.nowcast(data) : null;
          const maxProb = Math.max(...useOffsets.map((offset) => daySnapshot(data, offset, time.part).rainProb));
          const advice = maxProb >= 60 ? "Take an umbrella or rain jacket." : maxProb >= 30 ? "A compact umbrella is a sensible backup." : "You can probably leave the umbrella at home.";
          return `**Rain outlook · ${placeName}**\n${bullets(lines)}${nowcast ? `\n${nowcast.text}` : ""}\n${advice}`;
        },

        async temp() {
          const data = primaryData;
          const lines = useOffsets.slice(0, 7).map((offset) => {
            const s = daySnapshot(data, offset, time.part);
            const hottest = s.hours.length ? s.hours.reduce((top, hour) => (hour.temperature > top.temperature ? hour : top), s.hours[0]) : null;
            const label = dayTitle(offset, s.date);
            return `**${label}${partText}:** ${R(s.lo, s.hi)}${core.isNum(s.apparentHi) && Math.abs(s.apparentHi - s.hi) >= 2 ? `, feels up to ${B(s.apparentHi)}` : ""}${hottest && offset === 0 ? `; warmest around ${core.hourLabel(hottest.time)} (${B(hottest.temperature)})` : ""}`;
          });
          const now = data.current;
          const heat = core.heatIndexC(now.temperature_2m, now.relative_humidity_2m);
          const extra = useOffsets[0] === 0 ? `Right now it's ${F(now.temperature_2m)} and feels ${F(now.apparent_temperature)} — ${core.comfortLabel(now.apparent_temperature, now.dew_point_2m).toLowerCase()}, humidity ${Math.round(now.relative_humidity_2m)}%, dew point ${F(now.dew_point_2m)}${core.isNum(heat) && heat > now.temperature_2m + 1.5 ? `, heat index ${F(heat)}` : ""}.` : "";
          return `**Temperature · ${placeName}**\n${extra ? `${extra}\n` : ""}${bullets(lines)}`;
        },

        async wear() {
          const data = primaryData;
          const s = daySnapshot(data, mainOffset, time.part);
          const mean = s.hours.length ? core.sum(s.hours.map((hour) => hour.apparent)) / s.hours.length : (s.hi + s.lo) / 2;
          const apparent = mainOffset === 0 && !time.part ? (data.current.apparent_temperature + (s.hi + s.lo) / 2) / 2 : mean;
          const advice = core.clothingAdvice(apparent, s.rainProb, s.wind || 0, s.uv || 0);
          const range = `${R(s.lo, s.hi)}`;
          return `**What to wear ${dayWord(mainOffset, s.date)}${partText} in ${placeName}** (${core.describeCode(s.code).text.toLowerCase()}, ${range}, ${s.rainProb}% rain)\n${bullets(advice.map(cap))}${s.hi - s.lo >= 10 ? `\nThe day swings ${Math.round(units === "fahrenheit" ? (s.hi - s.lo) * 1.8 : s.hi - s.lo)}° — dress in layers you can remove.` : ""}`;
        },

        async air() {
          const airData = await air(primary);
          if (!airData) return `I couldn't load air-quality data for ${placeName} right now.`;
          const aqi = Math.round(airData.us_aqi);
          const uv = primaryData.daily.uv_index_max?.[0];
          const walk = core.rateActivity(primaryData, "walking", { aqi });
          return `**Air quality · ${placeName}**\n${bullets([
            `US AQI **${aqi}** — ${core.aqiCategory(aqi)}${core.isNum(airData.pm2_5) ? `; PM2.5 ${core.round(airData.pm2_5, 1)} µg/m³` : ""}${core.isNum(airData.pm10) ? `, PM10 ${core.round(airData.pm10, 1)} µg/m³` : ""}`,
            aqi > 150 ? "Avoid strenuous outdoor exertion; a well-fitted N95/FFP2 mask helps outdoors. Keep windows closed and use a purifier if you have one." : aqi > 100 ? "People with asthma, heart or lung conditions, children and older adults should limit long outdoor exertion." : aqi > 50 ? "Acceptable for most people; unusually sensitive people may notice symptoms." : "Clean air — fine for outdoor exercise and airing out the home.",
            walk && walk.best.score >= 25 ? `Best outdoor window today: ${core.hourLabel(walk.best.start)}–${core.hourLabel(walk.best.end)}.` : null,
            core.isNum(uv) ? `UV peaks at ${core.round(uv, 1)} (${core.uvCategory(uv).toLowerCase()}).` : null
          ])}\nAir-quality figures are modelled (CAMS) and not a substitute for local monitoring stations or health advice.`;
        },

        async uv() {
          const data = primaryData;
          const s = daySnapshot(data, mainOffset, null);
          const start = core.nowIndex(data);
          const uvHours = (core.dayHourRange(data, mainOffset)?.indices || []).filter((index) => mainOffset > 0 || index >= start).map((index) => core.hourAt(data, index)).filter((hour) => core.isNum(hour.uv) && hour.uv >= 3);
          const burn = core.uvBurnMinutes(s.uv);
          const peakHour = uvHours.length ? uvHours.reduce((top, hour) => (hour.uv > top.uv ? hour : top), uvHours[0]) : null;
          return `**UV index · ${dayWord(mainOffset, s.date)} in ${placeName}**\n${bullets([
            `Peak UV **${core.round(s.uv, 1)}** (${core.uvCategory(s.uv)})${peakHour ? ` near ${core.hourLabel(peakHour.time)}` : ""}`,
            uvHours.length ? `UV ≥ 3 (sunscreen recommended): ${joinRuns(uvHours.map((hour) => hour.time)).join(", ")}` : "UV stays below 3 for the rest of the period — sun protection is optional.",
            burn && s.uv >= 3 ? `Unprotected fair skin can burn in roughly ${burn} minutes at the peak; darker skin takes longer but is still at risk.` : null,
            s.uv >= 6 ? "Use SPF 30+ broad-spectrum sunscreen, sunglasses, a hat, and seek shade 11 AM–3 PM." : s.uv >= 3 ? "SPF 30 sunscreen on exposed skin if you'll be out more than 30 minutes." : null
          ])}`;
        },

        async wind() {
          const data = primaryData;
          const now = data.current;
          const s = daySnapshot(data, mainOffset, time.part);
          const gusts = s.hours.length ? s.hours.reduce((top, hour) => ((hour.gust ?? 0) > (top.gust ?? 0) ? hour : top), s.hours[0]) : null;
          return `**Wind · ${placeName}**\n${bullets([
            mainOffset === 0 ? `Now: **${Math.round(now.wind_speed_10m)} km/h** from the ${core.compass(now.wind_direction_10m)} (${core.windCategory(now.wind_speed_10m).toLowerCase()}), gusting ${Math.round(now.wind_gusts_10m ?? now.wind_speed_10m)} km/h` : null,
            `${cap(dayWord(mainOffset, s.date))}${partText}: sustained up to ${Math.round(s.wind ?? 0)} km/h${gusts && core.isNum(gusts.gust) ? `, gusts to ${Math.round(gusts.gust)} km/h around ${core.hourLabel(gusts.time)}` : ""}`,
            (s.gust ?? 0) >= 60 ? "Gusts this strong can down branches and make cycling, two-wheelers and high-sided vehicles hazardous." : (s.gust ?? 0) >= 40 ? "Blustery — secure loose outdoor items." : "Nothing unusual for most activities."
          ])}`;
        },

        async sun() {
          const data = primaryData;
          const s = daySnapshot(data, mainOffset, null);
          const duration = data.daily.daylight_duration?.[mainOffset];
          const rise = s.sunrise?.slice(11, 16);
          const set = s.sunset?.slice(11, 16);
          const hourMinute = (text) => core.hourLabel(`T${text}`);
          return `**Sun · ${dayWord(mainOffset, s.date)} in ${placeName}**\n${bullets([
            `Sunrise **${hourMinute(rise)}** · Sunset **${hourMinute(set)}**`,
            core.isNum(duration) ? `Daylight: ${Math.floor(duration / 3600)} h ${Math.round((duration % 3600) / 60)} min` : null,
            `Golden hours: about ${hourMinute(rise)}–${hourMinute(shiftTime(rise, 60))} and ${hourMinute(shiftTime(set, -60))}–${hourMinute(set)}`,
            `Cloud cover now ${Math.round(data.current.cloud_cover ?? 0)}% — ${(data.current.cloud_cover ?? 0) >= 70 ? "expect a muted sunrise/sunset" : "good odds of colour at the horizon"}.`
          ])}`;
        },

        async activity() {
          const id = activityId || "walking";
          const aqiData = await air(primary);
          const rating = localStep("Activity planner", `${id} · ${placeName}`, () => {
            const result = core.rateActivity(primaryData, id, { dayOffset: mainOffset, aqi: aqiData?.us_aqi ?? null });
            if (!result) throw new Error("No forecast hours left for that day.");
            return { value: result, summary: `${result.label}: ${result.best.score}/100 at ${core.hourLabel(result.best.start)}` };
          });
          const profile = core.ACTIVITIES[id];
          const scored = time.part ? rating.hours.filter((hour) => inPart(Number(hour.time.slice(11, 13)), time.part)) : core.relevantHours(id, rating.hours);
          const hoursPart = scored;
          const pool = hoursPart.length ? hoursPart : rating.hours;
          const worst = pool.reduce((low, hour) => (hour.score < low.score ? hour : low), pool[0]);
          let best = null;
          pool.forEach((hour, index) => {
            const next = pool[index + 1] || hour;
            const average = (hour.score + next.score) / 2;
            if (!best || average > best.score) best = { start: hour.time, end: core.plusHour(next.time), score: Math.round(average) };
          });
          const reasons = [];
          if (worst.temperature >= 33) reasons.push("heat");
          if (worst.temperature <= 5) reasons.push("cold");
          if ((worst.rainProbability ?? 0) >= 50) reasons.push("rain");
          if ((worst.wind ?? 0) >= 25) reasons.push("wind");
          if (core.isNum(worst.code) && worst.code >= 95) reasons.push("thunderstorms");
          const bestHour = pool.reduce((top, hour) => (hour.score > top.score ? hour : top), pool[0]);
          const bar = (score) => "█".repeat(Math.max(1, Math.round(score / 12.5))) + "░".repeat(8 - Math.max(1, Math.round(score / 12.5)));
          const strip = pool.filter((_, index) => index % 2 === 0).slice(0, 10).map((hour) => `${core.hourLabel(hour.time).padEnd(6)} ${bar(hour.score)} ${hour.score}`).join("\n");
          return `${profile.icon} **${profile.label} · ${dayWord(mainOffset, rating.date)}${partText} in ${placeName}**\n${bullets([
            `Best window: **${core.hourLabel(best.start)}–${core.hourLabel(best.end)}** — ${best.score}/100 (${core.scoreVerdict(best.score).toLowerCase()})`,
            `Peak hour ${core.hourLabel(bestHour.time)}: ${core.describeCode(bestHour.code).text.toLowerCase()}, ${F(bestHour.temperature)}, ${bestHour.rainProbability ?? 0}% rain, wind ${Math.round(bestHour.wind ?? 0)} km/h`,
            worst.score < 45 ? `Avoid around ${core.hourLabel(worst.time)} (${worst.score}/100${reasons.length ? `: ${reasons.join(", ")}` : ""})` : null,
            mainOffset === 0 && !time.part ? `Right now: ${rating.scoreNow}/100 (${core.scoreVerdict(rating.scoreNow).toLowerCase()})` : null,
            aqiData && aqiData.us_aqi > 100 ? `Air quality is ${core.aqiCategory(aqiData.us_aqi).toLowerCase()} (AQI ${Math.round(aqiData.us_aqi)}) — scores are reduced for outdoor exertion.` : null
          ])}\n\`\`\`\n${strip}\n\`\`\`\nScores are a heuristic (temperature, rain, wind, UV, humidity, daylight, air quality) — not a safety guarantee.`;
        },

        async bestDay() {
          const id = activityId || "walking";
          const aqiData = await air(primary);
          const span = Math.min(primaryData.daily.time.length, useOffsets.length > 1 ? useOffsets[useOffsets.length - 1] + 1 : 7);
          const ratings = localStep("Scan days", `${id} · ${span} days`, () => {
            const list = [];
            for (let offset = 0; offset < span; offset += 1) {
              const result = core.rateActivity(primaryData, id, { dayOffset: offset, aqi: offset === 0 ? aqiData?.us_aqi ?? null : null });
              if (result) list.push({ offset, ...result });
            }
            if (!list.length) throw new Error("No days could be scored.");
            return { value: list, summary: `${list.length} days scored` };
          });
          const ranked = ratings.slice().sort((a, b) => b.best.score - a.best.score);
          const top = ranked[0];
          const profile = core.ACTIVITIES[id];
          return `${profile.icon} **Best day for ${profile.label.split(/[\/(]/)[0].trim().toLowerCase()} in ${placeName}**\n${bullets([
            `**${cap(dayWord(top.offset, top.date))} (${top.weekday})**, ${core.hourLabel(top.best.start)}–${core.hourLabel(top.best.end)} — ${top.best.score}/100 (${core.scoreVerdict(top.best.score).toLowerCase()})`,
            ...ranked.slice(1, 4).map((item) => `${cap(item.offset < 2 ? dayWord(item.offset, item.date) : item.weekday)}: ${item.best.score}/100 around ${core.hourLabel(item.best.start)}`),
            ranked.length > 4 ? `Weakest: ${ranked[ranked.length - 1].weekday} (${ranked[ranked.length - 1].best.score}/100)` : null
          ])}`;
        },

        async travel() {
          const stops = targets.length >= 2 ? targets.slice(0, 2) : [primary];
          const id = activityId && ["commute", "spraying"].includes(activityId) ? activityId : "commute";
          const lines = [];
          for (const stop of stops) {
            const data = await forecast(stop, 16);
            const aqiData = await air(stop);
            const rating = localStep("Travel check", stop.name, () => {
              const result = core.rateActivity(data, id, { dayOffset: resolveOffsets(time, data)[0] ?? 0, aqi: aqiData?.us_aqi ?? null });
              if (!result) throw new Error("No hours left for that day.");
              return { value: result, summary: `${result.best.score}/100` };
            });
            const snapshot = daySnapshot(data, rating.hours.length ? Math.max(0, data.daily.time.indexOf(rating.date)) : 0, time.part);
            const risks = [];
            if (snapshot.rainProb >= 60) risks.push(`${snapshot.rainProb}% rain chance`);
            if ((snapshot.gust ?? 0) >= 50) risks.push(`gusts to ${Math.round(snapshot.gust)} km/h`);
            if (core.isNum(snapshot.code) && snapshot.code >= 95) risks.push("thunderstorms");
            if (snapshot.hi >= 38) risks.push(`heat up to ${F(snapshot.hi)}`);
            if (snapshot.lo <= 2) risks.push("freezing temperatures / ice");
            const fog = snapshot.hours.some((hour) => core.isNum(hour.visibility) && hour.visibility < 1000);
            if (fog) risks.push("low visibility");
            lines.push(`**${stop.name}** (${dayWord(rating.hours.length ? data.daily.time.indexOf(rating.date) : 0, rating.date)}): ${core.describeCode(snapshot.code).text.toLowerCase()}, ${R(snapshot.lo, snapshot.hi)}; best travel window ${core.hourLabel(rating.best.start)}–${core.hourLabel(rating.best.end)} (${rating.best.score}/100). ${risks.length ? `Watch for: ${risks.join(", ")}.` : "No notable hazards in the forecast."}`);
          }
          return `**Travel weather${stops.length === 2 ? `: ${stops[0].name} → ${stops[1].name}` : ` · ${stops[0].name}`}**\n${bullets(lines)}\nCheck local road, rail and flight advisories before you leave; forecasts can't see traffic or closures.`;
        },

        async compare() {
          const output = await tool("compare_places", { places: targets.map((target) => `${target.latitude},${target.longitude}`) }, { display: targets.map((target) => target.name).join(" vs ") });
          const rows = output.raw.rows.map((row, index) => ({ ...row, place: targets[index]?.name || row.place })).filter((row) => !row.error);
          if (rows.length < 2) return "I could only load weather for one of those places right now.";
          const by = (key, direction = 1) => rows.slice().sort((a, b) => (direction * ((b[key] ?? -999) - (a[key] ?? -999))))[0];
          const lines = rows.map((row) => `**${row.place}** — ${row.summary.toLowerCase()}, ${F(row.tempC)} (feels ${F(row.feelsLikeC)}), today ${R(row.todayLowC, row.todayHighC)}, ${row.rainChanceTodayPct ?? 0}% rain, wind ${row.windKmh} km/h${row.usAqi !== null ? `, AQI ${row.usAqi}` : ""}`);
          const hottest = by("tempC");
          const coolest = by("tempC", -1);
          const wettest = by("rainChanceTodayPct");
          const cleanest = rows.filter((row) => row.usAqi !== null).length ? rows.filter((row) => row.usAqi !== null).sort((a, b) => a.usAqi - b.usAqi)[0] : null;
          return `**Comparing ${rows.map((row) => row.place).join(", ")}**\n${bullets(lines)}\n**Verdict:** ${hottest.place} is warmest (${F(hottest.tempC)}) and ${coolest.place} coolest (${F(coolest.tempC)}). ${wettest.rainChanceTodayPct >= 30 ? `${wettest.place} has the best chance of rain (${wettest.rainChanceTodayPct}%).` : "Rain chances are low everywhere."}${cleanest ? ` ${cleanest.place} has the cleanest air (AQI ${cleanest.usAqi}).` : ""}`;
        },

        async history() {
          const yearMatch = /\b((?:19|20)\d{2})\b/.exec(q);
          const output = await tool("get_climate_history", { place: primary === ctx.location ? "" : `${primary.latitude},${primary.longitude}`, year: yearMatch ? Number(yearMatch[1]) : undefined }, { display: `${placeName}${yearMatch ? ` · ${yearMatch[1]}` : ""}` });
          const h = output.result;
          const hottestMonth = h.months.reduce((top, month) => (month.meanC > top.meanC ? month : top), h.months[0]);
          const wettestMonth = h.months.reduce((top, month) => (month.rainMm > top.rainMm ? month : top), h.months[0]);
          return `**${h.year} in ${placeName}** (ERA5 reanalysis)\n${bullets([
            `Mean temperature **${F(h.meanTemperatureC)}**, total rainfall **${h.totalRainMm} mm** over ${h.daysCovered} days`,
            h.hottestDay ? `Hottest day: ${dateLabel(h.hottestDay.date)} at ${F(h.hottestDay.maxC)}` : null,
            h.wettestDay ? `Wettest day: ${dateLabel(h.wettestDay.date)} with ${h.wettestDay.mm} mm` : null,
            `Warmest month ${hottestMonth.month} (${F(hottestMonth.meanC)} mean); wettest month ${wettestMonth.month} (${wettestMonth.rainMm} mm)`
          ])}\nThis describes that period only and is not an official climate record; open the Climate tab for multi-year charts.`;
        },

        async marine() {
          try {
            const output = await tool("get_marine_conditions", { place: primary === ctx.location ? "" : `${primary.latitude},${primary.longitude}` }, { display: placeName });
            const m = output.result;
            const risk = m.waveHeightM >= 2.5 || (m.peakWaveHeightNext48hM ?? 0) >= 3 ? "Rough seas — small craft and fishing boats should stay ashore unless local authorities advise otherwise." : m.waveHeightM >= 1.25 ? "Moderate seas — caution for small boats and swimmers." : "Seas are relatively calm.";
            return `**Sea state near ${placeName}**\n${bullets([
              `Waves **${m.waveHeightM} m** from ${m.waveDirectionDeg}° every ${m.wavePeriodS} s${core.isNum(m.swellHeightM) ? `; swell ${m.swellHeightM} m` : ""}`,
              core.isNum(m.seaSurfaceTempC) ? `Sea surface temperature ${F(m.seaSurfaceTempC)}` : null,
              core.isNum(m.peakWaveHeightNext48hM) ? `Peak wave height in the next 48 h: ${m.peakWaveHeightNext48hM} m` : null,
              risk
            ])}\nThis is model guidance, not an official marine or cyclone warning. Follow your coast guard / met office.`;
          } catch (error) {
            return `I couldn't get marine data near ${placeName} — it may be inland or outside the marine model's grid. Try a coastal town. Official coastal and cyclone warnings are not connected.`;
          }
        },

        async aviation() {
          const data = primaryData;
          const now = data.current;
          const s = daySnapshot(data, mainOffset, time.part);
          const lowVis = s.hours.filter((hour) => core.isNum(hour.visibility) && hour.visibility < 5000);
          const storm = s.hours.some((hour) => core.isNum(hour.code) && hour.code >= 95);
          const flags = [];
          if ((now.visibility ?? 99999) < 5000 || lowVis.length) flags.push("reduced visibility");
          if ((s.gust ?? 0) >= 40 || (now.wind_gusts_10m ?? 0) >= 40) flags.push("strong gusts");
          if (storm) flags.push("thunderstorms");
          return `**Aviation / drone conditions · ${placeName}**\n${bullets([
            `Visibility ${core.isNum(now.visibility) ? `${core.round(now.visibility / 1000, 1)} km` : "n/a"}${lowVis.length ? `; below 5 km around ${joinRuns(lowVis.map((hour) => hour.time)).slice(0, 2).join(", ")}` : ""}`,
            `Surface wind ${Math.round(now.wind_speed_10m)} km/h from ${core.compass(now.wind_direction_10m)}, gusts ${Math.round(now.wind_gusts_10m ?? now.wind_speed_10m)} km/h (today up to ${Math.round(s.gust ?? 0)})`,
            `Cloud cover ${Math.round(now.cloud_cover ?? 0)}%, pressure ${Math.round(now.pressure_msl)} hPa`,
            flags.length ? `Flags: ${flags.join(", ")}` : "No visibility, gust or thunderstorm flags in the forecast"
          ])}\nThis is model forecast data — **not** a METAR/TAF or an approved flight briefing. Use official aviation weather and follow local regulations.`;
        },

        async farm() {
          const data = primaryData;
          const s0 = daySnapshot(data, 0, null);
          const s1 = daySnapshot(data, 1, null);
          const spray = core.rateActivity(data, "spraying", { dayOffset: 0 });
          const spray1 = core.rateActivity(data, "spraying", { dayOffset: 1 });
          const rain48 = core.round((s0.rainMm || 0) + (s1.rainMm || 0), 1);
          const week = data.daily.precipitation_sum.slice(0, 7).reduce((total, value) => total + (value || 0), 0);
          const lines = [
            `Rain: ${s0.rainProb}% today / ${s1.rainProb}% tomorrow; ${rain48} mm expected over 48 h, ${core.round(week, 0)} mm over 7 days`,
            `Temperature ${R(s0.lo, s0.hi)} today; wind up to ${Math.round(s0.wind ?? 0)} km/h`,
            spray && spray.best.score >= 40 ? `Spray window today: **${core.hourLabel(spray.best.start)}–${core.hourLabel(spray.best.end)}** (${spray.best.score}/100)` : spray1 && spray1.best.score >= 40 ? `Better spray window tomorrow: **${core.hourLabel(spray1.best.start)}–${core.hourLabel(spray1.best.end)}** (${spray1.best.score}/100)` : "No good spray window in the next 2 days — wind or rain is likely to cause drift or wash-off",
            rain48 >= 20 ? "Heavy rain ahead — hold off on irrigation and fertiliser; check field drainage." : rain48 < 3 && s0.hi >= 34 ? "Dry and hot — plan irrigation for early morning or evening to cut evaporation." : "Moderate conditions — check soil moisture before irrigating.",
            s0.hi >= 40 ? "Heat stress risk for workers and livestock: work before 10 AM and after 4 PM." : null
          ];
          return `🌾 **Field weather · ${placeName}**${ctx.crop && ctx.crop !== "general" ? ` (${ctx.crop})` : ""}\n${bullets(lines)}\nGeneral weather planning only — not crop-specific advice. Check product labels and your local KVK / extension officer.`;
        },

        async alert() {
          const data = primaryData;
          const findings = [];
          const start = core.nowIndex(data);
          const next48 = Array.from({ length: 48 }, (_, i) => start + i).filter((index) => index < data.hourly.time.length).map((index) => core.hourAt(data, index));
          const storm = next48.find((hour) => core.isNum(hour.code) && hour.code >= 95);
          if (storm) findings.push(`⚡ Thunderstorm signal around ${dateLabel(storm.time.slice(0, 10))} ${core.hourLabel(storm.time)}`);
          const gustPeak = next48.reduce((top, hour) => ((hour.gust ?? 0) > (top.gust ?? 0) ? hour : top), next48[0]);
          if ((gustPeak.gust ?? 0) >= 60) findings.push(`💨 Gusts up to ${Math.round(gustPeak.gust)} km/h around ${core.hourLabel(gustPeak.time)}`);
          const rainPeak = next48.reduce((top, hour) => ((hour.precipitation ?? 0) > (top.precipitation ?? 0) ? hour : top), next48[0]);
          if ((rainPeak.precipitation ?? 0) >= 7) findings.push(`🌧 Intense rain rate ${core.round(rainPeak.precipitation, 1)} mm/h near ${core.hourLabel(rainPeak.time)}`);
          const total48 = core.sum(next48.map((hour) => hour.precipitation));
          if (total48 >= 60) findings.push(`🌊 ${Math.round(total48)} mm of rain in 48 h — localised flooding is possible`);
          const heatMax = Math.max(...data.daily.temperature_2m_max.slice(0, 3));
          if (heatMax >= 40) findings.push(`🥵 Highs up to ${F(heatMax)} in the next 3 days`);
          const coldMin = Math.min(...data.daily.temperature_2m_min.slice(0, 3));
          if (coldMin <= 2) findings.push(`🥶 Lows down to ${F(coldMin)} in the next 3 days`);
          const airData = await air(primary);
          if (airData && airData.us_aqi > 150) findings.push(`🫁 Air quality is ${core.aqiCategory(airData.us_aqi).toLowerCase()} (AQI ${Math.round(airData.us_aqi)})`);
          return `**Safety scan · ${placeName} (next 48 h)**\n${findings.length ? bullets(findings) : "No high-impact weather signal (storms, damaging gusts, intense rain, extreme heat/cold, hazardous air) appears in the forecast."}\n⚠ This is model-derived guidance, **not an official warning**, and no signal is not an all-clear. Follow IMD / NDMA / local authorities for official alerts, and call 112 in an emergency.`;
        }
      };

      const parts = [];
      for (const intent of effectiveIntents) {
        const compose = composers[intent];
        if (compose) parts.push(await compose());
      }
      const text = `${noteLines.length ? `${noteLines.join(" ")}\n\n` : ""}${parts.join("\n\n")}`.trim();

      memory.placeNames = targets.length ? targets.map((target) => target.name) : memory.placeNames;
      memory.intents = effectiveIntents.slice();
      memory.time = time;
      memory.activity = activityId;

      const followUps = [];
      const other = ctx.savedNames?.find((name) => name !== placeName);
      const suggest = (question2) => { if (followUps.length < 3 && !followUps.includes(question2)) followUps.push(question2); };
      if (effectiveIntents.includes("rain")) { suggest(`What should I wear ${time.kind === "today" ? "today" : time.label}?`); suggest(`Best time to walk ${time.kind === "today" ? "today" : time.label}?`); }
      if (effectiveIntents.includes("activity") || effectiveIntents.includes("bestDay")) { suggest(`Which day this week is best for ${core.ACTIVITIES[activityId || "walking"].label.split(/[\/(]/)[0].trim().toLowerCase()}?`); suggest("Is the air quality okay?"); }
      if (effectiveIntents.includes("forecast") || effectiveIntents.includes("briefing")) { suggest("Will it rain today?"); suggest("Best time to run tomorrow?"); }
      if (effectiveIntents.includes("compare") || other) suggest(other ? `Compare ${placeName} and ${other}` : "Compare Mumbai and Delhi");
      suggest("Plan my day");
      suggest("Is there any severe weather coming?");

      const changedPlace = targets.length && (targets[0].latitude !== ctx.location.latitude || targets[0].longitude !== ctx.location.longitude) ? targets[0] : null;
      return { handled: true, steps, text, followUps: followUps.slice(0, 3), places: targets, switchTo: effectiveIntents.includes("compare") ? null : changedPlace, intents: effectiveIntents };
    }

    return { run, memory };
  }

  return { createLocalAgent, extractPlaces, extractTime, detectIntents, chooseIntents, resolveOffsets };
});
