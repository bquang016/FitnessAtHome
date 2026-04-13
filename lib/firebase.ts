import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1TV6EdfaM7azlZ8XBIsMrAcJAossF57o",
  authDomain: "fitness-at-home-data.firebaseapp.com",
  projectId: "fitness-at-home-data",
  storageBucket: "fitness-at-home-data.firebasestorage.app",
  messagingSenderId: "437486466863",
  appId: "1:437486466863:web:458f1bdbdeb824811d53da",
  measurementId: "G-QEKLZ1QE39"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});
