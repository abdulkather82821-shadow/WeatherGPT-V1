const assert = require("node:assert/strict");
const test = require("node:test");
const chatHandler = require("../api/ai/chat");
const modelsHandler = require("../api/ai/models");

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      this.ended = true;
    }
  };
}

test("Vercel gateway answers an allowed preflight without requiring credentials", async () => {
  const req = {
    method: "OPTIONS",
    headers: { origin: "https://weather-gpt-v1.vercel.app" }
  };
  const res = createResponse();

  await modelsHandler(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.ended, true);
  assert.equal(res.headers["Access-Control-Allow-Origin"], req.headers.origin);
  assert.match(res.headers["Access-Control-Allow-Headers"], /X-Firebase-AppCheck/);
});

test("Vercel gateway rejects unapproved origins before processing credentials", async () => {
  const req = {
    method: "POST",
    headers: { origin: "https://attacker.example" },
    body: {}
  };
  const res = createResponse();

  await chatHandler(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error.code, "permission-denied");
});

test("Vercel gateway rejects non-POST requests", async () => {
  const req = {
    method: "GET",
    headers: { origin: "https://weather-gpt-v1.vercel.app" }
  };
  const res = createResponse();

  await chatHandler(req, res);

  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, "POST, OPTIONS");
});
