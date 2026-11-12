import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { recordActivityLog } from '@/lib/admin-store'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'hatoba2026'
const COOKIE_NAME = 'hatoba_admin_session'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)
  const isAuthenticated = session?.value === 'authenticated'

  return NextResponse.json({ authenticated: isAuthenticated })
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Kata sandi / PIN admin salah. Silakan coba lagi.' },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    await recordActivityLog({
      action: 'ADMIN_LOGIN',
      title: 'Login Admin Berhasil',
      description: 'Sesi admin aktif dibuka pada perangkat ini.',
      adminUser: 'Admin Pusat',
    })

    return NextResponse.json({ success: true, message: 'Login berhasil.' })
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat proses login.' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return NextResponse.json({ success: true, message: 'Logout berhasil.' })
}

