import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateInventorySnapshot, computeFinancialReport } from '@/lib/finance-store'

async function checkFinanceAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('hatoba_finance_session')?.value === 'authenticated'
}

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const isAuth = await checkFinanceAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { totalWeightKg, estimatedValue, notes, date, inspector, freezerTempCelsius } = body

    if (typeof estimatedValue !== 'number') {
      return NextResponse.json({ error: 'Nilai taksiran persediaan wajib berupa angka.' }, { status: 400 })
    }

    const snapshot = await updateInventorySnapshot(
      {
        date: date || new Date().toISOString().slice(0, 10),
        totalWeightKg: Number(totalWeightKg) || 0,
        estimatedValue: Number(estimatedValue),
        notes: notes || 'Stock opname fisik daging & jeroan beku di freezer',
        recordedAt: new Date().toISOString(),
      },
      typeof inspector === 'string' && inspector.trim() ? inspector.trim() : undefined,
      typeof freezerTempCelsius === 'number' || (typeof freezerTempCelsius === 'string' && freezerTempCelsius !== '') ? Number(freezerTempCelsius) : undefined
    )

    const report = await computeFinancialReport()

    return NextResponse.json({
      success: true,
      snapshot,
      report,
      message: 'Nilai persediaan daging beku berhasil diperbarui di Neraca & HPP!',
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Gagal memperbarui persediaan: ' + (err as Error).message },
      { status: 500 }
    )
  }
}
