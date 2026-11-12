import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminOrders, updateAdminOrderStatus, OrderStatus } from '@/lib/admin-store'

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('hatoba_admin_session')?.value === 'authenticated'
}

export async function GET() {
  const isAuth = await checkAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses tidak diizinkan. Silakan login.' }, { status: 401 })
  }

  const orders = await getAdminOrders()
  return NextResponse.json({ success: true, orders })
}

export async function PATCH(request: Request) {
  const isAuth = await checkAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses tidak diizinkan. Silakan login.' }, { status: 401 })
  }

  try {
    const { referenceCode, status, notes, adminUser } = await request.json()

    if (!referenceCode || !['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Parameter status atau kode referensi tidak valid.' },
        { status: 400 }
      )
    }

    const updated = await updateAdminOrderStatus(
      referenceCode,
      status as OrderStatus,
      adminUser || 'Admin Pusat',
      notes
    )

    if (!updated) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, order: updated })
  } catch {
    return NextResponse.json(
      { error: 'Gagal memperbarui status pesanan.' },
      { status: 500 }
    )
  }
}

