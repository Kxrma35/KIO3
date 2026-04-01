import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvFGbE9JA_KHGRe274zzrCGX2I9Jpmz6s",
  authDomain: "bulking-tracker-5dfea.firebaseapp.com",
  projectId: "bulking-tracker-5dfea",
  storageBucket: "bulking-tracker-5dfea.firebasestorage.app",
  messagingSenderId: "807412003211",
  appId: "1:807412003211:web:1aaf42d8abdac30dcfff8e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);