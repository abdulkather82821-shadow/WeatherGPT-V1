# WeatherGPT AI Gateway setup

## Vercel deployment (Firebase Spark)

The root `api/ai/models.js` and `api/ai/chat.js` routes run the existing gateway on Vercel, so Firebase Cloud Functions and a Firebase Blaze billing plan are not required for AI chat. Keep Firebase Authentication, App Check, and Firestore in the same Firebase project. The Vercel API verifies Firebase ID tokens and App Check tokens with the Firebase Admin SDK, reads the private Firestore model catalog, and records per-user request and aggregate usage limits.

1. Connect the GitHub repository to the Vercel project with the repository root as the project root. Vercel detects the Node.js functions under `api/`.
2. Create a Firebase service account for project `weathergpt-eb152`. Store its complete JSON credential only in Vercel's encrypted environment variables as `FIREBASE_SERVICE_ACCOUNT`; also set `FIREBASE_PROJECT_ID=weathergpt-eb152`. Never upload the service-account JSON or paste it into chat.
3. Add the provider key, such as `OPENAI_API_KEY`, as a Vercel environment variable. Do not add provider keys to GitHub, the Android package, or any client-side Firebase config.
4. Set `ALLOWED_ORIGINS` to a comma-separated list of the exact production and preview app origins if they differ from the defaults. The Android Capacitor origin `https://localhost` is allowed by default.
5. Deploy the project and confirm `/api/ai/models` and `/api/ai/chat` exist. Both routes accept POST requests and require a verified Firebase user and a valid Firebase App Check token.
6. Register Firebase App Check for Android with Play Integrity. For the web app, register reCAPTCHA v3, add the production Vercel domain to its authorized domains, and set the corresponding public site key in the ignored local `firebase-config.js` before building the web app. Never enforce web App Check until valid tokens are issued.
7. In Firestore Console, create the `aiGatewayConfig/active` document using the model catalog schema below. Firestore client rules must continue denying client reads/writes to this document and all usage collections. Only enabled, priced models appear in the app.

The Firebase service-account key grants administrative access to the project. Restrict access to the Vercel project, use production-only deployment scopes where practical, rotate the key if exposed, and never reuse or check it into source control. OpenAI API usage may incur separate provider charges even while Firebase remains on Spark.

The callable functions `chatWithWeatherGPT`, `getAiModels`, and `deleteOwnAccountData` run in `asia-south1`, and require a verified Firebase user and an App Check token. App Check is enforced. `getAiModels` takes no arguments and returns `{ providers: [{ id, name, models: [{ id, name }] }] }`; provider `name` may be set in provider configuration and otherwise defaults to the provider ID. Model `name` comes from its configured `label` and otherwise defaults to the model ID. Open-Meteo current conditions and a three-day forecast are fetched server-side for every chat request.

`deleteOwnAccountData` takes no arguments and returns `{ deleted: true }`. It recursively deletes `users/{authenticatedUid}` and all nested Firestore documents—including `private/profile`, `conversations/{id}`, and each conversation's `messages` subcollection—never accepts a client-supplied UID, and enforces a 15-minute per-account retry cooldown. This covers profile preferences, conversation metadata, and persisted messages. The client should call it successfully before deleting the Firebase Auth account. It does not delete the Auth account or documents outside the `users/{uid}` subtree.

`chatWithWeatherGPT` accepts `{ question, location: { name, latitude, longitude, timezone }, language, history: [{ role, content }], provider, model }`. `language` defaults to `en`; `location.timezone` may be an IANA timezone or `auto`. `provider` defaults to `auto`; provider and model identifiers must be enabled in the server configuration. The callable returns `{ answer, provider, model, weather: { source, updatedAt } }`. The answer instructions require the model to identify its response as AI guidance, not an official warning: WeatherGPT has no official warning feed, so users should follow local authorities for official alerts.

For the optional Firebase Cloud Functions deployment, set these Firebase Secret Manager secrets before deployment:

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

Provider keys are only read by the server. Configure the following `aiGatewayConfig/active` Firestore document using the Admin SDK or a trusted admin process; client rules deny access by default. Configuration is read on each request:

```json
{
  "enabled": true,
  "providerOrder": ["gemini", "openai", "anthropic"],
  "limits": { "dailyRequests": 20, "monthlyRequests": 300 },
  "providers": {
    "gemini": {
      "enabled": true,
      "name": "Google Gemini",
      "defaultModel": "gemini-2.5-flash",
      "models": [{
        "id": "gemini-2.5-flash",
        "label": "Gemini Flash",
        "enabled": true,
        "inputUsdPerMillion": 0.3,
        "outputUsdPerMillion": 2.5
      }]
    }
  }
}
```

Add equivalent enabled model lists for `openai` and `anthropic` as needed. Each enabled model must specify current input/output USD per million token rates; those admin-supplied rates are used only for estimated cost metrics. `providerOrder` sets Auto/fallback priority. An explicitly selected provider is tried first, followed by other enabled providers. Unknown or disabled provider/model IDs are rejected.

For an OpenAI-only deployment, add `OPENAI_API_KEY` to Secret Manager and bind that secret to `chatWithWeatherGPT` in `functions/index.js`. Configure `aiGatewayConfig/active` with `providerOrder: ["openai"]`, `providers.openai.enabled: true`, and at least one enabled model with its current price rates. Do not create placeholder secrets for providers you do not use. When adding another provider, create its secret and bind it to `chatWithWeatherGPT` before enabling it in the model catalog.

Request counters and aggregate latency, token, success/failure, provider, and estimated-cost metrics are stored in the Admin-SDK-only `aiUsageDaily` and `aiUsageMonthly` collections. Message bodies and conversation history are never written to metrics.
