'use client'

import { auth } from '@/lib/firebase/firebase'
import { signOut } from 'firebase/auth'
import { removeSession } from '@/app/login/actions'

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth)
      await removeSession()
    } catch (error) {
      console.error("Gagal logout:", error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
    >
      Keluar (Logout)
    </button>
  )
}
