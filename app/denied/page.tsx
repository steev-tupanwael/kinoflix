'use client'

import { RiShieldUserLine } from '@remixicon/react'

export default function DeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <RiShieldUserLine className="w-16 h-16 text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
        Silakan hubungi Administrator untuk meminta akses tambahan.
      </p>
    </div>
  )
}
