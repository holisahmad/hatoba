import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getActivityLogs } from '@/lib/admin-store'

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('hatoba_admin_session')?.value === 'authenticated'
}

export async function GET() {
  const isAuth = await checkAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses tidak diizinkan. Silakan login.' }, { status: 401 })
  }

  const logs = await getActivityLogs()
  return NextResponse.json({ success: true, logs })
}

