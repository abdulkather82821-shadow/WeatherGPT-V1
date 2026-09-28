# WeatherGPT AI Gateway setup

The callable functions `chatWithWeatherGPT`, `getAiModels`, and `deleteOwnAccountData` run in `asia-south1`, and require a verified Firebase user and an App Check token. App Check is enforced. `getAiModels` takes no arguments and returns `{ providers: [{ id, name, models: [{ id, name }] }] }`; provider `name` may be set in provider configuration and otherwise defaults to the provider ID. Model `name` comes from its configured `label` and otherwise defaults to the model ID. Open-Meteo current conditions and a three-day forecast are fetched server-side for every chat request.

`deleteOwnAccountData` takes no arguments and returns `{ deleted: true }`. It recursively deletes `users/{authenticatedUid}` and all nested Firestore documents—including `private/profile`, `conversations/{id}`, and each conversation's `messages` subcollection—never accepts a client-supplied UID, and enforces a 15-minute per-account retry cooldown. This covers profile preferences, conversation metadata, and persisted messages. The client should call it successfully before deleting the Firebase Auth account. It does not delete the Auth account or documents outside the `users/{uid}` subtree.

`chatWithWeatherGPT` accepts `{ question, location: { name, latitude, longitude, timezone }, language, history: [{ role, content }], provider, model }`. `language` defaults to `en`; `location.timezone` may be an IANA timezone or `auto`. `provider` defaults to `auto`; provider and model identifiers must be enabled in the server configuration. The callable returns `{ answer, provider, model, weather: { source, updatedAt } }`. The answer instructions require the model to identify its response as AI guidance, not an official warning: WeatherGPT has no official warning feed, so users should follow local authorities for official alerts.

Set these Firebase Secret Manager secrets before deployment:

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

Provider keys are only read by Cloud Functions. Configure the following `aiGatewayConfig/active` Firestore document using the Admin SDK or a trusted admin process; client rules deny access by default. Configuration is read by the callable on each invocation:

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

Request counters and aggregate latency, token, success/failure, provider, and estimated-cost metrics are stored in the Admin-SDK-only `aiUsageDaily` and `aiUsageMonthly` collections. Message bodies and conversation history are never written to metrics.
