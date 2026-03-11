import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB1Sr2FMQvAfggTHjknyTogUK4gIexU8t0",
  authDomain: "eventtide-358ab.firebaseapp.com",
  projectId: "eventtide-358ab",
  storageBucket: "eventtide-358ab.firebasestorage.app",
  messagingSenderId: "858896047722",
  appId: "1:858896047722:web:5195e148e47f742c4e3413",
  measurementId: "G-21ZVW6TPH4",
};

const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Only initialize analytics on the client side
export let analytics: any = null;
if (typeof window !== "undefined") {
  // Dynamically import analytics to avoid SSR issues
  import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }).catch((error) => {
    console.warn("Analytics initialization failed:", error);
  });
}
