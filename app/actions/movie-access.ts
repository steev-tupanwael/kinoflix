"use server";

import { supabaseAdmin } from "@/lib/supabase/supabase";
import { adminDb } from "@/lib/firebase/firebase-admin"; // Gunakan adminDb

export async function getAuthorizedMovieUrl(userId: string, movieId: string) {
  try {
    // 1. Ambil data film menggunakan Admin SDK
    const movieDoc = await adminDb.collection("movies").doc(movieId).get();

    if (!movieDoc.exists) {
      return { url: null, error: "Film tidak ditemukan." };
    }

    const movieData = movieDoc.data();
    const videoPath = movieData?.videoUrl;

    if (!videoPath) {
      return { url: null, error: "Path video tidak valid." };
    }

    // 2. Cek status langganan user di Firestore Admin
    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return { url: null, error: "User tidak ditemukan." };
    }

    const userData = userDoc.data();

    // Logika pengecekan Premium
    const isPremium = userData?.isPremium === true;

    // Firestore Admin mengembalikan Timestamp secara otomatis
    const premiumUntil = userData?.premiumUntil?.toDate();
    const now = new Date();

    if (!isPremium || (premiumUntil && premiumUntil < now)) {

      console.error("Payment Error: Akses ditolak.");
      return {
        url: null,
        error: "Akses ditolak. Konten ini hanya untuk member Kinoflix Pro. Jika Masa langganan Pro Anda telah habis. Silahkan perpanjang."
      };
    }

    // 3. Generate Signed URL dari Supabase
    const { data, error: supabaseError } = await supabaseAdmin
      .storage
      .from('movies')
      .createSignedUrl(videoPath, 7200);

    if (supabaseError) {
      console.error("Supabase Storage Error:", supabaseError.message);
      return { url: null, error: "Gagal mengambil akses video." };
    }

    return { url: data.signedUrl, error: null };

  } catch (error) {
    console.error("Movie Access Error:", error);
    return { url: null, error: "Terjadi kesalahan sistem." };
  }
}
