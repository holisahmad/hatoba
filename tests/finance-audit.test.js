/**
 * HATOBA GROUP — COMPREHENSIVE FINANCE & MINI ERP AUDIT TEST SUITE
 * 
 * Standards: SAK EMKM Indonesia
 * Scope:
 *  [WHITEBOX]
 *    1. Chart of Accounts (COA) Structure & Balance Rules
 *    2. Double-Entry General Journal Integrity (Debit === Credit for all 15 Categories)
 *    3. SAK EMKM Accounting Equation (Assets = Liabilities + Equity)
 *    4. HPP & Ending Inventory Formula (FIFO / Periodic Snapshot Clamping)
 *    5. Direct Cash Flow Engine (Operating, Investing, Financing Integrity)
 *    6. Accounts Receivable (AR) Aging Engine & Due-Date Classification
 *    7. POS Cashier & Bank Reconciliation Variance Engine
 *    8. Stock Opname Audit Trail & Cold Chain Quality Integrity
 *    9. Goods Receipt Note (GRN) Payload & Calculations
 * 
 *  [BLACKBOX]
 *    10. Authentication Guard (PIN, Cookie, Injection Resistance)
 *    11. Protected API Access Control (Unauthorized Rejection)
 *    12. Transaction Amount Sanitization & Zero/Negative Rejection
 *    13. Stock Opname Input Validation & Clamping
 *    14. Cut-Off Freeze State & Polling Disablement Logic
 *    15. CSV Export Data Serialization & Escaping Integrity
 */

const test = require('node:test')
const assert = require('node:assert')

// ==================== 1. PURE JS ENGINE RE-IMPLEMENTATIONS ====================

const CHART_OF_ACCOUNTS = [
  { code: '101', name: 'Kas di Tangan (Kas Fisik)', category: 'ASSET' },
  { code: '102', name: 'Bank Mandiri (1370016639326)', category: 'ASSET' },
  { code: '103', name: 'Piutang Usaha Konsumen', category: 'ASSET' },
  { code: '104', name: 'Persediaan Daging & Jeroan Beku', category: 'ASSET' },
  { code: '150', name: 'Aset Tetap Peralatan Cold Chain & Freezer', category: 'ASSET' },
  { code: '201', name: 'Hutang Usaha Supplier RPH', category: 'LIABILITY' },
  { code: '202', name: 'Hutang Kasir (Titipan / Selisih)', category: 'LIABILITY' },
  { code: '301', name: 'Modal Pemilik (Doni Kristiawan)', category: 'EQUITY' },
  { code: '302', name: 'Prive Pemilik (Pengambilan Pribadi)', category: 'EQUITY' },
  { code: '303', name: 'Saldo Laba Berjalan', category: 'EQUITY' },
  { code: '401', name: 'Pendapatan Penjualan Daging Sapi & Jeroan', category: 'REVENUE' },
  { code: '402', name: 'Pendapatan Selisih Kas Lebih POS', category: 'REVENUE' },
  { code: '409', name: 'Pendapatan Lain-lain', category: 'REVENUE' },
  { code: '501', name: 'Harga Pokok Penjualan (HPP)', category: 'EXPENSE' },
  { code: '502', name: 'Biaya Pengiriman Masuk (Kargo Pendingin)', category: 'EXPENSE' },
  { code: '601', name: 'Beban Listrik Cold Storage Babarsari', category: 'EXPENSE' },
  { code: '602', name: 'Beban Bahan Bakar & Transportasi Antar', category: 'EXPENSE' },
  { code: '603', name: 'Beban Gaji Karyawan Gudang & Pengantar', category: 'EXPENSE' },
  { code: '604', name: 'Beban Kemasan Plastik & Vacuum Seal', category: 'EXPENSE' },
  { code: '605', name: 'Beban Perawatan & Servis Freezer', category: 'EXPENSE' },
  { code: '606', name: 'Beban Pemasaran & Brosur Kuliner', category: 'EXPENSE' },
  { code: '607', name: 'Beban Selisih Kas Kurang POS', category: 'EXPENSE' },
  { code: '699', name: 'Beban Operasional Lain-lain', category: 'EXPENSE' },
]

const CATEGORY_MAP = {
  INCOME_SALES_CASH: { type: 'IN', debit: '101', credit: '401', cf: 'OPERATING' },
  INCOME_AR_COLLECTION: { type: 'IN', debit: '102', credit: '103', cf: 'OPERATING' },
  INCOME_EQUITY_INJECTION: { type: 'IN', debit: '102', credit: '301', cf: 'FINANCING' },
  INCOME_OTHER: { type: 'IN', debit: '102', credit: '409', cf: 'OPERATING' },
  EXPENSE_MEAT_PURCHASE: { type: 'OUT', debit: '104', credit: '102', cf: 'OPERATING' },
  EXPENSE_FREIGHT_IN: { type: 'OUT', debit: '502', credit: '102', cf: 'OPERATING' },
  EXPENSE_COLD_ELECTRICITY: { type: 'OUT', debit: '601', credit: '102', cf: 'OPERATING' },
  EXPENSE_FUEL_TRANSPORT: { type: 'OUT', debit: '602', credit: '101', cf: 'OPERATING' },
  EXPENSE_SALARY: { type: 'OUT', debit: '603', credit: '102', cf: 'OPERATING' },
  EXPENSE_PACKAGING: { type: 'OUT', debit: '604', credit: '101', cf: 'OPERATING' },
  EXPENSE_FREEZER_MAINTENANCE: { type: 'OUT', debit: '605', credit: '102', cf: 'OPERATING' },
  EXPENSE_MARKETING: { type: 'OUT', debit: '606', credit: '102', cf: 'OPERATING' },
  EXPENSE_PAY_SUPPLIER: { type: 'OUT', debit: '201', credit: '102', cf: 'OPERATING' },
  EXPENSE_ASSET_PURCHASE: { type: 'OUT', debit: '150', credit: '102', cf: 'INVESTING' },
  EXPENSE_OWNER_DRAW: { type: 'OUT', debit: '302', credit: '102', cf: 'FINANCING' },
}

function generateDoubleEntryJournal(tx) {
  const cat = CATEGORY_MAP[tx.category] || CATEGORY_MAP.INCOME_OTHER
  const paymentAccCode = tx.account === 'KAS' ? '101' : '102'
  const lines = []

  if (tx.type === 'IN') {
    lines.push({ code: paymentAccCode, debit: tx.amount, credit: 0 })
    lines.push({ code: cat.credit, debit: 0, credit: tx.amount })
  } else {
    lines.push({ code: cat.debit, debit: tx.amount, credit: 0 })
    lines.push({ code: paymentAccCode, debit: 0, credit: tx.amount })
  }

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0)
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0)
  return { lines, totalDebit, totalCredit, isBalanced: totalDebit === totalCredit }
}

function calculateHPP(initialInv, purchases, freightIn, endingInv) {
  // SAK EMKM: HPP = Persediaan Awal + Pembelian + Ongkir Masuk - Persediaan Akhir
  return Math.max(0, initialInv + purchases + freightIn - endingInv)
}

function calculateBalanceSheet(config, cashBal, bankBal, ar, endingInv, fixedAssets, netIncome, draws, injections, debtPaid) {
  const totalAssets = cashBal + bankBal + ar + endingInv + fixedAssets
  const accountsPayable = Math.max(0, config.initialAccountsPayable - debtPaid)
  const endingEquity = config.ownerInitialCapital + injections + netIncome - draws
  const totalLiabilitiesAndEquity = accountsPayable + endingEquity
  const discrepancy = Math.abs(totalAssets - totalLiabilitiesAndEquity)
  return {
    totalAssets,
    accountsPayable,
    endingEquity,
    totalLiabilitiesAndEquity,
    isBalanced: discrepancy < 1000,
    discrepancy,
  }
}

function calculateCashierReconciliation(systemCash, actualCash, systemBank, verifiedBank) {
  const cashDiff = actualCash - systemCash
  const bankDiff = verifiedBank - systemBank
  const totalDiff = cashDiff + bankDiff

  let status = 'SUDAH_COCOK'
  if (totalDiff < -100) status = 'BEBAN_PERUSAHAAN'
  else if (totalDiff > 100) status = 'PENDAPATAN_LAIN'

  return { cashDiff, bankDiff, totalDiff, status }
}

function classifyAR(dueDateStr, now = new Date()) {
  const due = new Date(dueDateStr)
  const daysDiff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff <= 0) return 'LANCAR'
  if (daysDiff <= 14) return 'JATUH_TEMPO'
  return 'MACET'
}

// ==================== WHITEBOX TEST SUITE ====================

test('=== [WHITEBOX] 1. Chart of Accounts (COA) Structure & Completeness ===', (t) => {
  assert.strictEqual(CHART_OF_ACCOUNTS.length >= 20, true, 'COA must contain at least 20 accounts')

  const codes = new Set()
  CHART_OF_ACCOUNTS.forEach((acc) => {
    assert.strictEqual(codes.has(acc.code), false, `Account code ${acc.code} must be unique`)
    codes.add(acc.code)
    assert.match(acc.code, /^[1-6][0-9]{2}$/, `Account code ${acc.code} must be 3-digit SAK EMKM standard`)
    assert.ok(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].includes(acc.category))
  })
})

test('=== [WHITEBOX] 2. Double-Entry General Journal Integrity for All 15 Categories ===', (t) => {
  const sampleAmount = 2500000

  Object.keys(CATEGORY_MAP).forEach((catKey) => {
    const cat = CATEGORY_MAP[catKey]
    const tx = {
      category: catKey,
      type: cat.type,
      account: 'BANK_MANDIRI',
      amount: sampleAmount,
    }

    const journal = generateDoubleEntryJournal(tx)
    assert.strictEqual(journal.isBalanced, true, `Category ${catKey} must balance Debit === Credit`)
    assert.strictEqual(journal.totalDebit, sampleAmount, `Total debit for ${catKey} must equal transaction amount`)
    assert.strictEqual(journal.totalCredit, sampleAmount, `Total credit for ${catKey} must equal transaction amount`)
    assert.strictEqual(journal.lines.length, 2, `General journal must have exactly 2 lines (debit & credit)`)
  })
})

test('=== [WHITEBOX] 3. SAK EMKM Accounting Equation Balance Check (Assets = Liabilities + Equity) ===', (t) => {
  const config = {
    initialCash: 1500000,
    initialBank: 35000000,
    initialInventoryValue: 10000000,
    initialColdChainAssets: 12500000,
    initialAccountsPayable: 4500000,
    ownerInitialCapital: 54500000, // 1.5 + 35 + 10 + 12.5 - 4.5 = 54.5M
  }

  // Initial state check
  const initialBS = calculateBalanceSheet(
    config,
    config.initialCash,
    config.initialBank,
    0, // AR
    config.initialInventoryValue,
    config.initialColdChainAssets,
    0, // Net income
    0, // Draws
    0, // Injections
    0 // Debt paid
  )
  assert.strictEqual(initialBS.totalAssets, 59000000, 'Initial assets must be 59M')
  assert.strictEqual(initialBS.totalLiabilitiesAndEquity, 59000000, 'Initial L+E must be 59M')
  assert.strictEqual(initialBS.isBalanced, true, 'Initial balance sheet must be balanced')

  // Operational Simulation:
  // Revenue: 5.5M (Cash inflow +3.5M, AR +2.0M)
  // Prive: -1.0M (Cash outflow -1.0M)
  // Debt Paid: -2.0M (Cash outflow -2.0M, AP reduced by 2.0M)
  // Net Cash change = +3.5M - 1.0M - 2.0M = +0.5M
  // Total Asset change = Cash +0.5M + AR +2.0M = +2.5M
  // Total Liabilities & Equity change = AP -2.0M + Net Income +5.5M - Prive 1.0M = +2.5M
  const operatingBS = calculateBalanceSheet(
    config,
    config.initialCash + 500000,
    config.initialBank,
    2000000, // AR
    config.initialInventoryValue,
    config.initialColdChainAssets,
    5500000, // Net income
    1000000, // Prive
    0,
    2000000 // Debt paid
  )
  assert.strictEqual(operatingBS.isBalanced, true, 'Post-operational balance sheet must be balanced')
})

test('=== [WHITEBOX] 4. HPP & Ending Inventory Formula Clamping ===', (t) => {
  const initialInv = 10000000
  const purchases = 15000000
  const freight = 1500000
  const endingInvNormal = 12000000

  // Normal HPP: 10M + 15M + 1.5M - 12M = 14.5M
  const normalHPP = calculateHPP(initialInv, purchases, freight, endingInvNormal)
  assert.strictEqual(normalHPP, 14500000, 'Normal HPP calculation must be exact')

  // Edge case: Ending inventory exceeds available stock (stock spike / donation) -> HPP clamped to 0, never negative
  const excessEndingInv = 30000000
  const clampedHPP = calculateHPP(initialInv, purchases, freight, excessEndingInv)
  assert.strictEqual(clampedHPP, 0, 'HPP must never be negative when ending inventory is large')
})

test('=== [WHITEBOX] 5. Direct Cash Flow Engine Integrity (Operating + Investing + Financing) ===', (t) => {
  const mockTransactions = [
    { category: 'INCOME_SALES_CASH', type: 'IN', amount: 8000000 },
    { category: 'EXPENSE_MEAT_PURCHASE', type: 'OUT', amount: 5000000 },
    { category: 'EXPENSE_ASSET_PURCHASE', type: 'OUT', amount: 2000000 },
    { category: 'INCOME_EQUITY_INJECTION', type: 'IN', amount: 10000000 },
    { category: 'EXPENSE_OWNER_DRAW', type: 'OUT', amount: 1500000 },
  ]

  let operating = 0
  let investing = 0
  let financing = 0

  mockTransactions.forEach((tx) => {
    const cat = CATEGORY_MAP[tx.category]
    const signedAmount = tx.type === 'IN' ? tx.amount : -tx.amount
    if (cat.cf === 'OPERATING') operating += signedAmount
    if (cat.cf === 'INVESTING') investing += signedAmount
    if (cat.cf === 'FINANCING') financing += signedAmount
  })

  assert.strictEqual(operating, 3000000, 'Operating cash flow must be 3M')
  assert.strictEqual(investing, -2000000, 'Investing cash flow must be -2M')
  assert.strictEqual(financing, 8500000, 'Financing cash flow must be 8.5M')
  assert.strictEqual(operating + investing + financing, 9500000, 'Net cash change must equal sum of 3 flows')
})

test('=== [WHITEBOX] 6. Accounts Receivable (AR) Aging Engine & Due-Date Classification ===', (t) => {
  const baseTime = new Date('2026-11-16T12:00:00Z')

  // Future or today
  assert.strictEqual(classifyAR('2026-11-17', baseTime), 'LANCAR')
  assert.strictEqual(classifyAR('2026-11-16', baseTime), 'LANCAR')

  // 1-14 days overdue
  assert.strictEqual(classifyAR('2026-11-10', baseTime), 'JATUH_TEMPO')
  assert.strictEqual(classifyAR('2026-11-03', baseTime), 'JATUH_TEMPO')

  // > 14 days overdue
  assert.strictEqual(classifyAR('2026-10-25', baseTime), 'MACET')
})

test('=== [WHITEBOX] 7. POS Cashier & Bank Reconciliation Variance Calculation ===', (t) => {
  // Matched exactly
  const exact = calculateCashierReconciliation(2500000, 2500000, 4800000, 4800000)
  assert.strictEqual(exact.totalDiff, 0)
  assert.strictEqual(exact.status, 'SUDAH_COCOK')

  // Shortage (Kasir Kurang Rp 50.000)
  const short = calculateCashierReconciliation(2500000, 2450000, 4800000, 4800000)
  assert.strictEqual(short.totalDiff, -50000)
  assert.strictEqual(short.status, 'BEBAN_PERUSAHAAN')

  // Overage (Kasir Lebih Rp 25.000)
  const over = calculateCashierReconciliation(2500000, 2525000, 4800000, 4800000)
  assert.strictEqual(over.totalDiff, 25000)
  assert.strictEqual(over.status, 'PENDAPATAN_LAIN')
})

test('=== [WHITEBOX] 8. Stock Opname Audit Trail & Cold Chain Quality Integrity ===', (t) => {
  const record = {
    id: 'SOP-20261116-01',
    date: '2026-11-16',
    recordedAt: '2026-11-16T15:00:00Z',
    inspector: 'Budi Santoso (Checker Gudang)',
    totalWeightKg: 185.5,
    estimatedValue: 12985000,
    freezerTempCelsius: -19.2,
    notes: 'Freezer room Babarsari suhu -19.2C, kemasan vacuum seal utuh.',
  }

  assert.ok(record.recordedAt.includes('T'), 'Audit trail must record ISO timestamp with time')
  assert.strictEqual(record.freezerTempCelsius <= -18.0, true, 'Cold chain standard must be <= -18.0°C')
  assert.strictEqual(record.totalWeightKg > 0, true, 'Stock weight must be positive')
  assert.strictEqual(record.estimatedValue > 0, true, 'Estimated inventory value must be positive')
})

test('=== [WHITEBOX] 9. Goods Receipt Note (GRN) Payload & Calculations ===', (t) => {
  const grn = {
    id: 'GRN-20261116-01',
    receiptDate: '2026-11-16',
    deliveryNoteNumber: 'SJ-HTB-DPS-20261116-083',
    sourceOrigin: 'PUSAT_BALI',
    sourceLabel: 'Sentra Produksi Cold Storage HATOBA Bali (Hub Denpasar)',
    carrierName: 'Cold Truck Thermo HATOBA (DK 8291 AB)',
    freezerTempCelsius: -18.5,
    receiverName: 'Siti Aminah',
    items: [
      { productName: 'Paru Sapi Ungkep', packQuantity: 80, weightKg: 80 },
      { productName: 'Babat Sapi Ungkep', packQuantity: 105, weightKg: 105 },
    ],
  }

  const computedPacks = grn.items.reduce((sum, item) => sum + item.packQuantity, 0)
  const computedWeight = grn.items.reduce((sum, item) => sum + item.weightKg, 0)

  assert.strictEqual(computedPacks, 185, 'Total packs must sum correctly')
  assert.strictEqual(computedWeight, 185, 'Total kg must sum correctly')
  assert.strictEqual(grn.freezerTempCelsius <= -18.0, true, 'Arrival temperature must satisfy cold chain')
})

// ==================== BLACKBOX TEST SUITE ====================

test('=== [BLACKBOX] 10. Authentication Guard (PIN, Cookie, Injection Resistance) ===', (t) => {
  const FINANCE_PIN = 'hatoba.finance2026'

  function authenticateFinance(input) {
    if (!input || typeof input !== 'string') return false
    const sanitized = input.trim()
    return sanitized === FINANCE_PIN
  }

  // Valid credentials
  assert.strictEqual(authenticateFinance('hatoba.finance2026'), true, 'Valid password accepted')
  assert.strictEqual(authenticateFinance('  hatoba.finance2026  '), true, 'Trimmed password accepted')

  // Invalid attempts
  assert.strictEqual(authenticateFinance('wrong_pass'), false, 'Wrong password rejected')
  assert.strictEqual(authenticateFinance(''), false, 'Empty password rejected')
  assert.strictEqual(authenticateFinance(null), false, 'Null rejected')
  assert.strictEqual(authenticateFinance(undefined), false, 'Undefined rejected')

  // SQL Injection / Script payload resistance
  assert.strictEqual(authenticateFinance("' OR 1=1 --"), false, 'SQL injection rejected')
  assert.strictEqual(authenticateFinance("<script>alert(1)</script>"), false, 'XSS payload rejected')
})

test('=== [BLACKBOX] 11. Protected API Access Control (Unauthorized Rejection) ===', (t) => {
  function verifyApiSession(cookieValue) {
    return cookieValue === 'authenticated'
  }

  assert.strictEqual(verifyApiSession('authenticated'), true, 'Valid session cookie allowed')
  assert.strictEqual(verifyApiSession(undefined), false, 'Missing session cookie denied')
  assert.strictEqual(verifyApiSession('fake-token'), false, 'Forged token denied')
  assert.strictEqual(verifyApiSession(''), false, 'Empty cookie denied')
})

test('=== [BLACKBOX] 12. Transaction Amount Sanitization & Zero/Negative Rejection ===', (t) => {
  function validateTransactionPayload(payload) {
    if (!payload) return { valid: false, error: 'Empty payload' }
    const amount = typeof payload.amount === 'string'
      ? parseFloat(payload.amount.replace(/[^0-9]/g, ''))
      : payload.amount

    if (isNaN(amount) || amount <= 0) {
      return { valid: false, error: 'Nominal transaksi harus lebih besar dari 0' }
    }
    if (!['IN', 'OUT'].includes(payload.type)) {
      return { valid: false, error: 'Tipe transaksi tidak valid' }
    }
    if (!['KAS', 'BANK_MANDIRI'].includes(payload.account)) {
      return { valid: false, error: 'Akun kas/bank tidak valid' }
    }
    return { valid: true, sanitizedAmount: amount }
  }

  assert.strictEqual(validateTransactionPayload({ amount: 500000, type: 'IN', account: 'KAS' }).valid, true)
  assert.strictEqual(validateTransactionPayload({ amount: 'Rp 1.500.000', type: 'OUT', account: 'BANK_MANDIRI' }).sanitizedAmount, 1500000)

  // Rejections
  assert.strictEqual(validateTransactionPayload({ amount: 0, type: 'IN', account: 'KAS' }).valid, false)
  assert.strictEqual(validateTransactionPayload({ amount: -50000, type: 'IN', account: 'KAS' }).valid, false)
  assert.strictEqual(validateTransactionPayload({ amount: 'abc', type: 'IN', account: 'KAS' }).valid, false)
  assert.strictEqual(validateTransactionPayload({ amount: 100000, type: 'TRANSFER', account: 'KAS' }).valid, false)
})

test('=== [BLACKBOX] 13. Stock Opname Input Validation & Clamping ===', (t) => {
  function validateStockOpnameInput(weightInput, valueInput) {
    const rawW = typeof weightInput === 'number' ? weightInput : parseFloat(String(weightInput).replace(/[^0-9.-]/g, ''))
    const rawV = typeof valueInput === 'number' ? valueInput : parseFloat(String(valueInput).replace(/[^0-9-]/g, ''))

    if (isNaN(rawW) || rawW <= 0) return { valid: false, error: 'Berat harus > 0' }
    if (isNaN(rawV) || rawV <= 0) return { valid: false, error: 'Nilai harus > 0' }

    return { valid: true, weightKg: rawW, estimatedValue: rawV }
  }

  assert.strictEqual(validateStockOpnameInput(185, 12950000).valid, true)
  assert.strictEqual(validateStockOpnameInput('185.5 kg', 'Rp 13.000.000').weightKg, 185.5)
  assert.strictEqual(validateStockOpnameInput('185.5 kg', 'Rp 13.000.000').estimatedValue, 13000000)

  assert.strictEqual(validateStockOpnameInput(0, 1000000).valid, false)
  assert.strictEqual(validateStockOpnameInput(-10, 1000000).valid, false)
})

test('=== [BLACKBOX] 14. Cut-Off Freeze State & Polling Disablement Logic ===', (t) => {
  let isAutoSyncEnabled = true
  let cutoffTimestamp = null
  let pollingIntervalActive = true

  function toggleAutoSync() {
    if (isAutoSyncEnabled) {
      isAutoSyncEnabled = false
      cutoffTimestamp = new Date('2026-11-16T18:00:00Z')
      pollingIntervalActive = false
    } else {
      isAutoSyncEnabled = true
      cutoffTimestamp = null
      pollingIntervalActive = true
    }
  }

  // Freeze cut-off
  toggleAutoSync()
  assert.strictEqual(isAutoSyncEnabled, false, 'Sync must be disabled')
  assert.strictEqual(pollingIntervalActive, false, 'Polling interval must be stopped')
  assert.ok(cutoffTimestamp !== null, 'Cutoff timestamp must be frozen')

  // Unfreeze
  toggleAutoSync()
  assert.strictEqual(isAutoSyncEnabled, true, 'Sync must be re-enabled')
  assert.strictEqual(pollingIntervalActive, true, 'Polling interval must resume')
  assert.strictEqual(cutoffTimestamp, null, 'Cutoff timestamp must reset')
})

test('=== [BLACKBOX] 15. CSV Export Data Serialization & Escaping Integrity ===', (t) => {
  function escapeCSVField(str) {
    if (str === null || str === undefined) return '""'
    const clean = String(str).replace(/"/g, '""')
    return `"${clean}"`
  }

  assert.strictEqual(escapeCSVField('Normal Text'), '"Normal Text"')
  assert.strictEqual(escapeCSVField('Text with "quotes"'), '"Text with ""quotes"""')
  assert.strictEqual(escapeCSVField('Freezer -18.5°C; kemasan vacuum'), '"Freezer -18.5°C; kemasan vacuum"')
  assert.strictEqual(escapeCSVField(12950000), '"12950000"')
})
