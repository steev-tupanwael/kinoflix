"use server";

import { adminAuth } from "@/lib/firebase/firebase-admin";

export async function makeUserAdmin(email: string) {
  try {
    // 1. Cari user berdasarkan email
    const user = await adminAuth.getUserByEmail(email);

    // 2. Set custom claims
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });

    return { success: true, message: `Berhasil! ${email} sekarang adalah admin.` };
  } catch (error) {
    console.error("Error setting custom claims:", error);
    return { success: false, message: "Gagal menjadikan admin. Pastikan email terdaftar." };
  }
}
