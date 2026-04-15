"use server";

import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";

export async function getVideoStream(movieId: string, sessionToken: string) {
  try {
    // 1. Verifikasi Token User
    const decodedToken = await adminAuth.verifyIdToken(sessionToken);
    const userId = decodedToken.uid;

    // 2. Cek status di database admin
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const isPremium = userDoc.data()?.isPremium;

    // 3. Ambil data film
    const movieDoc = await adminDb.collection("movies").doc(movieId).get();
    const movieData = movieDoc.data();

    // Jika film terkunci tapi user tidak premium
    if (movieData?.isLocked && !isPremium) {
      return { success: false, error: "ACCESS_DENIED" };
    }

    return {
      success: true,
      videoUrl: movieData?.videoUrl // URL ini hanya keluar jika lolos cek
    };
  } catch (error) {
    return { success: false, error: "AUTH_FAILED" };
  }
}
