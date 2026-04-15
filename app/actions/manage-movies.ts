"use server";

import { adminDb } from "@/lib/firebase/firebase-admin"; // Pastikan Anda sudah membuat init firebase-admin
import { FieldValue } from "firebase-admin/firestore";

/**
 * Fungsi untuk mengekstrak File ID dari berbagai format link Google Drive
 */
function extractGDriveId(url: string): string | null {
  const regex = /[-\w]{25,}/;
  const match = url.match(regex);
  return match ? match[0] : null;
}

export async function addMovieQuickly(title: string, gDriveLink: string) {
  try {
    // 1. Validasi Input
    if (!title || !gDriveLink) {
      return { success: false, message: "Judul dan Link wajib diisi." };
    }

    // 2. Ekstrak ID Drive
    const fileId = extractGDriveId(gDriveLink);
    if (!fileId) {
      return { success: false, message: "Link Google Drive tidak valid." };
    }

    const streamLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const movieData = {
      title,
      videoUrl: streamLink,
      thumbnailUrl: `https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070`, // Placeholder
      genre: ["Animation"],
      category: "Series",
      isPremium: true,
      createdAt: FieldValue.serverTimestamp(), // Menggunakan FieldValue dari firebase-admin
      updatedAt: FieldValue.serverTimestamp(),
      status: "active",
    };

    // 3. Simpan menggunakan firebase-admin (Bypass Rules)
    const docRef = await adminDb.collection("movies").add(movieData);

    return {
      success: true,
      message: `Berhasil menambahkan Film: ${title}`,
      id: docRef.id
    };
  } catch (error: any) {
    console.error("Firebase Admin Error:", error);
    return {
      success: false,
      message: error.message || "Gagal menyimpan (Server Error)."
    };
  }
}
