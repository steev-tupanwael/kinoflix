import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/firebase-admin";
import admin from "firebase-admin";

export async function POST(req: Request) {
  const data = await req.json();

  // 1. Verifikasi signature key Midtrans (Wajib untuk keamanan!)
  // ... (Logika verifikasi)

  const transactionStatus = data.transaction_status;
  const orderId = data.order_id;
  const userId = orderId.split("-")[1]; // Ambil userId dari order_id

  if (transactionStatus === "settlement" || transactionStatus === "capture") {
    // 2. Tentukan durasi (misal 30 hari)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 3. Update Firestore Admin
    await adminDb.collection("users").doc(userId).update({
      isPremium: true,
      premiumUntil: admin.firestore.Timestamp.fromDate(expiresAt),
      lastPaymentDate: admin.firestore.Timestamp.now(),
    });

    console.log(`User ${userId} berhasil upgrade ke PRO.`);
  }

  return NextResponse.json({ status: "ok" });
}
