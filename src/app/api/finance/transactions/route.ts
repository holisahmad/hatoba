import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getFinanceTransactions,
  addFinanceTransaction,
  deleteFinanceTransaction,
  computeFinancialReport,
  generateGeneralJournal,
  getInventorySnapshot,
  getFinanceConfig,
  getStockOpnameHistory,
  getGoodsReceipts,
  FinanceCategory,
} from '@/lib/finance-store'
import { getAdminOrders } from '@/lib/admin-store'

async function checkFinanceAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('hatoba_finance_session')?.value === 'authenticated'
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const isAuth = await checkFinanceAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses ditolak. Sesi keuangan belum login.' }, { status: 401 })
  }

  try {
    const [transactions, report, inventory, config, orders, stockOpnameHistory, goodsReceipts] = await Promise.all([
      getFinanceTransactions(),
      computeFinancialReport(),
      getInventorySnapshot(),
      getFinanceConfig(),
      getAdminOrders(),
      getStockOpnameHistory(),
      getGoodsReceipts(),
    ])

    const journal = generateGeneralJournal(transactions)

    return NextResponse.json({
      success: true,
      transactions,
      report,
      inventory,
      config,
      journal,
      orders,
      stockOpnameHistory,
      goodsReceipts,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Gagal memuat data keuangan: ' + (err as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const isAuth = await checkFinanceAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses ditolak. Sesi keuangan belum login.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      date,
      type,
      category,
      account,
      amount,
      recipientOrPayer,
      notes,
      referenceCode,
      createdBy,
    } = body

    if (!date || !type || !category || !account || !amount || !recipientOrPayer) {
      return NextResponse.json(
        { error: 'Data transaksi tidak lengkap. Pastikan tanggal, tipe, kategori, akun, nominal, dan nama pihak terkait terisi.' },
        { status: 400 }
      )
    }

    const newTx = await addFinanceTransaction({
      date,
      type: type as 'IN' | 'OUT',
      category: category as FinanceCategory,
      account: account as 'KAS' | 'BANK_MANDIRI',
      amount: Number(amount),
      recipientOrPayer: String(recipientOrPayer).trim(),
      notes: notes ? String(notes).trim() : undefined,
      referenceCode: referenceCode ? String(referenceCode).trim() : undefined,
      createdBy: createdBy || 'Manager Keuangan',
    })

    const updatedReport = await computeFinancialReport()

    return NextResponse.json({
      success: true,
      transaction: newTx,
      report: updatedReport,
      message: 'Transaksi keuangan berhasil dicatat dan diposting ke jurnal!',
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Gagal mencatat transaksi: ' + (err as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const isAuth = await checkFinanceAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID transaksi wajib disertakan.' }, { status: 400 })
    }

    await deleteFinanceTransaction(id)
    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus.' })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus transaksi.' }, { status: 500 })
  }
}
