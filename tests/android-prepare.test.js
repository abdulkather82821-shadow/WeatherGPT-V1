"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");

test("patchManifest adds missing permissions and queries once", async () => {
  const { patchManifest, REQUIRED_PERMISSIONS } = await import("../scripts/android-prepare.mjs");
  const base = `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <application android:label="x"></application>\n    <uses-permission android:name="android.permission.INTERNET" />\n</manifest>\n`;
  const once = patchManifest(base);
  for (const name of REQUIRED_PERMISSIONS) assert.equal(once.split(`"${name}"`).length - 1, 1, name);
  assert.match(once, /android.speech.RecognitionService/);
  assert.equal(patchManifest(once), once, "patching is idempotent");
  const crlf = patchManifest(base.replace(/\n/g, "\r\n"));
  assert.ok(!/[^\r]\n/.test(crlf), "CRLF preserved");
});
