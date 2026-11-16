import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const FINANCE_PASSWORD = process.env.FINANCE_PASSWORD || 'hatoba.finance2026'
const COOKIE_NAME = 'hatoba_finance_session'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)
  const isAuthenticated = session?.value === 'authenticated'

  return NextResponse.json({ authenticated: isAuthenticated })
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password || password !== FINANCE_PASSWORD) {
      return NextResponse.json(
        { error: 'Kata sandi / PIN Keuangan salah. Silakan periksa kembali.' },
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

    return NextResponse.json({ success: true, message: 'Login Finance & ERP berhasil.' })
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat proses login keuangan.' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return NextResponse.json({ success: true, message: 'Logout berhasil.' })
}
