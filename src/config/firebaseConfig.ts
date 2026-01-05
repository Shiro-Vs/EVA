import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAC5G93MpBjVM13gdNZj6I9xfvR1CEQ9tk",
  authDomain: "eva-finanzas.firebaseapp.com",
  projectId: "eva-finanzas",
  storageBucket: "eva-finanzas.firebasestorage.app",
  messagingSenderId: "1058026439316",
  appId: "1:1058026439316:web:cb2f766f4a3eaa3d16ea81",
  measurementId: "G-MMYQM99RVK",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
