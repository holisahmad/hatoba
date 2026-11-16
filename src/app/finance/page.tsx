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
} from 'lucide-react'
import {
  FinanceTransaction,
  FinanceCategory,
  CATEGORY_OPTIONS,
  ComprehensiveFinancialReport,
  InventorySnapshot,
  InitialCapitalConfig,
  JournalEntry,
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
  const [loading, setLoading] = useState(true)

  // Tab State
  type FinanceTab = 'overview' | 'transactions' | 'cashflow' | 'balancesheet' | 'equity' | 'ar_aging' | 'journal' | 'tax_advice'
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
      setIsAuthenticated(data.authenticated)
      if (data.authenticated) {
        fetchFinanceData()
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
        body: JSON.stringify({ password: pinInput.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsAuthenticated(true)
        setPinInput('')
        fetchFinanceData()
      } else {
        setAuthError(data.error || 'PIN / Kata sandi keuangan salah.')
      }
    } catch {
      setAuthError('Gagal menghubungkan ke server keuangan.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/finance/auth', { method: 'DELETE' })
      setIsAuthenticated(false)
      showToast('Sesi finance berhasil ditutup.')
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
        // Reset form
        setTxAmount('')
        setTxRecipient('')
        setTxNotes('')
        setTxRefCode('')
        // Refresh data
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

  // ======================= VIEW: LOGIN SCREEN (SUB-SISTEM TERPISAH) =======================
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#111613] text-[#FAF8F5] flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Subtle decorative background circles */}
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
              Portal internal manajemen arus kas, buku piutang tempo, neraca sederhana, dan penentuan HPP Cold Chain.
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

  // ======================= VIEW: DASHBOARD ERP UTAMA =======================
  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#111613] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-[#111613] text-white border-b border-[#2A362F] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <span>Ringkasan Finansial</span>
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
              <span>Jurnal Umum Otomatis</span>
            </button>

            <button
              onClick={() => setActiveTab('tax_advice')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'tax_advice'
                  ? 'bg-amber-400 text-[#111613]'
                  : 'text-amber-300/80 hover:text-amber-200 hover:bg-[#222E27]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Panduan Pajak &amp; Kas HATOBA</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ==================== TAB 1: OVERVIEW (RINGKASAN FINANSIAL) ==================== */}
        {activeTab === 'overview' && report && (
          <div className="space-y-6">
            {/* Top Insight Alert Box: Solusi Masalah Nyata HATOBA */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="font-bold text-sm sm:text-base text-[#111613]">
                    Diagnosa Keuangan &amp; Arus Kas HATOBA
                  </h2>
                </div>
                <span className="text-xs font-mono font-semibold text-gray-500">
                  Cut-Off Perputaran: Mingguan (SOP Cold Chain)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EBE4D8] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Masalah Utama Terdeteksi:
                  </span>
                  <div className="font-bold text-red-800 text-sm">
                    &ldquo;Omzet Besar Tapi Duit Kas Kosong&rdquo;
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Terjadi karena <strong>{formatIDR(report.totalReceivables)}</strong> omzet tertahan di piutang tempo konsumen. Sementara supplier daging dan listrik freezer menuntut kas riil segera.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Solusi Pembagian Margin Kotor:
                  </span>
                  <div className="font-bold text-emerald-950 text-sm">
                    Jangan Akui Laba Sebelum Piutang Cair
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Alokasikan Margin Kotor: <strong>65%</strong> untuk modal putar kas operasional, <strong>15%</strong> cadangan darurat freezer, <strong>10%</strong> cadangan piutang macet, dan <strong>10%</strong> saldo kas ditahan.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    Aturan Cut-Off Mingguan:
                  </span>
                  <div className="font-bold text-amber-950 text-sm">
                    Setiap Jumat Sore / Sabtu
                  </div>
                  <p className="text-amber-900 leading-relaxed">
                    Kunci pengiriman baru bagi mitra yang belum melunasi tagihan tempo &gt; 3 hari. Cocokkan saldo mutasi bank Mandiri dengan faktur yang diterbitkan.
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Kartu Metrik Pokok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Kas Riil */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3D9CC] shadow-sm space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Uang Kas &amp; Bank Riil
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-2xl text-[#111613]">
                    {formatIDR(report.totalLiquidCash)}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                    <div>• Bank Mandiri: <strong className="text-emerald-700">{formatIDR(report.realBank)}</strong></div>
                    <div>• Kas di Tangan: <strong>{formatIDR(report.realCash)}</strong></div>
                  </div>
                </div>
                <div className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-block">
                  Duit riil yang siap dibelanjakan hari ini
                </div>
              </div>

              {/* Card 2: Piutang Usaha Konsumen (Tempo) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-sm space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-800">
                    Uang Nyangkut di Piutang (AR)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-2xl text-amber-900">
                    {formatIDR(report.totalReceivables)}
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1 space-y-0.5">
                    <div>• Tempo Lancar (≤3 hari): <strong>{formatIDR(report.receivablesCurrent)}</strong></div>
                    <div>• Terlambat / Warning: <strong className="text-red-700">{formatIDR(report.receivablesOverdue)}</strong></div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('ar_aging')}
                  className="text-[10px] font-bold text-[#8C6B24] hover:underline flex items-center gap-1"
                >
                  <span>Buka Tagihan Konsumen ({report.pendingTempoOrders.length})</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 3: Nilai Stok Daging Beku (Persediaan Freezer) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3D9CC] shadow-sm space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Stok Daging di Freezer
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Snowflake className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-2xl text-[#111613]">
                    {formatIDR(report.inventoryValue)}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Berat Fisik: <strong>{inventory?.totalWeightKg || 0} kg</strong> daging &amp; jeroan
                  </div>
                </div>
                <button
                  onClick={() => setShowInventoryModal(true)}
                  className="text-[10px] font-semibold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <span>Update Stock Opname Freezer</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 4: Margin Kotor (Penjualan - HPP) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3D9CC] shadow-sm space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Margin Kotor (Gross Profit)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-2xl text-purple-950">
                    {formatIDR(report.grossProfitMarginRp)}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Margin: <strong>{report.grossProfitMarginPercent.toFixed(1)}%</strong> dari penjualan
                  </div>
                </div>
                <div className="text-[10px] text-gray-500">
                  HPP Dihitung: {formatIDR(report.estimatedHPP)}
                </div>
              </div>
            </div>

            {/* Rekomendasi Alokasi Margin Kotor (Bucket Cashflow Cold Chain) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3D9CC] shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif-title text-lg font-bold text-[#111613]">
                    Rekomendasi Alokasi Margin Kotor HATOBA
                  </h3>
                  <p className="text-xs text-gray-500">
                    Formula pengamanan kas agar HATOBA tidak kehabisan uang saat konsumen membayar tempo.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Total Margin Tersedia: {formatIDR(report.grossProfitMarginRp)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bucket 1: 65% Kas Putar Operasional */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDD0] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#111613]">1. Modal Putar Kas Operasional</span>
                    <span className="font-mono font-bold text-emerald-700">65%</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-800">
                    {formatIDR(report.grossProfitMarginRp * 0.65)}
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Standby di Bank Mandiri untuk talangan beli daging tunai sebelum tagihan tempo cair, bayar listrik freezer &amp; BBM armada.
                  </p>
                </div>

                {/* Bucket 2: 15% Cadangan Freezer & Maintenance */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDD0] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#111613]">2. Cadangan Darurat Cold Chain</span>
                    <span className="font-mono font-bold text-[#8C6B24]">15%</span>
                  </div>
                  <div className="text-lg font-bold text-[#8C6B24]">
                    {formatIDR(report.grossProfitMarginRp * 0.15)}
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Simpanan darurat jika kompresor freezer drop, isi freon, beli cooler box tambahan, atau perbaikan armada mendadak.
                  </p>
                </div>

                {/* Bucket 3: 10% Cadangan Piutang Macet */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDD0] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#111613]">3. Cadangan Piutang Macet</span>
                    <span className="font-mono font-bold text-amber-700">10%</span>
                  </div>
                  <div className="text-lg font-bold text-amber-800">
                    {formatIDR(report.grossProfitMarginRp * 0.10)}
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Peredam risiko jika ada warung/resto yang menunggak lebih dari 30 hari agar cashflow pembelian ke RPH tidak terhenti.
                  </p>
                </div>

                {/* Bucket 4: 10% Saldo Kas Pemilik / Ditahan */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDD0] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#111613]">4. Laba Bersih Ditahan / Prive</span>
                    <span className="font-mono font-bold text-blue-700">10%</span>
                  </div>
                  <div className="text-lg font-bold text-blue-900">
                    {formatIDR(report.grossProfitMarginRp * 0.10)}
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Porsi yang aman untuk diambil pemilik (prive) atau ditahan memperbesar modal usaha tanpa membuat perusahaan sesak nafas.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="p-5 rounded-2xl bg-[#111613] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C59B47] text-[#111613] flex items-center justify-center font-bold flex-shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Ada Uang Masuk dari Konsumen atau Belanja Daging Baru?</h4>
                  <p className="text-xs text-gray-300">
                    Catat langsung di Buku Kas &amp; Bank agar Neraca dan Jurnal Umum otomatis terupdate.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTxType('IN')
                  setShowAddTxModal(true)
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C59B47] hover:bg-[#D4AA55] text-[#111613] font-bold text-xs transition-all shadow-md flex-shrink-0"
              >
                + Catat Transaksi Sekarang
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: TRANSAKSI (BUKU KAS & BANK) ==================== */}
        {activeTab === 'transactions' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-[#E3D9CC] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif-title text-lg font-bold text-[#111613]">
                  Buku Kas &amp; Bank HATOBA
                </h3>
                <p className="text-xs text-gray-500">
                  Pencatatan uang masuk dan keluar riil (Kasir &amp; Bank Mandiri 1370016639326 a.n Doni Kristiawan).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTxType('IN')
                    setShowAddTxModal(true)
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>+ Uang Masuk (Penerimaan)</span>
                </button>

                <button
                  onClick={() => {
                    setTxType('OUT')
                    setShowAddTxModal(true)
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>- Uang Keluar (Pengeluaran)</span>
                </button>
              </div>
            </div>

            {/* Tabel Transaksi */}
            <div className="bg-white rounded-3xl border border-[#E3D9CC] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#EAE4DC] text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Tipe &amp; Akun</th>
                      <th className="py-3 px-4">Kategori Finansial</th>
                      <th className="py-3 px-4">Pihak Terkait &amp; Keterangan</th>
                      <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE4DC]/60 font-sans">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          Belum ada transaksi kas/bank yang tercatat.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => {
                        const cat = CATEGORY_OPTIONS[tx.category]
                        return (
                          <tr key={tx.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-gray-600 whitespace-nowrap">
                              {tx.date}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    tx.type === 'IN'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {tx.type === 'IN' ? 'MASUK' : 'KELUAR'}
                                </span>
                                <span className="font-semibold text-gray-700 text-[11px]">
                                  {tx.account === 'BANK_MANDIRI' ? 'Bank Mandiri' : 'Kasir / Tunai'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-[#111613] block">
                                {cat?.label || tx.category}
                              </span>
                              {tx.referenceCode && (
                                <span className="text-[10px] font-mono text-[#8C6B24]">
                                  Ref: {tx.referenceCode}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-[#111613]">{tx.recipientOrPayer}</div>
                              {tx.notes && (
                                <div className="text-[11px] text-gray-500 italic">{tx.notes}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                              <span
                                className={tx.type === 'IN' ? 'text-emerald-700' : 'text-red-700'}
                              >
                                {tx.type === 'IN' ? '+' : '-'} {formatIDR(tx.amount)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: LAPORAN ARUS KAS (CASH FLOW) ==================== */}
        {activeTab === 'cashflow' && report && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3D9CC] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-serif-title text-xl font-bold text-[#111613]">
                    Laporan Arus Kas (Statement of Cash Flows)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Standar SAK EMKM — Melacak aliran uang riil masuk dan keluar tanpa bias piutang tempo.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Kenaikan / Penurunan Kas Bersih</span>
                  <span className={`font-mono font-bold text-lg ${report.netCashChange >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {report.netCashChange >= 0 ? '+' : ''}{formatIDR(report.netCashChange)}
                  </span>
                </div>
              </div>

              {/* 3 Bagian Arus Kas */}
              <div className="space-y-6 text-xs font-sans">
                {/* 1. Arus Kas Operasional */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-2 font-bold text-[#111613]">
                    <span className="text-sm">1. Arus Kas dari Aktivitas Operasional</span>
                    <span className={`font-mono text-sm ${report.operatingCashFlow >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                      {formatIDR(report.operatingCashFlow)}
                    </span>
                  </div>
                  <div className="space-y-2 text-gray-600 pl-2">
                    <div className="flex justify-between">
                      <span>• Penerimaan Kas dari Penjualan &amp; Pelunasan Piutang Konsumen</span>
                      <span className="font-mono text-emerald-800 font-semibold">
                        + {formatIDR(transactions.filter(t => t.type === 'IN' && CATEGORY_OPTIONS[t.category]?.cashFlowCategory === 'OPERATING').reduce((s, t) => s + t.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Pengeluaran Kas untuk Pembelian Daging Beku &amp; Kargo Pendingin Masuk</span>
                      <span className="font-mono text-red-800 font-semibold">
                        - {formatIDR(transactions.filter(t => t.type === 'OUT' && (t.category === 'EXPENSE_MEAT_PURCHASE' || t.category === 'EXPENSE_FREIGHT_IN')).reduce((s, t) => s + t.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Pengeluaran Kas Operasional Cold Chain (Listrik, BBM, Gaji, Kemasan, Service)</span>
                      <span className="font-mono text-red-800 font-semibold">
                        - {formatIDR(report.totalOperatingExpenses)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Arus Kas Investasi */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-2 font-bold text-[#111613]">
                    <span className="text-sm">2. Arus Kas dari Aktivitas Investasi</span>
                    <span className={`font-mono text-sm ${report.investingCashFlow >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                      {formatIDR(report.investingCashFlow)}
                    </span>
                  </div>
                  <div className="space-y-2 text-gray-600 pl-2">
                    <div className="flex justify-between">
                      <span>• Pembelian Aset Tetap Freezer, Chiller &amp; Cooler Box Beku</span>
                      <span className="font-mono text-red-800 font-semibold">
                        {report.investingCashFlow < 0 ? `- ${formatIDR(Math.abs(report.investingCashFlow))}` : 'Rp 0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Arus Kas Pendanaan */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                  <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-2 font-bold text-[#111613]">
                    <span className="text-sm">3. Arus Kas dari Aktivitas Pendanaan (Modal &amp; Prive)</span>
                    <span className={`font-mono text-sm ${report.financingCashFlow >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                      {formatIDR(report.financingCashFlow)}
                    </span>
                  </div>
                  <div className="space-y-2 text-gray-600 pl-2">
                    <div className="flex justify-between">
                      <span>• Setoran Tambahan Modal Tunai Pemilik</span>
                      <span className="font-mono text-emerald-800 font-semibold">
                        + {formatIDR(report.capitalInjection)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Penarikan Dana Pribadi Pemilik (Prive)</span>
                      <span className="font-mono text-red-800 font-semibold">
                        - {formatIDR(report.ownerDraws)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rekap Saldo Kas Riil Akhir */}
                <div className="p-5 rounded-2xl bg-emerald-950 text-white flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div>
                    <span className="text-[11px] text-emerald-300 block">TOTAL SALDO KAS &amp; BANK RIIL AKHIR PERIODE:</span>
                    <span className="text-xs text-gray-400">Kas di tangan + Rekening Mandiri 1370016639326 a.n Doni Kristiawan</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#E5C278]">
                    {formatIDR(report.totalLiquidCash)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: NERACA SEDERHANA & HPP ==================== */}
        {activeTab === 'balancesheet' && report && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3D9CC] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-serif-title text-xl font-bold text-[#111613]">
                    Neraca Sederhana HATOBA (Balance Sheet)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Posisi Aset, Kewajiban (Hutang), dan Modal Bersih per Tanggal Cut-Off.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    report.balanceSheet.isBalanced
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {report.balanceSheet.isBalanced ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>BALANCE (SEIMBANG)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        <span>SELISIH: {formatIDR(report.balanceSheet.discrepancy)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 2-Column Neraca: Kiri Aset, Kanan Kewajiban & Ekuitas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                {/* Sisi Kiri: ASET (HARTA) */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-4">
                  <div className="border-b border-[#EAE4DC] pb-2 font-bold text-sm text-[#111613] flex justify-between items-center">
                    <span>ASET (HARTA USAHA)</span>
                    <span className="font-mono text-emerald-800">{formatIDR(report.balanceSheet.assets.totalAssets)}</span>
                  </div>

                  <div className="space-y-3 text-gray-700">
                    <div>
                      <strong className="block text-[11px] text-gray-500 uppercase tracking-wider">Aset Lancar:</strong>
                      <div className="mt-1 space-y-1.5 pl-2">
                        <div className="flex justify-between">
                          <span>1. Kas &amp; Bank Mandiri (Uang Riil)</span>
                          <span className="font-mono font-bold">{formatIDR(report.balanceSheet.assets.cashAndBank)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>2. Piutang Usaha Konsumen (Tempo)</span>
                          <span className="font-mono font-bold text-amber-800">{formatIDR(report.balanceSheet.assets.accountsReceivable)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>3. Persediaan Daging &amp; Jeroan Beku (Freezer)</span>
                          <span className="font-mono font-bold text-blue-800">{formatIDR(report.balanceSheet.assets.inventory)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60">
                      <strong className="block text-[11px] text-gray-500 uppercase tracking-wider">Aset Tetap (Peralatan):</strong>
                      <div className="mt-1 space-y-1.5 pl-2">
                        <div className="flex justify-between">
                          <span>4. Mesin &amp; Chest Freezer Suhu -18°C</span>
                          <span className="font-mono font-bold">{formatIDR(report.balanceSheet.assets.coldChainFixedAssets)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D8CEBE] flex justify-between items-center font-bold text-sm text-[#111613]">
                    <span>TOTAL ASET</span>
                    <span className="font-mono text-emerald-900">{formatIDR(report.balanceSheet.assets.totalAssets)}</span>
                  </div>
                </div>

                {/* Sisi Kanan: KEWAJIBAN & EKUITAS */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-4">
                  <div className="border-b border-[#EAE4DC] pb-2 font-bold text-sm text-[#111613] flex justify-between items-center">
                    <span>KEWAJIBAN &amp; MODAL (EKUITAS)</span>
                    <span className="font-mono text-[#8C6B24]">{formatIDR(report.balanceSheet.liabilitiesAndEquity.totalLiabilitiesAndEquity)}</span>
                  </div>

                  <div className="space-y-3 text-gray-700">
                    <div>
                      <strong className="block text-[11px] text-gray-500 uppercase tracking-wider">Kewajiban (Hutang):</strong>
                      <div className="mt-1 space-y-1.5 pl-2">
                        <div className="flex justify-between">
                          <span>1. Hutang ke Supplier Daging / RPH</span>
                          <span className="font-mono font-bold text-red-700">
                            {formatIDR(report.balanceSheet.liabilitiesAndEquity.accountsPayable)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>2. Hutang Operasional Standby</span>
                          <span className="font-mono font-bold">Rp 0</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60">
                      <strong className="block text-[11px] text-gray-500 uppercase tracking-wider">Ekuitas (Modal Pemilik):</strong>
                      <div className="mt-1 space-y-1.5 pl-2">
                        <div className="flex justify-between">
                          <span>3. Modal Akhir Pemilik (HATOBA)</span>
                          <span className="font-mono font-bold text-emerald-800">
                            {formatIDR(report.balanceSheet.liabilitiesAndEquity.endingEquity)}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 italic pl-1">
                          *Modal awal + Laba bersih berjalan - Prive pemilik
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D8CEBE] flex justify-between items-center font-bold text-sm text-[#111613]">
                    <span>TOTAL KEWAJIBAN &amp; EKUITAS</span>
                    <span className="font-mono text-[#8C6B24]">{formatIDR(report.balanceSheet.liabilitiesAndEquity.totalLiabilitiesAndEquity)}</span>
                  </div>
                </div>
              </div>

              {/* Box HPP Cold Chain Terinci */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold text-amber-950">
                  <div className="flex items-center gap-1.5">
                    <Snowflake className="w-4 h-4 text-amber-700" />
                    <span>Perhitungan HPP Daging Beku (Masuk Neraca &amp; Laba Kotor)</span>
                  </div>
                  <span className="font-mono text-sm">{formatIDR(report.estimatedHPP)}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-gray-700 font-mono">
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="text-[10px] text-gray-500 block font-sans">Persediaan Awal</span>
                    <strong className="text-gray-900">{formatIDR(config?.initialInventoryValue || 0)}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="text-[10px] text-gray-500 block font-sans">(+) Pembelian Daging</span>
                    <strong className="text-emerald-700">+{formatIDR(report.totalMeatPurchases)}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="text-[10px] text-gray-500 block font-sans">(-) Persediaan Akhir</span>
                    <strong className="text-blue-700">-{formatIDR(report.inventoryValue)}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-300 bg-amber-100/50">
                    <span className="text-[10px] text-gray-600 block font-sans">(=) Total HPP</span>
                    <strong className="text-amber-950">{formatIDR(report.estimatedHPP)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: LAPORAN PERUBAHAN MODAL ==================== */}
        {activeTab === 'equity' && report && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3D9CC] shadow-sm space-y-6">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#111613]">
                  Laporan Perubahan Modal (Statement of Changes in Equity)
                </h3>
                <p className="text-xs text-gray-500">
                  Melacak penambahan modal pemilik, akumulasi laba bersih berjalan, dan penarikan prive.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-4 max-w-2xl mx-auto text-xs font-sans">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-bold text-gray-700">Modal Awal Pemilik</span>
                  <span className="font-mono font-bold text-sm text-[#111613]">
                    {formatIDR(report.beginningEquity)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200 text-emerald-800">
                  <span>(+) Setoran Tambahan Modal Berjalan</span>
                  <span className="font-mono font-bold">
                    + {formatIDR(report.capitalInjection)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-bold text-gray-700">
                    {report.netIncome >= 0 ? '(+) Laba Bersih Usaha Berjalan' : '(-) Rugi Bersih Usaha Berjalan'}
                  </span>
                  <span className={`font-mono font-bold text-sm ${report.netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {report.netIncome >= 0 ? '+' : '-'} {formatIDR(Math.abs(report.netIncome))}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200 text-red-700">
                  <span>(-) Penarikan Prive / Kas Pribadi Pemilik</span>
                  <span className="font-mono font-bold">
                    - {formatIDR(report.ownerDraws)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t-2 border-[#111613] text-sm font-bold text-[#111613]">
                  <span>MODAL AKHIR HATOBA</span>
                  <span className="font-mono text-base text-emerald-800">
                    {formatIDR(report.endingEquity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: BUKU PIUTANG & AGING KONSUMEN ==================== */}
        {activeTab === 'ar_aging' && report && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3D9CC] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-serif-title text-xl font-bold text-[#111613]">
                    Buku Pembantu Piutang Konsumen (AR Aging)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Daftar tagihan tempo belum lunas dari order penjualan, dengan deteksi batas jatuh tempo.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Total Piutang Belum Cair</span>
                  <span className="font-mono font-bold text-xl text-amber-800">
                    {formatIDR(report.totalReceivables)}
                  </span>
                </div>
              </div>

              {/* Tabel Piutang */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#EAE4DC] text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-3">No. Order / Faktur</th>
                      <th className="py-3 px-3">Pelanggan &amp; Usaha</th>
                      <th className="py-3 px-3">Status Bayar</th>
                      <th className="py-3 px-3">Jatuh Tempo</th>
                      <th className="py-3 px-3 text-right">Total Order</th>
                      <th className="py-3 px-3 text-right">Sudah Bayar</th>
                      <th className="py-3 px-3 text-right">Sisa Piutang</th>
                      <th className="py-3 px-3 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE4DC]/60 font-sans">
                    {report.pendingTempoOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400">
                          Hebat! Semua tagihan pesanan telah lunas. Tidak ada piutang tertahan.
                        </td>
                      </tr>
                    ) : (
                      report.pendingTempoOrders.map((ord) => {
                        const remaining = Math.max(0, ord.totalAmount - (ord.paidAmount || 0))
                        const nowTime = new Date().getTime()
                        const due = ord.dueDate
                          ? new Date(ord.dueDate)
                          : new Date(new Date(ord.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000)
                        const isOverdue = nowTime > due.getTime()
                        const diffDays = Math.ceil((nowTime - due.getTime()) / (24 * 60 * 60 * 1000))

                        return (
                          <tr key={ord.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            <td className="py-3 px-3 font-mono font-semibold text-[#8C6B24]">
                              {ord.referenceCode}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-[#111613]">{ord.customerName}</div>
                              <div className="text-[11px] text-gray-500">{ord.businessName || '-'} ({ord.city})</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                {ord.paymentStatus || 'TEMPO'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono">
                              {due.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              {isOverdue && (
                                <span className="block text-[10px] text-red-600 font-bold">
                                  Terlambat {diffDays} hari!
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-mono">{formatIDR(ord.totalAmount)}</td>
                            <td className="py-3 px-3 text-right font-mono text-emerald-700">
                              {formatIDR(ord.paidAmount || 0)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-red-700">
                              {formatIDR(remaining)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => quickSettleAR(ord)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs"
                                title="Catat kas masuk pelunasan piutang ini"
                              >
                                Cairkan Kas
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: JURNAL UMUM OTOMATIS ==================== */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3D9CC] shadow-sm space-y-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#111613]">
                  Jurnal Umum Otomatis (General Ledger Engine)
                </h3>
                <p className="text-xs text-gray-500">
                  Penyederhanaan Akuntansi: Setiap transaksi kas otomatis diposting debit &amp; kredit berstandar SAK EMKM tanpa repot.
                </p>
              </div>

              <div className="space-y-4">
                {journal.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    Belum ada entri jurnal yang dihasilkan.
                  </div>
                ) : (
                  journal.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#EAE4DC] pb-2 gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#8C6B24] bg-[#F2ECE1] px-2 py-0.5 rounded text-[10px]">
                            {entry.referenceNo}
                          </span>
                          <span className="font-bold text-[#111613]">{entry.description}</span>
                        </div>
                        <span className="font-mono text-gray-400 text-[11px]">{entry.date}</span>
                      </div>

                      <div className="space-y-1 pt-1 font-mono text-[11px]">
                        {entry.lines.map((line, idx) => (
                          <div
                            key={idx}
                            className={`flex justify-between items-center py-1 px-2 rounded ${
                              line.credit > 0 ? 'pl-8 text-gray-600 bg-white/40' : 'font-semibold text-gray-900'
                            }`}
                          >
                            <span>
                              [{line.accountCode}] {line.accountName}
                            </span>
                            <div className="flex gap-6">
                              <span className="w-24 text-right">
                                {line.debit > 0 ? formatIDR(line.debit) : '-'}
                              </span>
                              <span className="w-24 text-right">
                                {line.credit > 0 ? formatIDR(line.credit) : '-'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 8: PANDUAN PAJAK & KEUANGAN RESMI HATOBA ==================== */}
        {activeTab === 'tax_advice' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3D9CC] shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs uppercase font-bold text-[#C59B47] tracking-[0.2em] block mb-1">
                  KONSULTASI PRAKTISI &amp; MANAJER KEUANGAN INDONESIA
                </span>
                <h3 className="font-serif-title text-2xl font-bold text-[#111613]">
                  Rekomendasi Strategis Perpajakan &amp; Cash Flow HATOBA
                </h3>
                <p className="text-xs text-gray-500">
                  Jawaban komprehensif atas 3 pertanyaan inti pemilik HATOBA terkait Pajak, Pembagian Margin Kotor, dan Pembukuan.
                </p>
              </div>

              {/* 1. Soal Pajak */}
              <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-base">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <h4>1. Kapan Usaha HATOBA Sebaiknya Didaftarkan Pajak?</h4>
                </div>
                <div className="text-xs text-amber-950 space-y-2.5 leading-relaxed">
                  <p>
                    <strong>Keputusan Tepat Saat Ini: TETAP NON-PKP &amp; JANGAN DAFTAR PKP DULU!</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>
                      <strong>Ambang Batas Wajib PKP (Rp 4,8 Miliar/tahun):</strong> Sesuai PMK 197/2013, usaha dengan omset di bawah Rp 4,8 Miliar per tahun <strong>TIDAK WAJIB PKP</strong>. Jika buru-buru jadi PKP, HATOBA wajib memungut PPN 11%–12% dan menyetor PPN ke kas negara setiap akhir bulan, padahal pembeli restoran sering bayar tempo 7–14 hari. Hal ini bisa langsung membunuh cash flow!
                    </li>
                    <li>
                      <strong>Fasilitas UMKM PP 55 Tahun 2022 (Bebas Pajak s.d Rp 500 Juta):</strong> Untuk Wajib Pajak Orang Pribadi (atas nama Doni Kristiawan), omset kumulatif hingga <strong>Rp 500 Juta pertama dalam satu tahun pajak adalah 0% (BEBAS PAJAK)</strong>. Di atas Rp 500 Juta baru dikenakan tarif PPh Final super ringan: <strong>0,5%</strong> dari omset.
                    </li>
                    <li>
                      <strong>Timing Pendaftaran Badan (PT / CV):</strong> Nanti ketika rekening giro perusahaan sudah jadi dan omset operasional sudah stabil di atas Rp 1–2 Miliar, barulah daftarkan NPWP Badan dengan skema PPh Final 0,5% PP 55/2022 (berlaku 3–4 tahun pertama) dan tetap pilih Non-PKP.
                    </li>
                  </ul>
                </div>
              </div>

              {/* 2. Pembagian Margin Kotor */}
              <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  <h4>2. Rumus Pembagian Margin Kotor (Penjualan − HPP)</h4>
                </div>
                <div className="text-xs text-emerald-950 space-y-2.5 leading-relaxed">
                  <p>
                    <strong>Ingat Kaidah Emas: Margin Kotor bukanlah uang kas bebas di dompet!</strong>
                  </p>
                  <p>
                    Rumus: <code>Margin Kotor = Total Penjualan − HPP (Daging + Kargo Masuk)</code>. Misal rata-rata margin kotor HATOBA 20%–25%:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <strong className="block text-emerald-900 font-bold">60% - 65% Kas Putar</strong>
                      <span className="text-[11px] text-gray-600">Standby di rekening operasional untuk talangan kas beli stok daging sebelum tagihan tempo cair.</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <strong className="block text-amber-900 font-bold">15% Simpanan Freezer</strong>
                      <span className="text-[11px] text-gray-600">Cadangan darurat service mesin pendingin -18°C, ganti kompresor, dan beli cooler box.</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <strong className="block text-red-900 font-bold">10% Cadangan Macet</strong>
                      <span className="text-[11px] text-gray-600">Peredam jika ada mitra HORECA yang gagal bayar atau menunggak lebih dari 30 hari.</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <strong className="block text-blue-900 font-bold">10% Laba Ditahan/Prive</strong>
                      <span className="text-[11px] text-gray-600">Boleh ditarik pemilik HANYA jika piutang minggu tersebut sudah benar-benar cair ke bank.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Pembukuan Pokok & Solusi Cut-Off */}
              <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-base">
                  <BookOpen className="w-5 h-5 text-blue-700" />
                  <h4>3. Empat Buku Pokok yang Wajib Dipegang &amp; Disiplin Cut-Off</h4>
                </div>
                <div className="text-xs text-blue-950 space-y-2.5 leading-relaxed">
                  <p>
                    Penyebab ilusi <em>&ldquo;seolah ada duit padahal tidak ada uang&rdquo;</em> adalah pencampuran antara <strong>Accrual Basis (Omzet di atas kertas)</strong> dengan <strong>Cash Basis (Uang riil di rekening bank)</strong> tanpa cut-off yang jelas.
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5">
                    <li><strong>Buku Kas &amp; Bank Riil:</strong> Hanya catat rupiah yang sudah masuk ke rekening Mandiri Doni Kristiawan atau kas kasir hari ini.</li>
                    <li><strong>Buku Piutang &amp; Aging (Jatuh Tempo):</strong> Pantau tagihan tiap mitra HORECA. Berlakukan aturan tegas: <em>Mitra dengan tagihan lewat 3 hari wajib dilunasi dulu sebelum order berikutnya dikirim</em>.</li>
                    <li><strong>Buku Persediaan Fisik (Stock Opname Freezer):</strong> Timbang sisa stok di freezer seminggu sekali untuk menghitung HPP riil yang masuk ke neraca.</li>
                    <li><strong>Jadwal Cut-Off Mingguan (Setiap Jumat Sore):</strong> Rekap semua faktur mingguan, cek mutasi bank, dan tentukan rencana belanja daging untuk minggu berikutnya berdasarkan kas yang ada.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================= MODAL: CATAT TRANSAKSI KAS/BANK ======================= */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E3D9CC] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#EAE4DC] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#111613]">
                  Catat Transaksi Kas &amp; Bank
                </h3>
                <p className="text-[11px] text-gray-500">
                  Otomatis terposting ke Jurnal Umum &amp; Laporan Arus Kas
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

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 text-xs font-sans">
              {/* Pilihan Tipe: Masuk / Keluar */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('IN')
                    setTxCategory('INCOME_AR_COLLECTION')
                  }}
                  className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border ${
                    txType === 'IN'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Uang Masuk (Penerimaan)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTxType('OUT')
                    setTxCategory('EXPENSE_MEAT_PURCHASE')
                  }}
                  className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border ${
                    txType === 'OUT'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Uang Keluar (Pengeluaran)</span>
                </button>
              </div>

              {/* Kategori */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Kategori Transaksi</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as FinanceCategory)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47]"
                  required
                >
                  {availableCategories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Akun Rekening Kas/Bank */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Masuk / Keluar Lewat</label>
                  <select
                    value={txAccount}
                    onChange={(e) => setTxAccount(e.target.value as 'KAS' | 'BANK_MANDIRI')}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                  >
                    <option value="BANK_MANDIRI">Bank Mandiri (1370016639326)</option>
                    <option value="KAS">Kas di Tangan / Kasir</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                    required
                  />
                </div>
              </div>

              {/* Nominal */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Nominal Transaksi (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">Rp</span>
                  <input
                    type="text"
                    placeholder="Contoh: 1.500.000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs font-mono font-bold text-[#111613] focus:outline-none focus:border-[#C59B47]"
                    required
                  />
                </div>
              </div>

              {/* Pihak Terkait (Konsumen / Supplier / Staf) */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">
                  {txType === 'IN' ? 'Diterima Dari (Konsumen / Pemilik)' : 'Dibayarkan Kepada (Supplier / Staf / Toko)'}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Warung Bu Kris, RPH Sapi, PLN, Doni Kristiawan"
                  value={txRecipient}
                  onChange={(e) => setTxRecipient(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47]"
                  required
                />
              </div>

              {/* No Referensi Order (Opsional) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">No. Order / Faktur (Opsional)</label>
                  <input
                    type="text"
                    placeholder="HTB-ORD-..."
                    value={txRefCode}
                    onChange={(e) => setTxRefCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs font-mono text-[#111613]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Catatan Tambahan</label>
                  <input
                    type="text"
                    placeholder="Keterangan singkat..."
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                  />
                </div>
              </div>

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
                  className="px-5 py-2.5 rounded-xl bg-[#C59B47] hover:bg-[#D4AA55] text-[#111613] font-bold text-xs transition-all shadow-sm disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
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

            <form onSubmit={handleSaveInventory} className="p-6 space-y-4 text-xs font-sans">
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
                    // Auto-calculate estimate @ 70k/kg average base cost
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
