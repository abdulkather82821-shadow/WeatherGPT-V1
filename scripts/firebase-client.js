import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { FirebaseAppCheck } from "@capacitor-firebase/app-check";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { getApp, getApps, initializeApp } from "firebase/app";
import { CustomProvider, ReCaptchaV3Provider, getToken as getAppCheckToken, initializeAppCheck } from "firebase/app-check";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  linkWithCredential,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  signOut,
  reload,
  updateProfile
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
const firebaseConfig = window.WEATHERGPT_FIREBASE_CONFIG;
const isConfigured = requiredKeys.every((key) => {
  const value = firebaseConfig?.[key];
  return typeof value === "string" && value.length > 0 && !value.startsWith("REPLACE_");
});
let auth;
let database;
let appCheck;
let unsubscribeAuth;
let userCallback;

function updateAuthUser(user) {
  userCallback?.(user);
}

async function synchronizeNativeUser() {
  const result = await FirebaseAuthentication.getCurrentUser();
  if (!result.user) {
    if (auth.currentUser?.providerData.some((provider) => provider.providerId === "google.com")) {
      await signOut(auth);
    }
    return;
  }
  if (auth.currentUser?.uid === result.user.uid) return;
  const tokenResult = await FirebaseAuthentication.getIdToken();
  if (!tokenResult.token) throw new Error("Google sign-in did not return a Firebase identity token.");
  const credential = GoogleAuthProvider.credential(tokenResult.token);
  await signInWithCredential(auth, credential);
}

async function initialize(onUser) {
  userCallback = onUser;
  if (!isConfigured) {
    updateAuthUser(null);
    return false;
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (Capacitor.isNativePlatform()) {
    await FirebaseAppCheck.initialize({ isTokenAutoRefreshEnabled: true });
    appCheck = initializeAppCheck(app, {
      provider: new CustomProvider({ getToken: () => FirebaseAppCheck.getToken() }),
      isTokenAutoRefreshEnabled: true
    });
    try {
      auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
    } catch (error) {
      if (error.code !== "auth/already-initialized") throw error;
      auth = getAuth(app);
    }
  } else {
    const siteKey = firebaseConfig.recaptchaV3SiteKey;
    if (siteKey && !siteKey.startsWith("REPLACE_")) {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
    }
    auth = getAuth(app);
  }
  database = getFirestore(app);
  unsubscribeAuth?.();
  unsubscribeAuth = onAuthStateChanged(auth, updateAuthUser);
  if (Capacitor.isNativePlatform()) await synchronizeNativeUser();
  return true;
}

async function signInWithGoogle() {
  if (!auth) throw new Error("Google sign-in is not configured. Add your Firebase app configuration and sync the Android project.");
  if (Capacitor.isNativePlatform()) {
    const result = await FirebaseAuthentication.signInWithGoogle();
    const idToken = result.credential?.idToken;
    if (!idToken) throw new Error("Google sign-in did not return an identity token. Check your Firebase Android SHA-1 setup.");
    await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return;
  }
  await signInWithPopup(auth, new GoogleAuthProvider());
}

async function continueAsGuest() {
  if (!auth) throw new Error("Firebase Authentication is not configured.");
  if (auth.currentUser) return auth.currentUser;
  return (await signInAnonymously(auth)).user;
}

async function signOutUser() {
  if (!auth) return;
  if (Capacitor.isNativePlatform()) await FirebaseAuthentication.signOut();
  await signOut(auth);
}

async function registerWithEmail(email, password, displayName) {
  if (!auth) throw new Error("Firebase Authentication is not configured.");
  const currentUser = auth.currentUser;
  const credential = currentUser?.isAnonymous
    ? await linkWithCredential(currentUser, EmailAuthProvider.credential(email.trim(), password))
    : await createUserWithEmailAndPassword(auth, email.trim(), password);
  const name = displayName.trim().slice(0, 80);
  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }
  await sendEmailVerification(credential.user);
  return credential.user;
}

async function signInWithEmail(email, password) {
  if (!auth) throw new Error("Firebase Authentication is not configured.");
  return (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
}

async function sendPasswordReset(email) {
  if (!auth) throw new Error("Firebase Authentication is not configured.");
  await sendPasswordResetEmail(auth, email.trim());
}

async function resendVerificationEmail() {
  const user = auth?.currentUser;
  if (!user) throw new Error("Sign in before requesting a verification email.");
  await sendEmailVerification(user);
}

async function refreshAuthUser() {
  const user = auth?.currentUser;
  if (!user) return null;
  await reload(user);
  return auth.currentUser;
}

async function deleteAccount(password) {
  const user = auth?.currentUser;
  if (!user) throw new Error("Sign in before deleting your account.");
  const accountUid = user.uid;
  if (user.providerData.some((provider) => provider.providerId === "password")) {
    const email = user.email;
    if (!email || !password) throw new Error("Enter your password to confirm account deletion.");
    const { EmailAuthProvider, reauthenticateWithCredential } = await import("firebase/auth");
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(email, password));
  } else if (user.providerData.some((provider) => provider.providerId === "google.com")) {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signInWithGoogle();
      await synchronizeNativeUser();
    } else {
      await signInWithPopup(auth, new GoogleAuthProvider());
    }
    if (auth.currentUser?.uid !== accountUid) throw new Error("Reauthenticate with the same account to confirm deletion.");
  }
  await callAI("deleteOwnAccountData", {});
  await deleteUser(user);
}

function getSignedInUser() {
  return auth?.currentUser || null;
}

async function saveProfile(profile) {
  const user = getSignedInUser();
  if (!user || !database) throw new Error("Sign in to save your profile.");
  const latitude = Number(profile.defaultLocation?.latitude);
  const longitude = Number(profile.defaultLocation?.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("Choose a valid default weather location before saving your profile.");
  }
  await setDoc(doc(database, "users", user.uid, "private", "profile"), {
    displayName: String(profile.displayName || "").trim().slice(0, 80),
    preferredLanguage: profile.preferredLanguage,
    temperatureUnit: profile.temperatureUnit,
    defaultLocation: {
      name: String(profile.defaultLocation?.name || "").slice(0, 100),
      latitude,
      longitude,
      timezone: String(profile.defaultLocation?.timezone || "auto").slice(0, 80)
    },
    voiceResponses: profile.voiceResponses === true,
    updatedAt: serverTimestamp()
  });
}

async function loadProfile() {
  const user = getSignedInUser();
  if (!user || !database) throw new Error("Sign in to load your profile.");
  const snapshot = await getDoc(doc(database, "users", user.uid, "private", "profile"));
  return snapshot.exists() ? snapshot.data() : null;
}

async function saveConversation(conversation) {
  const user = getSignedInUser();
  if (!user || !database) return false;
  const reference = doc(database, "users", user.uid, "conversations", conversation.id);
  const existing = await getDoc(reference);
  await setDoc(reference, {
    title: String(conversation.title || "New conversation").slice(0, 120),
    location: {
      name: String(conversation.location?.name || "").slice(0, 100),
      latitude: Number(conversation.location?.latitude),
      longitude: Number(conversation.location?.longitude)
    },
    searchText: String(conversation.searchText || "").slice(0, 2000),
    updatedAt: serverTimestamp(),
    pinned: conversation.pinned === true,
    archived: conversation.archived === true,
    ...(existing.exists() ? {} : { createdAt: serverTimestamp() })
  }, { merge: true });
  return true;
}

async function saveConversationMessage(conversationId, message) {
  const user = getSignedInUser();
  if (!user || !database) return false;
  await addDoc(collection(database, "users", user.uid, "conversations", conversationId, "messages"), {
    role: message.role,
    content: String(message.content).slice(0, 4000),
    createdAt: serverTimestamp(),
    provider: String(message.provider || "").slice(0, 40),
    model: String(message.model || "").slice(0, 80),
    inputType: message.inputType === "voice" ? "voice" : "text"
  });
  return true;
}

async function listConversations() {
  const user = getSignedInUser();
  if (!user || !database) return [];
  const result = await getDocs(query(
    collection(database, "users", user.uid, "conversations"),
    orderBy("updatedAt", "desc"),
    limit(100)
  ));
  return result.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
}

async function loadConversationMessages(conversationId) {
  const user = getSignedInUser();
  if (!user || !database) return [];
  const result = await getDocs(query(
    collection(database, "users", user.uid, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
    limit(100)
  ));
  return result.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
}

async function renameConversation(conversationId, title) {
  const user = getSignedInUser();
  if (!user || !database) throw new Error("Sign in before renaming a saved conversation.");
  await updateDoc(doc(database, "users", user.uid, "conversations", conversationId), {
    title: String(title).trim().slice(0, 120),
    updatedAt: serverTimestamp()
  });
}

async function deleteConversation(conversationId) {
  const user = getSignedInUser();
  if (!user || !database) throw new Error("Sign in before deleting a saved conversation.");
  const reference = doc(database, "users", user.uid, "conversations", conversationId);
  const messages = await getDocs(collection(reference, "messages"));
  await Promise.all(messages.docs.map((message) => deleteDoc(message.ref)));
  await deleteDoc(reference);
}

async function callAI(name, payload) {
  const user = auth?.currentUser;
  if (!user?.emailVerified) throw new Error("Sign in with a verified email account to use the WeatherGPT AI gateway.");
  const gatewayUrl = firebaseConfig.aiGatewayUrl || "https://weather-gpt-v1.vercel.app/api/ai";
  const idToken = await user.getIdToken();
  let appCheckToken;
  if (Capacitor.isNativePlatform()) {
    appCheckToken = (await FirebaseAppCheck.getToken()).token;
  } else if (appCheck) {
    appCheckToken = (await getAppCheckToken(appCheck)).token;
  }
  if (!appCheckToken) throw new Error("WeatherGPT AI access requires a valid Firebase App Check token.");
  const operation = {
    getAiModels: "models",
    chatWithWeatherGPT: "chat",
    deleteOwnAccountData: "delete-account"
  }[name];
  if (!operation) throw new Error("This WeatherGPT gateway operation is not available.");
  const response = await fetch(`${gatewayUrl.replace(/\/+$/, "")}/${operation}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
      "X-Firebase-AppCheck": appCheckToken
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60_000)
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The WeatherGPT AI gateway returned an invalid response.");
  }
  if (!response.ok) {
    const error = new Error(result?.error?.message || "WeatherGPT could not complete this request.");
    error.code = `functions/${result?.error?.code || "internal"}`;
    throw error;
  }
  return result;
}

async function loadEmailPreferences() {
  const user = getSignedInUser();
  if (!user || !database) throw new Error("Sign in with Google before loading email preferences.");
  const snapshot = await getDoc(doc(database, "users", user.uid));
  return snapshot.exists() ? snapshot.data().emailAlerts || null : null;
}

async function saveEmailPreferences(preferences) {
  const user = getSignedInUser();
  if (!user || !database) throw new Error("Sign in with Google before saving email preferences.");
  if (!user.emailVerified || !user.email) throw new Error("A verified Google email address is required for email alerts.");
  const latitude = Number(preferences.location?.latitude);
  const longitude = Number(preferences.location?.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("A valid forecast location is required before enabling email alerts.");
  }
  const categories = ["rain", "storm", "wind", "heat", "cold"].reduce((result, category) => {
    result[category] = preferences.categories?.[category] === true;
    return result;
  }, {});
  const enabled = preferences.consent === true && Object.values(categories).some(Boolean);
  await setDoc(doc(database, "users", user.uid), {
    emailAlerts: {
      enabled,
      categories,
      location: {
        name: String(preferences.location.name || "Selected location").slice(0, 100),
        latitude,
        longitude,
        timezone: String(preferences.location.timezone || "auto").slice(0, 80)
      }
    },
    updatedAt: serverTimestamp()
  }, { merge: true });
  return { enabled, email: user.email };
}

window.WeatherGPTFirebase = {
  configured: isConfigured,
  initialize,
  signInWithGoogle,
  continueAsGuest,
  registerWithEmail,
  signInWithEmail,
  sendPasswordReset,
  resendVerificationEmail,
  refreshAuthUser,
  deleteAccount,
  signOut: signOutUser,
  getSignedInUser,
  saveProfile,
  loadProfile,
  saveConversation,
  saveConversationMessage,
  listConversations,
  loadConversationMessages,
  renameConversation,
  deleteConversation,
  getAiModels: () => callAI("getAiModels", {}),
  chatWithWeatherGPT: (payload) => callAI("chatWithWeatherGPT", payload),
  loadEmailPreferences,
  saveEmailPreferences
};

window.WeatherGPTSpeech = {
  isNative: Capacitor.isNativePlatform(),
  textToSpeech: TextToSpeech
};
