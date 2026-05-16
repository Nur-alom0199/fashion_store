import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDZglR9hAx3BvMaxHqSrOJLlDHMmPKygMQ",
  authDomain: "cclabproject-75eb6.firebaseapp.com",
  projectId: "cclabproject-75eb6",
  storageBucket: "cclabproject-75eb6.firebasestorage.app",
  messagingSenderId: "1089926010727",
  appId: "1:1089926010727:web:9616d48273d966710b01c2",
  measurementId: "G-7QB8ZCNTL8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Used for future Firestore operations
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const googleProvider = new GoogleAuthProvider();
