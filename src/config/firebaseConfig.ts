import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "eva-finanzas.firebaseapp.com",
  projectId: "eva-finanzas",
  storageBucket: "eva-finanzas.firebasestorage.app",
  messagingSenderId: "1058026439316",
  appId: "1:1058026439316:web:cb2f766f4a3eaa3d16ea81",
  measurementId: "G-MMYQM99RVK",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
auth.languageCode = "es"; // Establecer idioma a español para correos
export const storage = getStorage(app);
