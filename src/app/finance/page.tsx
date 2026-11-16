'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  LogOut,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  PieChart,
  BookOpen,
  ShieldCheck,
  Snowflake,
  Scale,
  Receipt,
  Info,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  CheckCheck,
  Building2,
  AlertCircle,
} from 'lucide-react'
import {
  FinanceTransaction,
  FinanceCategory,
  CATEGORY_OPTIONS,
  ComprehensiveFinancialReport,
  InventorySnapshot,
  InitialCapitalConfig,
  JournalEntry,
  CashierReconciliation,
} from '@/lib/finance-store'

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function FinanceERPPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Finance Data States
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [report, setReport] = useState<ComprehensiveFinancialReport | null>(null)
  const [inventory, setInventory] = useState<InventorySnapshot | null>(null)
  const [config, setConfig] = useState<InitialCapitalConfig | null>(null)
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [reconciliations, setReconciliations] = useState<CashierReconciliation[]>([])
  const [loading, setLoading] = useState(true)

  // Tab State
  type FinanceTab =
    | 'overview'
    | 'reconciliation'
    | 'transactions'
    | 'cashflow'
    | 'balancesheet'
    | 'equity'
    | 'ar_aging'
    | 'journal'
    | 'help'
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview')

  // Form State: Tambah Transaksi Kas/Bank
  const [showAddTxModal, setShowAddTxModal] = useState(false)
  const [txType, setTxType] = useState<'IN' | 'OUT'>('IN')
  const [txCategory, setTxCategory] = useState<FinanceCategory>('INCOME_AR_COLLECTION')
  const [txAccount, setTxAccount] = useState<'KAS' | 'BANK_MANDIRI'>('BANK_MANDIRI')
  const [txAmount, setTxAmount] = useState<string>('')
  const [txRecipient, setTxRecipient] = useState<string>('')
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [txNotes, setTxNotes] = useState<string>('')
  const [txRefCode, setTxRefCode] = useState<string>('')
  const [savingTx, setSavingTx] = useState(false)

  // Form State: Stock Opname Nilai Stok Freezer
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [invWeightInput, setInvWeightInput] = useState<string>('185')
  const [invValueInput, setInvValueInput] = useState<string>('12950000')
  const [invNotesInput, setInvNotesInput] = useState<string>('Stok fisik daging & jeroan beku di freezer -18°C')
  const [savingInv, setSavingInv] = useState(false)

  // Form State: Rekonsiliasi Kasir & Bank
  const [recDate, setRecDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [recShiftLabel, setRecShiftLabel] = useState<string>(`Tutup Kasir ${new Date().toISOString().slice(0, 10)}`)
  const [recActualCash, setRecActualCash] = useState<string>('')
  const [recBankVerified, setRecBankVerified] = useState<string>('')
  const [recResolution, setRecResolution] = useState<'SUDAH_COCOK' | 'BEBAN_PERUSAHAAN' | 'POTONG_KASIR' | 'PENDAPATAN_LAIN'>('SUDAH_COCOK')
  const [recNotes, setRecNotes] = useState<string>('')
  const [savingRec, setSavingRec] = useState(false)

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // 1. Initial Auth Check
  useEffect(() => {
    checkFinanceAuth()
  }, [])

  const checkFinanceAuth = async () => {
    try {
      const res = await fetch('/api/finance/auth')
      const data = await res.json()
      if (data.authenticated) {
        setIsAuthenticated(true)
        fetchFinanceData()
      } else {
        setIsAuthenticated(false)
      }
    } catch {
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/finance/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsAuthenticated(true)
        setPinInput('')
        fetchFinanceData()
      } else {
        setAuthError(data.error || 'PIN tidak valid.')
      }
    } catch {
      setAuthError('Gagal terhubung ke server autentikasi.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/finance/auth', { method: 'DELETE' })
      setIsAuthenticated(false)
    } catch {
      setIsAuthenticated(false)
    }
  }

  const fetchFinanceData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/finance/transactions')
      const data = await res.json()
      if (res.ok && data.success) {
        setTransactions(data.transactions || [])
        setReport(data.report || null)
        setInventory(data.inventory || null)
        setConfig(data.config || null)
        setJournal(data.journal || [])

        // If report has pos stats, auto-fill verification fields if empty
        if (data.report?.posReconciliationStats) {
          setReconciliations(data.report.posReconciliationStats.recentReconciliations || [])
          if (!recActualCash) {
            setRecActualCash(String(data.report.posReconciliationStats.systemTotalCash || 0))
          }
          if (!recBankVerified) {
            setRecBankVerified(String(data.report.posReconciliationStats.systemTotalTransfer || 0))
          }
        }

        if (data.inventory) {
          setInvWeightInput(String(data.inventory.totalWeightKg || '0'))
          setInvValueInput(String(data.inventory.estimatedValue || '0'))
          setInvNotesInput(data.inventory.notes || '')
        }
      } else {
        showToast(data.error || 'Gagal memuat data keuangan.', 'error')
      }
    } catch {
      showToast('Koneksi jaringan keuangan terganggu.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 2. Submit Transaksi Keuangan
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = parseFloat(txAmount.replace(/[^0-9]/g, ''))
    if (!numericAmount || numericAmount <= 0) {
      alert('Nominal transaksi harus lebih dari 0.')
      return
    }
    if (!txRecipient.trim()) {
      alert('Nama pihak terkait (konsumen, supplier, atau staf) wajib diisi.')
      return
    }

    setSavingTx(true)
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: txDate,
          type: txType,
          category: txCategory,
          account: txAccount,
          amount: numericAmount,
          recipientOrPayer: txRecipient.trim(),
          notes: txNotes.trim() || undefined,
          referenceCode: txRefCode.trim() || undefined,
          createdBy: 'Finance Manager',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        showToast(data.message || 'Transaksi berhasil dicatat dan diposting ke jurnal!')
        setShowAddTxModal(false)
        setTxAmount('')
        setTxRecipient('')
        setTxNotes('')
        setTxRefCode('')
        fetchFinanceData()
      } else {
        showToast(data.error || 'Gagal menyimpan transaksi.', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan saat memproses transaksi.', 'error')
    } finally {
      setSavingTx(false)
    }
  }

  // 3. Delete Transaksi
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Yakin ingin menghapus catatan transaksi ini? Jurnal terkait juga akan diperbarui.')) {
      return
    }
    try {
      const res = await fetch(`/api/finance/transactions?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast('Transaksi berhasil dihapus.')
        fetchFinanceData()
      } else {
        showToast(data.error || 'Gagal menghapus transaksi.', 'error')
      }
    } catch {
      showToast('Gagal terhubung ke server.', 'error')
    }
  }

  // 4. Update Stock Opname
  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingInv(true)
    try {
      const res = await fetch('/api/finance/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalWeightKg: parseFloat(invWeightInput) || 0,
          estimatedValue: parseFloat(invValueInput.replace(/[^0-9]/g, '')) || 0,
          notes: invNotesInput.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast('Nilai persediaan daging beku berhasil diperbarui di Neraca & HPP!')
        setShowInventoryModal(false)
        fetchFinanceData()
      } else {
        showToast(data.error || 'Gagal memperbarui persediaan.', 'error')
      }
    } catch {
      showToast('Koneksi terganggu.', 'error')
    } finally {
      setSavingInv(false)
    }
  }

  // 5. Submit Rekonsiliasi Kasir & Bank
  const handleSaveReconciliation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!report?.posReconciliationStats) {
      alert('Data sistem kasir belum dimuat.')
      return
    }

    const actualCashNum = parseFloat(recActualCash.replace(/[^0-9]/g, '')) || 0
    const bankVerifiedNum = parseFloat(recBankVerified.replace(/[^0-9]/g, '')) || 0

    setSavingRec(true)
    try {
      const res = await fetch('/api/finance/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: recDate,
          shiftLabel: recShiftLabel,
          systemCashTotal: report.posReconciliationStats.systemTotalCash,
          actualCashCounted: actualCashNum,
          systemTransferTotal: report.posReconciliationStats.systemTotalTransfer,
          bankVerifiedTotal: bankVerifiedNum,
          resolutionAction: recResolution,
          notes: recNotes.trim(),
          reconciledBy: 'Finance Kasir',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        showToast(data.message || 'Rekonsiliasi tutup kasir & bank berhasil disimpan!')
        setRecNotes('')
        fetchFinanceData()
      } else {
        showToast(data.error || 'Gagal menyimpan rekonsiliasi kasir.', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan jaringan saat menyimpan rekonsiliasi.', 'error')
    } finally {
      setSavingRec(false)
    }
  }

  // Quick Settle AR from AR Aging List
  const quickSettleAR = (ord: any) => {
    const remaining = Math.max(0, ord.totalAmount - (ord.paidAmount || 0))
    setTxType('IN')
    setTxCategory('INCOME_AR_COLLECTION')
    setTxAccount('BANK_MANDIRI')
    setTxAmount(String(remaining))
    setTxRecipient(ord.businessName ? `${ord.customerName} (${ord.businessName})` : ord.customerName)
    setTxRefCode(ord.referenceCode)
    setTxNotes(`Pelunasan tagihan tempo invoice INV-${ord.referenceCode}`)
    setShowAddTxModal(true)
  }

  // Filter Categories by Type (IN or OUT)
  const availableCategories = useMemo(() => {
    return Object.values(CATEGORY_OPTIONS).filter((c) => c.type === txType)
  }, [txType])

  // Calculated discrepancies for Reconciliation Form
  const calcCashDiff = useMemo(() => {
    const sys = report?.posReconciliationStats?.systemTotalCash || 0
    const actual = parseFloat(recActualCash.replace(/[^0-9]/g, '')) || 0
    return actual - sys
  }, [report, recActualCash])

  const calcTransferDiff = useMemo(() => {
    const sys = report?.posReconciliationStats?.systemTotalTransfer || 0
    const verified = parseFloat(recBankVerified.replace(/[^0-9]/g, '')) || 0
    return verified - sys
  }, [report, recBankVerified])

  // ======================= VIEW: LOGIN SCREEN (SUB-SISTEM TERPISAH) =======================
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#111613] text-[#FAF8F5] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C59B47]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-[#18211C] border border-[#2D3A32] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C59B47] to-[#8C6B24] text-white shadow-lg mb-2">
              <Scale className="w-7 h-7" />
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#C59B47] font-semibold">
              HATOBA Group • Sub-Sistem Keuangan
            </div>
            <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-white">
              Mini ERP &amp; Akuntansi
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Portal internal manajemen arus kas, rekonsiliasi kasir POS, piutang tempo, dan neraca SAK EMKM.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                PIN / Kata Sandi Finance
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Masukkan PIN Keuangan..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0F1411] border border-[#3A4B40] rounded-xl text-white text-sm focus:outline-none focus:border-[#C59B47] focus:ring-1 focus:ring-[#C59B47]"
                  required
                  autoFocus
                />
                <Lock className="w-4 h-4 text-gray-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C59B47] to-[#A47F33] hover:from-[#D4AA55] hover:to-[#B38C3E] text-[#111613] font-bold text-sm tracking-wide transition-all shadow-md disabled:opacity-50"
            >
              {authLoading ? 'Memverifikasi...' : 'Masuk Portal Keuangan'}
            </button>
          </form>

          <div className="pt-4 border-t border-[#2D3A32] text-center space-y-2">
            <p className="text-[11px] text-gray-500">
              PIN Default: <code className="text-[#C59B47] font-mono bg-[#0F1411] px-2 py-0.5 rounded">hatoba.finance2026</code>
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400 pt-1">
              <Link href="/admin" className="hover:text-[#C59B47] transition-colors flex items-center gap-1">
                <span>Ke Admin Penjualan</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
              <span>•</span>
              <Link href="/" className="hover:text-[#C59B47] transition-colors">
                Website Utama
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ======================= VIEW: STANDALONE DASHBOARD ERP UTAMA =======================
  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#111613] flex flex-col font-sans">
      {/* Top Standalone Header Bar */}
      <header className="bg-[#111613] text-white border-b border-[#2A362F] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C59B47] to-[#8C6B24] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title font-bold text-base sm:text-lg tracking-tight text-white">
                  HATOBA Mini ERP
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                  SAK EMKM
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C59B47]/20 text-[#E5C278] border border-[#C59B47]/40 hidden md:inline-block">
                  Sub-Sistem Keuangan
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Penyederhanaan Akuntansi Usaha Cold Chain Daging &amp; Jeroan Sapi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => {
                setTxType('IN')
                setTxCategory('INCOME_AR_COLLECTION')
                setShowAddTxModal(true)
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Kas Masuk / Keluar</span>
            </button>

            <button
              onClick={() => setShowInventoryModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#233129] hover:bg-[#2F4237] text-[#C59B47] border border-[#3D5244] text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Stock Opname Fisik Freezer untuk Hitung HPP"
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>Stok Freezer</span>
            </button>

            <button
              onClick={fetchFinanceData}
              disabled={loading}
              className="p-1.5 rounded-xl bg-[#233129] hover:bg-[#2F4237] text-gray-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/admin"
              className="p-1.5 px-2.5 rounded-xl bg-[#233129] hover:bg-[#2F4237] text-gray-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
              title="Kembali ke Panel Admin Penjualan"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Toko</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 transition-colors"
              title="Keluar Sesi Keuangan"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-[#18211C] border-t border-[#28352D] px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-[#C59B47] text-[#111613]'
                  : 'text-gray-400 hover:text-white hover:bg-[#222E27]'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Ringkasan &amp; Alert</span>
            </button>

            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'reconciliation'
                  ? 'bg-[#C59B47] text-[#111613]'
                  : 'text-gray-400 hover:text-white hover:bg-[#222E27]'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tutup Kasir &amp; Bank</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'transactions'
                  ? 'bg-[#C59B47] text-[#111613]'
                  : 'text-gray-400 hover:text-white hover:bg-[#222E27]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Buku Kas &amp; Bank ({transactions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cashflow')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'cashflow'
                  ? 'bg-[#C59B47] text-[#111613]'
                  : 'text-gray-400 hover:text-white hover:bg-[#222E27]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Laporan Arus Kas</span>
            </button>

            <button
              onClick={() => setActiveTab('balancesheet')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'balancesheet'
                  ? 'bg-[#C59B47] text-[#111613]'
                  : 'text-gray-400 hover:text-white hover:bg-[#222E27]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Neraca Sederhana &amp; HPP</span>
            </button>

            <button
              onClick={() => setActiveTab('equity')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'equity'
                  ? 'bg-[#C59B47] text-[#111613]'
                  : 'text-gray-400 hover:text-white hover:bg-[#222E27]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Perubahan Modal</span>
            </button>

            <button
              onClick={() => setActiveTab('ar_aging')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'ar_aging'
                  ? 'bg-[#C59B47] text-[#111613]'
                  : 'text-gray-400 hover:text-white hover:bg-[#222E27]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Buku Piutang Tempo ({report?.pendingTempoOrders.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'journal'
                  ? 'bg-[#C59B47] text-[#111613]'
                  : 'text-gray-400 hover:text-white hover:bg-[#222E27]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Jurnal Umum</span>
            </button>

            <button
              onClick={() => setActiveTab('help')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'help'
                  ? 'bg-amber-400 text-[#111613]'
                  : 'text-amber-300/80 hover:text-amber-200 hover:bg-[#222E27]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Panduan &amp; SOP Help</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ==================== TAB 1: OVERVIEW (RINGKASAN & ALERT MANAJEMEN) ==================== */}
        {activeTab === 'overview' && report && (
          <div className="space-y-6">
            {/* ACTIONABLE MANAGEMENT ALERT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Alert 1: Overdue AR (Piutang Tempo Macet) */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  report.receivablesOverdue > 0
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Alert Piutang Tempo
                  </span>
                  <span className="text-xs font-mono font-bold">
                    {report.receivablesOverdue > 0 ? 'WASPADA' : 'AMAN'}
                  </span>
                </div>
                <div className="font-bold text-lg mb-1">
                  {formatIDR(report.receivablesOverdue)}
                </div>
                <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                  {report.receivablesOverdue > 0
                    ? `${report.pendingTempoOrders.filter(o => o.paymentStatus !== 'LUNAS').length} invoice tempo melewati batas 3 hari. Tahan pengiriman baru.`
                    : 'Semua invoice konsumen masih dalam batas tempo wajar.'}
                </p>
                <button
                  onClick={() => setActiveTab('ar_aging')}
                  className="w-full py-1.5 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-[#111613] transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Buka Buku Piutang &amp; Tagih</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Alert 2: Tutup Kasir POS & Rekonsiliasi Bank */}
              <div className="p-4 rounded-2xl border bg-amber-50 border-amber-200 text-amber-950">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tutup Kasir &amp; Bank
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-700">HARIAN</span>
                </div>
                <div className="font-bold text-lg mb-1">
                  {formatIDR(report.posReconciliationStats.systemTotalCash + report.posReconciliationStats.systemTotalTransfer)}
                </div>
                <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                  Total penjualan lunas hari ini (Kas: {formatIDR(report.posReconciliationStats.systemTotalCash)}, Transfer: {formatIDR(report.posReconciliationStats.systemTotalTransfer)}).
                </p>
                <button
                  onClick={() => setActiveTab('reconciliation')}
                  className="w-full py-1.5 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-[#111613] transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Cocokkan Fisik Kasir</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Alert 3: Rasio Kas Likuid vs Hutang Dagang */}
              <div
                className={`p-4 rounded-2xl border ${
                  report.totalLiquidCash < report.balanceSheet.liabilitiesAndEquity.accountsPayable
                    ? 'bg-orange-50 border-orange-200 text-orange-950'
                    : 'bg-blue-50 border-blue-200 text-blue-950'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    Likuiditas Kas Putar
                  </span>
                  <span className="text-xs font-mono font-bold">
                    {report.totalLiquidCash >= report.balanceSheet.liabilitiesAndEquity.accountsPayable ? 'SEHAT' : 'KETAT'}
                  </span>
                </div>
                <div className="font-bold text-lg mb-1">
                  {formatIDR(report.totalLiquidCash)}
                </div>
                <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                  Hutang ke supplier saat ini: <strong>{formatIDR(report.balanceSheet.liabilitiesAndEquity.accountsPayable)}</strong>.
                </p>
                <button
                  onClick={() => setActiveTab('cashflow')}
                  className="w-full py-1.5 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-[#111613] transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Pantau Arus Kas</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Alert 4: Stock Opname Freezer Rutin */}
              <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-950">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Snowflake className="w-3.5 h-3.5" />
                    Stok Freezer (-18°C)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700">OPNAME</span>
                </div>
                <div className="font-bold text-lg mb-1">
                  {inventory?.totalWeightKg || 0} Kg
                </div>
                <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                  Nilai aset beku: <strong>{formatIDR(report.inventoryValue)}</strong>. Update fisik mingguan untuk kalibrasi HPP.
                </p>
                <button
                  onClick={() => setShowInventoryModal(true)}
                  className="w-full py-1.5 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-[#111613] transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Opname Fisik Freezer</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 5 EXECUTIVE METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E3D9CC] shadow-sm">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-xs font-medium">Kas &amp; Bank Riil</span>
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-lg font-bold text-[#111613]">
                  {formatIDR(report.totalLiquidCash)}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 flex justify-between">
                  <span>Kas Fisik: {formatIDR(report.realCash)}</span>
                  <span>Bank: {formatIDR(report.realBank)}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E3D9CC] shadow-sm">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-xs font-medium">Total Piutang Konsumen</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-lg font-bold text-[#111613]">
                  {formatIDR(report.totalReceivables)}
                </div>
                <div className="text-[11px] text-red-600 mt-1 font-medium">
                  {formatIDR(report.receivablesOverdue)} lewat tempo &gt;3 hari
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E3D9CC] shadow-sm">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-xs font-medium">Persediaan Daging Beku</span>
                  <Snowflake className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="text-lg font-bold text-[#111613]">
                  {formatIDR(report.inventoryValue)}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {inventory?.totalWeightKg || 0} Kg di Freezer -18°C
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E3D9CC] shadow-sm">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-xs font-medium">Hutang Supplier RPH</span>
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-lg font-bold text-[#111613]">
                  {formatIDR(report.balanceSheet.liabilitiesAndEquity.accountsPayable)}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Kewajiban jangka pendek supplier
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E3D9CC] shadow-sm">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-xs font-medium">Margin Kotor Penjualan</span>
                  <TrendingUp className="w-4 h-4 text-[#C59B47]" />
                </div>
                <div className="text-lg font-bold text-[#C59B47]">
                  {formatIDR(report.grossProfitMarginRp)}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">
                  {report.grossProfitMarginPercent.toFixed(1)}% dari Omzet
                </div>
              </div>
            </div>

            {/* 2 SUMMARY PANELS: P&L SUMMARY & BALANCE SHEET HEALTH */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel 1: Laba Rugi Operasional */}
              <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-sm text-[#111613] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Ringkasan Laba Rugi Operasional (Bulan Berjalan)</span>
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">SAK EMKM</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">Total Penjualan Daging &amp; Jeroan:</span>
                    <span className="font-bold text-[#111613] font-mono">{formatIDR(report.totalSalesRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50 text-red-700">
                    <span>Estimasi Beban Pokok Penjualan (HPP Daging):</span>
                    <span className="font-bold font-mono">- {formatIDR(report.estimatedHPP)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-3 rounded-xl bg-amber-50 text-amber-900 font-bold">
                    <span>= Laba / Margin Kotor (Gross Profit):</span>
                    <span className="font-mono">{formatIDR(report.grossProfitMarginRp)} ({report.grossProfitMarginPercent.toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50 text-red-700">
                    <span>Total Beban Operasional (Listrik Cold Chain, Gaji, dll):</span>
                    <span className="font-bold font-mono">- {formatIDR(report.totalOperatingExpenses)}</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 rounded-xl bg-emerald-50 text-emerald-950 font-bold text-sm">
                    <span>= Laba Bersih Operasional (Net Income):</span>
                    <span className="font-mono">{formatIDR(report.netOperatingIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Panel 2: Neraca Sederhana & Status Keseimbangan */}
              <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-sm text-[#111613] flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#C59B47]" />
                    <span>Keseimbangan Neraca (Aset = Kewajiban + Ekuitas)</span>
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      report.balanceSheet.isBalanced
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {report.balanceSheet.isBalanced ? 'BALANCE (KLOP)' : 'SELISIH'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">Total Aset (Kas + Piutang + Stok + Freezer):</span>
                    <span className="font-bold text-[#111613] font-mono">{formatIDR(report.balanceSheet.assets.totalAssets)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">Hutang Supplier RPH (Kewajiban):</span>
                    <span className="font-bold text-red-700 font-mono">{formatIDR(report.balanceSheet.liabilitiesAndEquity.accountsPayable)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">Ekuitas Akhir Pemilik:</span>
                    <span className="font-bold text-emerald-700 font-mono">{formatIDR(report.balanceSheet.liabilitiesAndEquity.endingEquity)}</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 rounded-xl bg-gray-50 font-bold">
                    <span>Total Kewajiban + Ekuitas:</span>
                    <span className="font-mono">{formatIDR(report.balanceSheet.liabilitiesAndEquity.totalLiabilitiesAndEquity)}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
                    Seluruh pencatatan akuntansi HATOBA diselaraskan dengan standar SAK EMKM tanpa beban jurnal rumit.
                  </p>
                </div>
              </div>
            </div>

            {/* TOP INSIGHT BOX: 3 PILAR SOLUSI MASALAH HATOBA */}
            <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold text-sm text-[#111613]">
                  Diagnosa Keuangan &amp; Arus Kas HATOBA: &ldquo;Omzet Ada, Uang Kas Kosong&rdquo;
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EBE4D8] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    1. Masalah Terdeteksi
                  </span>
                  <div className="font-bold text-red-800 text-sm">
                    Uang Nyangkut di Konsumen Tempo
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px]">
                    Penjualan tercatat omzet besar, tapi konsumen warung/resto bayar tempo melebihi 3-7 hari, sementara RPH harus dibayar tunai.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EBE4D8] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    2. Resiko Cut-off
                  </span>
                  <div className="font-bold text-amber-800 text-sm">
                    Kasih Tempo Tanpa Batas Plafon
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px]">
                    Konsumen mengambil stok baru padahal tagihan sebelumnya belum lunas. HATOBA menanggung beban modal kerja konsumen.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EBE4D8] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    3. Kebijakan Manajemen
                  </span>
                  <div className="font-bold text-emerald-800 text-sm">
                    Kunci Penjualan &amp; SOP Alokasi Kas
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px]">
                    Batasi tempo max 3 hari. Margin kotor 20% langsung dipecah: 60% restock daging, 20% operasional, 10% cadangan, 10% tabungan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: REKONSILIASI TUTUP KASIR & BANK (POS SETTLEMENT) ==================== */}
        {activeTab === 'reconciliation' && report && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif-title text-xl font-bold text-[#111613] flex items-center gap-2">
                    <CheckCheck className="w-5 h-5 text-emerald-600" />
                    <span>Rekonsiliasi Tutup Kasir &amp; Mutasi Bank (End of Day)</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Pencocokan uang kas fisik di laci kasir dan mutasi rekening bank dengan rekap penjualan sistem POS.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Otomatis Jurnal Selisih
                  </span>
                </div>
              </div>

              {/* System Sales Summary for Today */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-gray-100 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC]">
                  <span className="text-gray-500 text-[11px] font-semibold block">Total Kas Kasir di Sistem POS</span>
                  <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                    {formatIDR(report.posReconciliationStats.systemTotalCash)}
                  </div>
                  <span className="text-[10px] text-gray-400">Order kasir berstatus Lunas (Metode Cash)</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC]">
                  <span className="text-gray-500 text-[11px] font-semibold block">Total Transfer Bank di Sistem POS</span>
                  <div className="text-lg font-bold font-mono text-blue-700 mt-0.5">
                    {formatIDR(report.posReconciliationStats.systemTotalTransfer)}
                  </div>
                  <span className="text-[10px] text-gray-400">Order berstatus Lunas (Metode Transfer Bank)</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC]">
                  <span className="text-gray-500 text-[11px] font-semibold block">Total Penjualan Tempo / Piutang</span>
                  <div className="text-lg font-bold font-mono text-amber-700 mt-0.5">
                    {formatIDR(report.posReconciliationStats.systemTotalTempo)}
                  </div>
                  <span className="text-[10px] text-gray-400">Penjualan tempo belum diterima uangnya</span>
                </div>
              </div>
            </div>

            {/* Reconciliation Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-5">
                <h3 className="font-bold text-sm text-[#111613] border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#C59B47]" />
                  <span>Formulir Tutup Shift / Tutup Kasir Harian</span>
                </h3>

                <form onSubmit={handleSaveReconciliation} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-700">Tanggal Rekonsiliasi</label>
                      <input
                        type="date"
                        value={recDate}
                        onChange={(e) => setRecDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] font-mono text-xs text-[#111613]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-700">Label Shift / Keterangan Tutup</label>
                      <input
                        type="text"
                        value={recShiftLabel}
                        onChange={(e) => setRecShiftLabel(e.target.value)}
                        placeholder="Contoh: Tutup Kasir Harian 16 Nov 2026"
                        className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                        required
                      />
                    </div>
                  </div>

                  {/* Section 1: Kas Fisik Kasir */}
                  <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EBE4D8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#111613] flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span>1. Uang Kas Fisik di Laci Kasir</span>
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        Target Sistem: {formatIDR(report.posReconciliationStats.systemTotalCash)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-600">
                          Jumlah Fisik Uang di Laci Dihitung (Rp)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400 font-bold">Rp</span>
                          <input
                            type="text"
                            value={recActualCash}
                            onChange={(e) => setRecActualCash(e.target.value)}
                            placeholder="Hitung fisik uang tunai..."
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-[#D8CEBE] font-mono font-bold text-xs text-[#111613]"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-600">Selisih Kas Fisik</label>
                        <div
                          className={`p-2.5 rounded-xl font-mono font-bold text-xs flex items-center justify-between ${
                            calcCashDiff === 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : calcCashDiff < 0
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          <span>{calcCashDiff === 0 ? 'SESUAI (0)' : calcCashDiff < 0 ? 'KURANG' : 'LEBIH'}</span>
                          <span>{formatIDR(calcCashDiff)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Mutasi Bank Transfer */}
                  <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EBE4D8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#111613] flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>2. Mutasi Rekening Bank Masuk</span>
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        Target Sistem: {formatIDR(report.posReconciliationStats.systemTotalTransfer)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-600">
                          Total Transfer Valid di Rekening Koran (Rp)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400 font-bold">Rp</span>
                          <input
                            type="text"
                            value={recBankVerified}
                            onChange={(e) => setRecBankVerified(e.target.value)}
                            placeholder="Cek mutasi rekening masuk..."
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-[#D8CEBE] font-mono font-bold text-xs text-[#111613]"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-600">Selisih Mutasi Bank</label>
                        <div
                          className={`p-2.5 rounded-xl font-mono font-bold text-xs flex items-center justify-between ${
                            calcTransferDiff === 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : calcTransferDiff < 0
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          <span>{calcTransferDiff === 0 ? 'SESUAI (0)' : calcTransferDiff < 0 ? 'BELUM MASUK' : 'LEBIH'}</span>
                          <span>{formatIDR(calcTransferDiff)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Perlakuan Akuntansi Selisih */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">
                      Perlakuan Akuntansi Selisih Kasir (Jika Terjadi Selisih)
                    </label>
                    <select
                      value={recResolution}
                      onChange={(e) => setRecResolution(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] font-medium"
                    >
                      <option value="SUDAH_COCOK">Klop / Pas (Tidak Ada Selisih)</option>
                      <option value="BEBAN_PERUSAHAAN">
                        Beban Perusahaan (Catat sebagai Beban Selisih Kas Kurang - Akun 608)
                      </option>
                      <option value="POTONG_KASIR">
                        Tanggung Jawab Kasir (Potong Gaji / Tagih Selisih ke Kasir Bertugas)
                      </option>
                      <option value="PENDAPATAN_LAIN">
                        Pendapatan Lain-lain (Kelebihan Uang Fisik Kasir - Akun 403)
                      </option>
                    </select>
                    <p className="text-[11px] text-gray-500">
                      Sistem akan membuat jurnal otomatis jika ada selisih kas fisik agar buku besar tetap klop.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-gray-700">Catatan / Bukti Cek Kasir</label>
                    <textarea
                      value={recNotes}
                      onChange={(e) => setRecNotes(e.target.value)}
                      placeholder="Contoh: Shift sore selesai jam 21.00. Fisik uang pas dihitung bersama finance lead..."
                      rows={2}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingRec}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{savingRec ? 'Menyimpan...' : 'Simpan Rekonsiliasi & Jurnal'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar Guide: SOP Rekonsiliasi */}
              <div className="p-6 rounded-3xl bg-[#18211C] text-white border border-[#2D3A32] shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#C59B47]">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">SOP Tutup Shift Kasir</h4>
                </div>
                <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-[#233129] border border-[#34463B]">
                    <strong className="text-white block mb-1">1. Hitung Fisik Laci Dulu</strong>
                    Hitung uang tunai di laci kasir sebelum melihat angka total penjualan di sistem POS, untuk menghindari bias angka.
                  </div>
                  <div className="p-3 rounded-xl bg-[#233129] border border-[#34463B]">
                    <strong className="text-white block mb-1">2. Cocokkan Mutasi Rekening</strong>
                    Pastikan konsumen yang membayar transfer bukti struknya sudah benar-benar masuk di rekening koran Bank Mandiri HATOBA.
                  </div>
                  <div className="p-3 rounded-xl bg-[#233129] border border-[#34463B]">
                    <strong className="text-white block mb-1">3. Konfirmasi Toleransi Selisih</strong>
                    Batas toleransi receh &le; Rp 5.000 masuk ke Akun 608 Beban Perusahaan. Di atas itu harus diinvestigasi bersama Kasir.
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Rekonsiliasi Table */}
            <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#111613] flex items-center justify-between border-b border-gray-100 pb-3">
                <span>Riwayat Rekonsiliasi Tutup Kasir Terakhir</span>
                <span className="text-xs text-gray-400 font-mono font-normal">
                  Total: {reconciliations.length} catatan
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] text-gray-500 font-semibold border-b border-[#EAE4DC]">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal &amp; Shift</th>
                      <th className="py-2.5 px-3">Kas Sistem</th>
                      <th className="py-2.5 px-3">Kas Fisik</th>
                      <th className="py-2.5 px-3">Selisih Kas</th>
                      <th className="py-2.5 px-3">Transfer Sistem</th>
                      <th className="py-2.5 px-3">Bank Valid</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Perlakuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reconciliations.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#111613]">{rec.shiftLabel}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{rec.date} • {rec.reconciledBy}</div>
                        </td>
                        <td className="py-3 px-3 font-mono">{formatIDR(rec.systemCashTotal)}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-800">{formatIDR(rec.actualCashCounted)}</td>
                        <td className="py-3 px-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              rec.cashDiscrepancy === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.cashDiscrepancy < 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {rec.cashDiscrepancy === 0 ? '0 (Klop)' : formatIDR(rec.cashDiscrepancy)}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">{formatIDR(rec.systemTransferTotal)}</td>
                        <td className="py-3 px-3 font-mono font-bold text-blue-800">{formatIDR(rec.bankVerifiedTotal)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'BALANCED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.status === 'BALANCED' ? 'BALANCED' : 'RESOLVED'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-600 text-[11px]">
                          {rec.resolutionAction || '-'}
                        </td>
                      </tr>
                    ))}
                    {reconciliations.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
                          Belum ada catatan rekonsiliasi kasir. Lakukan tutup kasir hari ini di formulir atas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: BUKU KAS & BANK ==================== */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif-title text-xl font-bold text-[#111613] flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-600" />
                    <span>Buku Kas &amp; Mutasi Bank (Buku Pembantu)</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Seluruh arus kas masuk dan kas keluar tercatat real-time dan terhubung ke Jurnal Umum.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTxType('IN')
                    setTxCategory('INCOME_AR_COLLECTION')
                    setShowAddTxModal(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Catat Transaksi Baru</span>
                </button>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] text-gray-500 font-semibold border-b border-[#EAE4DC]">
                    <tr>
                      <th className="py-3 px-3">Tanggal</th>
                      <th className="py-3 px-3">Kategori &amp; Keterangan</th>
                      <th className="py-3 px-3">Akun</th>
                      <th className="py-3 px-3">Pihak Terkait</th>
                      <th className="py-3 px-3 text-right">Nominal Masuk</th>
                      <th className="py-3 px-3 text-right">Nominal Keluar</th>
                      <th className="py-3 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => {
                      const catInfo = CATEGORY_OPTIONS[tx.category]
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3 font-mono text-gray-500 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#111613]">
                              {catInfo?.label || tx.category}
                            </div>
                            {tx.notes && <div className="text-[11px] text-gray-400">{tx.notes}</div>}
                            {tx.referenceCode && (
                              <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                                Ref: {tx.referenceCode}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.account === 'KAS'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-blue-100 text-blue-900 border border-blue-300'
                              }`}
                            >
                              {tx.account === 'KAS' ? 'KAS FISIK' : 'BANK MANDIRI'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-700">{tx.recipientOrPayer}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                            {tx.type === 'IN' ? formatIDR(tx.amount) : '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-red-700">
                            {tx.type === 'OUT' ? formatIDR(tx.amount) : '-'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          Belum ada transaksi keuangan yang dicatat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: LAPORAN ARUS KAS SAK EMKM ==================== */}
        {activeTab === 'cashflow' && report && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif-title text-xl font-bold text-[#111613] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Laporan Arus Kas (Cash Flow Statement)</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Klasifikasi arus kas berdasarkan 3 aktivitas utama standar SAK EMKM: Operasi, Investasi, &amp; Pendanaan.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Metode Langsung
                </span>
              </div>

              <div className="space-y-6 text-xs">
                {/* 1. Arus Kas Aktivitas Operasi */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <div className="flex items-center justify-between font-bold text-sm text-[#111613]">
                    <span className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      1. Arus Kas dari Aktivitas Operasi
                    </span>
                    <span className={`font-mono ${report.operatingCashFlow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {formatIDR(report.operatingCashFlow)}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-gray-600 pl-4 border-l-2 border-emerald-300">
                    <div className="flex justify-between">
                      <span>Penerimaan Kas dari Pelanggan &amp; Pelunasan Piutang:</span>
                      <span className="font-mono text-emerald-700 font-semibold">
                        + {formatIDR(report.totalSalesRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pengeluaran Kas untuk Pembelian Daging &amp; Stok Cold Chain:</span>
                      <span className="font-mono text-red-700 font-semibold">
                        - {formatIDR(report.totalMeatPurchases)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pengeluaran Kas Operasional (Listrik Freezer, Gaji, dll):</span>
                      <span className="font-mono text-red-700 font-semibold">
                        - {formatIDR(report.totalOperatingExpenses)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Arus Kas Aktivitas Investasi */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <div className="flex items-center justify-between font-bold text-sm text-[#111613]">
                    <span className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      2. Arus Kas dari Aktivitas Investasi
                    </span>
                    <span className={`font-mono ${report.investingCashFlow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {formatIDR(report.investingCashFlow)}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-gray-600 pl-4 border-l-2 border-blue-300">
                    <div className="flex justify-between">
                      <span>Pembelian Aset Tetap (Chest Freezer, Cooler Box, Kompresor):</span>
                      <span className="font-mono text-red-700 font-semibold">
                        {report.investingCashFlow < 0 ? formatIDR(report.investingCashFlow) : 'Rp 0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Arus Kas Aktivitas Pendanaan */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <div className="flex items-center justify-between font-bold text-sm text-[#111613]">
                    <span className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      3. Arus Kas dari Aktivitas Pendanaan
                    </span>
                    <span className={`font-mono ${report.financingCashFlow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {formatIDR(report.financingCashFlow)}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-gray-600 pl-4 border-l-2 border-purple-300">
                    <div className="flex justify-between">
                      <span>Setoran Modal Awal &amp; Injeksi Modal Pemilik:</span>
                      <span className="font-mono text-emerald-700 font-semibold">
                        + {formatIDR(report.capitalInjection)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prive / Penarikan Dana Pemilik:</span>
                      <span className="font-mono text-red-700 font-semibold">
                        - {formatIDR(report.ownerDraws)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Change in Cash */}
                <div className="p-5 rounded-2xl bg-[#111613] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div>
                    <span className="text-xs text-gray-400">Total Kenaikan / (Penurunan) Kas Bersih:</span>
                    <div className="text-xl font-bold font-mono text-[#C59B47]">
                      {formatIDR(report.netCashChange)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Posisi Saldo Kas &amp; Bank Akhir:</span>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      {formatIDR(report.totalLiquidCash)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: NERACA SEDERHANA & HPP ==================== */}
        {activeTab === 'balancesheet' && report && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif-title text-xl font-bold text-[#111613] flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-600" />
                    <span>Neraca Sederhana &amp; Penentuan HPP (SAK EMKM)</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Laporan posisi keuangan aset, liabilitas, dan ekuitas usaha HATOBA per hari ini.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInventoryModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] hover:bg-gray-100 text-xs font-bold text-[#111613] flex items-center gap-1.5"
                  >
                    <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Opname Nilai Stok</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Balance Sheet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* SISI KIRI: ASET */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E0D6C8] pb-2">
                    <h3 className="font-bold text-sm text-[#111613]">ASET (HARTA USAHA)</h3>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatIDR(report.balanceSheet.assets.totalAssets)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-gray-700">Aset Lancar:</div>
                    <div className="pl-3 space-y-1.5 text-gray-600">
                      <div className="flex justify-between">
                        <span>101. Kas Fisik di Tangan:</span>
                        <span className="font-mono font-bold">{formatIDR(report.realCash)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>102. Bank Mandiri Operasional:</span>
                        <span className="font-mono font-bold">{formatIDR(report.realBank)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>103. Piutang Usaha Konsumen:</span>
                        <span className="font-mono font-bold text-amber-700">{formatIDR(report.totalReceivables)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>104. Persediaan Daging &amp; Jeroan Beku:</span>
                        <span className="font-mono font-bold text-cyan-700">{formatIDR(report.inventoryValue)}</span>
                      </div>
                    </div>

                    <div className="font-semibold text-gray-700 pt-2">Aset Tetap (Peralatan Cold Chain):</div>
                    <div className="pl-3 space-y-1.5 text-gray-600">
                      <div className="flex justify-between">
                        <span>120. Chest Freezer &amp; Cooler Box (-18°C):</span>
                        <span className="font-mono font-bold">{formatIDR(report.balanceSheet.assets.coldChainFixedAssets)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E0D6C8] flex justify-between font-bold text-sm text-[#111613]">
                    <span>TOTAL ASET:</span>
                    <span className="font-mono text-emerald-800">{formatIDR(report.balanceSheet.assets.totalAssets)}</span>
                  </div>
                </div>

                {/* SISI KANAN: LIABILITAS & EKUITAS */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E0D6C8] pb-2">
                    <h3 className="font-bold text-sm text-[#111613]">KEWAJIBAN &amp; EKUITAS</h3>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatIDR(report.balanceSheet.liabilitiesAndEquity.totalLiabilitiesAndEquity)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-gray-700">Kewajiban Jangka Pendek:</div>
                    <div className="pl-3 space-y-1.5 text-gray-600">
                      <div className="flex justify-between">
                        <span>201. Hutang Usaha Supplier RPH:</span>
                        <span className="font-mono font-bold text-red-700">
                          {formatIDR(report.balanceSheet.liabilitiesAndEquity.accountsPayable)}
                        </span>
                      </div>
                    </div>

                    <div className="font-semibold text-gray-700 pt-2">Ekuitas (Modal Pemilik):</div>
                    <div className="pl-3 space-y-1.5 text-gray-600">
                      <div className="flex justify-between">
                        <span>301. Modal Pemilik (Doni Kristiawan):</span>
                        <span className="font-mono font-bold">{formatIDR(report.capitalInjection)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>302. Prive / Pengambilan Pribadi:</span>
                        <span className="font-mono font-bold text-red-700">- {formatIDR(report.ownerDraws)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>303. Saldo Laba Berjalan:</span>
                        <span className="font-mono font-bold text-emerald-700">{formatIDR(report.netOperatingIncome)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E0D6C8] flex justify-between font-bold text-sm text-[#111613]">
                    <span>TOTAL KEWAJIBAN &amp; EKUITAS:</span>
                    <span className="font-mono text-emerald-800">
                      {formatIDR(report.balanceSheet.liabilitiesAndEquity.totalLiabilitiesAndEquity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: PERUBAHAN MODAL ==================== */}
        {activeTab === 'equity' && report && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-5">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="font-serif-title text-xl font-bold text-[#111613] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Laporan Perubahan Modal (Equity Statement)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Menunjukkan pergerakan modal pemilik HATOBA dari modal awal, penambahan laba, dan penarikan prive.
                </p>
              </div>

              <div className="max-w-xl mx-auto p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-4 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-semibold">Modal Awal Disetor:</span>
                  <span className="font-mono font-bold text-base text-[#111613]">
                    {formatIDR(report.beginningEquity)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 text-emerald-800">
                  <span>+ Tambahan Setoran Modal Berjalan:</span>
                  <span className="font-mono font-bold">+ {formatIDR(report.capitalInjection - report.beginningEquity)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 text-emerald-800">
                  <span>+ Laba Bersih Usaha (Net Income):</span>
                  <span className="font-mono font-bold">+ {formatIDR(report.netIncome)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 text-red-700">
                  <span>- Penarikan Prive Pemilik:</span>
                  <span className="font-mono font-bold">- {formatIDR(report.ownerDraws)}</span>
                </div>
                <div className="flex justify-between py-3 px-4 rounded-2xl bg-emerald-100 text-emerald-950 font-bold text-sm">
                  <span>= Modal Akhir Pemilik (Per Hari Ini):</span>
                  <span className="font-mono text-base">{formatIDR(report.endingEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: BUKU PIUTANG TEMPO (AR AGING) ==================== */}
        {activeTab === 'ar_aging' && report && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif-title text-xl font-bold text-[#111613] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span>Buku Pembantu Piutang &amp; Analisis Umur Piutang (AR Aging)</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Daftar tagihan tempo konsumen warung makan, resto, dan hotel yang belum lunas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-red-100 text-red-800 border border-red-300">
                    Macet: {formatIDR(report.receivablesOverdue)}
                  </span>
                </div>
              </div>

              {/* Pending Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] text-gray-500 font-semibold border-b border-[#EAE4DC]">
                    <tr>
                      <th className="py-3 px-3">No. Invoice &amp; Tanggal</th>
                      <th className="py-3 px-3">Nama Pelanggan &amp; Usaha</th>
                      <th className="py-3 px-3">Metode &amp; Jatuh Tempo</th>
                      <th className="py-3 px-3 text-right">Total Tagihan</th>
                      <th className="py-3 px-3 text-right">Sudah Dibayar</th>
                      <th className="py-3 px-3 text-right">Sisa Piutang</th>
                      <th className="py-3 px-3 text-center">Status Umur</th>
                      <th className="py-3 px-3 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.pendingTempoOrders.map((ord) => {
                      const remaining = Math.max(0, ord.totalAmount - (ord.paidAmount || 0))
                      const daysOld = Math.floor(
                        (new Date().getTime() - new Date(ord.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                      )
                      const isOverdue = daysOld > 3

                      return (
                        <tr key={ord.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold font-mono text-[#111613]">INV-{ord.referenceCode}</div>
                            <div className="text-[11px] text-gray-400">
                              {new Date(ord.createdAt).toLocaleDateString('id-ID')}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#111613]">{ord.customerName}</div>
                            {ord.businessName && (
                              <div className="text-[11px] text-gray-500 font-medium">{ord.businessName}</div>
                            )}
                            {ord.phone && <div className="text-[10px] text-gray-400">{ord.phone}</div>}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              {ord.paymentMethod === 'TEMPO' ? 'TEMPO 3 HARI' : 'DP SEBAGIAN'}
                            </span>
                            <div className="text-[10px] text-gray-500 mt-0.5">Umur: {daysOld} hari</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono">{formatIDR(ord.totalAmount)}</td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-700">
                            {formatIDR(ord.paidAmount || 0)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-red-700">
                            {formatIDR(remaining)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isOverdue
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {isOverdue ? `Lewat (${daysOld} hr)` : 'Lancar (0-3 hr)'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => quickSettleAR(ord)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                              title="Catat Uang Pelunasan Masuk ke Kas/Bank"
                            >
                              Pelunasan
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {report.pendingTempoOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
                          Tidak ada piutang tempo yang menggantung. Semua pesanan berstatus Lunas!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 8: JURNAL UMUM OTOMATIS ==================== */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif-title text-xl font-bold text-[#111613] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <span>Jurnal Umum Otomatis (General Journal Posting)</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Setiap transaksi kas &amp; bank langsung terposting ke jurnal ganda (Debit = Kredit) standar akuntansi.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  Double-Entry Automatic
                </span>
              </div>

              {/* Journal Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] text-gray-500 font-semibold border-b border-[#EAE4DC]">
                    <tr>
                      <th className="py-3 px-3">Tanggal &amp; Ref</th>
                      <th className="py-3 px-3">Kode &amp; Nama Akun</th>
                      <th className="py-3 px-3 text-right">Debit (Rp)</th>
                      <th className="py-3 px-3 text-right">Kredit (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {journal.map((entry) => (
                      <React.Fragment key={entry.id}>
                        <tr className="bg-gray-50/70">
                          <td colSpan={4} className="py-2 px-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#111613]">{entry.description}</span>
                              <span className="font-mono text-gray-400 text-[11px]">
                                {entry.date} • Ref: {entry.referenceNo}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {entry.lines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/40">
                            <td className="py-1.5 px-3"></td>
                            <td className="py-1.5 px-3 font-mono">
                              <span className={line.credit > 0 ? 'pl-6 text-gray-600' : 'font-bold text-[#111613]'}>
                                {line.accountCode} - {line.accountName}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono font-bold text-[#111613]">
                              {line.debit > 0 ? formatIDR(line.debit) : '-'}
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono font-bold text-[#111613]">
                              {line.credit > 0 ? formatIDR(line.credit) : '-'}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {journal.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          Belum ada entri jurnal umum.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 9: PANDUAN & SOP HELP ==================== */}
        {activeTab === 'help' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-[#C59B47] mb-1">
                  <HelpCircle className="w-5 h-5" />
                  <span className="text-xs uppercase font-bold tracking-wider">Pusat Bantuan &amp; Tata Kelola</span>
                </div>
                <h2 className="font-serif-title text-2xl font-bold text-[#111613]">
                  Panduan Penggunaan Mini ERP &amp; Kebijakan Keuangan HATOBA
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  SOP Praktis untuk Pemilik, Kasir, dan Tim Finance tanpa latar belakang akuntansi rumit.
                </p>
              </div>

              {/* Accordion / Content Cards */}
              <div className="space-y-6 text-xs leading-relaxed text-gray-700">
                {/* 1. SOP Rekonsiliasi Tutup Kasir */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <h3 className="font-bold text-sm text-[#111613] flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>1. SOP Harian Tutup Kasir &amp; Validasi Mutasi Bank</span>
                  </h3>
                  <p>
                    Setiap pergantian shift atau tutup toko (cut-off malam pukul 21:00 WIB), kasir wajib membuka tab <strong>Tutup Kasir &amp; Bank</strong>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li><strong>Hitung Uang Fisik di Laci:</strong> Hitung seluruh uang kertas dan koin tanpa melihat angka sistem terlebih dahulu. Masukkan ke kolom <em>Jumlah Fisik Uang di Laci Dihitung</em>.</li>
                    <li><strong>Cek Mutasi Rekening Bank Mandiri:</strong> Buka mobile banking / internet banking, cek total transfer masuk dari konsumen hari ini, masukkan ke kolom <em>Total Transfer Valid di Rekening Koran</em>.</li>
                    <li><strong>Perlakuan Selisih Kasir:</strong> Jika fisik kurang, pilih <em>Beban Perusahaan</em> (Akun 608) jika dalam batas toleransi receh, atau <em>Potong Kasir</em> jika ada kelalaian kasir. Jika fisik lebih, pilih <em>Pendapatan Lain-lain</em> (Akun 403).</li>
                    <li>Sistem otomatis membuat jurnal penyesuaian selisih kas tanpa kasir pusing hitung debit/kredit manual.</li>
                  </ul>
                </div>

                {/* 2. Kebijakan Cut-off & Piutang Tempo */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <h3 className="font-bold text-sm text-[#111613] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>2. Kebijakan Cut-off &amp; Penagihan Piutang Tempo (Kunci Mengatasi Kas Kosong)</span>
                  </h3>
                  <p>
                    Masalah utama HATOBA adalah modal kerja tersandera di konsumen resto/warung yang bayar tempo. Kebijakan tegas yang wajib diterapkan:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li><strong>Batas Tempo Maksimal 3 Hari:</strong> Tagihan tempo hanya diberikan untuk konsumen B2B terverifikasi dengan jatuh tempo maksimal 3 hari kalender.</li>
                    <li><strong>Lock Order Jika Ada Tagihan Lewat Tempo:</strong> Jangan pernah mengirim pesanan baru jika invoice sebelumnya belum lunas (lihat alert merah di tab Ringkasan).</li>
                    <li><strong>Plafon Piutang Konsumen:</strong> Tiap warung makan memiliki limit piutang maksimal (misal Rp 3.000.000). Jika melewati plafon, pesanan berikutnya wajib TUNAI atau TRANSFER sebelum barang dikirim dari freezer.</li>
                  </ul>
                </div>

                {/* 3. Pembagian Margin Kotor Daging Cold Chain */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <h3 className="font-bold text-sm text-[#111613] flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-[#C59B47]" />
                    <span>3. Rekomendasi Alokasi Margin Kotor (Penjualan - HPP Daging)</span>
                  </h3>
                  <p>
                    Dalam bisnis cold chain daging sapi, <em>Margin Kotor</em> (Rp Omzet - Rp Beli Sapi/Jeroan) jangan langsung dianggap laba bersih. Alokasi ideal HATOBA:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-center">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-base font-bold text-emerald-800">60%</div>
                      <div className="font-semibold text-gray-700 text-[11px] mt-0.5">Modal Putar Restock</div>
                      <p className="text-[10px] text-gray-500 mt-1">Uang aman untuk kulakan daging berikutnya di RPH.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="text-base font-bold text-blue-800">20%</div>
                      <div className="font-semibold text-gray-700 text-[11px] mt-0.5">Listrik &amp; Operasional</div>
                      <p className="text-[10px] text-gray-500 mt-1">Biaya PLN Freezer -18°C, plastik vacuum, kurir.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="text-base font-bold text-amber-800">10%</div>
                      <div className="font-semibold text-gray-700 text-[11px] mt-0.5">Dana Cadangan Mesin</div>
                      <p className="text-[10px] text-gray-500 mt-1">Service kompresor, genset, fluktuasi harga sapi.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                      <div className="text-base font-bold text-purple-800">10%</div>
                      <div className="font-semibold text-gray-700 text-[11px] mt-0.5">Laba Bersih / Simpanan</div>
                      <p className="text-[10px] text-gray-500 mt-1">Keuntungan bersih pemilik untuk tabungan usaha.</p>
                    </div>
                  </div>
                </div>

                {/* 4. Ketentuan Pajak UMKM PP 55/2022 */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <h3 className="font-bold text-sm text-[#111613] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>4. Kapan HATOBA Perlu Daftar &amp; Bayar Pajak? (PP 55 Tahun 2022)</span>
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li><strong>Omzet s.d. Rp 500 Juta/Tahun BEBAS PAJAK:</strong> Sesuai PP 55/2022 dan UU HPP, Wajib Pajak Orang Pribadi UMKM dengan omzet di bawah Rp 500.000.000 dalam setahun <em>TIDAK DIKENAKAN PAJAK</em> PPh Final sama sekali (0%).</li>
                    <li><strong>Tarif PPh Final 0,5%:</strong> Jika omzet kumulatif melewati Rp 500 juta, pajak yang dibayar hanya 0,5% dari kelebihan omzet tersebut. Sangat ringan dan sederhana tanpa pembukuan rumit.</li>
                    <li><strong>Saran Praktisi:</strong> Fokuskan dulu energi 6-12 bulan pertama untuk menstabilkan arus kas, merapikan catatan kasir di Mini ERP ini, dan menekan piutang macet. Pajak baru dipikirkan saat omzet mendekati batas threshold.</li>
                  </ul>
                </div>

                {/* 5. Glosarium Singkat Akuntansi SAK EMKM */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <h3 className="font-bold text-sm text-[#111613] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>5. Kamus &amp; Glosarium Istilah Akuntansi Sederhana</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <strong className="text-[#111613]">HPP (Harga Pokok Penjualan):</strong>
                      <p className="text-gray-500">Harga beli daging mentah dari RPH ditambah ongkir pendingin masuk.</p>
                    </div>
                    <div>
                      <strong className="text-[#111613]">Piutang Usaha (AR):</strong>
                      <p className="text-gray-500">Uang HATOBA yang masih ada di tangan konsumen yang membeli tempo.</p>
                    </div>
                    <div>
                      <strong className="text-[#111613]">Hutang Usaha (AP):</strong>
                      <p className="text-gray-500">Kewajiban HATOBA ke supplier peternak/RPH yang belum dilunasi.</p>
                    </div>
                    <div>
                      <strong className="text-[#111613]">Ekuitas (Modal):</strong>
                      <p className="text-gray-500">Kekayaan bersih pemilik setelah seluruh total aset dikurangi seluruh hutang.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================= MODAL: TAMBAH TRANSAKSI KAS/BANK ======================= */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E3D9CC] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#EAE4DC] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#111613]">
                  {txType === 'IN' ? 'Catat Kas Masuk (Penerimaan)' : 'Catat Kas Keluar (Pengeluaran)'}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Otomatis diposting ke Jurnal Umum &amp; mempengaruhi Laporan Arus Kas
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTxModal(false)}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('IN')}
                  className={`py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${
                    txType === 'IN' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Kas Masuk (IN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('OUT')}
                  className={`py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${
                    txType === 'OUT' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Kas Keluar (OUT)</span>
                </button>
              </div>

              {/* Date & Account */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] font-mono text-xs text-[#111613]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Pilih Rekening / Kas</label>
                  <select
                    value={txAccount}
                    onChange={(e) => setTxAccount(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] font-medium"
                  >
                    <option value="BANK_MANDIRI">Bank Mandiri (102)</option>
                    <option value="KAS">Kas di Tangan / Kasir (101)</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Kategori Akuntansi SAK EMKM</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as FinanceCategory)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] font-medium"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nominal */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Nominal Transaksi (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">Rp</span>
                  <input
                    type="text"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Contoh: 1500000"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-[#D8CEBE] font-mono font-bold text-xs text-[#111613]"
                    required
                  />
                </div>
              </div>

              {/* Recipient / Payer */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">
                  {txType === 'IN' ? 'Diterima Dari (Nama Konsumen / Pemilik)' : 'Dibayarkan Kepada (Supplier / PLN / Staf)'}
                </label>
                <input
                  type="text"
                  value={txRecipient}
                  onChange={(e) => setTxRecipient(e.target.value)}
                  placeholder="Nama pihak terkait..."
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                  required
                />
              </div>

              {/* Ref Code & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">No. Referensi / Order (Opsional)</label>
                  <input
                    type="text"
                    value={txRefCode}
                    onChange={(e) => setTxRefCode(e.target.value)}
                    placeholder="Contoh: HTB-ORD-..."
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] font-mono text-xs text-[#111613]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Catatan Tambahan</label>
                  <input
                    type="text"
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    placeholder="Keterangan..."
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingTx}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  {savingTx ? 'Menyimpan...' : 'Simpan & Posting Jurnal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: STOCK OPNAME FREEZER (HPP) ======================= */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E3D9CC] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#EAE4DC] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#111613]">
                  Stock Opname Fisik Freezer (-18°C)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Update nilai stok persediaan akhir untuk menghitung HPP riil
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInventoryModal(false)}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                ❄️ <strong>Tips Cut-Off:</strong> Timbang atau hitung jumlah pack daging &amp; jeroan di freezer saat cut-off mingguan. Nilai ini menjadi <em>Persediaan Akhir</em> di Neraca dan pengurang HPP.
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Total Berat Daging &amp; Jeroan (Kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={invWeightInput}
                  onChange={(e) => {
                    const w = parseFloat(e.target.value) || 0
                    setInvWeightInput(e.target.value)
                    setInvValueInput(String(Math.round(w * 70000)))
                  }}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs font-mono font-bold text-[#111613]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Estimasi Nilai Total Persediaan (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">Rp</span>
                  <input
                    type="text"
                    value={invValueInput}
                    onChange={(e) => setInvValueInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs font-mono font-bold text-[#111613]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Catatan Kondisi Freezer &amp; Produk</label>
                <input
                  type="text"
                  value={invNotesInput}
                  onChange={(e) => setInvNotesInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInventoryModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingInv}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  {savingInv ? 'Menyimpan...' : 'Perbarui Neraca & HPP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-bottom-4 ${
            toast.type === 'success' ? 'bg-[#1D6C48] text-white' : 'bg-red-700 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
