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

Build a debug APK from the Android directory:

```powershell
$env:JAVA_HOME = 'C:\Path\To\JDK-21'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
.\gradlew.bat assembleDebug
```

The debug APK is written to `android\app\build\outputs\apk\debug\app-debug.apk`. Android requires user permission for location, microphone, speech recognition and notifications.

## Run as a mobile web app

```powershell
npm.cmd install
npm.cmd run start
```

Open `http://localhost:8000/`. The manifest and static-shell service worker enable installation and offline access to the cached app interface. Current weather and maps still need an internet connection.

## Implemented data and experiences

- **Live forecasts:** Open-Meteo forecast and geocoding APIs provide current conditions, pressure, visibility, UV, wind direction, hourly precipitations, rain probability and 16-day forecasts.
- **Air quality:** Open-Meteo Air Quality API provides US AQI and PM2.5.
- **Weather map:** Pan the map to load a local Open-Meteo grid for temperature, weather conditions, rainfall, wind, humidity, clouds, pressure, visibility, UV and US AQI. Grid values are model output at nearby points, not ground-station readings; the map refreshes when panned. RainViewer can be overlaid for observed precipitation imagery and is not a forecast or official warning. Lightning, flood extent, river levels, official warning polygons and cyclone tracks are not connected.
- **Alerts center:** Advisory, Watch and Warning labels are derived from local forecast thresholds. **They are not IMD, CWC or government-issued alerts**, and this prototype does not provide an emergency all-clear. Official alert sources are linked separately.
- **Weather assistant:** Rule-based answers use current API data, location lookup, travel, aviation, coastal/marine and farm-weather context. The voice helper uses device speech recognition in the selected language, with optional spoken answers and replay controls. It is **not connected to an LLM**, and its advice is not a substitute for an aviation briefing, agricultural professional, or government warning.
- **Farmer field planner:** The Home planner combines forecast rainfall, wind, temperature, selected crop and crop stage into general irrigation, spray-window and harvest-planning prompts. It does not provide crop-specific prescriptions; confirm decisions with field observations, product labels and a local KVK/agriculture-extension adviser.
- **Community relief guidance:** The Alerts center provides forecast-informed seasonal preparation, basic food/water safety, shelter verification steps and volunteer safety guidance, with links to NDMA/Sachet and an emergency 112 call link for India. The app does not register volunteers, dispatch help, or list confirmed shelters, accommodation, meal services, stock or live availability. Confirm arrangements with district officials and follow their instructions.
- **Historical climate charts:** Select 5, 10 or 20 full years to aggregate daily Open-Meteo Historical Weather API temperatures and rainfall into yearly charts. Historical estimates do not establish attribution or replace official Indian climate records.
- **Android features:** Multiple saved and comparable locations, GPS-based "near me", 11 Indian language UI/voice locales, native/browser voice recognition, °C/°F preferences and on-device, opt-in rain/heat notifications.
- **Data-source transparency:** Live forecast and air quality use Open-Meteo; map and radar attribution is shown. Feed cards are timestamped. The Alerts Center explicitly identifies its alerts as forecast guidance rather than official warnings.
- **Google sign-in and email preferences:** Firebase Authentication accepts Google sign-in only. Firestore rules restrict each verified Google account to its own validated preferences; Firebase App Check protects client requests (Play Integrity on Android, reCAPTCHA v3 on web). A scheduled Cloud Function can email opt-in rain, storm, wind, heat and cold forecast guidance through Resend. Flood email alerts are unavailable because no verified flood-warning feed is connected. These are model-triggered forecast emails, not official alerts.

## Configure Firebase and forecast email (optional)

Without Firebase project values, the app keeps Google sign-in disabled and the weather features continue to work. Firebase's web API key and app IDs identify the client project; they are not server secrets. Never commit service-account credentials, Resend keys, App Check debug tokens, or a production signing key.

1. Create Firebase Android and Web apps in one Firebase project. The Android package name is `com.weathergpt.mobile`. Enable **Google** in Firebase Authentication and register the Android debug and release SHA-1 fingerprints in the Firebase Android app settings.
2. Copy `firebase-config.example.js` to the ignored local file `firebase-config.js` and replace its placeholders with the Web app's Firebase configuration and a reCAPTCHA v3 site key. Add your development and production web domains to the reCAPTCHA authorized domains. Place the matching Android `google-services.json` at `android\app\google-services.json`. Both local configuration files are ignored by Git.
3. Register Play Integrity for the Android app and reCAPTCHA v3 for the Web app in Firebase App Check. First test sign-in and preference reads/writes with App Check monitoring; enforce App Check for Cloud Firestore only after valid tokens are confirmed for every client you distribute. Use a Firebase App Check debug token only for a private local development build and never ship or publish it.
4. Install and authenticate the Firebase CLI (`npm.cmd install --global firebase-tools`, `firebase login`, `firebase use <your-project-id>`), install dependencies at the repository root, and deploy the restrictive Firestore rules: `npm.cmd install`, then `firebase deploy --only firestore:rules`. Rules permit only the signed-in owner with a verified Google account, validate the allowed fields and coordinate ranges, and reject client access to worker state and email quota documents.
5. To enable server-side email, use a Firebase project with billing and Cloud Scheduler support. Verify a sender/domain in Resend, then create `functions\.env.<your-firebase-project-id>` containing `ALERT_EMAIL_FROM="WeatherGPT <alerts@your-verified-domain.example>"`. Set the provider API key as a Firebase secret with `firebase functions:secrets:set RESEND_API_KEY`, and deploy the worker with `firebase deploy --only functions`. Install the function dependencies with `npm.cmd install --prefix functions` before deploying.
6. Verify the deployed schedule and test with an opted-in account before relying on email. The worker checks Open-Meteo forecasts every 15 minutes, identifies itself as model guidance, deduplicates a category per account and local date, and caps delivery at three emails per account and local date. Disable consent in Profile to stop future checks for that account. Do not use this prototype as an emergency notification service.

## Integrations still needed for a production public-safety platform

No backend, LLM/function-calling engine, authoritative real-time IMD or NDMA alert feed, push notification server, SMS/email channel, GFS/WRF selection, airport METAR/TAF provider, verified river-level/flood monitoring, lightning network, government cyclone-track service, volunteer registration/dispatch, or verified shelter/food/accommodation inventory is included. Do not present model-derived advisories as verified official warnings or inferred locations as open relief centres. Use appropriately licensed authoritative providers and server-side validation before adding emergency notification, volunteer coordination, shelter/food listings or professional aviation/marine decision support.
