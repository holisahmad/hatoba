import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateFinanceConfig, computeFinancialReport } from '@/lib/finance-store'

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
    const {
      initialCash,
      initialBank,
      initialInventoryValue,
      initialColdChainAssets,
      initialAccountsPayable,
      ownerInitialCapital,
    } = body

    const config = await updateFinanceConfig({
      initialCash: Number(initialCash),
      initialBank: Number(initialBank),
      initialInventoryValue: Number(initialInventoryValue),
      initialColdChainAssets: Number(initialColdChainAssets),
      initialAccountsPayable: Number(initialAccountsPayable),
      ownerInitialCapital: Number(ownerInitialCapital),
    })

    const report = await computeFinancialReport()

    return NextResponse.json({
      success: true,
      config,
      report,
      message: 'Konfigurasi saldo awal & modal berhasil diperbarui!',
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Gagal memperbarui konfigurasi: ' + (err as Error).message },
      { status: 500 }
    )
  }
}
