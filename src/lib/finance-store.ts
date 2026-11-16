import { supabase } from '@/lib/supabase'
import { getAdminOrders, AdminOrder } from '@/lib/admin-store'

// ==================== CHART OF ACCOUNTS (SAK EMKM SIMPLIFIED) ====================
export interface AccountDef {
  code: string
  name: string
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  normalBalance: 'DEBIT' | 'CREDIT'
}

export const CHART_OF_ACCOUNTS: AccountDef[] = [
  // 1. Aset Lancar & Tetap
  { code: '101', name: 'Kas di Tangan (Kasir / Operasional)', type: 'ASSET', normalBalance: 'DEBIT' },
  { code: '102', name: 'Bank Mandiri (1370016639326 a.n Doni Kristiawan)', type: 'ASSET', normalBalance: 'DEBIT' },
  { code: '103', name: 'Piutang Usaha Konsumen (Tempo HATOBA)', type: 'ASSET', normalBalance: 'DEBIT' },
  { code: '104', name: 'Persediaan Daging & Jeroan Beku Cold Chain', type: 'ASSET', normalBalance: 'DEBIT' },
  { code: '120', name: 'Aset Peralatan Cold Chain (Freezer & Cooler Box)', type: 'ASSET', normalBalance: 'DEBIT' },
  
  // 2. Kewajiban (Hutang)
  { code: '201', name: 'Hutang Usaha / Supplier Daging & RPH', type: 'LIABILITY', normalBalance: 'CREDIT' },
  { code: '202', name: 'Hutang Biaya & Operasional Standby', type: 'LIABILITY', normalBalance: 'CREDIT' },

  // 3. Ekuitas (Modal)
  { code: '301', name: 'Modal Awal Disetor Pemilik', type: 'EQUITY', normalBalance: 'CREDIT' },
  { code: '302', name: 'Prive / Penarikan Dana Pemilik', type: 'EQUITY', normalBalance: 'DEBIT' },
  { code: '303', name: 'Laba Ditahan / Akumulasi Saldo Kas', type: 'EQUITY', normalBalance: 'CREDIT' },

  // 4. Pendapatan
  { code: '401', name: 'Pendapatan Penjualan Daging & Jeroan Sapi', type: 'REVENUE', normalBalance: 'CREDIT' },
  { code: '402', name: 'Pendapatan Lain-lain & Non-Operasional', type: 'REVENUE', normalBalance: 'CREDIT' },
  { code: '403', name: 'Pendapatan Selisih Kas Lebih (Kasir)', type: 'REVENUE', normalBalance: 'CREDIT' },

  // 5. HPP (Harga Pokok Penjualan)
  { code: '501', name: 'HPP - Pembelian Daging & Jeroan Sapi', type: 'EXPENSE', normalBalance: 'DEBIT' },
  { code: '502', name: 'HPP - Biaya Kargo & Ekspedisi Pendingin Masuk', type: 'EXPENSE', normalBalance: 'DEBIT' },

  // 6. Beban Operasional Cold Chain
  { code: '601', name: 'Beban Listrik Cold Storage & Freezer', type: 'EXPENSE', normalBalance: 'DEBIT' },
  { code: '602', name: 'Beban BBM & Pengiriman Armada Frozen', type: 'EXPENSE', normalBalance: 'DEBIT' },
  { code: '603', name: 'Beban Gaji & Upah Staf', type: 'EXPENSE', normalBalance: 'DEBIT' },
  { code: '604', name: 'Beban Kemasan Vacuum Pack & Ice Pack', type: 'EXPENSE', normalBalance: 'DEBIT' },
  { code: '605', name: 'Beban Pemeliharaan & Service Freezer', type: 'EXPENSE', normalBalance: 'DEBIT' },
  { code: '606', name: 'Beban Promosi & Operasional Marketing', type: 'EXPENSE', normalBalance: 'DEBIT' },
  { code: '607', name: 'Beban Administrasi, Bank & Lainnya', type: 'EXPENSE', normalBalance: 'DEBIT' },
  { code: '608', name: 'Beban Selisih Kas Kurang (Kasir / Operasional)', type: 'EXPENSE', normalBalance: 'DEBIT' },
]

export type FinanceCategory =
  | 'INCOME_SALES_CASH'
  | 'INCOME_AR_COLLECTION'
  | 'INCOME_EQUITY_INJECTION'
  | 'INCOME_OTHER'
  | 'INCOME_CASH_OVERAGE'
  | 'EXPENSE_MEAT_PURCHASE'
  | 'EXPENSE_FREIGHT_IN'
  | 'EXPENSE_PAY_SUPPLIER'
  | 'EXPENSE_COLD_ELECTRICITY'
  | 'EXPENSE_FUEL_TRANSPORT'
  | 'EXPENSE_SALARY'
  | 'EXPENSE_PACKAGING'
  | 'EXPENSE_FREEZER_MAINTENANCE'
  | 'EXPENSE_MARKETING'
  | 'EXPENSE_ASSET_PURCHASE'
  | 'EXPENSE_OWNER_DRAW'
  | 'EXPENSE_OTHER'
  | 'EXPENSE_CASH_SHORTAGE'

export interface CategoryOption {
  key: FinanceCategory
  label: string
  type: 'IN' | 'OUT'
  defaultAccountDebit: string
  defaultAccountCredit: string
  cashFlowCategory: 'OPERATING' | 'INVESTING' | 'FINANCING'
}

export const CATEGORY_OPTIONS: Record<FinanceCategory, CategoryOption> = {
  INCOME_SALES_CASH: {
    key: 'INCOME_SALES_CASH',
    label: 'Penjualan Tunai / Lunas Kasir (Cash Sales)',
    type: 'IN',
    defaultAccountDebit: '101', // Kas
    defaultAccountCredit: '401', // Pendapatan Penjualan
    cashFlowCategory: 'OPERATING',
  },
  INCOME_AR_COLLECTION: {
    key: 'INCOME_AR_COLLECTION',
    label: 'Penerimaan Pelunasan Piutang Konsumen Tempo',
    type: 'IN',
    defaultAccountDebit: '102', // Bank Mandiri
    defaultAccountCredit: '103', // Piutang Usaha
    cashFlowCategory: 'OPERATING',
  },
  INCOME_EQUITY_INJECTION: {
    key: 'INCOME_EQUITY_INJECTION',
    label: 'Setoran Tambahan Modal Pemilik (Injeksi Kas)',
    type: 'IN',
    defaultAccountDebit: '102',
    defaultAccountCredit: '301',
    cashFlowCategory: 'FINANCING',
  },
  INCOME_OTHER: {
    key: 'INCOME_OTHER',
    label: 'Pendapatan Lain-lain / Cashback / Jual Kardus',
    type: 'IN',
    defaultAccountDebit: '101',
    defaultAccountCredit: '402',
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_MEAT_PURCHASE: {
    key: 'EXPENSE_MEAT_PURCHASE',
    label: 'Pembelian Stok Daging & Jeroan Beku (HPP Daging)',
    type: 'OUT',
    defaultAccountDebit: '104', // Persediaan Daging (Aset)
    defaultAccountCredit: '102', // Bank
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_FREIGHT_IN: {
    key: 'EXPENSE_FREIGHT_IN',
    label: 'Ongkir Kargo Beku / Ekspedisi Pendingin Masuk',
    type: 'OUT',
    defaultAccountDebit: '502',
    defaultAccountCredit: '102',
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_PAY_SUPPLIER: {
    key: 'EXPENSE_PAY_SUPPLIER',
    label: 'Pelunasan Hutang ke Supplier Daging / RPH',
    type: 'OUT',
    defaultAccountDebit: '201',
    defaultAccountCredit: '102',
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_COLD_ELECTRICITY: {
    key: 'EXPENSE_COLD_ELECTRICITY',
    label: 'Biaya Listrik PLN Freezer & Cold Storage',
    type: 'OUT',
    defaultAccountDebit: '601',
    defaultAccountCredit: '102',
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_FUEL_TRANSPORT: {
    key: 'EXPENSE_FUEL_TRANSPORT',
    label: 'BBM & Tol Armada Pengiriman Pendingin',
    type: 'OUT',
    defaultAccountDebit: '602',
    defaultAccountCredit: '101',
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_SALARY: {
    key: 'EXPENSE_SALARY',
    label: 'Gaji / Upah Staf Operasional & Gudang',
    type: 'OUT',
    defaultAccountDebit: '603',
    defaultAccountCredit: '102',
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_PACKAGING: {
    key: 'EXPENSE_PACKAGING',
    label: 'Beli Plastik Vacuum Seal, Ice Pack & Stiker Logo',
    type: 'OUT',
    defaultAccountDebit: '604',
    defaultAccountCredit: '101',
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_FREEZER_MAINTENANCE: {
    key: 'EXPENSE_FREEZER_MAINTENANCE',
    label: 'Service / Perawatan Kompresor & Freezer Suhu -18°C',
    type: 'OUT',
    defaultAccountDebit: '605',
    defaultAccountCredit: '102',
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_MARKETING: {
    key: 'EXPENSE_MARKETING',
    label: 'Beban Promosi & Komisi Staf Marketing',
    type: 'OUT',
    defaultAccountDebit: '606',
    defaultAccountCredit: '102',
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_ASSET_PURCHASE: {
    key: 'EXPENSE_ASSET_PURCHASE',
    label: 'Investasi Aset: Beli Chest Freezer / Cooler Box Baru',
    type: 'OUT',
    defaultAccountDebit: '120', // Aset Tetap
    defaultAccountCredit: '102',
    cashFlowCategory: 'INVESTING',
  },
  EXPENSE_OWNER_DRAW: {
    key: 'EXPENSE_OWNER_DRAW',
    label: 'Prive / Penarikan Dana Pribadi Pemilik',
    type: 'OUT',
    defaultAccountDebit: '302', // Prive
    defaultAccountCredit: '102',
    cashFlowCategory: 'FINANCING',
  },
  EXPENSE_OTHER: {
    key: 'EXPENSE_OTHER',
    label: 'Biaya Administrasi Bank & Operasional Umum',
    type: 'OUT',
    defaultAccountDebit: '607',
    defaultAccountCredit: '101',
    cashFlowCategory: 'OPERATING',
  },
  INCOME_CASH_OVERAGE: {
    key: 'INCOME_CASH_OVERAGE',
    label: 'Selisih Kas Lebih (Kelebihan Uang Fisik Kasir)',
    type: 'IN',
    defaultAccountDebit: '101', // Kas di Tangan
    defaultAccountCredit: '403', // Pendapatan Selisih Kas Lebih
    cashFlowCategory: 'OPERATING',
  },
  EXPENSE_CASH_SHORTAGE: {
    key: 'EXPENSE_CASH_SHORTAGE',
    label: 'Selisih Kas Kurang (Beban Selisih Uang Fisik Kasir)',
    type: 'OUT',
    defaultAccountDebit: '608', // Beban Selisih Kas Kurang
    defaultAccountCredit: '101', // Kas di Tangan
    cashFlowCategory: 'OPERATING',
  },
}

export interface FinanceTransaction {
  id: string
  date: string // YYYY-MM-DD
  type: 'IN' | 'OUT'
  category: FinanceCategory
  account: 'KAS' | 'BANK_MANDIRI'
  amount: number
  recipientOrPayer: string
  notes?: string
  referenceCode?: string // Nomor order penjualan jika relevan
  createdAt: string
  createdBy: string
}

export interface JournalLine {
  accountCode: string
  accountName: string
  debit: number
  credit: number
}

export interface JournalEntry {
  id: string
  transactionId: string
  date: string
  referenceNo: string
  description: string
  lines: JournalLine[]
}

export interface InventorySnapshot {
  date: string
  totalWeightKg: number
  estimatedValue: number
  notes: string
  recordedAt: string
}

export interface InitialCapitalConfig {
  initialCash: number
  initialBank: number
  initialInventoryValue: number
  initialColdChainAssets: number
  initialAccountsPayable: number
  ownerInitialCapital: number
  lastUpdated: string
}

// In-Memory Storage & Fallback Cache
let cachedTransactions: FinanceTransaction[] = [
  {
    id: 'FTX-20261101-001',
    date: '2026-11-01',
    type: 'IN',
    category: 'INCOME_EQUITY_INJECTION',
    account: 'BANK_MANDIRI',
    amount: 35000000,
    recipientOrPayer: 'Doni Kristiawan (Setoran Modal Pemilik)',
    notes: 'Modal awal operasional perputaran kas HATOBA',
    createdAt: '2026-11-01T08:00:00Z',
    createdBy: 'Finance Manager',
  },
  {
    id: 'FTX-20261102-002',
    date: '2026-11-02',
    type: 'OUT',
    category: 'EXPENSE_ASSET_PURCHASE',
    account: 'BANK_MANDIRI',
    amount: 12500000,
    recipientOrPayer: 'Toko Pendingin Denpasar',
    notes: 'Beli 2 unit Chest Freezer 600L suhu -18°C',
    createdAt: '2026-11-02T10:30:00Z',
    createdBy: 'Finance Manager',
  },
  {
    id: 'FTX-20261103-003',
    date: '2026-11-03',
    type: 'OUT',
    category: 'EXPENSE_MEAT_PURCHASE',
    account: 'BANK_MANDIRI',
    amount: 15400000,
    recipientOrPayer: 'RPH / Supplier Sapi',
    notes: 'Pembelian bahan baku Babat, Iso & Iga Sapi 220 kg',
    createdAt: '2026-11-03T11:00:00Z',
    createdBy: 'Finance Manager',
  },
  {
    id: 'FTX-20261104-004',
    date: '2026-11-04',
    type: 'OUT',
    category: 'EXPENSE_PACKAGING',
    account: 'KAS',
    amount: 750000,
    recipientOrPayer: 'Sentra Plastik & Vacuum',
    notes: 'Plastik vacuum seal food grade + ice pack',
    createdAt: '2026-11-04T13:00:00Z',
    createdBy: 'Kasir',
  },
  {
    id: 'FTX-20261108-005',
    date: '2026-11-08',
    type: 'IN',
    category: 'INCOME_AR_COLLECTION',
    account: 'BANK_MANDIRI',
    amount: 3825000,
    recipientOrPayer: 'Warung Bu Kris Denpasar',
    referenceCode: 'HTB-ORD-20261105-8821',
    notes: 'Pelunasan tagihan tempo invoice INV-HTB-ORD-20261105-8821',
    createdAt: '2026-11-08T14:15:00Z',
    createdBy: 'Finance Manager',
  },
  {
    id: 'FTX-20261112-006',
    date: '2026-11-12',
    type: 'OUT',
    category: 'EXPENSE_COLD_ELECTRICITY',
    account: 'BANK_MANDIRI',
    amount: 1450000,
    recipientOrPayer: 'PLN Pascabayar',
    notes: 'Listrik operasional freezer gudang cold chain',
    createdAt: '2026-11-12T09:00:00Z',
    createdBy: 'Finance Manager',
  },
]

let cachedInventory: InventorySnapshot = {
  date: new Date().toISOString().slice(0, 10),
  totalWeightKg: 185,
  estimatedValue: 12950000, // Rp 12.950.000 (185 kg @ 70rb rata-rata HPP)
  notes: 'Stok fisik daging & jeroan beku tersimpan rapi di freezer -18°C',
  recordedAt: new Date().toISOString(),
}

let cachedConfig: InitialCapitalConfig = {
  initialCash: 1500000,
  initialBank: 35000000,
  initialInventoryValue: 10000000,
  initialColdChainAssets: 12500000,
  initialAccountsPayable: 4500000,
  ownerInitialCapital: 54500000, // 1.5M + 35M + 10M + 12.5M - 4.5M
  lastUpdated: new Date().toISOString(),
}

// ==================== STORE ACCESS FUNCTIONS ====================
export async function getFinanceTransactions(): Promise<FinanceTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('hatoba_finance_tx')
      .select('data')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      cachedTransactions = data.map((d) => d.data as FinanceTransaction)
    }
  } catch {
    // Keep in-memory cache
  }
  return cachedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function addFinanceTransaction(
  payload: Omit<FinanceTransaction, 'id' | 'createdAt'>
): Promise<FinanceTransaction> {
  const newTx: FinanceTransaction = {
    ...payload,
    id: `FTX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
  }

  cachedTransactions.unshift(newTx)

  try {
    await supabase.from('hatoba_finance_tx').insert({
      id: newTx.id,
      created_at: newTx.createdAt,
      data: newTx,
    })
  } catch {
    // In-memory persists
  }

  return newTx
}

export async function deleteFinanceTransaction(id: string): Promise<boolean> {
  cachedTransactions = cachedTransactions.filter((tx) => tx.id !== id)
  try {
    await supabase.from('hatoba_finance_tx').delete().eq('id', id)
  } catch {
    // In-memory persists
  }
  return true
}

export async function getInventorySnapshot(): Promise<InventorySnapshot> {
  return cachedInventory
}

export async function updateInventorySnapshot(snapshot: InventorySnapshot): Promise<InventorySnapshot> {
  cachedInventory = snapshot
  return cachedInventory
}

export async function getFinanceConfig(): Promise<InitialCapitalConfig> {
  return cachedConfig
}

export async function updateFinanceConfig(config: Partial<InitialCapitalConfig>): Promise<InitialCapitalConfig> {
  cachedConfig = { ...cachedConfig, ...config, lastUpdated: new Date().toISOString() }
  return cachedConfig
}

// ==================== CASHIER RECONCILIATION ENGINE ====================
export interface CashierReconciliation {
  id: string
  date: string
  shiftLabel: string
  systemCashTotal: number
  actualCashCounted: number
  cashDiscrepancy: number
  systemTransferTotal: number
  bankVerifiedTotal: number
  transferDiscrepancy: number
  status: 'BALANCED' | 'DISCREPANCY_RESOLVED' | 'DISCREPANCY_PENDING'
  resolutionAction?: 'POTONG_KASIR' | 'BEBAN_PERUSAHAAN' | 'PENDAPATAN_LAIN' | 'SUDAH_COCOK'
  notes?: string
  reconciledBy: string
  reconciledAt: string
}

let cachedReconciliations: CashierReconciliation[] = [
  {
    id: 'REC-20261115-01',
    date: '2026-11-15',
    shiftLabel: 'Tutup Kasir Harian 15 Nov 2026',
    systemCashTotal: 4850000,
    actualCashCounted: 4850000,
    cashDiscrepancy: 0,
    systemTransferTotal: 8320000,
    bankVerifiedTotal: 8320000,
    transferDiscrepancy: 0,
    status: 'BALANCED',
    resolutionAction: 'SUDAH_COCOK',
    notes: 'Kasir fisik uang pas Rp 4.850.000, mutasi Bank Mandiri klop 100%.',
    reconciledBy: 'Finance Lead',
    reconciledAt: '2026-11-15T21:00:00Z',
  },
]

export async function getCashierReconciliations(): Promise<CashierReconciliation[]> {
  try {
    const { data, error } = await supabase
      .from('hatoba_cashier_reconciliations')
      .select('data')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      cachedReconciliations = data.map((d) => d.data as CashierReconciliation)
    }
  } catch {
    // in-memory fallback
  }
  return cachedReconciliations
}

export async function addCashierReconciliation(
  payload: Omit<CashierReconciliation, 'id' | 'reconciledAt'>
): Promise<CashierReconciliation> {
  const newRec: CashierReconciliation = {
    ...payload,
    id: `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
    reconciledAt: new Date().toISOString(),
  }

  cachedReconciliations.unshift(newRec)

  // Otomatis buat transaksi keuangan jika ada selisih kas fisik
  if (newRec.cashDiscrepancy !== 0) {
    if (newRec.cashDiscrepancy < 0 && newRec.resolutionAction === 'BEBAN_PERUSAHAAN') {
      await addFinanceTransaction({
        date: newRec.date,
        type: 'OUT',
        category: 'EXPENSE_CASH_SHORTAGE',
        account: 'KAS',
        amount: Math.abs(newRec.cashDiscrepancy),
        recipientOrPayer: `Selisih Kasir (${newRec.shiftLabel})`,
        notes: `Penyesuaian selisih kas fisik kurang Rp ${Math.abs(newRec.cashDiscrepancy).toLocaleString('id-ID')}`,
        createdBy: newRec.reconciledBy,
      })
    } else if (newRec.cashDiscrepancy > 0) {
      await addFinanceTransaction({
        date: newRec.date,
        type: 'IN',
        category: 'INCOME_CASH_OVERAGE',
        account: 'KAS',
        amount: newRec.cashDiscrepancy,
        recipientOrPayer: `Selisih Kasir (${newRec.shiftLabel})`,
        notes: `Kelebihan kas fisik laci kasir Rp ${newRec.cashDiscrepancy.toLocaleString('id-ID')}`,
        createdBy: newRec.reconciledBy,
      })
    }
  }

  try {
    await supabase.from('hatoba_cashier_reconciliations').insert({
      id: newRec.id,
      created_at: newRec.reconciledAt,
      data: newRec,
    })
  } catch {
    // in-memory persists
  }

  return newRec
}

// ==================== AUTOMATIC DOUBLE-ENTRY JOURNAL ENGINE ====================
export function generateGeneralJournal(transactions: FinanceTransaction[]): JournalEntry[] {
  return transactions.map((tx) => {
    const cat = CATEGORY_OPTIONS[tx.category] || CATEGORY_OPTIONS.INCOME_OTHER
    const lines: JournalLine[] = []

    const paymentAccountCode = tx.account === 'KAS' ? '101' : '102'
    const paymentAccountName = tx.account === 'KAS' ? 'Kas di Tangan' : 'Bank Mandiri (1370016639326)'

    if (tx.type === 'IN') {
      // Debit: Kas / Bank
      lines.push({
        accountCode: paymentAccountCode,
        accountName: paymentAccountName,
        debit: tx.amount,
        credit: 0,
      })
      // Credit: Akun Pendapatan / Piutang / Modal
      const creditAcc = CHART_OF_ACCOUNTS.find((a) => a.code === cat.defaultAccountCredit)
      lines.push({
        accountCode: cat.defaultAccountCredit,
        accountName: creditAcc ? creditAcc.name : 'Pendapatan / Akun Terkait',
        debit: 0,
        credit: tx.amount,
      })
    } else {
      // Pengeluaran (OUT)
      // Debit: Akun Beban / Persediaan / Aset / Prive
      const debitAcc = CHART_OF_ACCOUNTS.find((a) => a.code === cat.defaultAccountDebit)
      lines.push({
        accountCode: cat.defaultAccountDebit,
        accountName: debitAcc ? debitAcc.name : 'Beban / Persediaan Terkait',
        debit: tx.amount,
        credit: 0,
      })
      // Credit: Kas / Bank
      lines.push({
        accountCode: paymentAccountCode,
        accountName: paymentAccountName,
        debit: 0,
        credit: tx.amount,
      })
    }

    return {
      id: `JRN-${tx.id}`,
      transactionId: tx.id,
      date: tx.date,
      referenceNo: tx.referenceCode || tx.id,
      description: `${cat.label} — ${tx.recipientOrPayer}${tx.notes ? ` (${tx.notes})` : ''}`,
      lines,
    }
  })
}

// ==================== FINANCIAL STATEMENTS ENGINE (SAK EMKM) ====================
export interface ComprehensiveFinancialReport {
  // 1. Kas & Bank Riil Saat Ini
  realCash: number
  realBank: number
  totalLiquidCash: number

  // 2. Piutang Usaha Konsumen (Dari Order Tempo / DP)
  totalReceivables: number // Total Piutang Belum Lunas
  receivablesCurrent: number // Belum Jatuh Tempo (0-3 hari)
  receivablesOverdue: number // Lewat Jatuh Tempo (>3 hari)
  pendingTempoOrders: AdminOrder[]

  // 3. Persediaan & HPP
  inventoryValue: number
  totalMeatPurchases: number
  totalFreightIn: number
  estimatedHPP: number

  // 4. Laba Rugi Operasional (Income Statement)
  grossSalesFromOrders: number
  cashSalesDirect: number
  totalSalesRevenue: number
  grossProfitMarginRp: number
  grossProfitMarginPercent: number
  totalOperatingExpenses: number
  netOperatingIncome: number

  // 5. Arus Kas (Cash Flow Statement)
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  netCashChange: number

  // 6. Laporan Perubahan Modal
  beginningEquity: number
  capitalInjection: number
  netIncome: number
  ownerDraws: number
  endingEquity: number

  // 7. Neraca Sederhana (Balance Sheet)
  balanceSheet: {
    assets: {
      cashAndBank: number
      accountsReceivable: number
      inventory: number
      coldChainFixedAssets: number
      totalAssets: number
    }
    liabilitiesAndEquity: {
      accountsPayable: number
      endingEquity: number
      totalLiabilitiesAndEquity: number
    }
    isBalanced: boolean
    discrepancy: number
  }

  // 8. Financial Health Metrics
  cashToDebtRatio: number
  workingCapital: number
  arToSalesRatio: number

  // 9. Kasir POS & Bank Reconciliation Stats
  posReconciliationStats: {
    systemTotalCash: number
    systemTotalTransfer: number
    systemTotalTempo: number
    recentReconciliations: CashierReconciliation[]
  }
}

export async function computeFinancialReport(): Promise<ComprehensiveFinancialReport> {
  const [transactions, orders, config, inventory, reconciliations] = await Promise.all([
    getFinanceTransactions(),
    getAdminOrders(),
    getFinanceConfig(),
    getInventorySnapshot(),
    getCashierReconciliations(),
  ])

  // --- 1. Kas & Bank Real Calculation ---
  let cashBalance = config.initialCash
  let bankBalance = config.initialBank

  transactions.forEach((tx) => {
    if (tx.account === 'KAS') {
      cashBalance += tx.type === 'IN' ? tx.amount : -tx.amount
    } else {
      bankBalance += tx.type === 'IN' ? tx.amount : -tx.amount
    }
  })

  // --- 2. Piutang Usaha (AR) Real-Time from Orders ---
  let totalReceivables = 0
  let receivablesCurrent = 0
  let receivablesOverdue = 0
  const pendingTempoOrders: AdminOrder[] = []

  const now = new Date()

  orders.forEach((o) => {
    // Only calculate for active/verified orders (not rejected)
    if (o.status !== 'REJECTED') {
      const remainingUnpaid = Math.max(0, o.totalAmount - (o.paidAmount || 0))
      if (remainingUnpaid > 0 && o.paymentStatus !== 'LUNAS') {
        totalReceivables += remainingUnpaid
        pendingTempoOrders.push(o)

        const due = o.dueDate ? new Date(o.dueDate) : new Date(new Date(o.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000)
        if (now.getTime() > due.getTime()) {
          receivablesOverdue += remainingUnpaid
        } else {
          receivablesCurrent += remainingUnpaid
        }
      }
    }
  })

  // --- 3. Penjualan & Revenue ---
  // Penjualan terverifikasi dari modul penjualan
  const grossSalesFromOrders = orders
    .filter((o) => o.status === 'VERIFIED')
    .reduce((acc, o) => acc + o.totalAmount, 0)

  // Penjualan tunai dari transaksi keuangan langsung
  const cashSalesDirect = transactions
    .filter((t) => t.category === 'INCOME_SALES_CASH')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalSalesRevenue = grossSalesFromOrders > 0 ? grossSalesFromOrders : cashSalesDirect

  // --- 4. HPP & Persediaan ---
  const totalMeatPurchases = transactions
    .filter((t) => t.category === 'EXPENSE_MEAT_PURCHASE')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalFreightIn = transactions
    .filter((t) => t.category === 'EXPENSE_FREIGHT_IN')
    .reduce((acc, t) => acc + t.amount, 0)

  // HPP = Persediaan Awal + Pembelian Daging + Ongkir Kargo Masuk - Persediaan Akhir
  const initialInv = config.initialInventoryValue
  const endingInv = inventory.estimatedValue
  const estimatedHPP = Math.max(0, initialInv + totalMeatPurchases + totalFreightIn - endingInv)

  // Margin Kotor (Gross Profit) = Penjualan - HPP
  const grossProfitMarginRp = totalSalesRevenue - estimatedHPP
  const grossProfitMarginPercent = totalSalesRevenue > 0 ? (grossProfitMarginRp / totalSalesRevenue) * 100 : 0

  // --- 5. Beban Operasional ---
  const operatingExpensesCategories: FinanceCategory[] = [
    'EXPENSE_COLD_ELECTRICITY',
    'EXPENSE_FUEL_TRANSPORT',
    'EXPENSE_SALARY',
    'EXPENSE_PACKAGING',
    'EXPENSE_FREEZER_MAINTENANCE',
    'EXPENSE_MARKETING',
    'EXPENSE_OTHER',
  ]

  const totalOperatingExpenses = transactions
    .filter((t) => operatingExpensesCategories.includes(t.category))
    .reduce((acc, t) => acc + t.amount, 0)

  const netOperatingIncome = grossProfitMarginRp - totalOperatingExpenses

  // --- 6. Arus Kas (Cash Flow Statement) ---
  let operatingIn = 0
  let operatingOut = 0
  let investingIn = 0
  let investingOut = 0
  let financingIn = 0
  let financingOut = 0

  transactions.forEach((tx) => {
    const cat = CATEGORY_OPTIONS[tx.category]
    const cfType = cat?.cashFlowCategory || 'OPERATING'

    if (cfType === 'OPERATING') {
      if (tx.type === 'IN') operatingIn += tx.amount
      else operatingOut += tx.amount
    } else if (cfType === 'INVESTING') {
      if (tx.type === 'IN') investingIn += tx.amount
      else investingOut += tx.amount
    } else if (cfType === 'FINANCING') {
      if (tx.type === 'IN') financingIn += tx.amount
      else financingOut += tx.amount
    }
  })

  const operatingCashFlow = operatingIn - operatingOut
  const investingCashFlow = investingIn - investingOut
  const financingCashFlow = financingIn - financingOut
  const netCashChange = operatingCashFlow + investingCashFlow + financingCashFlow

  // --- 7. Laporan Perubahan Modal (Statement of Changes in Equity) ---
  const beginningEquity = config.ownerInitialCapital
  const capitalInjection = transactions
    .filter((t) => t.category === 'INCOME_EQUITY_INJECTION')
    .reduce((acc, t) => acc + t.amount, 0)
  const ownerDraws = transactions
    .filter((t) => t.category === 'EXPENSE_OWNER_DRAW')
    .reduce((acc, t) => acc + t.amount, 0)

  const endingEquity = beginningEquity + capitalInjection + netOperatingIncome - ownerDraws

  // --- 8. Neraca Sederhana (Balance Sheet) ---
  // Aset Tetap Cold Chain
  const newAssetPurchases = transactions
    .filter((t) => t.category === 'EXPENSE_ASSET_PURCHASE')
    .reduce((acc, t) => acc + t.amount, 0)
  const coldChainFixedAssets = config.initialColdChainAssets + newAssetPurchases

  const totalAssets = cashBalance + bankBalance + totalReceivables + endingInv + coldChainFixedAssets

  // Hutang Supplier (AP)
  const debtRepayment = transactions
    .filter((t) => t.category === 'EXPENSE_PAY_SUPPLIER')
    .reduce((acc, t) => acc + t.amount, 0)
  const accountsPayable = Math.max(0, config.initialAccountsPayable - debtRepayment)

  const totalLiabilitiesAndEquity = accountsPayable + endingEquity
  const discrepancy = Math.abs(totalAssets - totalLiabilitiesAndEquity)
  const isBalanced = discrepancy < 1000 // toleransi pembulatan

  // --- POS Cashier & Bank Sales Totals ---
  let systemTotalCash = 0
  let systemTotalTransfer = 0
  let systemTotalTempo = 0

  orders.forEach((o) => {
    if (o.status !== 'REJECTED') {
      const method = (o.paymentMethod || '').toLowerCase()
      const paid = o.paidAmount || 0
      if (o.paymentStatus === 'LUNAS') {
        if (method.includes('tunai') || method.includes('cash')) {
          systemTotalCash += o.totalAmount
        } else {
          systemTotalTransfer += o.totalAmount
        }
      } else if (o.paymentStatus === 'DP') {
        if (method.includes('tunai') || method.includes('cash')) {
          systemTotalCash += paid
        } else {
          systemTotalTransfer += paid
        }
        systemTotalTempo += Math.max(0, o.totalAmount - paid)
      } else if (o.paymentStatus === 'TEMPO') {
        systemTotalTempo += o.totalAmount
      }
    }
  })

  return {
    realCash: cashBalance,
    realBank: bankBalance,
    totalLiquidCash: cashBalance + bankBalance,

    totalReceivables,
    receivablesCurrent,
    receivablesOverdue,
    pendingTempoOrders,

    inventoryValue: endingInv,
    totalMeatPurchases,
    totalFreightIn,
    estimatedHPP,

    grossSalesFromOrders,
    cashSalesDirect,
    totalSalesRevenue,
    grossProfitMarginRp,
    grossProfitMarginPercent,
    totalOperatingExpenses,
    netOperatingIncome,

    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,
    netCashChange,

    beginningEquity,
    capitalInjection,
    netIncome: netOperatingIncome,
    ownerDraws,
    endingEquity,

    balanceSheet: {
      assets: {
        cashAndBank: cashBalance + bankBalance,
        accountsReceivable: totalReceivables,
        inventory: endingInv,
        coldChainFixedAssets,
        totalAssets,
      },
      liabilitiesAndEquity: {
        accountsPayable,
        endingEquity,
        totalLiabilitiesAndEquity,
      },
      isBalanced,
      discrepancy,
    },

    cashToDebtRatio: accountsPayable > 0 ? (cashBalance + bankBalance) / accountsPayable : 99,
    workingCapital: cashBalance + bankBalance + totalReceivables + endingInv - accountsPayable,
    arToSalesRatio: totalSalesRevenue > 0 ? (totalReceivables / totalSalesRevenue) * 100 : 0,

    posReconciliationStats: {
      systemTotalCash,
      systemTotalTransfer,
      systemTotalTempo,
      recentReconciliations: reconciliations,
    },
  }
}
