import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const userProfileCookie = request.cookies.get('user_profile')?.value
  const { pathname } = request.nextUrl

  console.log("Path saat ini:", pathname)

  // 1. Tentukan Route secara eksplisit
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
  const isLoginPage = pathname === '/login'
  const isPublicPage = pathname === '/' || pathname === '' // Tambahkan definisi halaman publik utama

  // 2. JIKA HALAMAN PUBLIK (seperti /), IZINKAN SIAPA PUN (Login atau Tidak)
  if (isPublicPage) {
    console.log('terdeteksi public')
    return NextResponse.next()
  }

  // 3. Validasi Dasar untuk Pengunjung yang BELUM Login
  if (!isPublicPage && !session && isProtectedRoute) {
    console.log('terdeteksi belum login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Validasi Dasar untuk User yang SUDAH Login (mencegah balik ke login page)
  if (session && isLoginPage) {
    console.log('terdeteksi sudah login')
    // Arahkan ke /dashboard atau /admin sesuai kebutuhan, atau tetap di /
    return NextResponse.next() // Izinkan saja jika ingin tetap bisa lihat halaman login (tapi biasanya diredirect)
    // return NextResponse.redirect(new URL('/', request.url)) // Kembali ke home
  }

  // 5. Proteksi Granular untuk User yang sudah Login di Area Terproteksi
  if (session && isProtectedRoute) {
    try {
      const user = userProfileCookie ? JSON.parse(decodeURIComponent(userProfileCookie)) : null

      // Admin selalu bebas akses ke manapun
      if (user?.role === 'admin') return NextResponse.next()

      // User biasa mencoba masuk area /admin? Lempar ke denied
      if (pathname.startsWith('/admin') && user?.role !== 'admin') {
        return NextResponse.redirect(new URL('/denied', request.url))
      }

      // Daftar halaman yang boleh diakses user login biasa
      const publicDashboardPaths = ['/', '/dashboard', '/denied', '/profile']
      if (publicDashboardPaths.includes(pathname)) return NextResponse.next()

      // Cek Allowed Paths (untuk fitur tambahan)
      const allowedPaths = user?.allowedPaths || []
      const hasAccess = allowedPaths.some((path: string) =>
        pathname === path || pathname.startsWith(path + '/')
      )

      if (!hasAccess && pathname.startsWith('/dashboard/')) {
        return NextResponse.redirect(new URL('/denied', request.url))
      }

    } catch (e) {
      console.error("Middleware Error:", e)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*|favicon.ico).*)'],
}
