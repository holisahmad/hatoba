import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getCashierReconciliations,
  addCashierReconciliation,
  computeFinancialReport,
} from '@/lib/finance-store'

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

  const reconciliations = await getCashierReconciliations()
  return NextResponse.json({ success: true, reconciliations })
}

export async function POST(request: Request) {
  const isAuth = await checkFinanceAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      date,
      shiftLabel,
      systemCashTotal,
      actualCashCounted,
      systemTransferTotal,
      bankVerifiedTotal,
      resolutionAction,
      notes,
      reconciledBy,
    } = body

    const cashDiff = Number(actualCashCounted) - Number(systemCashTotal)
    const transferDiff = Number(bankVerifiedTotal) - Number(systemTransferTotal)

    const status =
      cashDiff === 0 && transferDiff === 0
        ? 'BALANCED'
        : resolutionAction && resolutionAction !== 'PENDING'
        ? 'DISCREPANCY_RESOLVED'
        : 'DISCREPANCY_PENDING'

    const newRec = await addCashierReconciliation({
      date: date || new Date().toISOString().slice(0, 10),
      shiftLabel: shiftLabel || `Tutup Kasir ${date || 'Hari Ini'}`,
      systemCashTotal: Number(systemCashTotal) || 0,
      actualCashCounted: Number(actualCashCounted) || 0,
      cashDiscrepancy: cashDiff,
      systemTransferTotal: Number(systemTransferTotal) || 0,
      bankVerifiedTotal: Number(bankVerifiedTotal) || 0,
      transferDiscrepancy: transferDiff,
      status,
      resolutionAction: resolutionAction || (cashDiff === 0 ? 'SUDAH_COCOK' : 'PENDING'),
      notes: notes || undefined,
      reconciledBy: reconciledBy || 'Finance Kasir',
    })

    const report = await computeFinancialReport()

    return NextResponse.json({
      success: true,
      reconciliation: newRec,
      report,
      message: 'Rekonsiliasi tutup kasir & bank berhasil disimpan dan dijurnal!',
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Gagal memproses rekonsiliasi: ' + (err as Error).message },
      { status: 500 }
    )
  }
}
