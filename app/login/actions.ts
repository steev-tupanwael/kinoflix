'use server'

import { adminAuth, adminDb } from '@/lib/firebase/firebase-admin'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createSession(idToken: string, userData?: { name: string, email: string, photo: string }) {
  const cookieStore = await cookies()

  // 1. Verifikasi Token
  const decodeToken = await adminAuth.verifyIdToken(idToken)
  const uid = decodeToken.uid

  if (decodeToken) {
  const adminEmails = ['steev_tupanwael@outlook.com'];
  const userEmail = decodeToken.email; // string | undefined

  // Pastikan userEmail ada DAN termasuk dalam daftar adminEmails
  if (userEmail && adminEmails.includes(userEmail)) {
    // Setel klaim admin di Firebase
    await adminAuth.setCustomUserClaims(decodeToken.uid, { admin: true });
  }
}

  // 2. Ambil data dari Firestore
  const userRef = adminDb.collection('users').doc(uid)
  const userDoc = await userRef.get()

  let userDataFirestore = userDoc.data()

  if (!userDoc.exists) {
    const newUser = {
      uid: uid,
      email: userData?.email || decodeToken.email || "",
      name: userData?.name || decodeToken.name || "",
      photo: userData?.photo || decodeToken.picture || "",
      role: 'user',
      // User baru hanya boleh akses /dashboard (halaman utama)
      // Halaman lain seperti /dashboard/users atau /dashboard/analytics tidak akan bisa dibuka
      allowedPaths: ['/dashboard'],
      createdAt: new Date().toISOString()
    }
    await userRef.set(newUser)
    userDataFirestore = newUser
  }

  // 3. Logika Role & Permissions
  const role = userDataFirestore?.role || (decodeToken.role as string) || 'user'
  const allowedPaths = userDataFirestore?.allowedPaths || []

  // 4. (Opsional tapi Sangat Disarankan) Buat Session Cookie Firebase
  // Ini lebih aman daripada menyimpan idToken mentah
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 hari
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

  // 5. Simpan Session Cookie
  cookieStore.set('session', sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 5, // 5 hari
    path: '/',
    sameSite: 'lax'
  })

  // 6. Simpan Profile Payload
  const profilePayload = {
    uid: uid, // Tambahkan UID agar mudah dicocokkan di middleware
    name: userData?.name || decodeToken.name || "",
    email: userData?.email || decodeToken.email || "",
    photo: userData?.photo || decodeToken.picture || "",
    role: role,
    allowedPaths: allowedPaths
  }

  cookieStore.set('user_profile', JSON.stringify(profilePayload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 5,
    path: '/',
    sameSite: 'lax'
  })

  return { success: true };
}

export async function removeSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  cookieStore.delete('user_profile')
  // Jangan gunakan redirect di dalam try/catch atau secara async tanpa await jika di server actions tertentu
  // Tapi untuk logout sederhana ini sudah cukup.
  redirect('/login')
}

export async function syncProfileCookie(data: any) {
  const cookieStore = await cookies()
  const profilePayload = JSON.stringify(data)

  cookieStore.set('user_profile', profilePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 5,
    path: '/',
    sameSite: 'lax'
  })
}
