# WeatherGPT for Android

WeatherGPT is a mobile-first conversational weather application packaged for Android with [Capacitor 7](https://capacitorjs.com/). The Android project includes native GPS, Android speech recognition, local notifications, a branded launcher icon and native status-bar styling.

## Run the app in Android Studio

Prerequisites: Node.js 20+, JDK 21, Android Studio, the Android 35 SDK, Android platform-tools and a USB-connected Android device or emulator. The Firebase Cloud Functions worker uses Node.js 22. The Capacitor Android plugins require JDK 21; a newer Android Studio bundled JDK may not work.

```powershell
npm.cmd install
npm.cmd run android:sync
npm.cmd run android:open
```

Select an emulator or connected device in Android Studio and run the `app` configuration. To run from PowerShell, start an Android emulator or connect a device, then use:

```powershell
$env:JAVA_HOME = 'C:\Path\To\JDK-21'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
npm.cmd run android:run
```

### Build the APK on GitHub (no local Android setup)

`.github/workflows/android-apk.yml` builds a debug APK on every pull request, push to `main`, tag `v*` and manual run (**Actions → Build Android APK → Run workflow**). It runs the tests, builds the web assets, uses the existing `capacitor.config.json` to create and sync the Android project (`scripts/android-prepare.mjs` also declares the location, microphone, notification and network permissions), and runs `gradlew assembleDebug`. Download `WeatherGPT-debug-apk` from the run's **Artifacts**; pushing a `v*` tag also attaches `WeatherGPT-debug.apk` to a GitHub Release. Optional repository secrets: `FIREBASE_CONFIG_JS` (contents of your `firebase-config.js`) and `GOOGLE_SERVICES_JSON_BASE64` (base64 of `google-services.json`, needed for native Google sign-in). Without them the APK still builds and the local agent works. The `app-debug.apk` checked into the repo is an older build; use the workflow artifact for the version with the agent.

Build a debug APK locally from the Android directory:

```powershell
$env:JAVA_HOME = 'C:\Path\To\JDK-21'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
.\gradlew.bat assembleDebug
```

The debug APK is written to `android\app\build\outputs\apk\debug\app-debug.apk`. Android requires user permission for location, microphone, speech recognition and notifications.

Voice replies use the device's built-in Text-to-Speech engine. In the app, open **Profile → Voice Accessibility**, choose the speech language and installed voice, select **Read answers aloud**, then tap **Test selected language voice**. On Android, **Install device voice data** opens the built-in TTS installer so you can add Tamil or another supported language pack; actual voices are supplied by the device, not bundled with the app. If no voice is listed on Android, open **Settings → Accessibility → Text-to-speech output** (the exact path can vary by manufacturer), select an installed engine, and download voice data for the selected language. The app does not send speech text to a paid voice service.

## Run as a mobile web app

```powershell
npm.cmd install
npm.cmd run start
```

Open `http://localhost:8000/`. The manifest and service worker enable installation and offline access to the app shell. The app also keeps up to eight recent forecast and air-quality snapshots on this device, keyed by location coordinates; cached answers show when they were updated. Live refresh, map layers, GPS and place search still need an internet connection.

### Deploying the web app (Vercel and other static hosts)

`npm run build:web` writes the deployable site into `www/` (page shell, `agent-core.js`, the bundled `firebase-client.js` and the map library). `vercel.json` runs that build and serves `www/` as the static output, next to the Node functions in `api/ai/*`. Serve the build output — do **not** serve the repository root: the root has no `node_modules`, and static hosts never serve it, so a page that loads `node_modules/leaflet/...` at runtime leaves the map blank. Keep runtime references limited to files that the build copies into `www/`; `npm test` fails if a referenced file is missing from the build. The Leaflet map library is vendored in `vendor/leaflet/` (refresh with `npm run vendor:leaflet`) so it ships with the build, the Capacitor Android assets and any plain static host.

## Implemented data and experiences

- **Live forecasts:** Open-Meteo forecast and geocoding APIs provide current conditions, pressure, visibility, UV, wind direction, hourly precipitations, rain probability and 16-day forecasts.
- **Air quality:** Open-Meteo Air Quality API provides US AQI and PM2.5.
- **Weather map:** Pan the map to load a local Open-Meteo grid for temperature, weather conditions, rainfall, wind, humidity, clouds, pressure, visibility, UV and US AQI. Grid values are model output at nearby points, not ground-station readings. The basemap uses Esri World Street Map tiles and falls back to OpenStreetMap; no CARTO key is required. Leaflet is vendored in `vendor/leaflet` and pre-cached by the service worker, so the map controls, marker icons and the cached shell keep working even when an individual deployment file is unavailable. The weather grid refreshes when panned. RainViewer can be overlaid for observed precipitation imagery and is not a forecast or official warning. Lightning, flood extent, river levels, official warning polygons and cyclone tracks are not connected.
- **Alerts center:** Advisory, Watch and Warning labels are derived from local forecast thresholds. **They are not IMD, CWC or government-issued alerts**, and this prototype does not provide an emergency all-clear. Official alert sources are linked separately.
- **WeatherGPT agent (new):** The chat is now a tool-using AI agent. It plans, calls live Open-Meteo tools, observes the results and answers — and every answer has a collapsible **tool trace** showing exactly which tools ran. A first-run quick tour introduces Home, planning, chat, Map, Alerts, and Profile. The local WeatherGPT assistant also handles explicit app navigation and actions; when the AI Gateway is available, the agent answers broader app-use and general-knowledge questions in a natural conversational style. Tools: `get_weather` (current conditions, 2-hour rain nowcast, 16-day outlook for *any* place), `get_air_quality`, `compare_places` (up to 4 places), `rate_activity` (hour-by-hour 0–100 suitability for 12 activities), `get_climate_history` (a full ERA5 year), `get_marine_conditions` and `search_place`. Two engines share the same tools (`functions/agent-core.js`):
  - **Built-in local agent** (`local-agent.js`) — works with no account and no API key. It understands places, dates ("on Friday", "this weekend", "in 3 days"), time of day, follow-ups ("what about Delhi?"), comparisons, routes ("from Pune to Mumbai"), farm/aviation/marine/health/safety questions, and offers a "Make X my location" action. English questions are handled by the agent; other UI languages fall back to the existing rule-based replies unless the question is typed in English.
  - **AI model agent** — when the AI Gateway is configured, Gemini / OpenAI / Anthropic run a bounded tool-calling loop (max 5 rounds / 8 tool calls) server-side (`functions/ai-agent.js`) with the same tools, provider fallback, usage limits and the same "AI guidance, not an official warning" rules. Tool arguments are validated and only ever reach Open-Meteo.
- **Extreme home dashboard (new):** Today's **agent briefing** (rain timing, clothing, best time outside, UV burn time, air quality, wind, heat/cold stress, tomorrow's change, with share), an **activity planner** (walking, running, cycling, picnic, cricket, photography, stargazing, laundry, commute, crop spraying, beach, outdoor event) with an hourly suitability chart for the next 7 days, a 15-minute **rain nowcast**, and extra live vitals: dew point, wind gusts, cloud cover, rain in the next 24 h, comfort/heat index and sunburn time. Activity scores and briefing rules are heuristics documented in `functions/agent-core.js`, not safety guarantees.
- **Weather assistant:** When Firebase and at least one administrator-configured LLM provider are available, chat uses the authenticated WeatherGPT AI Gateway. The server fetches a fresh Open-Meteo forecast from validated coordinates before the model call, keeps provider keys server-side, applies provider fallback and per-account request limits, and records aggregate usage without storing prompt bodies in usage metrics. Gemini, OpenAI and Anthropic adapters are supported. Only administrator-enabled providers/models are offered. If the gateway is not configured or unavailable, the built-in agent answers supported weather and app-help questions locally and clearly says when it cannot reliably answer a broader question. AI and forecast guidance are not official warnings or professional aviation/agricultural advice.
- **Accounts and chat sync:** Firebase Google, verified email/password, and anonymous guest sign-in are supported when configured. Firebase restores its locally persisted sign-in on startup and refreshes the active ID token through the SDK; credentials are not copied into app storage. Guests can sync profile preferences and conversations under their private anonymous UID, then upgrade that same identity to email/password to retain the cloud data. Existing-account sign-in switches to that account; guest data is not automatically merged. Profile and conversation access is scoped to the verified or anonymous account UID. AI gateway access requires a verified account; email alert subscriptions remain Google-account-only.
- **Location precision:** The Home screen and saved places display coordinates. Manual search uses Open-Meteo geocoding; device location requests high accuracy and displays GPS accuracy when supplied. Forecast data is still model output at the selected coordinates; street-level reverse-geocoding, roads and building data are not connected.
- **Farmer field planner:** The Home planner combines forecast rainfall, wind, temperature, selected crop and crop stage into general irrigation, spray-window and harvest-planning prompts. It does not provide crop-specific prescriptions; confirm decisions with field observations, product labels and a local KVK/agriculture-extension adviser.
- **Community relief guidance:** The Alerts center provides forecast-informed seasonal preparation, basic food/water safety, shelter verification steps and volunteer safety guidance, with links to NDMA/Sachet and an emergency 112 call link for India. The app does not register volunteers, dispatch help, or list confirmed shelters, accommodation, meal services, stock or live availability. Confirm arrangements with district officials and follow their instructions.
- **Historical climate charts:** Select 5, 10 or 20 full years to aggregate daily Open-Meteo Historical Weather API temperatures and rainfall into yearly charts. Historical estimates do not establish attribution or replace official Indian climate records.
- **Android features:** Multiple saved and comparable locations, GPS-coordinate forecasts with device-reported accuracy, 11 Indian language UI/voice locales, native/browser voice recognition, Android built-in Text-to-Speech playback (browser built-in speech as the web fallback), a Voice Accessibility language dropdown and installed-device voice selection, a voice test, speech rate/volume, stop/replay, °C/°F preferences and on-device, opt-in forecast notifications. Speech playback is generated locally by the device’s installed speech engine and does not use a paid cloud voice service.
- **Data-source transparency:** Live forecast and air quality use Open-Meteo; map and radar attribution is shown. Feed cards are timestamped. The Alerts Center explicitly identifies its alerts as forecast guidance rather than official warnings.
- **Google sign-in and email preferences:** Google sign-in is required for the existing forecast-email subscription. Firestore rules restrict each verified owner to their own profile and conversations; Firebase App Check protects Firebase client requests (Play Integrity natively, reCAPTCHA v3 on web). A scheduled Cloud Function can email opt-in rain, storm, wind, heat and cold forecast guidance through Resend. Flood email alerts are unavailable because no verified flood-warning feed is connected. These are model-triggered forecast emails, not official alerts.

## Tests

```powershell
npm.cmd test        # gateway + agent tests (no network: Open-Meteo and LLM providers are mocked)
npm.cmd run check   # syntax checks + web build
```

## AI Gateway and account configuration

After setting up Firebase below, follow [`functions/AI_GATEWAY.md`](./functions/AI_GATEWAY.md) for the Vercel gateway, required private environment variables, the administrator-only `aiGatewayConfig/active` model catalog, budget limits and deployment instructions. This deployment avoids Firebase Cloud Functions and works with Firebase Spark; Vercel serves the API routes while Firebase Authentication, App Check and Firestore remain the identity, app-attestation and configuration/usage stores. The in-app provider/model selectors require deployed Vercel API routes, valid App Check, and at least one enabled provider/model in Firestore. Provider keys and Firebase service-account credentials must be stored only as private Vercel environment variables; never put them in `firebase-config.js`, the Android project, or GitHub. Configure Firebase Authentication's Google and Email/Password providers as desired. Cloud profile/chat sync and the AI gateway require a verified account and App Check.

The gateway currently uses request/response calls rather than token streaming. Daily/monthly usage limits default to 20/300 requests per user; aggregate token, latency, provider and estimated-cost metrics are stored privately. Model prices must be maintained by an administrator. Conversations are only stored below the user's UID. The app is not a real-time emergency alert system.

## Configure Firebase and forecast email (optional)

Without Firebase project values, the app keeps Google sign-in disabled and the weather features continue to work. Firebase's web API key and app IDs identify the client project; they are not server secrets. Never commit service-account credentials, Resend keys, App Check debug tokens, or a production signing key.

1. Create Firebase Android and Web apps in one Firebase project. The Android package name is `com.weathergpt.mobile`. Enable **Google** in Firebase Authentication and register the Android debug and release SHA-1 fingerprints in the Firebase Android app settings. Enable **Email/Password** too if you want email/password accounts.
2. Copy `firebase-config.example.js` to the ignored local file `firebase-config.js` and replace its placeholders with the Web app's Firebase configuration and a reCAPTCHA v3 site key. Add your development and production web domains to the reCAPTCHA authorized domains. Place the matching Android `google-services.json` at `android\app\google-services.json`. Both local configuration files are ignored by Git.
3. Register Play Integrity for the Android app and reCAPTCHA v3 for the Web app in Firebase App Check. First test sign-in and preference reads/writes with App Check monitoring; enforce App Check for Cloud Firestore only after valid tokens are confirmed for every client you distribute. Use a Firebase App Check debug token only for a private local development build and never ship or publish it.
4. Install and authenticate the Firebase CLI (`npm.cmd install --global firebase-tools`, `firebase login`, `firebase use <your-project-id>`), install dependencies at the repository root, and deploy the restrictive Firestore rules: `npm.cmd install`, then `firebase deploy --only firestore:rules`. Rules permit verified owners to access only their own email preferences, profile and conversations, validate stored shapes and coordinate ranges, and deny client access to AI configuration/usage, worker state and email quota documents.
5. To enable server-side email, use a Firebase project with billing and Cloud Scheduler support. Verify a sender/domain in Resend, then create `functions\.env.<your-firebase-project-id>` containing `ALERT_EMAIL_FROM="WeatherGPT <alerts@your-verified-domain.example>"`. Set the provider API key as a Firebase secret with `firebase functions:secrets:set RESEND_API_KEY`, and deploy the worker with `firebase deploy --only functions`. Install the function dependencies with `npm.cmd install --prefix functions` before deploying.
6. Verify the deployed schedule and test with an opted-in account before relying on email. The worker checks Open-Meteo forecasts every 15 minutes, identifies itself as model guidance, deduplicates a category per account and local date, and caps delivery at three emails per account and local date. Disable consent in Profile to stop future checks for that account. Do not use this prototype as an emergency notification service.

7. Follow [`functions/AI_GATEWAY.md`](./functions/AI_GATEWAY.md) to provision only the providers you intend to offer, configure server-side keys and Firebase service-account credentials as private Vercel environment variables, create the administrator-owned model/routing document, deploy the Vercel API routes, and verify App Check. Never place provider keys or service-account credentials in frontend config or the public repository.

## Integrations still needed for a production public-safety platform

The optional AI gateway and forecast email workers exist but need your project/provider secrets and administrator configuration before they can run. There is no authoritative real-time IMD/CWC/NDMA warning feed, emergency push-notification service, SMS channel, GFS/WRF selection, METAR/TAF provider, verified river/flood monitoring, lightning network, cyclone-track service, volunteer dispatch, verified shelter/food/accommodation inventory, street-level reverse-geocoding provider, or streaming AI response. Do not present model-derived advisories as verified official warnings or inferred locations as open relief centres. Use licensed authoritative providers and server-side validation before adding emergency notification, volunteer coordination, relief listings or professional aviation/marine decision support.
