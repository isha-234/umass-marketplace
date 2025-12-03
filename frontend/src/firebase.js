import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error("Firebase config missing. Set REACT_APP_FIREBASE_* env vars.");
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Analytics is optional; only initialize if supported and measurement ID is provided.
export const analyticsPromise =
  firebaseConfig.measurementId && typeof window !== "undefined"
    ? isAnalyticsSupported().then((supported) => (supported ? getAnalytics(app) : null))
    : Promise.resolve(null);
