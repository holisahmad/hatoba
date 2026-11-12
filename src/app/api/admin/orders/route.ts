import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminOrders, updateAdminOrderStatus, addAdminOrder, OrderStatus, AdminOrder } from '@/lib/admin-store'
import { generateReferenceCode } from '@/lib/whatsapp'

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('hatoba_admin_session')?.value === 'authenticated'
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const isAuth = await checkAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses tidak diizinkan. Silakan login.' }, { status: 401 })
  }

  const orders = await getAdminOrders()
  return NextResponse.json({ success: true, orders })
}

// POST create order from POS Kasir
export async function POST(request: Request) {
  const isAuth = await checkAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses tidak diizinkan. Silakan login.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      customerName,
      businessName,
      businessType,
      phone,
      hubArea,
      city,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus,
      paidAmount,
      changeAmount,
      notes,
      marketingName,
      status,
      source,
    } = body

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Nama pelanggan dan rincian item wajib diisi.' },
        { status: 400 }
      )
    }

    const referenceCode = generateReferenceCode('POS')
    const newOrder = await addAdminOrder({
      referenceCode,
      customerName,
      businessName: businessName || '',
      businessType: businessType || 'Restoran / Rumah Makan',
      phone: phone || '-',
      hubArea: hubArea || 'Bali',
      city: city || 'Denpasar',
      marketingName: marketingName || 'Kasir POS',
      notes: notes || '',
      items,
      totalAmount: totalAmount || 0,
      status: status || 'VERIFIED',
      paymentMethod: paymentMethod || 'Tunai',
      paymentStatus: paymentStatus || 'LUNAS',
      source: source || 'POS',
      paidAmount: paidAmount || totalAmount || 0,
      changeAmount: changeAmount || 0,
      verifiedAt: status === 'VERIFIED' ? new Date().toISOString() : undefined,
      statusNotes: `Dibuat via Kasir POS (${paymentMethod || 'Tunai'})`,
    })

    return NextResponse.json({ success: true, order: newOrder })
  } catch (err) {
    console.error('POS order creation error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat menyimpan transaksi kasir.' },
      { status: 500 }
    )
  }
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

