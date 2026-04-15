import { auth, db } from "@/lib/firebase/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword, // Fungsi ini resmi dari Firebase
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// 1. Login Google (User)
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isPremium: false,
        subscriptionType: "None",
        expiryDate: null,
        myList: []
      });
    }
    return user;
  } catch (error) {
    console.error("Error Google Login:", error);
    throw error;
  }
};

// 2. Login Email/Password (Admin)
export const loginAdmin = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error) {
    console.error("Error Admin Login:", error);
    throw error;
  }
};

// 3. Logout
export const logout = () => signOut(auth);
