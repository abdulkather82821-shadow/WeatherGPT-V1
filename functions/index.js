const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { FieldPath, FieldValue, Timestamp, getFirestore } = require("firebase-admin/firestore");
const { createHash } = require("node:crypto");
const { defineSecret, defineString } = require("firebase-functions/params");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { classifyForecastAlerts } = require("./alert-conditions");
const { createAiGateway } = require("./ai-gateway");
const { createDeleteOwnAccountData } = require("./account-deletion");

initializeApp();

const db = getFirestore();
const resendApiKey = defineSecret("RESEND_API_KEY");
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const openAiApiKey = defineSecret("OPENAI_API_KEY");
const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");
const alertEmailFrom = defineString("ALERT_EMAIL_FROM");
const PAGE_SIZE = 100;
const USER_CONCURRENCY = 5;
const apiUrl = "https://api.open-meteo.com/v1/forecast";
const aiGateway = createAiGateway({
  db,
  HttpsError,
  FieldValue,
  getSecret: (provider) => ({
    gemini: geminiApiKey,
    openai: openAiApiKey,
    anthropic: anthropicApiKey
  })[provider].value()
});
const deleteOwnAccountDataHandler = createDeleteOwnAccountData({
  db,
  HttpsError,
  Timestamp
});

const aiCallableOptions = {
  region: "asia-south1",
  timeoutSeconds: 60,
  memory: "256MiB",
  maxInstances: 30,
  enforceAppCheck: true
};

exports.chatWithWeatherGPT = onCall({
  ...aiCallableOptions,
  secrets: [openAiApiKey]
}, async (request) => {
  try {
    return await aiGateway.chat(request);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    if (["unauthenticated", "failed-precondition", "invalid-argument", "resource-exhausted"].includes(error?.code)) {
      throw new HttpsError(error.code, error.message);
    }
    logger.error("WeatherGPT chat request failed.", { code: error?.code || "unknown" });
    throw new HttpsError("internal", "WeatherGPT could not complete this request.");
  }
});

exports.getAiModels = onCall(aiCallableOptions, async (request) => {
  try {
    return await aiGateway.getModels(request);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    if (["unauthenticated", "failed-precondition", "invalid-argument"].includes(error?.code)) {
      throw new HttpsError(error.code, error.message);
    }
    logger.error("WeatherGPT model catalog request failed.", { code: error?.code || "unknown" });
    throw new HttpsError("internal", "WeatherGPT model choices are temporarily unavailable.");
  }
});

exports.deleteOwnAccountData = onCall(aiCallableOptions, async (request) => {
  try {
    return await deleteOwnAccountDataHandler(request);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    logger.error("WeatherGPT account data deletion failed.", { code: error?.code || "unknown" });
    throw new HttpsError("internal", "Account data deletion could not be completed.");
  }
});

function htmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

async function getForecast(location) {
  const parameters = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: location.timezone || "auto",
    forecast_days: "1",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    current: "weather_code,wind_speed_10m",
    hourly: "wind_speed_10m",
    daily: "time,precipitation_probability_max,precipitation_sum,temperature_2m_max,temperature_2m_min"
  });
  const response = await fetch(`${apiUrl}?${parameters}`, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Open-Meteo forecast returned ${response.status}.`);
  const forecast = await response.json();
  if (!forecast.current || !forecast.daily?.time?.length) throw new Error("Open-Meteo returned incomplete forecast data.");
  return forecast;
}

async function claimAlert(uid, category, localDate) {
  const reference = db.doc(`emailAlertState/${uid}_${category}_${localDate}`);
  const now = Date.now();
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const previous = snapshot.data();
    if (previous?.status === "sent") return null;
    if (previous?.status === "pending" && now - previous.createdAt.toMillis() < 30 * 60 * 1000) return null;
    transaction.set(reference, {
      status: "pending",
      createdAt: Timestamp.fromMillis(now),
      category,
      localDate
    });
    return reference;
  });
}

async function claimDailyEmailSlot(uid, localDate) {
  const reference = db.doc(`emailDeliveryLimits/${uid}`);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const previous = snapshot.data();
    const count = previous?.localDate === localDate ? Number(previous.count) || 0 : 0;
    if (count >= 3) return false;
    transaction.set(reference, { localDate, count: count + 1 });
    return true;
  });
}

async function releaseDailyEmailSlot(uid, localDate) {
  const reference = db.doc(`emailDeliveryLimits/${uid}`);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const previous = snapshot.data();
    if (!snapshot.exists || previous.localDate !== localDate || previous.count <= 0) return;
    transaction.update(reference, { count: previous.count - 1 });
  });
}

async function sendForecastEmail(email, locationName, category, alert, forecastTime, idempotencyKey) {
  const location = htmlEscape(locationName);
  const title = htmlEscape(alert.title);
  const detail = htmlEscape(alert.detail);
  const text = [
    `${alert.title} · ${location}`,
    alert.detail,
    `Open-Meteo forecast issued ${forecastTime}. This is automated model guidance, not an official warning.`,
    "For emergencies, follow local authorities. Change or disable email preferences in WeatherGPT."
  ].join("\n\n");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey.value()}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({
      from: alertEmailFrom.value(),
      to: [email],
      subject: `WeatherGPT forecast guidance: ${alert.title} · ${locationName}`,
      text,
      html: `<h2>${title} · ${location}</h2><p>${detail}</p><p>Forecast issued ${htmlEscape(forecastTime)}.</p><p><strong>This is automated Open-Meteo forecast model guidance, not an official warning.</strong> For emergencies, follow local authorities. Change or disable email preferences in WeatherGPT.</p>`
    }),
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
}

async function processSubscription(subscription) {
  const settings = subscription.data().emailAlerts;
  if (!settings?.enabled || !settings.location || !settings.categories) return;
  const account = await getAuth().getUser(subscription.id);
  if (!account.email || !account.emailVerified) {
    logger.warn("Skipped an email alert subscription without a verified email address.");
    return;
  }

  const forecast = await getForecast(settings.location);
  const alerts = classifyForecastAlerts(forecast);
  const localDate = forecast.daily.time[0];
  const forecastTime = forecast.current.time;
  for (const [category, alert] of Object.entries(alerts)) {
    if (settings.categories[category] !== true) continue;
    const claim = await claimAlert(subscription.id, category, localDate);
    if (!claim) continue;
    const hasDailySlot = await claimDailyEmailSlot(subscription.id, localDate);
    if (!hasDailySlot) {
      await claim.delete();
      logger.warn("A forecast email alert was skipped because the account reached its daily delivery limit.");
      continue;
    }
    try {
      const locationName = String(settings.location.name || "Selected location").replace(/[\r\n\t]/g, " ").slice(0, 100);
      const idempotencyKey = createHash("sha256").update(`${subscription.id}:${category}:${localDate}`).digest("hex");
      await sendForecastEmail(account.email, locationName, category, alert, forecastTime, idempotencyKey);
      await claim.update({ status: "sent", sentAt: FieldValue.serverTimestamp() });
    } catch (error) {
      await claim.delete();
      await releaseDailyEmailSlot(subscription.id, localDate);
      throw error;
    }
  }
}

exports.sendForecastEmailAlerts = onSchedule({
  schedule: "every 15 minutes",
  timeZone: "Asia/Kolkata",
  region: "asia-south1",
  timeoutSeconds: 300,
  maxInstances: 1,
  memory: "256MiB",
  secrets: [resendApiKey]
}, async () => {
  const cursorReference = db.doc("emailAlertSystem/subscriptionCursor");
  const cursorSnapshot = await cursorReference.get();
  const cursor = cursorSnapshot.data()?.uid;
  const baseQuery = db.collection("users")
    .where("emailAlerts.enabled", "==", true)
    .orderBy(FieldPath.documentId())
    .limit(PAGE_SIZE);
  let subscriptions = await (cursor ? baseQuery.startAfter(cursor).get() : baseQuery.get());
  if (subscriptions.empty && cursor) {
    await cursorReference.delete();
    subscriptions = await baseQuery.get();
  }
  if (subscriptions.empty) return;

  for (let start = 0; start < subscriptions.docs.length; start += USER_CONCURRENCY) {
    const batch = subscriptions.docs.slice(start, start + USER_CONCURRENCY);
    const results = await Promise.allSettled(batch.map(processSubscription));
    results.forEach((result) => {
      if (result.status === "rejected") logger.error("Weather email alert processing failed.", result.reason);
    });
  }
  await cursorReference.set({ uid: subscriptions.docs[subscriptions.docs.length - 1].id });
});
