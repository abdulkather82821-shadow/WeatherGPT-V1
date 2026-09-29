const { getAppCheck } = require("firebase-admin/app-check");
const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue, getFirestore, Timestamp } = require("firebase-admin/firestore");
const { createAiGateway } = require("../functions/ai-gateway");
const { createDeleteOwnAccountData } = require("../functions/account-deletion");

const projectId = process.env.FIREBASE_PROJECT_ID || "weathergpt-eb152";
const allowedOrigins = new Set([
  "https://weather-gpt-v1.vercel.app",
  "https://localhost",
  "capacitor://localhost",
  "http://localhost",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  ...(process.env.ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean)
]);
const allowedAppIds = new Set([
  "1:180386702779:android:1f4aea96dd8890625bd09e",
  "1:180386702779:web:e4b820399e8b4cfa5bd09e",
  ...(process.env.FIREBASE_APP_IDS || "").split(",").map((appId) => appId.trim()).filter(Boolean)
]);

class GatewayError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function getFirebaseApp() {
  const existing = getApps().find((app) => app.name === "weathergpt-vercel");
  if (existing) return existing;
  const serviceAccountValue = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountValue) throw new GatewayError("failed-precondition", "The Firebase server credential is not configured.");
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountValue);
  } catch {
    throw new GatewayError("failed-precondition", "The Firebase server credential is invalid.");
  }
  if (serviceAccount.project_id !== projectId || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new GatewayError("failed-precondition", "The Firebase server credential does not match this project.");
  }
  return initializeApp({ credential: cert(serviceAccount), projectId }, "weathergpt-vercel");
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) {
    res.status(403).json({ error: { code: "permission-denied", message: "This app origin is not allowed to use the AI gateway." } });
    return false;
  }
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Firebase-AppCheck");
  res.setHeader("Access-Control-Max-Age", "600");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return false;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ error: { code: "invalid-argument", message: "Use a POST request." } });
    return false;
  }
  return true;
}

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    throw new GatewayError("unauthenticated", "Sign in with a verified account to use WeatherGPT.");
  }
  return header.slice("Bearer ".length).trim();
}

let gateway;

async function getVerifiedRequest(req) {
  const app = getFirebaseApp();
  const token = getBearerToken(req);
  const appCheckToken = req.headers["x-firebase-appcheck"];
  if (typeof appCheckToken !== "string" || appCheckToken.length < 20) {
    throw new GatewayError("failed-precondition", "A valid Firebase App Check token is required.");
  }
  let decodedToken;
  try {
    decodedToken = await getAuth(app).verifyIdToken(token, true);
  } catch {
    throw new GatewayError("unauthenticated", "Your sign-in could not be verified. Sign in again.");
  }
  if (decodedToken.aud !== projectId || decodedToken.email_verified !== true) {
    throw new GatewayError("unauthenticated", "Sign in with a verified email account to use WeatherGPT.");
  }
  let verifiedAppCheckToken;
  try {
    verifiedAppCheckToken = await getAppCheck(app).verifyToken(appCheckToken);
  } catch {
    throw new GatewayError("failed-precondition", "Firebase App Check could not verify this app.");
  }
  if (!allowedAppIds.has(verifiedAppCheckToken.appId)) {
    throw new GatewayError("permission-denied", "This Firebase app is not authorized to use the AI gateway.");
  }
  return {
    auth: { uid: decodedToken.uid, token: decodedToken },
    app: { appId: verifiedAppCheckToken.appId },
    data: req.body
  };
}

function getGateway(app) {
  if (gateway) return gateway;
  const db = getFirestore(app);
  gateway = createAiGateway({
    db,
    HttpsError: GatewayError,
    FieldValue,
    getSecret: (provider) => ({
      gemini: process.env.GEMINI_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY
    })[provider]
  });
  return gateway;
}

function statusForCode(code) {
  return {
    "invalid-argument": 400,
    unauthenticated: 401,
    "permission-denied": 403,
    "failed-precondition": 412,
    "resource-exhausted": 429,
    unavailable: 503
  }[code] || 500;
}

async function handleGateway(req, res, operation) {
  if (!setCors(req, res)) return;
  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > 32_000) {
    res.status(413).json({ error: { code: "invalid-argument", message: "The request is too large." } });
    return;
  }
  try {
    const app = getFirebaseApp();
    const request = await getVerifiedRequest(req);
    const requestSize = Buffer.byteLength(JSON.stringify(request.data ?? null));
    if (requestSize > 32_000) {
      throw new GatewayError("invalid-argument", "The request is too large.");
    }
    const result = operation === "deleteAccountData"
      ? await createDeleteOwnAccountData({
        db: getFirestore(app),
        HttpsError: GatewayError,
        Timestamp
      })(request)
      : await getGateway(app)[operation](request);
    res.status(200).json(result);
  } catch (error) {
    const code = error instanceof GatewayError ? error.code : "internal";
    if (!(error instanceof GatewayError)) {
      console.error("WeatherGPT Vercel gateway request failed.", { code: error?.code || "unknown" });
    }
    res.status(statusForCode(code)).json({
      error: {
        code,
        message: error instanceof GatewayError
          ? error.message
          : "WeatherGPT could not complete this request."
      }
    });
  }
}

module.exports = { handleGateway };
