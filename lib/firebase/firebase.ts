import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Cek apakah aplikasi sudah diinisialisasi, jika belum maka buat baru
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inisialisasi Layanan
const db = getFirestore(app);
const auth = getAuth(app);

// Tambahan: Jika kamu menggunakan Firebase Auth di Next.js, 
// terkadang kamu butuh persistensi agar login tidak hilang saat refresh.
// Firebase biasanya menangani ini secara otomatis di browser.

export { app, db, auth };
