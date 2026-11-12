'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Printer,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Lock,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Layers,
  Sparkles,
} from 'lucide-react'
import { AdminOrder, AdminProduct, ActivityLog, OrderStatus } from '@/lib/admin-store'

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu' | 'logs'>('dashboard')

  // Data states
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | OrderStatus>('ALL')
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<AdminOrder | null>(null)

  // Menu modal (Add / Edit)
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null)
  const [productFormLoading, setProductFormLoading] = useState(false)

  // Status update modal / notes
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [statusNoteInput, setStatusNoteInput] = useState('')
  const [pendingStatusAction, setPendingStatusAction] = useState<OrderStatus | null>(null)

  // Check auth on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/auth')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
      if (data.authenticated) {
        fetchAllData()
      }
    } catch {
      setIsAuthenticated(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Password admin salah.')
      } else {
        setIsAuthenticated(true)
        fetchAllData()
      }
    } catch {
      setLoginError('Koneksi server gagal. Coba beberapa saat lagi.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setIsAuthenticated(false)
    setPasswordInput('')
  }

  const fetchAllData = async () => {
    setDataLoading(true)
    try {
      const [ordersRes, productsRes, logsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/products'),
        fetch('/api/admin/logs'),
      ])

      const ordersData = await ordersRes.json()
      const productsData = await productsRes.json()
      const logsData = await logsRes.json()

      if (ordersData.orders) setOrders(ordersData.orders)
      if (productsData.products) setProducts(productsData.products)
      if (logsData.logs) setLogs(logsData.logs)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setDataLoading(false)
    }
  }

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (referenceCode: string, newStatus: OrderStatus, notes?: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceCode,
          status: newStatus,
          notes: notes || undefined,
          adminUser: 'Admin Pusat',
        }),
      })

      const data = await res.json()
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.referenceCode === referenceCode ? data.order : o)))
        setUpdatingOrderId(null)
        setStatusNoteInput('')
        setPendingStatusAction(null)
        // Refresh logs
        const logsRes = await fetch('/api/admin/logs')
        const logsData = await logsRes.json()
        if (logsData.logs) setLogs(logsData.logs)
      }
    } catch {
      alert('Gagal memperbarui status order.')
    }
  }

  // Handle Save Menu (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct?.name) return

    setProductFormLoading(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      })
      const data = await res.json()

      if (data.success && data.product) {
        setIsMenuModalOpen(false)
        setEditingProduct(null)
        fetchAllData()
      } else {
        alert(data.error || 'Gagal menyimpan menu.')
      }
    } catch {
      alert('Terjadi kesalahan koneksi.')
    } finally {
      setProductFormLoading(false)
    }
  }

  // Handle Delete Menu
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Yakin ingin menghapus menu "${productName}"?`)) return

    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
        fetchAllData()
      } else {
        alert(data.error || 'Gagal menghapus menu.')
      }
    } catch {
      alert('Terjadi kesalahan koneksi saat menghapus.')
    }
  }

  // Export to Excel / CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('Tidak ada data orderan untuk diekspor.')
      return
    }

    const headers = [
      'Kode Referensi',
      'Tanggal',
      'Nama Pemesan',
      'Nama Usaha',
      'Tipe Usaha',
      'Nomor WhatsApp',
      'Hub Layanan',
      'Kota',
      'Nama Marketing',
      'Rincian Menu',
      'Total Nilai (IDR)',
      'Status',
      'Catatan Khusus',
    ]

    const rows = orders.map((o) => {
      const itemsDetail = o.items.map((i) => `${i.productName} (${i.variantName}) x${i.quantity}`).join('; ')
      return [
        `"${o.referenceCode}"`,
        `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${(o.businessName || '-').replace(/"/g, '""')}"`,
        `"${(o.businessType || '-').replace(/"/g, '""')}"`,
        `"${o.phone}"`,
        `"${o.hubArea}"`,
        `"${o.city}"`,
        `"${(o.marketingName || '-').replace(/"/g, '""')}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        o.totalAmount,
        `"${o.status}"`,
        `"${(o.notes || '-').replace(/"/g, '""')}"`,
      ].join(',')
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `rekap_order_hatoba_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter
      const query = orderSearchQuery.toLowerCase()
      const matchQuery =
        !query ||
        o.referenceCode.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        (o.businessName && o.businessName.toLowerCase().includes(query)) ||
        (o.marketingName && o.marketingName.toLowerCase().includes(query)) ||
        o.city.toLowerCase().includes(query)
      return matchStatus && matchQuery
    })
  }, [orders, orderStatusFilter, orderSearchQuery])

  // Computed Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status === 'VERIFIED')
      .reduce((sum, o) => sum + o.totalAmount, 0)
    const pendingCount = orders.filter((o) => o.status === 'PENDING').length
    const verifiedCount = orders.filter((o) => o.status === 'VERIFIED').length
    const rejectedCount = orders.filter((o) => o.status === 'REJECTED').length

    // Marketing breakdown
    const marketingMap: Record<string, { count: number; total: number }> = {}
    orders.forEach((o) => {
      const mName = o.marketingName?.trim() || 'Organik / Tanpa Marketing'
      if (!marketingMap[mName]) marketingMap[mName] = { count: 0, total: 0 }
      marketingMap[mName].count += 1
      if (o.status === 'VERIFIED') marketingMap[mName].total += o.totalAmount
    })

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingCount,
      verifiedCount,
      rejectedCount,
      marketingList: Object.entries(marketingMap).sort((a, b) => b[1].total - a[1].total),
    }
  }, [orders])

  // Format IDR helper
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // 1. Loading screen
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#111613]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#C59B47]" />
          <span className="font-medium text-sm">Memeriksa sesi admin...</span>
        </div>
      </div>
    )
  }

  // 2. Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DFD5] shadow-xl shadow-stone-200/60 text-[#111613]">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FAF6F0] border border-[#E2D6C5] mb-1">
              <Lock className="w-6 h-6 text-[#8C6B24]" />
            </div>
            <h1 className="font-serif-title text-2xl sm:text-3xl font-bold tracking-tight text-[#111613]">
              HATOBA Admin Panel
            </h1>
            <p className="text-xs text-[#5C6E65]">
              Masuk untuk mengelola pesanan masuk, katalog menu B2B, dan pantau log aktivitas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#48564F] mb-1.5">
                Kata Sandi / PIN Admin
              </label>
              <input
                type="password"
                required
                placeholder="Masukkan PIN (Default: hatoba2026)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-sm text-[#111613] focus:outline-none focus:border-[#C59B47] focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-crimson hover:bg-crimson-hover shadow-lg shadow-crimson/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Buka Panel Admin</span>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-[#EAE4DC] mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-[#8C6B24] hover:text-[#111613] font-medium transition-colors inline-flex items-center gap-1"
            >
              ← Kembali ke Website Utama
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 3. Authenticated Dashboard UI
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#111613] pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EAE4DC] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 relative flex-shrink-0">
                <Image
                  src="/images/branding/logo-hatoba-gold.png"
                  alt="HATOBA Group"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif-title text-base font-bold tracking-wider text-[#111613]">
                  HATOBA
                </span>
                <span className="text-[10px] tracking-widest text-[#8C6B24] font-semibold block -mt-1 uppercase">
                  Admin Panel
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-block h-4 w-px bg-gray-200 mx-2" />

            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#5C6E65]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Operasional Aktif</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchAllData}
              disabled={dataLoading}
              title="Perbarui Data"
              className="p-2 rounded-lg border border-[#E2D6C5] text-[#5C6E65] hover:text-[#111613] hover:bg-[#FAF8F5] transition-all text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="p-2 rounded-lg border border-[#E2D6C5] text-[#5C6E65] hover:text-[#111613] hover:bg-[#FAF8F5] transition-all text-xs flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lihat Web</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all text-xs flex items-center gap-1.5 font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#111613] text-white shadow-md'
                : 'text-[#48564F] hover:text-[#111613] hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap relative ${
              activeTab === 'orders'
                ? 'bg-[#111613] text-white shadow-md'
                : 'text-[#48564F] hover:text-[#111613] hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orderan Masuk</span>
            {metrics.pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-crimson text-white font-mono font-bold">
                {metrics.pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-[#111613] text-white shadow-md'
                : 'text-[#48564F] hover:text-[#111613] hover:bg-gray-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Kelola Menu (CRUD)</span>
            <span className="text-[10px] text-gray-400">({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-[#111613] text-white shadow-md'
                : 'text-[#48564F] hover:text-[#111613] hover:bg-gray-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Log Aktivitas (30 Hari)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* ======================= TAB 1: DASHBOARD ======================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD5] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#5C6E65] uppercase tracking-wider">
                    Total Omset Diverifikasi
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-[#111613]">
                  {formatIDR(metrics.totalRevenue)}
                </div>
                <p className="text-[11px] text-[#5C6E65] mt-1">
                  Dari total {metrics.verifiedCount} pesanan berstatus Diterima.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD5] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#5C6E65] uppercase tracking-wider">
                    Order Butuh Verifikasi
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-amber-800">
                  {metrics.pendingCount}
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  Menunggu review / konfirmasi pembayaran.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD5] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#5C6E65] uppercase tracking-wider">
                    Total Pesanan Masuk
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-[#111613]">
                  {metrics.totalOrders}
                </div>
                <p className="text-[11px] text-[#5C6E65] mt-1">
                  {metrics.verifiedCount} diterima · {metrics.rejectedCount} ditolak.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD5] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#5C6E65] uppercase tracking-wider">
                    Menu Aktif di Web
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] text-[#8C6B24] flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-[#111613]">
                  {products.filter((p) => p.isAvailable !== false).length}
                </div>
                <p className="text-[11px] text-[#5C6E65] mt-1">
                  Siap diorder oleh mitra HORECA & ritel.
                </p>
              </div>
            </div>

            {/* Grid 2 Cols: Recent Orders & Marketing Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Orders (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif-title text-lg font-bold text-[#111613]">
                      Pesanan Terbaru
                    </h3>
                    <p className="text-xs text-[#5C6E65]">Daftar 5 pesanan terkini yang masuk dari website.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#8C6B24] hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Semua Order</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-[#5C6E65]">
                        <th className="pb-3 font-semibold">Ref & Waktu</th>
                        <th className="pb-3 font-semibold">Pemesan & Usaha</th>
                        <th className="pb-3 font-semibold">Marketing</th>
                        <th className="pb-3 font-semibold">Total Nilai</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-3 font-mono font-medium text-[#111613]">
                            <div>{ord.referenceCode}</div>
                            <span className="text-[10px] text-gray-400">
                              {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="font-semibold text-[#111613]">{ord.customerName}</div>
                            <div className="text-[11px] text-gray-500">
                              {ord.businessName || ord.city} ({ord.hubArea})
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FAF6F0] text-[#8C6B24] border border-[#E8DFD5] font-medium">
                              {ord.marketingName || 'Organik'}
                            </span>
                          </td>
                          <td className="py-3 font-mono font-bold text-[#111613]">
                            {formatIDR(ord.totalAmount)}
                          </td>
                          <td className="py-3">
                            {ord.status === 'VERIFIED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Diterima</span>
                              </span>
                            )}
                            {ord.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </span>
                            )}
                            {ord.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                <XCircle className="w-3 h-3" />
                                <span>Ditolak</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Marketing Leaderboard (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-sm space-y-5">
                <div>
                  <h3 className="font-serif-title text-lg font-bold text-[#111613]">
                    Performa Marketing / Bonus
                  </h3>
                  <p className="text-xs text-[#5C6E65]">Rekap omset terverifikasi per promotor.</p>
                </div>

                <div className="space-y-3">
                  {metrics.marketingList.map(([name, data], idx) => (
                    <div
                      key={name}
                      className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4DC] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#EFE8DC] font-bold text-[#8C6B24] flex items-center justify-center text-[10px] flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-[#111613] truncate">{name}</div>
                          <span className="text-[10px] text-[#5C6E65]">
                            {data.count} transaksi masuk
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 font-mono">
                        <div className="font-bold text-emerald-800">{formatIDR(data.total)}</div>
                        <span className="text-[9px] text-gray-400">Total Valid</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: ORDERAN MASUK ======================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Top Bar: Search, Status Filter & Export Button */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8DFD5] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#5C6E65] mr-1">Filter Status:</span>
                <button
                  onClick={() => setOrderStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    orderStatusFilter === 'ALL'
                      ? 'bg-[#111613] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua ({orders.length})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    orderStatusFilter === 'PENDING'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Pending ({metrics.pendingCount})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('VERIFIED')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    orderStatusFilter === 'VERIFIED'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Diterima ({metrics.verifiedCount})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    orderStatusFilter === 'REJECTED'
                      ? 'bg-red-700 text-white shadow-sm'
                      : 'bg-red-50 text-red-800 hover:bg-red-100'
                  }`}
                >
                  Ditolak ({metrics.rejectedCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari ref, pemesan, marketing..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#C59B47] focus:bg-white"
                  />
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Ekspor Excel (CSV)</span>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-[#E8DFD5] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#EAE4DC] text-[#5C6E65]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Ref & Waktu</th>
                      <th className="py-3.5 px-4 font-semibold">Pemesan & Kontak</th>
                      <th className="py-3.5 px-4 font-semibold">Marketing / Hub</th>
                      <th className="py-3.5 px-4 font-semibold">Item Dipesan</th>
                      <th className="py-3.5 px-4 font-semibold">Total Nilai</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE4DC]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          Tidak ditemukan pesanan dengan kriteria ini.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          {/* Ref & Waktu */}
                          <td className="py-4 px-4 align-top">
                            <span className="font-mono font-bold text-[#111613] text-sm block">
                              {ord.referenceCode}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {new Date(ord.createdAt).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {ord.notes && (
                              <div className="mt-1.5 p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[10px] text-amber-900 max-w-[200px]">
                                <strong>Catatan:</strong> {ord.notes}
                              </div>
                            )}
                          </td>

                          {/* Pemesan & Kontak */}
                          <td className="py-4 px-4 align-top">
                            <div className="font-bold text-[#111613] text-sm">{ord.customerName}</div>
                            {ord.businessName && (
                              <div className="text-[11px] text-gray-600 font-medium">
                                {ord.businessName} ({ord.businessType || 'HORECA'})
                              </div>
                            )}
                            <div className="text-[11px] text-gray-500">{ord.city}</div>
                            <a
                              href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#8C6B24] hover:underline font-mono mt-1 inline-block"
                            >
                              WA: {ord.phone} ↗
                            </a>
                          </td>

                          {/* Marketing & Hub */}
                          <td className="py-4 px-4 align-top">
                            <span className="px-2.5 py-1 rounded-full text-[10px] bg-[#FAF6F0] text-[#8C6B24] border border-[#E8DFD5] font-semibold block w-fit mb-1">
                              Promotor: {ord.marketingName || '-'}
                            </span>
                            <span className="text-[11px] text-gray-500 block">Hub: {ord.hubArea}</span>
                          </td>

                          {/* Items */}
                          <td className="py-4 px-4 align-top">
                            <ul className="space-y-1">
                              {ord.items.map((it, i) => (
                                <li key={i} className="text-[11px] text-[#111613]">
                                  <span className="font-semibold">{it.quantity}x</span> {it.productName}{' '}
                                  <span className="text-gray-400">({it.variantName})</span>
                                </li>
                              ))}
                            </ul>
                          </td>

                          {/* Total */}
                          <td className="py-4 px-4 align-top">
                            <span className="font-mono font-bold text-sm text-[#111613] block">
                              {formatIDR(ord.totalAmount)}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 align-top">
                            {ord.status === 'VERIFIED' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Diterima / Lolos</span>
                              </span>
                            )}
                            {ord.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Menunggu Review</span>
                              </span>
                            )}
                            {ord.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Ditolak</span>
                              </span>
                            )}
                            {ord.statusNotes && (
                              <span className="block text-[10px] text-gray-500 mt-1 italic max-w-[140px]">
                                {ord.statusNotes}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 align-top text-right space-y-1.5">
                            <div className="flex items-center justify-end gap-1.5">
                              {ord.status !== 'VERIFIED' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.referenceCode, 'VERIFIED')}
                                  title="Terima / Verifikasi Pesanan"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-sm"
                                >
                                  Terima
                                </button>
                              )}

                              {ord.status !== 'REJECTED' && (
                                <button
                                  onClick={() => {
                                    setUpdatingOrderId(ord.referenceCode)
                                    setPendingStatusAction('REJECTED')
                                  }}
                                  title="Tolak Pesanan"
                                  className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition-all"
                                >
                                  Tolak
                                </button>
                              )}

                              {ord.status !== 'PENDING' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.referenceCode, 'PENDING')}
                                  title="Kembalikan ke status Pending"
                                  className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] transition-all"
                                >
                                  Pending
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedOrderForPrint(ord)}
                                title="Cetak Nota / Simpan PDF"
                                className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-all"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: KELOLA MENU (CRUD) ======================= */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#111613]">
                  Katalog Menu Produk B2B
                </h3>
                <p className="text-xs text-[#5C6E65]">
                  Tambah varian baru, edit deskripsi, kelola diskon & harga coret, serta atur label badge.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    category: 'Jeroan Sapi Higienis',
                    description: '',
                    badge: 'Baru',
                    discountPercent: 0,
                    originalPrice: 0,
                    isAvailable: true,
                    variants: [
                      {
                        id: `var-${Date.now()}`,
                        name: 'Kemasan Ritel Vacuum (250g)',
                        packType: 'retail',
                        weight: '250 gr',
                        portion: 'Porsi 2-3 orang',
                        minQty: 1,
                        price: 45000,
                        isAvailable: true,
                      },
                    ],
                  })
                  setIsMenuModalOpen(true)
                }}
                className="px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-hover text-white text-xs font-bold transition-all shadow-md shadow-crimson/25 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Menu Baru</span>
              </button>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => {
                const lowestPrice = Math.min(...prod.variants.map((v) => v.price))
                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl border border-[#E8DFD5] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Thumbnail & Badges */}
                      <div className="relative aspect-[16/10] bg-[#FAF8F5] overflow-hidden">
                        <Image
                          src={prod.packagingImage || prod.image || '/images/products/kemasan-babat.png'}
                          alt={prod.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                          {prod.badge && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#111613]/90 text-white backdrop-blur-md border border-white/20">
                              {prod.badge}
                            </span>
                          )}
                          {prod.discountPercent && prod.discountPercent > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-crimson text-white">
                              -{prod.discountPercent}%
                            </span>
                          ) : null}
                        </div>

                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              prod.isAvailable !== false
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-red-50 text-red-800 border border-red-300'
                            }`}
                          >
                            {prod.isAvailable !== false ? 'Tersedia' : 'Habis / Nonaktif'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C6B24]">
                          {prod.category}
                        </span>
                        <h4 className="font-serif-title text-base font-bold text-[#111613]">
                          {prod.name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {prod.shortDescription || prod.description}
                        </p>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-400 block">Mulai dari</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-[#111613]">
                                {formatIDR(lowestPrice)}
                              </span>
                              {prod.originalPrice && prod.originalPrice > lowestPrice && (
                                <span className="text-xs text-gray-400 line-through font-mono">
                                  {formatIDR(prod.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {prod.variants.length} Varian Pack
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE4DC] flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(JSON.parse(JSON.stringify(prod)))
                          setIsMenuModalOpen(true)
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#D8CEBE] hover:bg-white text-[#111613] text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#8C6B24]" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 4: LOG AKTIVITAS ======================= */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#111613]">
                  Log Aktivitas & Audit Trail
                </h3>
                <p className="text-xs text-[#5C6E65]">
                  Catatan riwayat perubahan status order, login sistem, dan modifikasi katalog menu (disimpan maksimal 30 hari).
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-[#FAF6F0] text-[#8C6B24] border border-[#E8DFD5] font-semibold">
                Retensi Otomatis: 30 Hari
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DFD5] shadow-sm p-6 sm:p-8">
              <div className="relative border-l-2 border-[#EAE4DC] ml-4 space-y-8">
                {logs.length === 0 ? (
                  <p className="text-xs text-gray-400 pl-6">Belum ada riwayat aktivitas tercatat.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="relative pl-6">
                      {/* Node Bullet */}
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#C59B47]" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-[#111613]">{log.title}</span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {new Date(log.timestamp).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-[#5C6E65] leading-relaxed">{log.description}</p>
                      <span className="inline-block mt-1 text-[10px] text-[#8C6B24] font-medium">
                        Oleh: {log.adminUser}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================= MODAL: REJECT / NOTE PROMPT ======================= */}
      {updatingOrderId && pendingStatusAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-2xl space-y-4">
            <h4 className="font-serif-title text-lg font-bold text-[#111613]">
              {pendingStatusAction === 'REJECTED' ? 'Tolak Pesanan Ini?' : 'Alasan Perubahan Status'}
            </h4>
            <p className="text-xs text-[#5C6E65]">
              Silakan tuliskan catatan alasan untuk pesanan <strong>{updatingOrderId}</strong>:
            </p>

            <textarea
              rows={3}
              placeholder="Misal: Stok karkas habis, di luar jangkauan cold chain tanpa sewa styrofoam, dll."
              value={statusNoteInput}
              onChange={(e) => setStatusNoteInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#C59B47]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setUpdatingOrderId(null)
                  setPendingStatusAction(null)
                  setStatusNoteInput('')
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleUpdateOrderStatus(updatingOrderId, pendingStatusAction, statusNoteInput)}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md ${
                  pendingStatusAction === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-crimson hover:bg-crimson-hover'
                }`}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CRUD MENU (ADD / EDIT) ======================= */}
      {isMenuModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#111613]">
                  {editingProduct.id ? 'Edit Menu Produk' : 'Tambah Menu Baru'}
                </h3>
                <p className="text-xs text-gray-500">Katalog B2B & Ritel HATOBA Frozen Food</p>
              </div>
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#48564F] mb-1">
                    Nama Menu Produk: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Babat Sapi Ungkep"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48564F] mb-1">Kategori:</label>
                  <select
                    value={editingProduct.category || 'Jeroan Sapi Higienis'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47]"
                  >
                    <option value="Jeroan Sapi Higienis">Jeroan Sapi Higienis</option>
                    <option value="Daging Sapi Pilihan">Daging Sapi Pilihan</option>
                    <option value="Paket Mix Komplit">Paket Mix Komplit</option>
                    <option value="Karkas & Potongan Khusus">Karkas & Potongan Khusus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48564F] mb-1">
                  Deskripsi Singkat:
                </label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan keunggulan produk, tekstur, dan saran olahan..."
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#48564F] mb-1">Badge / Label:</label>
                  <input
                    type="text"
                    placeholder="Misal: Best Seller / Promo"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48564F] mb-1">Diskon (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={editingProduct.discountPercent || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        discountPercent: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48564F] mb-1">
                    Harga Coret (Rp):
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47]"
                  />
                </div>
              </div>

              {/* Status Ketersediaan */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={editingProduct.isAvailable !== false}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })
                  }
                  className="rounded text-[#C59B47] focus:ring-[#C59B47]"
                />
                <label htmlFor="availCheck" className="text-xs text-[#111613] font-medium cursor-pointer">
                  Menu Tersedia untuk Dipesan (Stok Aktif)
                </label>
              </div>

              {/* Varian List */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111613] uppercase tracking-wider">
                    Varian Kemasan & Harga (IDR)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newVars = [...(editingProduct.variants || [])]
                      newVars.push({
                        id: `var-${Date.now()}`,
                        name: 'Kemasan Baru',
                        packType: 'retail',
                        weight: '250 gr',
                        portion: 'Porsi 2-3 orang',
                        minQty: 1,
                        price: 50000,
                        isAvailable: true,
                      })
                      setEditingProduct({ ...editingProduct, variants: newVars })
                    }}
                    className="text-xs font-semibold text-[#8C6B24] hover:underline"
                  >
                    + Tambah Varian
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editingProduct.variants?.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4DC] grid grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Nama Varian"
                          value={v.name}
                          onChange={(e) => {
                            const newVars = [...(editingProduct.variants || [])]
                            newVars[idx].name = e.target.value
                            setEditingProduct({ ...editingProduct, variants: newVars })
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-[#D8CEBE]"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Berat (e.g. 250 gr)"
                          value={v.weight}
                          onChange={(e) => {
                            const newVars = [...(editingProduct.variants || [])]
                            newVars[idx].weight = e.target.value
                            setEditingProduct({ ...editingProduct, variants: newVars })
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-[#D8CEBE]"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Harga Rp"
                          value={v.price}
                          onChange={(e) => {
                            const newVars = [...(editingProduct.variants || [])]
                            newVars[idx].price = parseInt(e.target.value) || 0
                            setEditingProduct({ ...editingProduct, variants: newVars })
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-[#D8CEBE] font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        {editingProduct.variants && editingProduct.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newVars = editingProduct.variants?.filter((_, i) => i !== idx)
                              setEditingProduct({ ...editingProduct, variants: newVars })
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={productFormLoading}
                  className="px-6 py-2.5 rounded-xl bg-crimson hover:bg-crimson-hover text-white text-xs font-bold transition-all shadow-md shadow-crimson/25 disabled:opacity-50"
                >
                  {productFormLoading ? 'Menyimpan...' : 'Simpan Perubahan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL / PRINT SHEET: CETAK NOTA ======================= */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-6 text-[#111613]">
            {/* Header Nota */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative flex-shrink-0">
                  <Image
                    src="/images/branding/logo-hatoba-gold.png"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="font-serif-title font-bold text-base tracking-wider block">
                    HATOBA FROZEN FOOD
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#8C6B24] font-semibold block">
                    Holding Group Rantai Dingin
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-sm text-[#111613] block">
                  {selectedOrderForPrint.referenceCode}
                </span>
                <span className="text-[10px] text-gray-500">
                  {new Date(selectedOrderForPrint.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Info Pelanggan */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE4DC]">
              <div>
                <span className="text-[10px] text-gray-500 block">Pemesan:</span>
                <span className="font-bold text-[#111613] block">
                  {selectedOrderForPrint.customerName}
                </span>
                <span className="text-[11px] text-gray-600">
                  {selectedOrderForPrint.businessName || '-'}
                </span>
                <span className="text-[11px] text-gray-500 block">{selectedOrderForPrint.phone}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 block">Hub & Kota Kirim:</span>
                <span className="font-bold text-[#111613] block">
                  {selectedOrderForPrint.hubArea}
                </span>
                <span className="text-[11px] text-gray-600 block">{selectedOrderForPrint.city}</span>
                <span className="text-[10px] text-[#8C6B24] font-semibold block mt-1">
                  Marketing: {selectedOrderForPrint.marketingName || 'Organik'}
                </span>
              </div>
            </div>

            {/* Rincian Produk */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#111613] uppercase tracking-wider block border-b border-gray-100 pb-1">
                Daftar Menu & Kuantiti
              </span>
              <table className="w-full text-xs">
                <tbody>
                  {selectedOrderForPrint.items.map((it, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-1.5 font-medium">
                        {it.productName} <span className="text-gray-400">({it.variantName})</span>
                      </td>
                      <td className="py-1.5 text-center font-mono font-bold">{it.quantity}x</td>
                      <td className="py-1.5 text-right font-mono font-semibold">
                        {formatIDR(it.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between font-mono">
                <span className="font-bold text-xs">Total Pembayaran:</span>
                <span className="font-bold text-base text-emerald-800">
                  {formatIDR(selectedOrderForPrint.totalAmount)}
                </span>
              </div>
            </div>

            {/* Action Print Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedOrderForPrint(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#111613] hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

