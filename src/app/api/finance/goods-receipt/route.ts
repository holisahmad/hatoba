import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getGoodsReceipts, addGoodsReceipt, GoodsReceiptRecord } from '@/lib/finance-store'

async function checkFinanceAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('hatoba_finance_session')?.value === 'authenticated'
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const isAuth = await checkFinanceAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 })
  }

  try {
    const receipts = await getGoodsReceipts()
    return NextResponse.json({ success: true, receipts })
  } catch (err) {
    return NextResponse.json(
      { error: 'Gagal memuat data penerimaan barang: ' + (err as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const isAuth = await checkFinanceAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      receiptDate,
      deliveryNoteNumber,
      sourceOrigin,
      sourceLabel,
      destinationHub,
      carrierName,
      freezerTempCelsius,
      receiverName,
      items,
      notes,
    } = body

    if (!deliveryNoteNumber || !receiverName) {
      return NextResponse.json(
        { error: 'Nomor Surat Jalan dan Nama Petugas Penerima wajib diisi.' },
        { status: 400 }
      )
    }

    const itemsList = Array.isArray(items) && items.length > 0 ? items : []
    const totalPacks = itemsList.reduce((acc, it) => acc + (Number(it.packQuantity) || 0), 0)
    const totalWeightKg = itemsList.reduce((acc, it) => acc + (Number(it.weightKg) || 0), 0)

    const newReceipt = await addGoodsReceipt({
      receiptDate: receiptDate || new Date().toISOString().slice(0, 10),
      deliveryNoteNumber: String(deliveryNoteNumber).trim(),
      sourceOrigin: sourceOrigin || 'PUSAT_BALI',
      sourceLabel: sourceLabel || 'Sentra Produksi Cold Storage HATOBA Bali',
      destinationHub: destinationHub || 'Hub Yogyakarta (Freezer Room)',
      carrierName: carrierName || 'Armada Cold Truck HATOBA',
      freezerTempCelsius: Number(freezerTempCelsius) || -18.5,
      receiverName: String(receiverName).trim(),
      items: itemsList,
      totalPacks,
      totalWeightKg,
      notes: notes || '',
    })

    return NextResponse.json({
      success: true,
      receipt: newReceipt,
      message: 'Bukti Penerimaan Barang (Surat Jalan Masuk) berhasil dicatat!',
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Gagal mencatat penerimaan barang: ' + (err as Error).message },
      { status: 500 }
    )
  }
}
