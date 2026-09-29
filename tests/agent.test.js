const assert = require("node:assert/strict");
const test = require("node:test");
const core = require("../functions/agent-core");
const localAgent = require("../local-agent");
const { createAiGateway, validateChatInput } = require("../functions/ai-gateway");
const { createMockFetch } = require("./mock-open-meteo");

const PUNE = { name: "Pune", country: "India", latitude: 18.52, longitude: 73.86, timezone: "Asia/Kolkata" };

function newAgent() {
  const fetchImpl = createMockFetch();
  return { fetchImpl, agent: localAgent.createLocalAgent({ fetchImpl }) };
}
const context = () => ({ location: PUNE, units: "celsius", language: "en" });

test("place, time and intent planning", () => {
  assert.deepEqual(localAgent.extractPlaces("compare Mumbai and Delhi").places, ["Mumbai", "Delhi"]);
  assert.deepEqual(localAgent.extractPlaces("weather in Thanjavur, Tamil Nadu tomorrow").places, ["Thanjavur, Tamil Nadu"]);
  assert.deepEqual(localAgent.extractPlaces("from Pune to Mumbai tomorrow").places, ["Pune", "Mumbai"]);
  assert.equal(localAgent.extractPlaces("Will it rain today?").places.length, 0);
  assert.equal(localAgent.extractPlaces("what should I wear in the morning").places.length, 0);
  assert.equal(localAgent.extractTime("rain on Friday").kind, "weekday");
  assert.equal(localAgent.extractTime("tonight").part, "night");
  const { intents } = localAgent.detectIntents("best time to run tomorrow in Pune", localAgent.extractPlaces("best time to run tomorrow in Pune"));
  assert.equal(intents[0], "activity");
});

test("local agent answers a rain question with visible tool steps", async () => {
  const { agent } = newAgent();
  const seen = [];
  const result = await agent.run("Will it rain in Mumbai tomorrow?", context(), { onStep: (step) => seen.push(`${step.tool}:${step.status}`) });
  assert.equal(result.handled, true);
  assert.match(result.text, /Rain outlook · Mumbai/);
  assert.match(result.text, /3 PM/);
  assert.ok(result.steps.some((step) => step.tool === "get_weather" && step.status === "done"));
  assert.ok(seen.includes("get_weather:running") && seen.includes("get_weather:done"));
  assert.equal(result.switchTo.name, "Mumbai");
});

test("local agent compares places using live tools", async () => {
  const { agent } = newAgent();
  const result = await agent.run("compare Mumbai and Delhi", context());
  assert.match(result.text, /Delhi is warmest/);
  assert.match(result.text, /AQI 168/);
  assert.equal(result.switchTo, null);
});

test("activity planner finds a morning window for running", async () => {
  const { agent } = newAgent();
  const result = await agent.run("best time to run tomorrow", context());
  assert.match(result.text, /Running · tomorrow in Pune/);
  assert.match(result.text, /Best window: \*\*6 AM–8 AM\*\*/);
});

test("local agent keeps context for follow-up questions", async () => {
  const { agent } = newAgent();
  await agent.run("will it rain in Goa tomorrow", context());
  const followUp = await agent.run("what about Delhi?", context());
  assert.equal(followUp.handled, true);
  assert.match(followUp.text, /Rain outlook · Delhi/);
});

test("safety answers never claim an official all-clear", async () => {
  const { agent } = newAgent();
  const result = await agent.run("is there any severe weather coming?", context());
  assert.match(result.text, /not an official warning/i);
  assert.match(result.text, /not an all-clear/i);
});

test("unknown small talk is left to the fallback responder", async () => {
  const { agent } = newAgent();
  assert.equal((await agent.run("tell me a joke", context())).handled, false);
});

test("Fahrenheit preference is honoured", async () => {
  const { agent } = newAgent();
  const result = await agent.run("what's the temperature", { ...context(), units: "fahrenheit" });
  assert.match(result.text, /°F/);
  assert.doesNotMatch(result.text, /°°/);
});

test("activity scoring penalises heat, rain and darkness", () => {
  const good = core.scoreHour("running", { apparent: 18, wind: 8, gust: 14, rainProbability: 5, precipitation: 0, uv: 2, humidity: 50, isDay: 1, code: 1 });
  const hot = core.scoreHour("running", { apparent: 40, wind: 8, gust: 14, rainProbability: 5, precipitation: 0, uv: 9, humidity: 50, isDay: 1, code: 1 });
  const wet = core.scoreHour("running", { apparent: 18, wind: 8, gust: 14, rainProbability: 90, precipitation: 4, uv: 2, humidity: 90, isDay: 1, code: 65 });
  const night = core.scoreHour("running", { apparent: 18, wind: 8, gust: 14, rainProbability: 5, precipitation: 0, uv: 0, humidity: 50, isDay: 0, code: 1 });
  assert.ok(good >= 85, `good=${good}`);
  assert.ok(hot < good - 30, `hot=${hot}`);
  assert.ok(wet < good - 40, `wet=${wet}`);
  assert.ok(night < good - 40, `night=${night}`);
  assert.equal(core.scoreHour("stargazing", { apparent: 18, wind: 5, cloud: 0, rainProbability: 0, precipitation: 0, humidity: 50, isDay: 1 }) < 30, true);
});

test("derived weather science helpers", () => {
  assert.ok(core.heatIndexC(35, 70) > 45);
  assert.equal(core.heatIndexC(20, 50), 20);
  assert.equal(core.aqiCategory(168), "Unhealthy");
  assert.equal(core.uvBurnMinutes(10), 13);
  assert.equal(core.hourLabel("2026-09-29T00:00"), "12 AM");
  assert.equal(core.hourLabel(core.plusHour("2026-09-29T23:00")), "12 AM");
});

test("tool executor validates arguments and rejects unknown tools", async () => {
  const executor = core.createToolExecutor({ fetchImpl: createMockFetch(), context: { location: PUNE } });
  await assert.rejects(() => executor.run("delete_everything", {}), /Unknown tool/);
  await assert.rejects(() => executor.run("compare_places", { places: ["Mumbai"] }), /at least two/);
  await assert.rejects(() => executor.run("rate_activity", { activity: "skydiving" }), /Unknown activity/);
  await assert.rejects(() => executor.run("get_weather", { place: "95,10" }), /out of range/);
  const weather = await executor.run("get_weather", { days: 3 });
  assert.equal(weather.result.daily.length, 3);
  assert.equal(weather.result.place, "Pune, India");
});

/* ---- server gateway agent loop ---- */

function fakeDb() {
  const store = new Map();
  const db = {
    doc(path) {
      return {
        path,
        firestore: db,
        get: async () => ({ exists: store.has(path), data: () => store.get(path) })
      };
    },
    runTransaction: async (callback) => callback({
      get: async (ref) => ({ data: () => store.get(ref.path) }),
      set: (ref, value) => {
        const existing = store.get(ref.path) || {};
        store.set(ref.path, { ...existing, ...value });
      }
    })
  };
  store.set("aiGatewayConfig/active", {
    enabled: true, providerOrder: ["openai", "anthropic", "gemini"],
    providers: {
      openai: { enabled: true, defaultModel: "gpt-test", models: [{ id: "gpt-test", enabled: true, inputUsdPerMillion: 1, outputUsdPerMillion: 2 }] },
      anthropic: { enabled: true, defaultModel: "claude-test", models: [{ id: "claude-test", enabled: true, inputUsdPerMillion: 1, outputUsdPerMillion: 2 }] },
      gemini: { enabled: true, defaultModel: "gemini-test", models: [{ id: "gemini-test", enabled: true, inputUsdPerMillion: 1, outputUsdPerMillion: 2 }] }
    }
  });
  return { db, store };
}
const FieldValue = { increment: (value) => ({ increment: value }), serverTimestamp: () => "now" };
FieldValue.increment = (value) => value; // the fake store just keeps the last value

class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }

function chatRequest(overrides = {}) {
  return {
    auth: { uid: "user-1", token: { email_verified: true } },
    app: { appId: "app" },
    data: { question: "Compare Mumbai and Delhi weather", location: { name: "Pune", latitude: 18.52, longitude: 73.86, timezone: "Asia/Kolkata" }, provider: "openai", ...overrides }
  };
}

function providerFetch(handlers) {
  const weather = createMockFetch();
  const calls = [];
  const impl = async (url, options = {}) => {
    const href = String(url);
    if (href.includes("open-meteo.com")) return weather(url, options);
    const body = JSON.parse(options.body);
    calls.push({ href, body });
    for (const [pattern, handler] of handlers) if (href.includes(pattern)) return { ok: true, status: 200, json: async () => handler(body, calls.filter((c) => c.href.includes(pattern)).length) };
    return { ok: false, status: 500, json: async () => ({}) };
  };
  impl.calls = calls;
  return impl;
}

test("gateway agent loop: OpenAI tool call → tool result → final answer", async () => {
  const { db } = fakeDb();
  const fetchImpl = providerFetch([["api.openai.com", (body, n) => {
    if (n === 1) {
      assert.equal(body.tool_choice, "auto");
      assert.ok(body.tools.some((tool) => tool.function.name === "compare_places"));
      assert.match(body.messages[0].content, /Prefetched Open-Meteo data/);
      return { choices: [{ message: { role: "assistant", content: null, tool_calls: [{ id: "call_1", type: "function", function: { name: "compare_places", arguments: JSON.stringify({ places: ["Mumbai", "Delhi"] }) } }] } }], usage: { prompt_tokens: 100, completion_tokens: 20 } };
    }
    const toolMessage = body.messages.find((message) => message.role === "tool");
    assert.ok(toolMessage, "tool result was sent back");
    assert.match(toolMessage.content, /Delhi/);
    return { choices: [{ message: { role: "assistant", content: "Delhi is hotter than Mumbai today." } }], usage: { prompt_tokens: 400, completion_tokens: 30 } };
  }]]);
  const gateway = createAiGateway({ db, HttpsError, FieldValue, getSecret: () => "key", fetchImpl });
  const result = await gateway.chat(chatRequest());
  assert.equal(result.answer, "Delhi is hotter than Mumbai today.");
  assert.equal(result.provider, "openai");
  assert.equal(result.agent.toolCalls, 1);
  assert.equal(result.agent.steps[0].tool, "compare_places");
  assert.equal(result.agent.steps[0].status, "done");
});

test("gateway agent loop: Anthropic tool_use blocks round trip", async () => {
  const { db } = fakeDb();
  const fetchImpl = providerFetch([["api.anthropic.com", (body, n) => {
    if (n === 1) return { content: [{ type: "text", text: "Checking." }, { type: "tool_use", id: "tu_1", name: "get_air_quality", input: { place: "Delhi" } }], usage: { input_tokens: 10, output_tokens: 5 } };
    const last = body.messages[body.messages.length - 1];
    assert.equal(last.role, "user");
    assert.equal(last.content[0].type, "tool_result");
    assert.equal(last.content[0].tool_use_id, "tu_1");
    assert.deepEqual(body.tool_choice, { type: "auto" });
    return { content: [{ type: "text", text: "Delhi AQI is 168." }], usage: { input_tokens: 30, output_tokens: 8 } };
  }]]);
  const gateway = createAiGateway({ db, HttpsError, FieldValue, getSecret: () => "key", fetchImpl });
  const result = await gateway.chat(chatRequest({ provider: "anthropic", question: "How is Delhi's air?" }));
  assert.equal(result.answer, "Delhi AQI is 168.");
  assert.equal(result.agent.steps[0].tool, "get_air_quality");
});

test("gateway agent loop: Gemini functionCall round trip keeps the raw model parts", async () => {
  const { db } = fakeDb();
  const fetchImpl = providerFetch([["generativelanguage.googleapis.com", (body, n) => {
    if (n === 1) {
      assert.ok(body.tools[0].functionDeclarations.length >= 5);
      assert.doesNotMatch(JSON.stringify(body.tools), /additionalProperties/);
      return { candidates: [{ content: { parts: [{ functionCall: { name: "rate_activity", args: { activity: "running", day_offset: 1 } }, thoughtSignature: "sig" }] } }], usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 } };
    }
    const model = body.contents.find((content) => content.role === "model");
    assert.equal(model.parts[0].thoughtSignature, "sig");
    const response = body.contents[body.contents.length - 1].parts[0].functionResponse;
    assert.equal(response.name, "rate_activity");
    assert.ok(response.response.result.overall);
    return { candidates: [{ content: { parts: [{ text: "Run at 6 AM." }] } }], usageMetadata: { promptTokenCount: 30, candidatesTokenCount: 4 } };
  }]]);
  const gateway = createAiGateway({ db, HttpsError, FieldValue, getSecret: () => "key", fetchImpl });
  const result = await gateway.chat(chatRequest({ provider: "gemini", question: "When should I run tomorrow?" }));
  assert.equal(result.answer, "Run at 6 AM.");
});

test("gateway agent survives a failing tool and caps the loop", async () => {
  const { db } = fakeDb();
  const fetchImpl = providerFetch([["api.openai.com", (body, n) => {
    if (body.tool_choice === "none") return { choices: [{ message: { content: "I could not verify that place." } }] };
    return { choices: [{ message: { content: null, tool_calls: [{ id: `c${n}`, type: "function", function: { name: "get_weather", arguments: JSON.stringify({ place: "Atlantis" }) } }] } }] };
  }]]);
  const gateway = createAiGateway({ db, HttpsError, FieldValue, getSecret: () => "key", fetchImpl });
  const result = await gateway.chat(chatRequest({ question: "Weather in Atlantis?" }));
  assert.equal(result.answer, "I could not verify that place.");
  assert.ok(result.agent.steps.length >= 1 && result.agent.steps.length <= 8);
  assert.ok(result.agent.steps.every((step) => step.status === "error"));
});

test("gateway falls back to the next provider when the first agent call fails", async () => {
  const { db } = fakeDb();
  const fetchImpl = providerFetch([
    ["api.openai.com", () => { throw new Error("boom"); }],
    ["api.anthropic.com", () => ({ content: [{ type: "text", text: "From Claude." }] })]
  ]);
  const gateway = createAiGateway({ db, HttpsError, FieldValue, getSecret: () => "key", fetchImpl });
  const result = await gateway.chat(chatRequest());
  assert.equal(result.provider, "anthropic");
  assert.equal(result.answer, "From Claude.");
});

test("agent: false keeps the classic single-call gateway path", async () => {
  const { db } = fakeDb();
  const fetchImpl = providerFetch([["api.openai.com", (body) => {
    assert.equal(body.tools, undefined);
    return { choices: [{ message: { content: "Classic answer." } }], usage: { prompt_tokens: 1, completion_tokens: 1 } };
  }]]);
  const gateway = createAiGateway({ db, HttpsError, FieldValue, getSecret: () => "key", fetchImpl });
  const result = await gateway.chat(chatRequest({ agent: false }));
  assert.equal(result.answer, "Classic answer.");
  assert.equal(result.agent.enabled, false);
});

test("chat input validation covers the new agent fields", () => {
  const base = { question: "hi", location: { latitude: 1, longitude: 2 } };
  assert.equal(validateChatInput(base).agent, true);
  assert.equal(validateChatInput({ ...base, units: "fahrenheit", mode: "farm", agent: false }).mode, "farm");
  assert.throws(() => validateChatInput({ ...base, units: "kelvin" }), /units/);
  assert.throws(() => validateChatInput({ ...base, mode: "hacker" }), /mode/);
  assert.throws(() => validateChatInput({ ...base, agent: "yes" }), /agent/);
});
