# WeatherGPT for Android

WeatherGPT is a mobile-first conversational weather application packaged for Android with [Capacitor 7](https://capacitorjs.com/). The Android project includes native GPS, Android speech recognition, local notifications, a branded launcher icon and native status-bar styling.

## Run the app in Android Studio

Prerequisites: Node.js 20+, JDK 21, Android Studio, the Android 35 SDK, Android platform-tools and a USB-connected Android device or emulator. The Capacitor Android plugins require JDK 21; a newer Android Studio bundled JDK may not work.

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
- **Maps and radar:** OpenStreetMap provides interactive map tiles; observed rain-radar frames come from RainViewer and show their local observation time. Radar is not a rainfall forecast or official warning.
- **Alerts center:** Advisory, Watch and Warning labels are derived from local forecast thresholds. **They are not IMD, CWC or government-issued alerts**, and this prototype does not provide an emergency all-clear. Official alert sources are linked separately.
- **Weather assistant:** Rule-based answers use current API data, location lookup, travel, aviation, coastal/marine and farm-weather context. It is **not connected to an LLM**, and its advice is not a substitute for an aviation briefing, agricultural professional, or government warning.
- **Historical climate charts:** Select 5, 10 or 20 full years to aggregate daily Open-Meteo Historical Weather API temperatures and rainfall into yearly charts. Historical estimates do not establish attribution or replace official Indian climate records.
- **Android features:** Multiple saved and comparable locations, GPS-based "near me", 11 Indian language UI/voice locales, native/browser voice recognition, °C/°F preferences and on-device, opt-in rain/heat notifications.
- **Data-source transparency:** Live forecast and air quality use Open-Meteo; map and radar attribution is shown. Feed cards are timestamped. The Alerts Center explicitly identifies its alerts as forecast guidance rather than official warnings.

## Integrations still needed for a production public-safety platform

No backend, LLM/function-calling engine, authoritative real-time IMD or NDMA alert feed, push notification server, SMS/email channel, GFS/WRF selection, airport METAR/TAF provider, verified river-level/flood monitoring, lightning network, or government cyclone-track service is included. Do not present model-derived advisories as verified official warnings. Use appropriately licensed authoritative providers and server-side validation before adding emergency notification or professional aviation/marine decision support.
