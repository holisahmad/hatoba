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
  ChevronLeft,
  Sparkles,
  HelpCircle,
  CheckCheck,
  Building2,
  AlertCircle,
  Download,
  Printer,
  FileSpreadsheet,
  FileCheck,
  Eye,
  Layers,
  Share2,
  Menu,
  X,
  Radio,
  Zap,
  Play,
  Pause,
  Truck,
  Box,
  PackageCheck,
  Thermometer,
  PhoneCall,
} from 'lucide-react'
import {
  FinanceTransaction,
  FinanceCategory,
  CATEGORY_OPTIONS,
  ComprehensiveFinancialReport,
  InventorySnapshot,
  StockOpnameRecord,
  GoodsReceiptRecord,
  InitialCapitalConfig,
  JournalEntry,
  CashierReconciliation,
} from '@/lib/finance-store'
import { AdminOrder } from '@/lib/admin-store'

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)

  // Real-time Live Sync States
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date())
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  // Layout UI State: Left Admin Panel Expand/Collapse & Mobile Drawer
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

  // Tab State
  type FinanceTab =
    | 'overview'
    | 'reports'
    | 'reconciliation'
    | 'transactions'
    | 'cashflow'
    | 'balancesheet'
    | 'equity'
    | 'ar_aging'
    | 'journal'
    | 'goods_receipt'
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
  const [invInspectorInput, setInvInspectorInput] = useState<string>('Finance Lead & Checker')
  const [invTempInput, setInvTempInput] = useState<string>('-18.5')
  const [invNotesInput, setInvNotesInput] = useState<string>('Stok fisik daging & jeroan beku di freezer -18°C')
  const [savingInv, setSavingInv] = useState(false)

  // Stock Opname History & Goods Receipt States
  const [stockOpnameHistory, setStockOpnameHistory] = useState<StockOpnameRecord[]>([])
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptRecord[]>([])

  // Goods Receipt Modal State
  const [showGoodsReceiptModal, setShowGoodsReceiptModal] = useState<boolean>(false)
  const [grDeliveryNote, setGrDeliveryNote] = useState<string>('')
  const [grSource, setGrSource] = useState<'PUSAT_BALI' | 'SUPPLIER_RPH' | 'VENDOR_LAIN'>('PUSAT_BALI')
  const [grSourceLabel, setGrSourceLabel] = useState<string>('Sentra Produksi Cold Storage HATOBA Bali (Hub Denpasar)')
  const [grCarrier, setGrCarrier] = useState<string>('Armada Cold Truck Thermo HATOBA')
  const [grTemp, setGrTemp] = useState<string>('-18.5')
  const [grReceiver, setGrReceiver] = useState<string>('Staf Gudang & Checker HATOBA')
  const [grPacks, setGrPacks] = useState<string>('185')
  const [grWeight, setGrWeight] = useState<string>('185')
  const [grNotes, setGrNotes] = useState<string>('Kargo tiba tepat waktu, suhu -18.5°C, kemasan vacuum seal beku sempurna.')
  const [savingGr, setSavingGr] = useState<boolean>(false)

  // Real-time Live Sync & Cut-Off Freeze States
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true)
  const [cutoffTimestamp, setCutoffTimestamp] = useState<Date | null>(null)

  // Form State: Rekonsiliasi Kasir & Bank
  const [recDate, setRecDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [recShiftLabel, setRecShiftLabel] = useState<string>(`Tutup Kasir ${new Date().toISOString().slice(0, 10)}`)
  const [recActualCash, setRecActualCash] = useState<string>('')
  const [recBankVerified, setRecBankVerified] = useState<string>('')
  const [recResolution, setRecResolution] = useState<'SUDAH_COCOK' | 'BEBAN_PERUSAHAAN' | 'POTONG_KASIR' | 'PENDAPATAN_LAIN'>('SUDAH_COCOK')
  const [recNotes, setRecNotes] = useState<string>('')
  const [savingRec, setSavingRec] = useState(false)

  // Export & Print State
  const [showExportModal, setShowExportModal] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  type ReportType = 'ALL' | 'PL' | 'BALANCE_SHEET' | 'CASH_FLOW' | 'SALES' | 'AR' | 'CASH_BANK' | 'RECON' | 'JOURNAL'
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('ALL')

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Toggle Auto-Sync / Freeze Cut-Off Data
  const toggleAutoSync = () => {
    if (isAutoSyncEnabled) {
      setIsAutoSyncEnabled(false)
      const now = new Date()
      setCutoffTimestamp(now)
      showToast(`Sinkronisasi live dijeda. Data dibekukan pada Cut-Off ${now.toLocaleTimeString('id-ID')} untuk audit & pelaporan pimpinan.`, 'success')
    } else {
      setIsAutoSyncEnabled(true)
      setCutoffTimestamp(null)
      showToast('Sinkronisasi live aktif kembali. Data diperbarui real-time.', 'success')
      fetchFinanceData(true)
    }
  }

  // 1. Initial Auth Check
  useEffect(() => {
    checkFinanceAuth()
  }, [])

  // 2. Real-Time Silent Auto-Polling Interval (Data Live tanpa Refresh Manual - dapat dijeda untuk Cut-Off)
  useEffect(() => {
    if (!isAuthenticated || !isAutoSyncEnabled) return
    const interval = setInterval(() => {
      fetchFinanceData(true)
    }, 12000) // Sinkronisasi otomatis setiap 12 detik di latar belakang
    return () => clearInterval(interval)
  }, [isAuthenticated, isAutoSyncEnabled])

  const checkFinanceAuth = async () => {
    try {
      const res = await fetch('/api/finance/auth')
      const data = await res.json()
      if (data.authenticated) {
        setIsAuthenticated(true)
        fetchFinanceData(false)
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
        body: JSON.stringify({ password: pinInput.trim(), pin: pinInput.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsAuthenticated(true)
        setPinInput('')
        fetchFinanceData(false)
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

  // Fetch data: silent=true does not trigger full-screen loading spinner
  const fetchFinanceData = async (silent = false) => {
    if (!silent) {
      setLoading(true)
    } else {
      setIsSyncing(true)
    }

    try {
      const res = await fetch('/api/finance/transactions')
      const data = await res.json()
      if (res.ok && data.success) {
        setTransactions(data.transactions || [])
        setReport(data.report || null)
        setInventory(data.inventory || null)
        setConfig(data.config || null)
        setJournal(data.journal || [])
        setOrders(data.orders || [])
        setStockOpnameHistory(data.stockOpnameHistory || [])
        setGoodsReceipts(data.goodsReceipts || [])
        setLastSyncedAt(new Date())

        // If report has pos stats, auto-fill verification fields if empty
        if (data.report?.posReconciliationStats) {
          setReconciliations(data.report.posReconciliationStats.recentReconciliations || [])
          setRecActualCash((prev) => (prev ? prev : String(data.report.posReconciliationStats.systemTotalCash || 0)))
          setRecBankVerified((prev) => (prev ? prev : String(data.report.posReconciliationStats.systemTotalTransfer || 0)))
        }

        if (data.inventory) {
          setInvWeightInput(String(data.inventory.totalWeightKg || '0'))
          setInvValueInput(String(data.inventory.estimatedValue || '0'))
          setInvNotesInput(data.inventory.notes || '')
        }
      } else if (!silent) {
        showToast(data.error || 'Gagal memuat data keuangan.', 'error')
      }
    } catch {
      if (!silent) {
        showToast('Koneksi jaringan keuangan terganggu.', 'error')
      }
    } finally {
      if (!silent) setLoading(false)
      setIsSyncing(false)
    }
  }

  // 3. Submit Transaksi Keuangan (Langsung auto-sync live)
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
        // Instant real-time live sync
        fetchFinanceData(true)
      } else {
        showToast(data.error || 'Gagal menyimpan transaksi.', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan saat memproses transaksi.', 'error')
    } finally {
      setSavingTx(false)
    }
  }

  // 4. Delete Transaksi
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Yakin ingin menghapus catatan transaksi ini? Jurnal terkait juga akan diperbarui.')) {
      return
    }
    try {
      const res = await fetch(`/api/finance/transactions?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast('Transaksi berhasil dihapus.')
        fetchFinanceData(true)
      } else {
        showToast(data.error || 'Gagal menghapus transaksi.', 'error')
      }
    } catch {
      showToast('Gagal terhubung ke server.', 'error')
    }
  }

  // 5. Update Stock Opname
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
          inspector: invInspectorInput.trim(),
          freezerTempCelsius: parseFloat(invTempInput) || -18.5,
          date: new Date().toISOString().slice(0, 10),
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast('Nilai persediaan daging beku berhasil diperbarui & tercatat di audit trail!')
        setShowInventoryModal(false)
        fetchFinanceData(true)
      } else {
        showToast(data.error || 'Gagal memperbarui persediaan.', 'error')
      }
    } catch {
      showToast('Koneksi terganggu.', 'error')
    } finally {
      setSavingInv(false)
    }
  }

  // 5b. Submit Penerimaan Barang Masuk (Goods Receipt)
  const handleSaveGoodsReceipt = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingGr(true)
    try {
      const res = await fetch('/api/finance/goods-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptDate: new Date().toISOString().slice(0, 10),
          deliveryNoteNumber: grDeliveryNote.trim() || `SJ-HTB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
          sourceOrigin: grSource,
          sourceLabel: grSourceLabel.trim(),
          destinationHub: 'Hub Yogyakarta (Freezer Room Babarsari)',
          carrierName: grCarrier.trim(),
          freezerTempCelsius: parseFloat(grTemp) || -18.5,
          receiverName: grReceiver.trim(),
          items: [
            {
              productName: 'Produk Daging & Jeroan Beku Assorted',
              packQuantity: parseInt(grPacks) || 0,
              weightKg: parseFloat(grWeight) || 0,
              condition: 'SEMPURNA_BEKU',
            },
          ],
          notes: grNotes.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast('Penerimaan barang masuk dari pusat/supplier berhasil dicatat!')
        setShowGoodsReceiptModal(false)
        fetchFinanceData(true)
      } else {
        showToast(data.error || 'Gagal mencatat penerimaan barang.', 'error')
      }
    } catch {
      showToast('Gagal terhubung ke server.', 'error')
    } finally {
      setSavingGr(false)
    }
  }

  // Export Stock Opname History CSV
  const handleExportStockOpnameCSV = () => {
    let csv = `"HATOBA - RIWAYAT & LAPORAN STOCK OPNAME FISIK FREEZER"\n"Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}"\n\n`
    csv += `"No","ID Opname","Tanggal","Waktu Audit","Petugas Pemeriksa","Suhu Freezer (°C)","Total Berat (Kg)","Estimasi Nilai (Rp)","Catatan Kondisi Fisik"\n`
    stockOpnameHistory.forEach((sop, idx) => {
      csv += `"${idx + 1}","${sop.id}","${sop.date}","${sop.recordedAt}","${sop.inspector}","${sop.freezerTempCelsius}°C","${sop.totalWeightKg}","${sop.estimatedValue}","${sop.notes}"\n`
    })
    downloadCSV(`HATOBA_Laporan_Stock_Opname_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Laporan Riwayat Stock Opname berhasil diunduh!')
  }

  // Export Goods Receipt History CSV
  const handleExportGoodsReceiptCSV = () => {
    let csv = `"HATOBA - LAPORAN PENERIMAAN BARANG MASUK (GOODS RECEIPT)"\n"Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}"\n\n`
    csv += `"No","ID GRN","Tanggal Terima","No. Surat Jalan","Asal Kiriman","Tujuan","Armada Pendingin","Suhu (°C)","Penerima","Total Pack","Total Berat (Kg)","Catatan"\n`
    goodsReceipts.forEach((gr, idx) => {
      csv += `"${idx + 1}","${gr.id}","${gr.receiptDate}","${gr.deliveryNoteNumber}","${gr.sourceLabel}","${gr.destinationHub}","${gr.carrierName}","${gr.freezerTempCelsius}°C","${gr.receiverName}","${gr.totalPacks}","${gr.totalWeightKg}","${gr.notes || '-'}"\n`
    })
    downloadCSV(`HATOBA_Laporan_Penerimaan_Barang_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Laporan Penerimaan Barang berhasil diunduh!')
  }

  // 6. Submit Rekonsiliasi Kasir & Bank
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
        fetchFinanceData(true)
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

  // ======================= EXCEL / CSV EXPORTERS =======================
  const handleExportSalesCSV = () => {
    const rows = [
      ['No. Referensi', 'Tanggal', 'Nama Pelanggan', 'Nama Usaha/Resto', 'Area Hub', 'Kota', 'Marketing', 'Produk & Qty', 'Total Omzet (Rp)', 'Metode Bayar', 'Status Bayar', 'Status Order', 'Catatan'],
      ...orders.map((ord) => [
        `INV-${ord.referenceCode}`,
        new Date(ord.createdAt).toLocaleDateString('id-ID'),
        ord.customerName,
        ord.businessName || '-',
        ord.hubArea,
        ord.city,
        ord.marketingName || 'Organik Web/POS',
        ord.items.map((i) => `${i.productName} (${i.quantity}x)`).join('; '),
        ord.totalAmount,
        ord.paymentMethod || 'TUNAI',
        ord.paymentStatus || 'LUNAS',
        ord.status,
        (ord.notes || '').replace(/"/g, '""'),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCSV(`HATOBA_Laporan_Penjualan_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Laporan Penjualan berhasil diunduh ke Excel (.csv)!')
  }

  const handleExportPLCSV = () => {
    if (!report) return
    const rows = [
      ['HATOBA COLD CHAIN BOGA MANDIRI - LAPORAN LABA RUGI SAK EMKM'],
      [`Periode: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`, `Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}`],
      [''],
      ['Komponen Laba Rugi', 'Kode Akun', 'Nominal (Rp)', 'Keterangan'],
      ['PENDAPATAN PENJUALAN', '', '', ''],
      ['  Penjualan Daging & Jeroan Beku (Pesanan Terverifikasi)', 'Akun 401', report.grossSalesFromOrders, ''],
      ['  Penjualan Kasir Langsung (POS Cash Sales)', 'Akun 401', report.cashSalesDirect, ''],
      ['TOTAL PENDAPATAN OPERASIONAL', 'Akun 401', report.totalSalesRevenue, '100%'],
      [''],
      ['BEBAN POKOK PENJUALAN (HPP)', '', '', ''],
      ['  Pembelian Daging & Jeroan Sapi RPH', 'Akun 501', report.totalMeatPurchases, ''],
      ['  Ongkir Kargo Beku / Ekspedisi Pendingin Masuk', 'Akun 502', report.totalFreightIn, ''],
      ['  Nilai Persediaan Akhir Freezer (-18°C)', 'Akun 104', -report.inventoryValue, 'Pengurang HPP'],
      ['TOTAL BEBAN POKOK PENJUALAN (HPP)', 'Akun 500', report.estimatedHPP, `${((report.estimatedHPP / (report.totalSalesRevenue || 1)) * 100).toFixed(1)}%`],
      [''],
      ['LABA KOTOR (GROSS PROFIT)', '', report.grossProfitMarginRp, `${report.grossProfitMarginPercent.toFixed(1)}% dari Omzet`],
      [''],
      ['BEBAN OPERASIONAL USAHA', '', '', ''],
      ['  Total Beban Operasional (PLN Freezer, Gaji, BBM, dll)', 'Akun 600', report.totalOperatingExpenses, ''],
      [''],
      ['LABA BERSIH OPERASIONAL (NET INCOME)', 'Akun 303', report.netOperatingIncome, 'Sebelum Pajak UMKM (PP 55/2022)'],
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCSV(`HATOBA_Laba_Rugi_EMKM_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Laporan Laba Rugi SAK EMKM berhasil diunduh ke Excel (.csv)!')
  }

  const handleExportBalanceSheetCSV = () => {
    if (!report) return
    const rows = [
      ['HATOBA COLD CHAIN BOGA MANDIRI - LAPORAN POSISI KEUANGAN (NERACA SEDERHANA)'],
      [`Standar: SAK EMKM`, `Per Tanggal: ${new Date().toLocaleDateString('id-ID')}`],
      [''],
      ['Klasifikasi Neraca', 'Kode Akun', 'Nama Akun', 'Nominal (Rp)'],
      ['ASET LANCAR', '', '', ''],
      ['  Aset Lancar', '101', 'Kas Fisik di Tangan', report.realCash],
      ['  Aset Lancar', '102', 'Bank Mandiri Operasional', report.realBank],
      ['  Aset Lancar', '103', 'Piutang Usaha Konsumen', report.totalReceivables],
      ['  Aset Lancar', '104', 'Persediaan Daging & Jeroan Beku (-18°C)', report.inventoryValue],
      ['TOTAL ASET LANCAR', '', '', report.realCash + report.realBank + report.totalReceivables + report.inventoryValue],
      [''],
      ['ASET TETAP', '', '', ''],
      ['  Aset Tetap', '120', 'Chest Freezer & Peralatan Pendingin Cold Chain', report.balanceSheet.assets.coldChainFixedAssets],
      ['TOTAL ASET TETAP', '', '', report.balanceSheet.assets.coldChainFixedAssets],
      [''],
      ['TOTAL ASET (HARTA USAHA)', '', '', report.balanceSheet.assets.totalAssets],
      [''],
      ['KEWAJIBAN (LIABILITAS JANGKA PENDEK)', '', '', ''],
      ['  Hutang Usaha', '201', 'Hutang Dagang Supplier Daging RPH', report.balanceSheet.liabilitiesAndEquity.accountsPayable],
      ['TOTAL KEWAJIBAN', '', '', report.balanceSheet.liabilitiesAndEquity.accountsPayable],
      [''],
      ['EKUITAS (MODAL PEMILIK)', '', '', ''],
      ['  Modal', '301', 'Modal Disetor Pemilik (Doni Kristiawan)', report.capitalInjection],
      ['  Prive', '302', 'Pengambilan Prive Pemilik', -report.ownerDraws],
      ['  Laba', '303', 'Saldo Laba Berjalan', report.netOperatingIncome],
      ['TOTAL EKUITAS PEMILIK', '', '', report.balanceSheet.liabilitiesAndEquity.endingEquity],
      [''],
      ['TOTAL LIABILITAS & EKUITAS', '', '', report.balanceSheet.liabilitiesAndEquity.totalLiabilitiesAndEquity],
      ['STATUS KESEIMBANGAN', '', '', report.balanceSheet.isBalanced ? 'BALANCE (KLOP)' : 'SELISIH'],
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCSV(`HATOBA_Neraca_Sederhana_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Laporan Neraca Sederhana berhasil diunduh ke Excel (.csv)!')
  }

  const handleExportCashFlowCSV = () => {
    if (!report) return
    const rows = [
      ['HATOBA COLD CHAIN BOGA MANDIRI - LAPORAN ARUS KAS (METODE LANGSUNG)'],
      [`Standar: SAK EMKM`, `Periode: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`],
      [''],
      ['Aktivitas Arus Kas', 'Rincian Transaksi', 'Arus Kas Masuk (Rp)', 'Arus Kas Keluar (Rp)', 'Arus Kas Bersih (Rp)'],
      ['AKTIVITAS OPERASI', 'Penerimaan Kas dari Konsumen & Pelunasan Piutang', report.totalSalesRevenue, 0, ''],
      ['AKTIVITAS OPERASI', 'Pembayaran Kas untuk Pembelian Daging RPH', 0, report.totalMeatPurchases, ''],
      ['AKTIVITAS OPERASI', 'Pembayaran Kas Beban Operasional (PLN, Gaji, dll)', 0, report.totalOperatingExpenses, ''],
      ['TOTAL ARUS KAS DARI AKTIVITAS OPERASI', '', '', '', report.operatingCashFlow],
      [''],
      ['AKTIVITAS INVESTASI', 'Pembelian Chest Freezer & Cooler Box', 0, Math.abs(report.investingCashFlow), ''],
      ['TOTAL ARUS KAS DARI AKTIVITAS INVESTASI', '', '', '', report.investingCashFlow],
      [''],
      ['AKTIVITAS PENDANAAN', 'Setoran Modal Pemilik', report.capitalInjection, 0, ''],
      ['AKTIVITAS PENDANAAN', 'Penarikan Dana Pribadi (Prive)', 0, report.ownerDraws, ''],
      ['TOTAL ARUS KAS DARI AKTIVITAS PENDANAAN', '', '', '', report.financingCashFlow],
      [''],
      ['KENAIKAN / (PENURUNAN) KAS BERSIH', '', '', '', report.netCashChange],
      ['SALDO KAS & BANK AKHIR', `Kas Fisik (${formatIDR(report.realCash)}) + Bank (${formatIDR(report.realBank)})`, '', '', report.totalLiquidCash],
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCSV(`HATOBA_Arus_Kas_EMKM_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Laporan Arus Kas SAK EMKM berhasil diunduh ke Excel (.csv)!')
  }

  const handleExportTransactionsCSV = () => {
    const rows = [
      ['ID Transaksi', 'Tanggal', 'Akun', 'Tipe', 'Kategori Akuntansi', 'Nominal (Rp)', 'Pihak Terkait', 'No. Referensi', 'Catatan'],
      ...transactions.map((tx) => [
        tx.id,
        tx.date,
        tx.account === 'KAS' ? 'KAS FISIK (101)' : 'BANK MANDIRI (102)',
        tx.type === 'IN' ? 'KAS MASUK' : 'KAS KELUAR',
        CATEGORY_OPTIONS[tx.category]?.label || tx.category,
        tx.amount,
        tx.recipientOrPayer,
        tx.referenceCode || '-',
        (tx.notes || '').replace(/"/g, '""'),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCSV(`HATOBA_Buku_Kas_dan_Bank_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Buku Kas & Bank berhasil diunduh ke Excel (.csv)!')
  }

  const handleExportARCSV = () => {
    if (!report) return
    const rows = [
      ['No. Invoice', 'Tanggal Pesanan', 'Nama Pelanggan', 'Nama Usaha/Resto', 'No. Telepon', 'Metode Bayar', 'Total Tagihan (Rp)', 'Sudah Dibayar (Rp)', 'Sisa Piutang (Rp)', 'Umur Piutang (Hari)', 'Status Umur'],
      ...report.pendingTempoOrders.map((ord) => {
        const remaining = Math.max(0, ord.totalAmount - (ord.paidAmount || 0))
        const daysOld = Math.floor((new Date().getTime() - new Date(ord.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        return [
          `INV-${ord.referenceCode}`,
          new Date(ord.createdAt).toLocaleDateString('id-ID'),
          ord.customerName,
          ord.businessName || '-',
          ord.phone || '-',
          ord.paymentMethod || 'TEMPO',
          ord.totalAmount,
          ord.paidAmount || 0,
          remaining,
          daysOld,
          daysOld > 3 ? 'LEWAT JATUH TEMPO (>3 Hari)' : 'LANCAR (0-3 Hari)',
        ]
      }),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCSV(`HATOBA_Buku_Piutang_AR_Aging_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Buku Pembantu Piutang berhasil diunduh ke Excel (.csv)!')
  }

  const handleExportReconcileCSV = () => {
    const rows = [
      ['ID Rekonsiliasi', 'Tanggal', 'Label Shift', 'Kasir / Petugas', 'Kas Sistem (Rp)', 'Kas Fisik Dihitung (Rp)', 'Selisih Kas (Rp)', 'Transfer Sistem (Rp)', 'Bank Valid (Rp)', 'Selisih Transfer (Rp)', 'Status', 'Perlakuan Akuntansi', 'Catatan'],
      ...reconciliations.map((rec) => [
        rec.id,
        rec.date,
        rec.shiftLabel,
        rec.reconciledBy,
        rec.systemCashTotal,
        rec.actualCashCounted,
        rec.cashDiscrepancy,
        rec.systemTransferTotal,
        rec.bankVerifiedTotal,
        rec.transferDiscrepancy,
        rec.status,
        rec.resolutionAction || 'SUDAH_COCOK',
        (rec.notes || '').replace(/"/g, '""'),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCSV(`HATOBA_Rekonsiliasi_Kasir_POS_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Log Rekonsiliasi Kasir berhasil diunduh ke Excel (.csv)!')
  }

  const handleExportJournalCSV = () => {
    const rows: (string | number)[][] = [
      ['ID Jurnal', 'Tanggal', 'No. Referensi', 'Keterangan Jurnal', 'Kode Akun', 'Nama Akun', 'Debit (Rp)', 'Kredit (Rp)'],
    ]
    journal.forEach((entry) => {
      entry.lines.forEach((line) => {
        rows.push([
          entry.id,
          entry.date,
          entry.referenceNo,
          entry.description.replace(/"/g, '""'),
          line.accountCode,
          line.accountName,
          line.debit,
          line.credit,
        ])
      })
    })
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCSV(`HATOBA_Jurnal_Umum_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Jurnal Umum berhasil diunduh ke Excel (.csv)!')
  }

  const handleExportMasterBundleCSV = () => {
    if (!report) return
    let csv = `"HATOBA COLD CHAIN BOGA MANDIRI - BUNDEL LAPORAN KEUANGAN LENGKAP"\n"Standar: SAK EMKM Indonesia","Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}"\n\n`
    csv += `"1. RINGKASAN METRIK EKSEKUTIF"\n"Kas Likuid (Rp)","${report.totalLiquidCash}"\n"Total Piutang (Rp)","${report.totalReceivables}"\n"Persediaan Daging Freezer (Rp)","${report.inventoryValue}"\n"Hutang Supplier RPH (Rp)","${report.balanceSheet.liabilitiesAndEquity.accountsPayable}"\n"Margin Kotor Penjualan (Rp)","${report.grossProfitMarginRp}"\n"Laba Bersih Operasional (Rp)","${report.netOperatingIncome}"\n\n`
    csv += `"2. BUKU KAS & BANK TERAKHIR"\n"Tanggal","Akun","Tipe","Kategori","Nominal (Rp)","Pihak Terkait"\n`
    transactions.slice(0, 50).forEach((tx) => {
      csv += `"${tx.date}","${tx.account}","${tx.type}","${CATEGORY_OPTIONS[tx.category]?.label || tx.category}","${tx.amount}","${tx.recipientOrPayer}"\n`
    })
    csv += `\n"3. BUKU PEMBANTU PIUTANG (AR AGING)"\n"Invoice","Pelanggan","Bisnis","Total Tagihan (Rp)","Sisa Piutang (Rp)","Umur (Hari)"\n`
    report.pendingTempoOrders.forEach((ord) => {
      const remaining = Math.max(0, ord.totalAmount - (ord.paidAmount || 0))
      const daysOld = Math.floor((new Date().getTime() - new Date(ord.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      csv += `"INV-${ord.referenceCode}","${ord.customerName}","${ord.businessName || '-'}","${ord.totalAmount}","${remaining}","${daysOld}"\n`
    })
    downloadCSV(`HATOBA_Master_Laporan_Keuangan_Lengkap_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showToast('Bundel Master Laporan Lengkap berhasil diunduh!')
  }

  // Quick Open Print Preview
  const triggerPrintPreview = (type: ReportType = 'ALL') => {
    setSelectedReportType(type)
    setShowPrintPreview(true)
  }

  // Active Tab Title for Breadcrumbs
  const activeTabTitle = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return 'Ringkasan Finansial & Alert Manajemen'
      case 'reports':
        return 'Pusat Laporan Lengkap & Ekspor PDF/Excel'
      case 'reconciliation':
        return 'Rekonsiliasi Tutup Kasir & Mutasi Bank'
      case 'transactions':
        return 'Buku Kas & Mutasi Bank (Buku Pembantu)'
      case 'cashflow':
        return 'Laporan Arus Kas (Metode Langsung)'
      case 'balancesheet':
        return 'Neraca Sederhana & Penentuan HPP'
      case 'equity':
        return 'Laporan Perubahan Modal'
      case 'ar_aging':
        return 'Buku Pembantu Piutang (AR Aging)'
      case 'journal':
        return 'Buku Jurnal Umum Otomatis'
      case 'goods_receipt':
        return 'Penerimaan Barang Masuk (Goods Receipt Note - GRN)'
      case 'help':
        return 'Pusat Bantuan, SOP & Tata Kelola'
      default:
        return 'Mini ERP Finance'
    }
  }, [activeTab])

  // Nav Items array with badges & counts
  const navItems = [
    {
      id: 'overview',
      label: 'Ringkasan & Alert',
      icon: PieChart,
      badge: report && report.receivablesOverdue > 0 ? 'Alert' : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'reports',
      label: 'Laporan & Ekspor',
      icon: FileSpreadsheet,
      badge: 'PDF/XLS',
      badgeColor: 'bg-[#C59B47] text-[#111613]',
    },
    {
      id: 'reconciliation',
      label: 'Tutup Kasir & Bank',
      icon: CheckCheck,
      badge: 'POS',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'transactions',
      label: 'Buku Kas & Bank',
      icon: Receipt,
      count: transactions.length,
    },
    {
      id: 'cashflow',
      label: 'Laporan Arus Kas',
      icon: TrendingUp,
    },
    {
      id: 'balancesheet',
      label: 'Neraca & HPP',
      icon: Scale,
    },
    {
      id: 'equity',
      label: 'Perubahan Modal',
      icon: FileText,
    },
    {
      id: 'ar_aging',
      label: 'Buku Piutang',
      icon: Clock,
      count: report?.pendingTempoOrders.length || 0,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'journal',
      label: 'Jurnal Umum',
      icon: BookOpen,
      count: journal.length,
    },
    {
      id: 'goods_receipt',
      label: 'Penerimaan Barang',
      icon: Truck,
      count: goodsReceipts.length,
      badge: 'Gudang',
      badgeColor: 'bg-cyan-700 text-white',
    },
    {
      id: 'help',
      label: 'Panduan & SOP Help',
      icon: HelpCircle,
    },
  ]

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
    <div className="min-h-screen bg-[#F7F4EE] text-[#111613] flex font-sans antialiased">
      {/* MOBILE BACKDROP OVERLAY */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      {/* ======================= LEFT SIDEBAR ADMIN PANEL (EXPAND / COLLAPSE) ======================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#111613] text-white flex flex-col justify-between border-r border-[#2A362F] transition-all duration-300 ease-in-out no-print overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${sidebarExpanded ? 'lg:w-64' : 'lg:w-20'}`}
      >
        {/* Top Branding Section */}
        <div className="flex flex-col">
          <div className="p-4 border-b border-[#222E26] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C59B47] to-[#8C6B24] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              {(sidebarExpanded || mobileMenuOpen) && (
                <div className="overflow-hidden animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif-title font-bold text-sm text-white whitespace-nowrap tracking-tight">
                      HATOBA ERP
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                      EMKM
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">
                    Cold Chain Finance
                  </p>
                </div>
              )}
            </div>

            {/* Collapse/Expand Toggle on Desktop */}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="hidden lg:flex p-1.5 rounded-lg bg-[#1B241E] hover:bg-[#25322A] text-gray-400 hover:text-white transition-colors"
              title={sidebarExpanded ? 'Ciutkan Menu (Collapse)' : 'Perluas Menu (Expand)'}
            >
              {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Close button on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-[#1B241E] hover:bg-[#25322A] text-gray-400 hover:text-white transition-colors"
              title="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Live Sync / Cut-off Freeze Status Card */}
          {(sidebarExpanded || mobileMenuOpen) ? (
            <div className={`p-3 mx-3 my-2.5 rounded-2xl border flex items-center justify-between text-xs animate-in fade-in ${
              isAutoSyncEnabled ? 'bg-[#17211B] border-[#2A372D]' : 'bg-[#2A2312] border-amber-600/50'
            }`}>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    isAutoSyncEnabled
                      ? isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <div>
                  <div className="font-bold text-[11px] text-white flex items-center gap-1">
                    <span>{isAutoSyncEnabled ? 'Live Real-Time' : 'Cut-Off Terkunci'}</span>
                    {isSyncing && <span className="text-[9px] text-amber-300 font-normal">Sync...</span>}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {isAutoSyncEnabled
                      ? lastSyncedAt.toLocaleTimeString('id-ID')
                      : (cutoffTimestamp ? cutoffTimestamp.toLocaleTimeString('id-ID') : lastSyncedAt.toLocaleTimeString('id-ID'))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleAutoSync}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isAutoSyncEnabled
                      ? 'hover:bg-white/10 text-gray-400 hover:text-amber-400'
                      : 'bg-amber-600 text-white hover:bg-amber-500'
                  }`}
                  title={isAutoSyncEnabled ? 'Jeda otomatis (Kunci Cut-Off data)' : 'Aktifkan sinkronisasi live'}
                >
                  {isAutoSyncEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => fetchFinanceData(true)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Update snapshot data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2.5 flex justify-center">
              <div
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  isAutoSyncEnabled
                    ? isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400 ring-2 ring-amber-500/40'
                }`}
                title={isAutoSyncEnabled ? 'Live Sync Aktif (Klik untuk jeda)' : 'Cut-Off Terkunci (Klik untuk aktifkan)'}
                onClick={toggleAutoSync}
              />
            </div>
          )}

          {/* Nav Items List */}
          <nav className="px-2 py-1 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-none text-xs">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as FinanceTab)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full py-2.5 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    sidebarExpanded || mobileMenuOpen ? 'px-3 text-left' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C59B47] to-[#A47F33] text-[#111613] font-bold shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-[#1C2620]'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#111613]' : 'text-gray-400'}`} />

                  {(sidebarExpanded || mobileMenuOpen) && (
                    <span className="flex-1 truncate text-xs">{item.label}</span>
                  )}

                  {(sidebarExpanded || mobileMenuOpen) && (
                    <>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-gray-700 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/15 text-white">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Footer Actions */}
        <div className="p-3 border-t border-[#222E26] space-y-2 bg-[#0E1310]">
          {(sidebarExpanded || mobileMenuOpen) ? (
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setTxType('IN')
                  setTxCategory('INCOME_AR_COLLECTION')
                  setShowAddTxModal(true)
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catat Kas Masuk/Keluar</span>
              </button>

              <button
                onClick={() => setShowInventoryModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-[#1B251F] hover:bg-[#25332A] text-[#C59B47] border border-[#34463A] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>Stock Opname Freezer</span>
              </button>

              <button
                onClick={() => setShowGoodsReceiptModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-[#132227] hover:bg-[#1A2E35] text-cyan-400 border border-cyan-800/60 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Terima Barang (GRN)</span>
              </button>

              <div className="pt-2 border-t border-[#1C2620] flex items-center justify-between text-xs text-gray-400">
                <Link
                  href="/admin"
                  className="hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Admin Toko</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="hover:text-red-400 flex items-center gap-1 transition-colors text-red-300"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => {
                  setTxType('IN')
                  setTxCategory('INCOME_AR_COLLECTION')
                  setShowAddTxModal(true)
                }}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                title="Catat Kas Baru"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowInventoryModal(true)}
                className="p-2 rounded-xl bg-[#1B251F] hover:bg-[#25332A] text-[#C59B47] border border-[#34463A] transition-colors"
                title="Stock Opname Freezer"
              >
                <Snowflake className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowGoodsReceiptModal(true)}
                className="p-2 rounded-xl bg-[#132227] hover:bg-[#1A2E35] text-cyan-400 border border-cyan-800/60 transition-colors"
                title="Penerimaan Barang Masuk (GRN)"
              >
                <Truck className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-950/60 text-red-400 transition-colors"
                title="Keluar Sesi Keuangan"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ======================= MAIN WORKSPACE AREA ======================= */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        {/* Sticky Top Header Bar with Live Indicator & Actions */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E3D9CC] shadow-xs no-print">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            {/* Left: Mobile hamburger + Breadcrumb Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#111613] transition-colors"
                title="Buka Menu Panel Admin"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 hidden sm:inline">Mini ERP</span>
                  <span className="text-gray-300 hidden sm:inline">/</span>
                  <h1 className="font-bold text-sm sm:text-base text-[#111613] tracking-tight">
                    {activeTabTitle}
                  </h1>
                </div>
              </div>
            </div>

            {/* Right: Live Sync Indicator + Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live Real-time / Cut-off Toggle Pill */}
              <button
                onClick={toggleAutoSync}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                  isAutoSyncEnabled
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300/50'
                }`}
                title={
                  isAutoSyncEnabled
                    ? 'Klik untuk menjeda auto-sync & membekukan data cut-off'
                    : 'Klik untuk mengaktifkan kembali sinkronisasi live real-time'
                }
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isAutoSyncEnabled
                      ? isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="hidden sm:inline">
                  {isAutoSyncEnabled
                    ? isSyncing ? 'Sinkronisasi...' : `Live • ${lastSyncedAt.toLocaleTimeString('id-ID')}`
                    : `Cut-Off • ${cutoffTimestamp ? cutoffTimestamp.toLocaleTimeString('id-ID') : lastSyncedAt.toLocaleTimeString('id-ID')}`}
                </span>
                <span className="sm:hidden">
                  {isAutoSyncEnabled ? (isSyncing ? 'Sync...' : 'Live') : 'Freeze'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 font-mono">
                  {isAutoSyncEnabled ? '⏸ Jeda' : '▶ Live'}
                </span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => fetchFinanceData(false)}
                disabled={loading}
                className="p-1.5 sm:p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#111613] transition-colors"
                title="Muat Ulang Data Sekarang"
              >
                <RefreshCw className={`w-4 h-4 ${loading || isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>

              {/* Ekspor Laporan Button */}
              <button
                onClick={() => {
                  setSelectedReportType('ALL')
                  setShowExportModal(true)
                }}
                className="px-3 py-1.5 rounded-xl bg-[#233129] hover:bg-[#2F4237] text-white border border-[#C59B47]/60 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                title="Ekspor Laporan Keuangan ke Excel & Cetak PDF Resmi"
              >
                <Download className="w-3.5 h-3.5 text-[#C59B47]" />
                <span className="hidden sm:inline">Ekspor &amp; PDF</span>
              </button>

              {/* + Catat Kas Button */}
              <button
                onClick={() => {
                  setTxType('IN')
                  setTxCategory('INCOME_AR_COLLECTION')
                  setShowAddTxModal(true)
                }}
                className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catat Kas</span>
              </button>

              {/* Tombol Logout Sesi Keuangan */}
              <button
                onClick={handleLogout}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Keluar dari Portal Keuangan (Logout)"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </header>

        {/* ======================= MAIN CONTENT TABS ======================= */}
        <main className="flex-1 min-w-0 w-full max-w-full p-4 sm:p-6 lg:p-8 space-y-6 no-print">
          {/* CUT-OFF FREEZE AUDIT BANNER */}
          {!isAutoSyncEnabled && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400/80 text-amber-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-200 text-amber-900 flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                    <span>Data Laporan Dibekukan (Cut-Off Period Terkunci)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                      Audit Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Cut-Off: <strong>{cutoffTimestamp ? cutoffTimestamp.toLocaleString('id-ID') : lastSyncedAt.toLocaleString('id-ID')}</strong>. Data stabil dan tidak akan bergeser otomatis oleh transaksi kasir baru untuk pelaporan atau pencetakan pimpinan.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => fetchFinanceData(true)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1.5"
                  title="Ambil snapshot terkini tanpa mengaktifkan auto-polling"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Update Snapshot</span>
                </button>
                <button
                  onClick={toggleAutoSync}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Buka Kunci Live</span>
                </button>
              </div>
            </div>
          )}
          {/* ==================== TAB 1: OVERVIEW (RINGKASAN & ALERT MANAJEMEN) ==================== */}
          {activeTab === 'overview' && report && (
            <div className="space-y-6">
              {/* Quick Export CTA Banner */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#18211C] to-[#25332B] text-white border border-[#2D3A32] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#C59B47]/20 border border-[#C59B47]/40 flex items-center justify-center text-[#E5C278]">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Pusat Laporan Lengkap Akuntansi HATOBA
                    </h3>
                    <p className="text-xs text-gray-300">
                      Semua laporan (Penjualan, Laba Rugi, Neraca, Arus Kas, Piutang) siap diekspor ke Excel (.csv) &amp; Cetak/Simpan PDF (A4).
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="px-4 py-2 rounded-xl bg-[#C59B47] hover:bg-[#D4AA55] text-[#111613] font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Semua Laporan</span>
                  </button>
                  <button
                    onClick={handleExportMasterBundleCSV}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5 border border-white/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Master Excel</span>
                  </button>
                </div>
              </div>

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

          {/* ==================== TAB 2: PUSAT LAPORAN & EKSPOR (EXCEL & PDF) ==================== */}
          {activeTab === 'reports' && report && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="font-serif-title text-xl font-bold text-[#111613] flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      <span>Pusat Laporan Lengkap &amp; Ekspor (Excel &amp; PDF Resmi)</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Semua laporan akuntansi SAK EMKM dan rekap penjualan dapat diunduh ke format Excel (.csv) atau dicetak resmi A4 (Simpan PDF).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportMasterBundleCSV}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Master Excel Semua Laporan</span>
                    </button>
                    <button
                      onClick={() => triggerPrintPreview('ALL')}
                      className="px-4 py-2 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm border border-[#C59B47]/40"
                    >
                      <Printer className="w-4 h-4 text-[#C59B47]" />
                      <span>Cetak PDF Resmi A4</span>
                    </button>
                  </div>
                </div>

                {/* Grid of Report Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                  {/* 1. Laporan Penjualan & POS */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111613] flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-emerald-600" />
                          <span>Laporan Rekap Penjualan POS</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {orders.length} Transaksi
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Rincian pesanan dari Web &amp; POS kasir, performa tim marketing, metode bayar (Tunai/Transfer/Tempo), dan status lunas.
                      </p>
                      <div className="font-mono font-bold text-base text-[#111613]">
                        Omzet: {formatIDR(report.totalSalesRevenue)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-xs">
                      <button
                        onClick={handleExportSalesCSV}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-[#111613] flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel (.csv)</span>
                      </button>
                      <button
                        onClick={() => triggerPrintPreview('SALES')}
                        className="py-2 px-3 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Cetak A4 / Simpan PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Laporan Laba Rugi SAK EMKM */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111613] flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span>Laporan Laba Rugi (P&amp;L)</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          SAK EMKM
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Laba kotor penjualan daging, beban HPP, rincian biaya listrik cold storage -18°C, gaji, dan laba operasional bersih.
                      </p>
                      <div className="font-mono font-bold text-base text-emerald-700">
                        Laba Bersih: {formatIDR(report.netOperatingIncome)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-xs">
                      <button
                        onClick={handleExportPLCSV}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-[#111613] flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel (.csv)</span>
                      </button>
                      <button
                        onClick={() => triggerPrintPreview('PL')}
                        className="py-2 px-3 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Cetak A4 / Simpan PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Laporan Posisi Keuangan (Neraca) */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111613] flex items-center gap-2">
                          <Scale className="w-4 h-4 text-[#C59B47]" />
                          <span>Laporan Neraca Sederhana</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Balance
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Aset lancar (Kas, Bank, Piutang, Daging Beku), Aset Tetap Freezer, Hutang Supplier, dan Ekuitas Modal Pemilik.
                      </p>
                      <div className="font-mono font-bold text-base text-[#111613]">
                        Total Aset: {formatIDR(report.balanceSheet.assets.totalAssets)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-xs">
                      <button
                        onClick={handleExportBalanceSheetCSV}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-[#111613] flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel (.csv)</span>
                      </button>
                      <button
                        onClick={() => triggerPrintPreview('BALANCE_SHEET')}
                        className="py-2 px-3 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Cetak A4 / Simpan PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. Laporan Arus Kas (Cash Flow) */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111613] flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span>Laporan Arus Kas</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          Metode Langsung
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Pergerakan arus kas riil dari 3 pilar: Aktivitas Operasi harian, Aktivitas Investasi mesin, dan Aktivitas Pendanaan.
                      </p>
                      <div className="font-mono font-bold text-base text-emerald-700">
                        Kas Bersih: {formatIDR(report.totalLiquidCash)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-xs">
                      <button
                        onClick={handleExportCashFlowCSV}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-[#111613] flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel (.csv)</span>
                      </button>
                      <button
                        onClick={() => triggerPrintPreview('CASH_FLOW')}
                        className="py-2 px-3 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Cetak A4 / Simpan PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* 5. Buku Pembantu Piutang (AR Aging) */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111613] flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Buku Piutang &amp; AR Aging</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {report.pendingTempoOrders.length} Debitur
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Daftar tagihan tempo per warung makan/resto, umur tagihan, status lancar (0-3 hari) vs macet (&gt;3 hari), kontak konsumen.
                      </p>
                      <div className="font-mono font-bold text-base text-amber-700">
                        Total Piutang: {formatIDR(report.totalReceivables)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-xs">
                      <button
                        onClick={handleExportARCSV}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-[#111613] flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel (.csv)</span>
                      </button>
                      <button
                        onClick={() => triggerPrintPreview('AR')}
                        className="py-2 px-3 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Cetak A4 / Simpan PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* 6. Buku Kas & Bank */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111613] flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-blue-600" />
                          <span>Buku Kas &amp; Mutasi Bank</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {transactions.length} Mutasi
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Rekap seluruh transaksi mutasi kas masuk dan keluar, rekening Kas Fisik (101) dan Bank Mandiri (102).
                      </p>
                      <div className="font-mono font-bold text-base text-[#111613]">
                        Saldo: {formatIDR(report.totalLiquidCash)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-xs">
                      <button
                        onClick={handleExportTransactionsCSV}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-[#111613] flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel (.csv)</span>
                      </button>
                      <button
                        onClick={() => triggerPrintPreview('CASH_BANK')}
                        className="py-2 px-3 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Cetak A4 / Simpan PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* 7. Rekonsiliasi Tutup Kasir POS */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111613] flex items-center gap-2">
                          <CheckCheck className="w-4 h-4 text-emerald-600" />
                          <span>Rekonsiliasi Tutup Kasir</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {reconciliations.length} Sesi
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Berita acara pencocokan fisik uang laci kasir, mutasi bank rekening, dan pencatatan selisih kas (Akun 608/403).
                      </p>
                      <div className="font-mono font-bold text-base text-emerald-700">
                        Sesi Terakhir: {reconciliations[0]?.status || 'BALANCED'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-xs">
                      <button
                        onClick={handleExportReconcileCSV}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-[#111613] flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel (.csv)</span>
                      </button>
                      <button
                        onClick={() => triggerPrintPreview('RECON')}
                        className="py-2 px-3 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Cetak A4 / Simpan PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* 8. Jurnal Umum Otomatis */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111613] flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span>Jurnal Umum Otomatis</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Double-Entry
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Buku jurnal umum standar akuntansi berisi posting debit dan kredit otomatis dari seluruh transaksi kas, bank, dan selisih.
                      </p>
                      <div className="font-mono font-bold text-base text-[#111613]">
                        {journal.length} Entri Jurnal
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-xs">
                      <button
                        onClick={handleExportJournalCSV}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-[#111613] flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel (.csv)</span>
                      </button>
                      <button
                        onClick={() => triggerPrintPreview('JOURNAL')}
                        className="py-2 px-3 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Cetak A4 / Simpan PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: REKONSILIASI TUTUP KASIR & BANK (POS SETTLEMENT) ==================== */}
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

                {/* Mobile Card View (md:hidden) */}
                <div className="md:hidden space-y-3">
                  {reconciliations.map((rec) => (
                    <div key={rec.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-[#111613]">{rec.shiftLabel}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{rec.date} • {rec.reconciledBy}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'BALANCED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rec.status === 'BALANCED' ? 'BALANCED' : 'RESOLVED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-gray-200">
                        <div className="p-2 rounded-xl bg-white border border-gray-100">
                          <span className="text-gray-500 text-[10px] block font-medium">Kas Fisik vs Sistem</span>
                          <div className="font-bold font-mono text-emerald-800 text-xs mt-0.5">
                            {formatIDR(rec.actualCashCounted)}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">Sistem: {formatIDR(rec.systemCashTotal)}</div>
                          <span
                            className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              rec.cashDiscrepancy === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.cashDiscrepancy < 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Selisih: {rec.cashDiscrepancy === 0 ? '0 (Klop)' : formatIDR(rec.cashDiscrepancy)}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-white border border-gray-100">
                          <span className="text-gray-500 text-[10px] block font-medium">Bank Valid vs Sistem</span>
                          <div className="font-bold font-mono text-blue-800 text-xs mt-0.5">
                            {formatIDR(rec.bankVerifiedTotal)}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">Sistem: {formatIDR(rec.systemTransferTotal)}</div>
                          <span
                            className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              rec.transferDiscrepancy === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Selisih: {rec.transferDiscrepancy === 0 ? '0 (Klop)' : formatIDR(rec.transferDiscrepancy)}
                          </span>
                        </div>
                      </div>

                      {rec.resolutionAction && (
                        <div className="text-[10px] text-gray-600 bg-white p-2 rounded-xl border border-gray-200">
                          Perlakuan: <strong className="text-[#111613]">{rec.resolutionAction}</strong>
                          {rec.notes && <span className="block text-gray-500 mt-0.5">{rec.notes}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                  {reconciliations.length === 0 && (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      Belum ada catatan rekonsiliasi kasir.
                    </div>
                  )}
                </div>

                {/* Desktop Table View (hidden md:block) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[750px]">
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

          {/* ==================== TAB 4: BUKU KAS & BANK ==================== */}
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
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleExportTransactionsCSV}
                      className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-xs text-[#111613] flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unduh Excel</span>
                    </button>
                    <button
                      onClick={() => {
                        setTxType('IN')
                        setTxCategory('INCOME_AR_COLLECTION')
                        setShowAddTxModal(true)
                      }}
                      className="flex-1 sm:flex-initial justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Catat Transaksi</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Card View (sm:hidden) */}
                <div className="sm:hidden space-y-3">
                  {transactions.map((tx) => {
                    const catInfo = CATEGORY_OPTIONS[tx.category]
                    return (
                      <div key={tx.id} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-gray-500">{tx.date}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.account === 'KAS'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-blue-100 text-blue-900 border border-blue-300'
                              }`}
                            >
                              {tx.account === 'KAS' ? 'KAS FISIK' : 'BANK MANDIRI'}
                            </span>
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-2 pt-1 border-t border-gray-100">
                          <div>
                            <div className="font-bold text-xs text-[#111613]">
                              {catInfo?.label || tx.category}
                            </div>
                            <div className="text-[11px] text-gray-600 font-medium">{tx.recipientOrPayer}</div>
                            {tx.notes && <div className="text-[10px] text-gray-400 mt-0.5">{tx.notes}</div>}
                            {tx.referenceCode && (
                              <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                                Ref: {tx.referenceCode}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div
                              className={`font-mono font-bold text-sm ${
                                tx.type === 'IN' ? 'text-emerald-700' : 'text-red-700'
                              }`}
                            >
                              {tx.type === 'IN' ? `+ ${formatIDR(tx.amount)}` : `- ${formatIDR(tx.amount)}`}
                            </div>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                tx.type === 'IN'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {tx.type === 'IN' ? 'Kas Masuk' : 'Kas Keluar'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {transactions.length === 0 && (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      Belum ada transaksi keuangan yang dicatat.
                    </div>
                  )}
                </div>

                {/* Desktop Table View (hidden sm:block) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[700px]">
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

          {/* ==================== TAB 5: LAPORAN ARUS KAS SAK EMKM ==================== */}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCashFlowCSV}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-xs text-[#111613] flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unduh Excel</span>
                    </button>
                    <button
                      onClick={() => triggerPrintPreview('CASH_FLOW')}
                      className="px-3 py-1.5 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                      <span>Cetak PDF</span>
                    </button>
                  </div>
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

          {/* ==================== TAB 6: NERACA SEDERHANA & HPP ==================== */}
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
                      onClick={handleExportBalanceSheetCSV}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-xs text-[#111613] flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unduh Excel</span>
                    </button>
                    <button
                      onClick={() => triggerPrintPreview('BALANCE_SHEET')}
                      className="px-3 py-1.5 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                      <span>Cetak PDF</span>
                    </button>
                    <button
                      onClick={() => setShowInventoryModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] hover:bg-gray-100 text-xs font-bold text-[#111613] flex items-center gap-1.5"
                    >
                      <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Opname Stok</span>
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

              {/* Riwayat & Audit Trail Stock Opname Fisik Freezer */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-5 w-full min-w-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-serif-title text-lg font-bold text-[#111613] flex items-center gap-2">
                      <Snowflake className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <span>Riwayat &amp; Audit Trail Stock Opname Fisik Freezer</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Pencatatan berkala kondisi fisik, berat daging &amp; jeroan (Kg), suhu cold storage, serta tanggal &amp; waktu audit akurat.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleExportStockOpnameCSV}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-xs text-[#111613] flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Unduh Riwayat Stock Opname ke Excel"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Unduh Excel</span>
                    </button>
                    <button
                      onClick={() => setShowInventoryModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat Opname Baru</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Card View (md:hidden) */}
                <div className="md:hidden space-y-3">
                  {stockOpnameHistory.map((sop, idx) => (
                    <div
                      key={sop.id || idx}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-2.5 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-900 bg-cyan-100/70 px-2 py-0.5 rounded-lg text-[11px]">
                          {sop.id}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {sop.date} • {new Date(sop.recordedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 py-1.5 border-y border-dashed border-[#E3D9CC]">
                        <div>
                          <div className="text-[10px] text-gray-500 font-medium">Total Berat Fisik</div>
                          <div className="font-mono font-bold text-[#111613] text-sm">{sop.totalWeightKg} Kg</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 font-medium">Estimasi Nilai HPP</div>
                          <div className="font-mono font-bold text-emerald-800 text-sm">{formatIDR(sop.estimatedValue)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-600">
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
                          <span className="font-mono font-bold text-cyan-900">{sop.freezerTempCelsius}°C</span>
                        </div>
                        <div className="text-gray-700 font-medium truncate max-w-[180px]">
                          Pemeriksa: <span className="font-bold">{sop.inspector}</span>
                        </div>
                      </div>

                      {sop.notes && (
                        <p className="text-[11px] text-gray-600 italic bg-white/70 p-2 rounded-xl border border-gray-200">
                          &ldquo;{sop.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}

                  {stockOpnameHistory.length === 0 && (
                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl text-xs">
                      Belum ada riwayat stock opname tercatat.
                    </div>
                  )}
                </div>

                {/* Desktop Table View (hidden md:block) */}
                <div className="hidden md:block overflow-x-auto w-full border border-gray-100 rounded-2xl">
                  <table className="w-full text-xs text-left min-w-[750px]">
                    <thead className="bg-[#FAF8F5] text-gray-500 font-semibold border-b border-[#EAE4DC]">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">ID &amp; Tanggal Audit</th>
                        <th className="py-2.5 px-3">Petugas Pemeriksa</th>
                        <th className="py-2.5 px-3 text-center">Suhu Freezer</th>
                        <th className="py-2.5 px-3 text-right">Total Berat</th>
                        <th className="py-2.5 px-3 text-right">Nilai Persediaan</th>
                        <th className="py-2.5 px-3">Catatan Kondisi Fisik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stockOpnameHistory.map((sop, idx) => (
                        <tr key={sop.id || idx} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-gray-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-mono font-bold text-cyan-900">{sop.id}</div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              {sop.date} • {new Date(sop.recordedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#111613]">
                            {sop.inspector}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-bold text-[11px]">
                              <Thermometer className="w-3 h-3 text-cyan-600" />
                              {sop.freezerTempCelsius}°C
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#111613]">
                            {sop.totalWeightKg} Kg
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                            {formatIDR(sop.estimatedValue)}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate" title={sop.notes}>
                            {sop.notes || '-'}
                          </td>
                        </tr>
                      ))}
                      {stockOpnameHistory.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400">
                            Belum ada riwayat stock opname fisik.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 7: PERUBAHAN MODAL ==================== */}
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

          {/* ==================== TAB 8: BUKU PIUTANG TEMPO (AR AGING) ==================== */}
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
                    <button
                      onClick={handleExportARCSV}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-xs text-[#111613] flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unduh Excel</span>
                    </button>
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-red-100 text-red-800 border border-red-300">
                      Macet: {formatIDR(report.receivablesOverdue)}
                    </span>
                  </div>
                </div>

                {/* Mobile Card View (md:hidden) */}
                <div className="md:hidden space-y-3.5">
                  {report.pendingTempoOrders.map((ord) => {
                    const remaining = Math.max(0, ord.totalAmount - (ord.paidAmount || 0))
                    const daysOld = Math.floor(
                      (new Date().getTime() - new Date(ord.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                    )
                    const isOverdue = daysOld > 3

                    return (
                      <div key={ord.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-xs text-[#111613]">INV-{ord.referenceCode}</span>
                            <span className="text-[10px] text-gray-500 font-mono block">
                              {new Date(ord.createdAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOverdue
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {isOverdue ? `Lewat (${daysOld} hr)` : 'Lancar (0-3 hr)'}
                          </span>
                        </div>

                        <div className="pt-1.5 border-t border-gray-200">
                          <div className="font-bold text-xs text-[#111613]">{ord.customerName}</div>
                          {ord.businessName && (
                            <div className="text-[11px] text-gray-600 font-medium">{ord.businessName}</div>
                          )}
                          {ord.phone && (
                            <a
                              href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Halo Kak ${ord.customerName}, konfirmasi dari Tim Finance HATOBA terkait tagihan tempo INV-${ord.referenceCode} sebesar ${formatIDR(
                                  remaining
                                )}. Mohon konfirmasi jadwal pelunasannya. Terima kasih.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold mt-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Hubungi via WA ({ord.phone})</span>
                            </a>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white border border-gray-200 text-center font-mono text-[11px]">
                          <div>
                            <span className="text-[9px] text-gray-500 block">Total Tagihan</span>
                            <span className="font-medium text-gray-700">{formatIDR(ord.totalAmount)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-500 block">Sudah Dibayar</span>
                            <span className="font-medium text-emerald-700">{formatIDR(ord.paidAmount || 0)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-red-600 font-bold block">Sisa Piutang</span>
                            <span className="font-bold text-red-700 text-xs">{formatIDR(remaining)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => quickSettleAR(ord)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Catat Pelunasan Tagihan</span>
                        </button>
                      </div>
                    )
                  })}
                  {report.pendingTempoOrders.length === 0 && (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      Tidak ada piutang tempo yang menggantung. Semua pesanan Lunas!
                    </div>
                  )}
                </div>

                {/* Desktop Table View (hidden md:block) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[750px]">
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

          {/* ==================== TAB 9: JURNAL UMUM OTOMATIS ==================== */}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportJournalCSV}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-xs text-[#111613] flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unduh Excel</span>
                    </button>
                    <button
                      onClick={() => triggerPrintPreview('JOURNAL')}
                      className="px-3 py-1.5 rounded-xl bg-[#111613] hover:bg-[#222E27] text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C59B47]" />
                      <span>Cetak PDF</span>
                    </button>
                  </div>
                </div>

                {/* Journal Mobile Cards View (sm:hidden) */}
                <div className="sm:hidden space-y-3">
                  {journal.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-2.5 text-xs shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-[#111613] leading-snug">{entry.description}</div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 whitespace-nowrap">
                          {entry.referenceNo}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        {entry.date}
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-dashed border-[#E3D9CC]">
                        {entry.lines.map((line, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl flex items-center justify-between text-[11px] ${
                              line.debit > 0
                                ? 'bg-emerald-50/70 border border-emerald-100'
                                : 'bg-amber-50/70 border border-amber-100 ml-2'
                            }`}
                          >
                            <div className="space-y-0.5 max-w-[65%]">
                              <span className="font-mono text-[10px] text-gray-500 block">
                                {line.accountCode}
                              </span>
                              <span className="font-semibold text-[#111613] truncate block">
                                {line.accountName}
                              </span>
                            </div>
                            <div className="text-right">
                              {line.debit > 0 ? (
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold block">
                                    Debit
                                  </span>
                                  <span className="font-mono font-bold text-emerald-800">
                                    {formatIDR(line.debit)}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-amber-700 font-bold block">
                                    Kredit
                                  </span>
                                  <span className="font-mono font-bold text-amber-900">
                                    {formatIDR(line.credit)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {journal.length === 0 && (
                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl text-xs">
                      Belum ada entri jurnal umum.
                    </div>
                  )}
                </div>

                {/* Journal Table Desktop View (hidden sm:block) */}
                <div className="hidden sm:block overflow-x-auto w-full border border-gray-100 rounded-2xl">
                  <table className="w-full text-xs text-left min-w-[650px]">
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

          {/* ==================== TAB 10: PENERIMAAN BARANG MASUK (GOODS RECEIPT) ==================== */}
          {activeTab === 'goods_receipt' && (
            <div className="space-y-6 w-full min-w-0">
              {/* Summary Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3D9CC] shadow-xs min-w-0">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-xs font-semibold truncate">Total Dokumen GRN</span>
                    <Truck className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#111613]">
                    {goodsReceipts.length}
                    <span className="text-xs text-gray-500 font-sans font-normal ml-1">Pengiriman</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 truncate">Surat jalan pasokan masuk</p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3D9CC] shadow-xs min-w-0">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-xs font-semibold truncate">Total Berat Tiba</span>
                    <Box className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-900">
                    {goodsReceipts.reduce((sum, g) => sum + g.totalWeightKg, 0).toLocaleString('id-ID')}
                    <span className="text-xs text-gray-500 font-sans font-normal ml-1">Kg</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 truncate">Daging &amp; jeroan beku masuk</p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3D9CC] shadow-xs min-w-0">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-xs font-semibold truncate">Total Kemasan</span>
                    <PackageCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-900">
                    {goodsReceipts.reduce((sum, g) => sum + g.totalPacks, 0).toLocaleString('id-ID')}
                    <span className="text-xs text-gray-500 font-sans font-normal ml-1">Pack</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 truncate">Kemasan vacuum pack</p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3D9CC] shadow-xs min-w-0">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-xs font-semibold truncate">Suhu Rantai Dingin</span>
                    <Thermometer className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-blue-900">
                    -18.5°C
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 truncate">✓ Cold Chain Terjaga</p>
                </div>
              </div>

              {/* Main Goods Receipt List Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E3D9CC] shadow-sm space-y-5 w-full min-w-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="font-serif-title text-xl font-bold text-[#111613] flex items-center gap-2">
                      <Truck className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <span>Buku Penerimaan Barang Masuk (Goods Receipt Note - GRN)</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Pencatatan pasokan produk daging beku dari Sentra Produksi Bali atau Supplier RPH ke Hub Gudang Babarsari.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleExportGoodsReceiptCSV}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-xs text-[#111613] flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Unduh Laporan Penerimaan Barang ke Excel"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Unduh Excel</span>
                    </button>
                    <button
                      onClick={() => setShowGoodsReceiptModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat Penerimaan Barang</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Cards View (md:hidden) */}
                <div className="md:hidden space-y-3">
                  {goodsReceipts.map((gr, idx) => (
                    <div
                      key={gr.id || idx}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-2.5 text-xs shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono font-bold text-cyan-900 text-xs">
                            {gr.deliveryNoteNumber}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            GRN: {gr.id} • {gr.receiptDate}
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-bold text-[10px]">
                          <Thermometer className="w-3 h-3 text-cyan-600" />
                          {gr.freezerTempCelsius}°C
                        </span>
                      </div>

                      <div className="text-[11px] space-y-1 bg-white/70 p-2.5 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <span className="font-semibold text-gray-500">Asal:</span>
                          <span className="font-medium truncate">{gr.sourceLabel}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <span className="font-semibold text-gray-500">Armada:</span>
                          <span className="truncate">{gr.carrierName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <span className="font-semibold text-gray-500">Penerima:</span>
                          <span className="font-medium">{gr.receiverName}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 py-1.5 border-y border-dashed border-[#E3D9CC]">
                        <div>
                          <div className="text-[10px] text-gray-500 font-medium">Jumlah Kemasan</div>
                          <div className="font-mono font-bold text-[#111613] text-sm">{gr.totalPacks} Pack</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 font-medium">Total Berat Masuk</div>
                          <div className="font-mono font-bold text-cyan-900 text-sm">{gr.totalWeightKg} Kg</div>
                        </div>
                      </div>

                      {gr.notes && (
                        <p className="text-[11px] text-gray-600 italic bg-white/70 p-2 rounded-xl border border-gray-200">
                          &ldquo;{gr.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}

                  {goodsReceipts.length === 0 && (
                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl text-xs">
                      Belum ada pencatatan penerimaan barang masuk.
                    </div>
                  )}
                </div>

                {/* Desktop Table View (hidden md:block) */}
                <div className="hidden md:block overflow-x-auto w-full border border-gray-100 rounded-2xl">
                  <table className="w-full text-xs text-left min-w-[850px]">
                    <thead className="bg-[#FAF8F5] text-gray-500 font-semibold border-b border-[#EAE4DC]">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">No. Surat Jalan &amp; ID</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Tanggal Tiba</th>
                        <th className="py-2.5 px-3 min-w-[200px] max-w-[240px]">Asal Kiriman</th>
                        <th className="py-2.5 px-3 min-w-[150px]">Armada &amp; Suhu</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Penerima Gudang</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Kemasan</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Total Berat</th>
                        <th className="py-2.5 px-3 min-w-[160px]">Kondisi &amp; Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {goodsReceipts.map((gr, idx) => (
                        <tr key={gr.id || idx} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-gray-400 font-mono text-center">{idx + 1}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-mono font-bold text-cyan-950">{gr.deliveryNoteNumber}</div>
                            <div className="text-[11px] text-gray-400 font-mono">{gr.id}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-gray-600 whitespace-nowrap">
                            {gr.receiptDate}
                          </td>
                          <td className="py-2.5 px-3 min-w-[200px] max-w-[240px]">
                            <div className="font-medium text-[#111613] truncate" title={gr.sourceLabel}>
                              {gr.sourceLabel}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">Hub Yogyakarta</div>
                          </td>
                          <td className="py-2.5 px-3 min-w-[150px]">
                            <div className="text-gray-700 truncate max-w-[160px]" title={gr.carrierName}>
                              {gr.carrierName}
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] text-cyan-800 font-mono font-bold">
                              <Thermometer className="w-3 h-3 text-cyan-600" />
                              {gr.freezerTempCelsius}°C
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#111613] whitespace-nowrap">
                            {gr.receiverName}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#111613] whitespace-nowrap">
                            {gr.totalPacks} Pack
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-900 whitespace-nowrap">
                            {gr.totalWeightKg} Kg
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate" title={gr.notes}>
                            {gr.notes || '-'}
                          </td>
                        </tr>
                      ))}
                      {goodsReceipts.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-gray-400">
                            Belum ada dokumen penerimaan barang masuk dari supplier/pusat.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
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
      </div>

      {/* ======================= MODAL: MODAL EKSPOR LAPORAN ======================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E3D9CC] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#EAE4DC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#111613]">
                  Ekspor &amp; Cetak Laporan Keuangan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-gray-600">
                Pilih format keluaran dan laporan yang ingin diunduh atau dicetak resmi:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleExportMasterBundleCSV()
                    setShowExportModal(false)
                  }}
                  className="w-full p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-bold flex items-center justify-between transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                    <div>
                      <div className="text-xs">Unduh Semua Laporan (Master Excel .csv)</div>
                      <div className="text-[11px] text-emerald-700 font-normal">Bundel lengkap metrik, kas, piutang &amp; neraca</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-700" />
                </button>

                <button
                  onClick={() => {
                    setShowExportModal(false)
                    triggerPrintPreview('ALL')
                  }}
                  className="w-full p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-bold flex items-center justify-between transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Printer className="w-5 h-5 text-[#C59B47]" />
                    <div>
                      <div className="text-xs">Cetak / Simpan PDF Dokumen Resmi A4</div>
                      <div className="text-[11px] text-gray-500 font-normal">Format formal kop surat &amp; lembar tanda tangan direktur</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Ekspor Laporan Spesifik (Excel):
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => { handleExportSalesCSV(); setShowExportModal(false); }}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left font-semibold text-gray-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rekap Penjualan</span>
                  </button>
                  <button
                    onClick={() => { handleExportPLCSV(); setShowExportModal(false); }}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left font-semibold text-gray-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Laba Rugi EMKM</span>
                  </button>
                  <button
                    onClick={() => { handleExportBalanceSheetCSV(); setShowExportModal(false); }}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left font-semibold text-gray-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Neraca Sederhana</span>
                  </button>
                  <button
                    onClick={() => { handleExportCashFlowCSV(); setShowExportModal(false); }}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left font-semibold text-gray-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Arus Kas EMKM</span>
                  </button>
                  <button
                    onClick={() => { handleExportARCSV(); setShowExportModal(false); }}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left font-semibold text-gray-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Buku Piutang</span>
                  </button>
                  <button
                    onClick={() => { handleExportJournalCSV(); setShowExportModal(false); }}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left font-semibold text-gray-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Jurnal Umum</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: PRINTER & PDF PREVIEW A4 RESMI ======================= */}
      {showPrintPreview && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-xs font-sans overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-300 overflow-hidden my-auto">
            {/* Top Preview Action Bar (No-Print) */}
            <div className="px-6 py-4 bg-[#111613] text-white flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#C59B47]" />
                <span className="font-bold text-sm">
                  Pratinjau Dokumen Cetak / Simpan PDF (A4)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintPreview(false)}
                  className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold text-xs transition-colors"
                >
                  ✕ Tutup
                </button>
              </div>
            </div>

            {/* A4 PRINTABLE DOCUMENT BODY */}
            <div id="printable-report" className="p-8 sm:p-12 bg-white text-black space-y-6 text-xs leading-relaxed">
              {/* Formal Letterhead (Kop Surat) */}
              <div className="border-b-2 border-black pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left space-y-1">
                  <div className="font-serif-title font-bold text-xl tracking-tight text-black">
                    HATOBA COLD CHAIN BOGA MANDIRI
                  </div>
                  <div className="text-[11px] font-semibold text-gray-700">
                    Spesialis Daging Sapi &amp; Jeroan Beku Higienis (-18°C) • Cold Chain Food Service
                  </div>
                  <div className="text-[10px] text-gray-600">
                    Hub Denpasar: Jl. Teuku Umar Barat, Denpasar Barat • Hub Yogyakarta: Sleman DIY • WA: 0812-3456-7890
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Standar Pelaporan: SAK EMKM Indonesia • Klasifikasi Usaha: Cold Chain Trading
                  </div>
                </div>
                <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-gray-300 pt-2 sm:pt-0 sm:pl-4 space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Dokumen Resmi</div>
                  <div className="font-mono font-bold text-xs">HTB-FIN/{new Date().getFullYear()}/{String(new Date().getMonth()+1).padStart(2, '0')}</div>
                  <div className="text-[10px] text-gray-600">Tanggal: {new Date().toLocaleDateString('id-ID')}</div>
                </div>
              </div>

              {/* Title of Document */}
              <div className="text-center py-2">
                <h1 className="font-bold text-base uppercase tracking-wide">
                  {selectedReportType === 'ALL' && 'LAPORAN KEUANGAN LENGKAP & REKAPITULASI (SAK EMKM)'}
                  {selectedReportType === 'PL' && 'LAPORAN LABA RUGI OPERASIONAL (SAK EMKM)'}
                  {selectedReportType === 'BALANCE_SHEET' && 'LAPORAN POSISI KEUANGAN / NERACA SEDERHANA'}
                  {selectedReportType === 'CASH_FLOW' && 'LAPORAN ARUS KAS (METODE LANGSUNG)'}
                  {selectedReportType === 'SALES' && 'LAPORAN REKAPITULASI PENJUALAN POS & KASIR'}
                  {selectedReportType === 'AR' && 'BUKU PEMBANTU PIUTANG & ANALISIS UMUR (AR AGING)'}
                  {selectedReportType === 'CASH_BANK' && 'BUKU KAS & MUTASI REKENING BANK'}
                  {selectedReportType === 'RECON' && 'BERITA ACARA REKONSILIASI TUTUP KASIR POS'}
                  {selectedReportType === 'JOURNAL' && 'BUKU JURNAL UMUM DOUBLE-ENTRY'}
                </h1>
                <p className="text-[11px] text-gray-600">
                  Periode Berjalan: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* SECTION: LABA RUGI (Visible in ALL or PL) */}
              {(selectedReportType === 'ALL' || selectedReportType === 'PL') && (
                <div className="space-y-2 page-break-avoid">
                  <div className="font-bold text-xs uppercase bg-gray-100 p-1.5 border border-black">
                    I. Laporan Laba Rugi Operasional (Income Statement)
                  </div>
                  <table className="w-full text-xs border border-black border-collapse">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="p-2 font-bold" colSpan={2}>PENDAPATAN USAHA (PENJUALAN DAGING)</td>
                        <td className="p-2 text-right font-mono font-bold">{formatIDR(report.totalSalesRevenue)}</td>
                      </tr>
                      <tr className="border-b border-gray-300 text-gray-700">
                        <td className="p-2 pl-6">Estimasi Beban Pokok Penjualan (HPP Daging Beku &amp; Kargo Pendingin)</td>
                        <td className="p-2 font-mono text-center">Akun 500</td>
                        <td className="p-2 text-right font-mono">- {formatIDR(report.estimatedHPP)}</td>
                      </tr>
                      <tr className="border-b-2 border-black bg-gray-50 font-bold">
                        <td className="p-2">LABA KOTOR (GROSS PROFIT MARGIN)</td>
                        <td className="p-2 font-mono text-center">{report.grossProfitMarginPercent.toFixed(1)}%</td>
                        <td className="p-2 text-right font-mono">{formatIDR(report.grossProfitMarginRp)}</td>
                      </tr>
                      <tr className="border-b border-gray-300 text-gray-700">
                        <td className="p-2 pl-6">Total Beban Operasional (PLN Freezer, Gaji, Kemasan Vacuum, BBM)</td>
                        <td className="p-2 font-mono text-center">Akun 600</td>
                        <td className="p-2 text-right font-mono">- {formatIDR(report.totalOperatingExpenses)}</td>
                      </tr>
                      <tr className="bg-gray-100 font-bold border-t-2 border-black">
                        <td className="p-2" colSpan={2}>LABA BERSIH OPERASIONAL (NET INCOME)</td>
                        <td className="p-2 text-right font-mono text-sm">{formatIDR(report.netOperatingIncome)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* SECTION: NERACA (Visible in ALL or BALANCE_SHEET) */}
              {(selectedReportType === 'ALL' || selectedReportType === 'BALANCE_SHEET') && (
                <div className="space-y-2 page-break-avoid">
                  <div className="font-bold text-xs uppercase bg-gray-100 p-1.5 border border-black">
                    II. Laporan Posisi Keuangan / Neraca Sederhana
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <table className="w-full text-xs border border-black border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-black">
                          <th className="p-2 text-left" colSpan={2}>ASET (HARTA)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="p-2">Kas Fisik di Tangan (101)</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.realCash)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="p-2">Bank Mandiri (102)</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.realBank)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="p-2">Piutang Usaha Konsumen (103)</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.totalReceivables)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="p-2">Persediaan Daging Freezer (104)</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.inventoryValue)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="p-2">Aset Tetap Freezer -18°C (120)</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.balanceSheet.assets.coldChainFixedAssets)}</td>
                        </tr>
                        <tr className="bg-gray-100 font-bold border-t-2 border-black">
                          <td className="p-2">TOTAL ASET</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.balanceSheet.assets.totalAssets)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="w-full text-xs border border-black border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-black">
                          <th className="p-2 text-left" colSpan={2}>KEWAJIBAN &amp; EKUITAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="p-2">Hutang Supplier RPH (201)</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.balanceSheet.liabilitiesAndEquity.accountsPayable)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="p-2">Modal Disetor Pemilik (301)</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.capitalInjection)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="p-2">Prive Pemilik (302)</td>
                          <td className="p-2 text-right font-mono">- {formatIDR(report.ownerDraws)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="p-2">Saldo Laba Berjalan (303)</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.netOperatingIncome)}</td>
                        </tr>
                        <tr className="border-b border-gray-200 font-semibold">
                          <td className="p-2">Total Ekuitas Bersih</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.balanceSheet.liabilitiesAndEquity.endingEquity)}</td>
                        </tr>
                        <tr className="bg-gray-100 font-bold border-t-2 border-black">
                          <td className="p-2">TOTAL LIABILITAS &amp; EKUITAS</td>
                          <td className="p-2 text-right font-mono">{formatIDR(report.balanceSheet.liabilitiesAndEquity.totalLiabilitiesAndEquity)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: PIUTANG TEMPO (Visible in ALL or AR) */}
              {(selectedReportType === 'ALL' || selectedReportType === 'AR') && (
                <div className="space-y-2 page-break-avoid">
                  <div className="font-bold text-xs uppercase bg-gray-100 p-1.5 border border-black flex justify-between">
                    <span>III. Rekap Buku Pembantu Piutang (AR Aging Konsumen)</span>
                    <span className="font-mono">Total Piutang: {formatIDR(report.totalReceivables)}</span>
                  </div>
                  <table className="w-full text-[11px] border border-black border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-black">
                        <th className="p-1.5 text-left">No. Invoice</th>
                        <th className="p-1.5 text-left">Nama Pelanggan &amp; Usaha</th>
                        <th className="p-1.5 text-left">Metode</th>
                        <th className="p-1.5 text-right">Total Tagihan</th>
                        <th className="p-1.5 text-right">Sisa Piutang</th>
                        <th className="p-1.5 text-center">Status Umur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.pendingTempoOrders.map((ord) => {
                        const remaining = Math.max(0, ord.totalAmount - (ord.paidAmount || 0))
                        const daysOld = Math.floor((new Date().getTime() - new Date(ord.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                        return (
                          <tr key={ord.id} className="border-b border-gray-200">
                            <td className="p-1.5 font-mono">INV-{ord.referenceCode}</td>
                            <td className="p-1.5 font-semibold">{ord.customerName} {ord.businessName ? `(${ord.businessName})` : ''}</td>
                            <td className="p-1.5">{ord.paymentMethod || 'TEMPO'}</td>
                            <td className="p-1.5 text-right font-mono">{formatIDR(ord.totalAmount)}</td>
                            <td className="p-1.5 text-right font-mono font-bold">{formatIDR(remaining)}</td>
                            <td className="p-1.5 text-center">{daysOld > 3 ? `Macet (${daysOld} hr)` : `Lancar (${daysOld} hr)`}</td>
                          </tr>
                        )
                      })}
                      {report.pendingTempoOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-3 text-center text-gray-500">Tidak ada piutang menggantung. Seluruh invoice lunas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Formal Signature Box (Tanda Tangan Pengesahan) */}
              <div className="pt-8 border-t border-gray-400 grid grid-cols-3 gap-6 text-center text-xs page-break-avoid">
                <div className="space-y-16">
                  <div className="font-semibold text-gray-700">Dibuat Oleh:</div>
                  <div className="border-t border-black pt-1">
                    <div className="font-bold">Tim Finance &amp; Kasir</div>
                    <div className="text-[10px] text-gray-500">Staf Keuangan HATOBA</div>
                  </div>
                </div>

                <div className="space-y-16">
                  <div className="font-semibold text-gray-700">Diperiksa Oleh:</div>
                  <div className="border-t border-black pt-1">
                    <div className="font-bold">Finance Lead / Manager</div>
                    <div className="text-[10px] text-gray-500">Supervisor Akuntansi</div>
                  </div>
                </div>

                <div className="space-y-16">
                  <div className="font-semibold text-gray-700">Disetujui Oleh:</div>
                  <div className="border-t border-black pt-1">
                    <div className="font-bold underline">Doni Kristiawan</div>
                    <div className="text-[10px] text-gray-500">Direktur / Pemilik Usaha</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: TAMBAH TRANSAKSI KAS/BANK ======================= */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans no-print">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans no-print">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E3D9CC] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#EAE4DC] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#111613] flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-cyan-600" />
                  Stock Opname Fisik Freezer (-18°C)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Update nilai persediaan akhir untuk HPP &amp; audit trail otomatis
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
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed flex items-center justify-between">
                <div>
                  ❄️ <strong>Audit Otomatis:</strong> Tanggal &amp; jam opname tercatat otomatis ke riwayat audit trail pimpinan.
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-200 text-blue-950 px-2 py-0.5 rounded-full ml-2 whitespace-nowrap">
                  {new Date().toISOString().slice(0, 10)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Total Berat Daging (Kg)</label>
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
                  <label className="block font-bold text-gray-700">Suhu Freezer (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={invTempInput}
                    onChange={(e) => setInvTempInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs font-mono font-bold text-[#111613]"
                    required
                  />
                </div>
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
                <p className="text-[10px] text-gray-400">Estimasi otomatis: Berat × Rp 70.000 / Kg (dapat disesuaikan)</p>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Petugas Pemeriksa (Checker)</label>
                <input
                  type="text"
                  value={invInspectorInput}
                  onChange={(e) => setInvInspectorInput(e.target.value)}
                  placeholder="Nama staf gudang / akuntansi..."
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                  required
                />
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
                  className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Snowflake className="w-3.5 h-3.5" />
                  {savingInv ? 'Menyimpan...' : 'Simpan Stock Opname'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: PENERIMAAN BARANG MASUK (GOODS RECEIPT) ======================= */}
      {showGoodsReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E3D9CC] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#EAE4DC] flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-sm text-[#111613] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-600" />
                  Catat Penerimaan Barang Masuk (GRN)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Surat Jalan dari Sentra Produksi Bali / Supplier ke Gudang Hub
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGoodsReceiptModal(false)}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoodsReceipt} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">No. Surat Jalan (Delivery Note)</label>
                <input
                  type="text"
                  value={grDeliveryNote}
                  onChange={(e) => setGrDeliveryNote(e.target.value)}
                  placeholder="Contoh: SJ-HTB-DPS-20261116-083"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] font-mono text-xs text-[#111613]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Asal Kiriman</label>
                <select
                  value={grSource}
                  onChange={(e) => {
                    const val = e.target.value as any
                    setGrSource(val)
                    if (val === 'PUSAT_BALI') {
                      setGrSourceLabel('Sentra Produksi Cold Storage HATOBA Bali (Hub Denpasar)')
                    } else if (val === 'SUPPLIER_RPH') {
                      setGrSourceLabel('Supplier RPH Daging Sapi Mitra')
                    } else {
                      setGrSourceLabel('Vendor / Mitra Pengadaan Eksternal')
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                >
                  <option value="PUSAT_BALI">Sentra Produksi / Cold Storage HATOBA Bali</option>
                  <option value="SUPPLIER_RPH">Supplier / RPH Langsung</option>
                  <option value="VENDOR_LAIN">Vendor / Mitra Pengadaan Lain</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Armada Pendingin</label>
                  <input
                    type="text"
                    value={grCarrier}
                    onChange={(e) => setGrCarrier(e.target.value)}
                    placeholder="Nama / Plat thermo cold truck"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Suhu Tiba (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={grTemp}
                    onChange={(e) => setGrTemp(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] font-mono text-xs font-bold text-[#111613]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Total Pack Diterima</label>
                  <input
                    type="number"
                    value={grPacks}
                    onChange={(e) => setGrPacks(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] font-mono text-xs font-bold text-[#111613]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">Total Berat (Kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={grWeight}
                    onChange={(e) => setGrWeight(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] font-mono text-xs font-bold text-[#111613]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Nama Petugas Penerima Gudang</label>
                <input
                  type="text"
                  value={grReceiver}
                  onChange={(e) => setGrReceiver(e.target.value)}
                  placeholder="Nama staf penerima..."
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Catatan Kondisi Fisik &amp; Kemasan</label>
                <textarea
                  value={grNotes}
                  onChange={(e) => setGrNotes(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Suhu -18.5°C, kemasan vacuum seal beku sempurna, tidak ada kebocoran."
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoodsReceiptModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingGr}
                  className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  {savingGr ? 'Menyimpan GRN...' : 'Simpan Penerimaan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-bottom-4 no-print ${
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
