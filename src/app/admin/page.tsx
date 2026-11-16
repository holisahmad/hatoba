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
  Upload,
  Camera,
  ImageIcon,
  Receipt,
  Users,
  UserCheck,
  HeartHandshake,
  Gift,
  Tag,
  MessageSquare,
  Send,
  CreditCard,
  Check,
} from 'lucide-react'
import { AdminOrder, AdminProduct, ActivityLog, OrderStatus, OrderItem } from '@/lib/admin-store'
import OrderPrintModal from '@/components/admin/OrderPrintModal'
import PosCashierTab from '@/components/admin/PosCashierTab'

export interface CustomerProfile {
  id: string
  name: string
  phone: string
  businessName: string
  businessType: string
  city: string
  hubArea: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  daysSinceLastOrder: number
  itemsBought: { name: string; totalQty: number }[]
  loyaltyTier: 'VIP' | 'REGULAR' | 'NEW'
  loyaltyLabel: string
  orders: AdminOrder[]
  needsFollowUp: boolean
  overdueOrdersCount: number
}

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'orders' | 'customers' | 'menu' | 'logs'>('dashboard')

  // Data states
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | OrderStatus>('ALL')
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<AdminOrder | null>(null)

  // Payment Management Modal (POS Style: Lunas Tunai/Transfer, DP, Campuran, Tempo)
  const [orderToMarkPaid, setOrderToMarkPaid] = useState<AdminOrder | null>(null)
  const [payMode, setPayMode] = useState<'LUNAS_TRANSFER' | 'LUNAS_TUNAI' | 'DP' | 'CAMPURAN' | 'TEMPO'>('LUNAS_TRANSFER')
  const [payMethodInput, setPayMethodInput] = useState('Transfer Mandiri')
  const [payAmountInput, setPayAmountInput] = useState('')
  const [payDueDateInput, setPayDueDateInput] = useState('')
  const [payDueDaysInput, setPayDueDaysInput] = useState<number>(3)
  const [payNotesInput, setPayNotesInput] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  // Customer CRM (Database Pelanggan)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [customerTierFilter, setCustomerTierFilter] = useState<'ALL' | 'VIP' | 'REGULAR' | 'NEW'>('ALL')
  const [customerHubFilter, setCustomerHubFilter] = useState<'ALL' | 'Bali' | 'Yogyakarta'>('ALL')
  const [customerFollowUpFilter, setCustomerFollowUpFilter] = useState<'ALL' | 'NEED_FOLLOWUP' | 'RECENT'>('ALL')
  const [selectedCustomerForFollowUp, setSelectedCustomerForFollowUp] = useState<CustomerProfile | null>(null)
  const [followUpTemplate, setFollowUpTemplate] = useState<'APPRECIATION_DISCOUNT' | 'RESTOCK_REMINDER' | 'GROSIR_OFFER' | 'CUSTOM'>('APPRECIATION_DISCOUNT')
  const [customFollowUpMessage, setCustomFollowUpMessage] = useState('')

  // Menu modal (Add / Edit)
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null)
  const [productFormLoading, setProductFormLoading] = useState(false)

  // Status update modal / notes
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [statusNoteInput, setStatusNoteInput] = useState('')
  const [pendingStatusAction, setPendingStatusAction] = useState<OrderStatus | null>(null)

  // Stock Adjustment & Verification Modal
  const [adjustingOrder, setAdjustingOrder] = useState<AdminOrder | null>(null)
  const [adjustedItems, setAdjustedItems] = useState<OrderItem[]>([])
  const [adjustmentNoteInput, setAdjustmentNoteInput] = useState('')
  const [adjustmentDueDays, setAdjustmentDueDays] = useState<number>(3)
  const [adjustmentMarketingInput, setAdjustmentMarketingInput] = useState('')
  const [adjustmentLoading, setAdjustmentLoading] = useState(false)

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Image upload state & handler
  const [uploadingField, setUploadingField] = useState<'packaging' | 'serving' | null>(null)

  const handleFileUpload = async (file: File, target: 'packaging' | 'serving') => {
    if (!file) return
    setUploadingField(target)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success && data.url) {
        if (target === 'packaging') {
          setEditingProduct((prev) => (prev ? { ...prev, packagingImage: data.url } : prev))
        } else {
          setEditingProduct((prev) => (prev ? { ...prev, image: data.url } : prev))
        }
        showToast(`Foto ${target === 'packaging' ? 'kemasan' : 'sajian'} berhasil diunggah!`)
      } else {
        showToast(data.error || 'Gagal mengunggah foto.', 'error')
      }
    } catch {
      showToast('Koneksi gagal saat mengunggah foto.', 'error')
    } finally {
      setUploadingField(null)
    }
  }

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

  // Handle Open Payment Management Modal
  const openPaymentModal = (ord: AdminOrder) => {
    setOrderToMarkPaid(ord)
    const initialMode: 'LUNAS_TRANSFER' | 'LUNAS_TUNAI' | 'DP' | 'CAMPURAN' | 'TEMPO' =
      ord.paymentStatus === 'LUNAS'
        ? (ord.paymentMethod?.toLowerCase().includes('tunai') ? 'LUNAS_TUNAI' : 'LUNAS_TRANSFER')
        : ord.paymentStatus === 'DP'
        ? (ord.paymentMethod?.toLowerCase().includes('tempo') ? 'CAMPURAN' : 'DP')
        : ord.paymentStatus === 'TEMPO'
        ? 'TEMPO'
        : 'LUNAS_TRANSFER'

    setPayMode(initialMode)
    setPayMethodInput(
      ord.paymentMethod?.includes('Mandiri')
        ? 'Transfer Mandiri'
        : ord.paymentMethod?.includes('BCA')
        ? 'Transfer BCA'
        : ord.paymentMethod?.includes('Tunai')
        ? 'Tunai / Cash'
        : 'Transfer Mandiri'
    )
    setPayAmountInput(String(ord.paidAmount || ord.totalAmount))
    const base = ord.createdAt ? new Date(ord.createdAt) : new Date()
    let initialDays = 3
    if (ord.dueDate) {
      const diff = Math.round((new Date(ord.dueDate).getTime() - base.getTime()) / (24 * 60 * 60 * 1000))
      if (diff > 0) initialDays = diff
    }
    setPayDueDaysInput(initialDays)
    const initialDueDate = ord.dueDate
      ? ord.dueDate.slice(0, 10)
      : new Date(base.getTime() + initialDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    setPayDueDateInput(initialDueDate)
    setPayNotesInput(ord.statusNotes || '')
  }

  const handlePayDueDaysChange = (days: number) => {
    const clamped = Math.max(1, isNaN(days) ? 1 : days)
    setPayDueDaysInput(clamped)
    const base = orderToMarkPaid?.createdAt ? new Date(orderToMarkPaid.createdAt) : new Date()
    const target = new Date(base.getTime() + clamped * 24 * 60 * 60 * 1000)
    setPayDueDateInput(target.toISOString().slice(0, 10))
  }

  // Handle Confirm Update Payment (POS style: Lunas Tunai/Transfer, DP, Campuran, Tempo)
  const handleConfirmMarkPaid = async () => {
    if (!orderToMarkPaid) return
    setPayLoading(true)

    const rawAmount = parseFloat(payAmountInput.replace(/[^0-9]/g, '')) || 0
    let computedAmount = rawAmount
    if (payMode === 'LUNAS_TRANSFER') computedAmount = orderToMarkPaid.totalAmount
    if (payMode === 'TEMPO') computedAmount = 0

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceCode: orderToMarkPaid.referenceCode,
          action: 'UPDATE_PAYMENT',
          paymentMode: payMode,
          paymentMethod: payMethodInput,
          paidAmount: computedAmount,
          dueDate: payDueDateInput ? new Date(payDueDateInput).toISOString() : undefined,
          notes: payNotesInput.trim() || undefined,
          adminUser: 'Admin Keuangan',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success && data.order) {
        showToast(
          `Status pembayaran ${orderToMarkPaid.referenceCode} berhasil diperbarui!`,
          'success'
        )
        setOrders((prev) =>
          prev.map((o) => (o.referenceCode === orderToMarkPaid.referenceCode ? data.order : o))
        )
        if (selectedOrderForPrint?.referenceCode === orderToMarkPaid.referenceCode) {
          setSelectedOrderForPrint(data.order)
        }
        setOrderToMarkPaid(null)
        setPayNotesInput('')
        // Refresh logs
        const logsRes = await fetch('/api/admin/logs')
        const logsData = await logsRes.json()
        if (logsData.logs) setLogs(logsData.logs)
      } else {
        showToast(data.error || 'Gagal mengubah status pembayaran.', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan jaringan saat memproses pembayaran.', 'error')
    } finally {
      setPayLoading(false)
    }
  }

  // Handle Open Stock Adjustment Modal
  const openAdjustmentModal = (ord: AdminOrder) => {
    setAdjustingOrder(ord)
    setAdjustedItems(JSON.parse(JSON.stringify(ord.items)))
    setAdjustmentNoteInput(ord.adjustmentNotes || '')
    setAdjustmentMarketingInput(ord.marketingName || '')
    const base = ord.createdAt ? new Date(ord.createdAt) : new Date()
    let initialDays = 3
    if (ord.dueDate) {
      const diff = Math.round((new Date(ord.dueDate).getTime() - base.getTime()) / (24 * 60 * 60 * 1000))
      if (diff > 0) initialDays = diff
    }
    setAdjustmentDueDays(initialDays)
  }

  // Handle Save Adjusted Order (Accept As-Is OR Accept with Adjusted Stock)
  const handleSaveAdjustedOrder = async (acceptAsIs = false) => {
    if (!adjustingOrder) return
    setAdjustmentLoading(true)

    try {
      const base = adjustingOrder.createdAt ? new Date(adjustingOrder.createdAt) : new Date()
      const calculatedDueDate = new Date(base.getTime() + (Number(adjustmentDueDays) || 3) * 24 * 60 * 60 * 1000).toISOString()

      const payload: {
        referenceCode: string
        status: OrderStatus
        adminUser: string
        items?: OrderItem[]
        totalAmount?: number
        adjustmentNotes?: string
        dueDate?: string
        marketingName?: string
      } = {
        referenceCode: adjustingOrder.referenceCode,
        status: 'VERIFIED',
        adminUser: 'Admin Pusat',
        dueDate: calculatedDueDate,
        marketingName: adjustmentMarketingInput.trim() || undefined,
      }

      if (!acceptAsIs) {
        if (adjustedItems.length === 0) {
          alert('Pesanan harus memiliki minimal 1 item. Jika semua stok kosong, silakan gunakan tombol Tolak Pesanan.')
          setAdjustmentLoading(false)
          return
        }
        const newTotal = adjustedItems.reduce((acc, it) => acc + it.subtotal, 0)
        payload.items = adjustedItems
        payload.totalAmount = newTotal
        payload.adjustmentNotes =
          adjustmentNoteInput.trim() || 'Stok disesuaikan atas konfirmasi & kesepakatan konsumen via WhatsApp'
      }

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.referenceCode === adjustingOrder.referenceCode ? data.order : o))
        )
        setAdjustingOrder(null)
        showToast(
          acceptAsIs
            ? `Pesanan ${adjustingOrder.referenceCode} berhasil diterima sesuai order awal.`
            : `Pesanan ${adjustingOrder.referenceCode} berhasil diterima dengan penyesuaian stok.`
        )
        const logsRes = await fetch('/api/admin/logs')
        const logsData = await logsRes.json()
        if (logsData.logs) setLogs(logsData.logs)
      } else {
        showToast(data.error || 'Gagal memproses penyesuaian pesanan.', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan koneksi saat menyimpan penyesuaian.', 'error')
    } finally {
      setAdjustmentLoading(false)
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
        showToast(`Menu "${data.product.name}" berhasil disimpan.`)
      } else {
        showToast(data.error || 'Gagal menyimpan menu.', 'error')
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
        showToast(`Menu "${productName}" berhasil dihapus.`)
      } else {
        showToast(data.error || 'Gagal menghapus menu.', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan koneksi saat menghapus.', 'error')
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

  // Customer Profiles Aggregated from Orders (Database Konsumen / CRM)
  const customerProfiles = useMemo<CustomerProfile[]>(() => {
    const customerMap = new Map<
      string,
      {
        name: string
        phone: string
        businessName: string
        businessType: string
        city: string
        hubArea: string
        orders: AdminOrder[]
      }
    >()

    orders.forEach((order) => {
      const cleanPhone = (order.phone || '').trim().replace(/[^0-9]/g, '')
      const key =
        cleanPhone.length >= 8
          ? cleanPhone
          : (order.customerName || 'anon').toLowerCase().trim()

      const existing = customerMap.get(key)
      if (existing) {
        existing.orders.push(order)
        if (order.businessName && !existing.businessName) existing.businessName = order.businessName
        if (order.city && !existing.city) existing.city = order.city
      } else {
        customerMap.set(key, {
          name: order.customerName,
          phone: order.phone || '',
          businessName: order.businessName || '',
          businessType: order.businessType || 'Restoran / Rumah Makan',
          city: order.city || 'Denpasar',
          hubArea: order.hubArea || 'Bali',
          orders: [order],
        })
      }
    })

    const now = Date.now()
    const profiles: CustomerProfile[] = []

    customerMap.forEach((entry, key) => {
      const sortedOrders = [...entry.orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      const lastOrder = sortedOrders[0]
      const lastOrderTime = new Date(lastOrder.createdAt).getTime()
      const daysSince = Math.floor((now - lastOrderTime) / (1000 * 60 * 60 * 24))

      const totalSpent = sortedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      const totalOrders = sortedOrders.length

      // Tally favorite products
      const itemMap = new Map<string, number>()
      sortedOrders.forEach((o) => {
        o.items?.forEach((it) => {
          const current = itemMap.get(it.productName) || 0
          itemMap.set(it.productName, current + it.quantity)
        })
      })
      const itemsBought = Array.from(itemMap.entries())
        .map(([name, totalQty]) => ({ name, totalQty }))
        .sort((a, b) => b.totalQty - a.totalQty)

      // Loyalty tier assignment
      let loyaltyTier: 'VIP' | 'REGULAR' | 'NEW' = 'NEW'
      let loyaltyLabel = 'Pelanggan Baru'
      if (totalOrders >= 4 || totalSpent >= 1500000) {
        loyaltyTier = 'VIP'
        loyaltyLabel = 'Mitra VIP / Loyal'
      } else if (totalOrders >= 2) {
        loyaltyTier = 'REGULAR'
        loyaltyLabel = 'Mitra Reguler'
      }

      // Track record of overdue payments
      const overdueOrdersCount = sortedOrders.filter((o) => {
        if (o.paymentStatus === 'LUNAS' || o.status === 'REJECTED') return false
        const dDate =
          o.dueDate ||
          new Date(new Date(o.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
        return now > new Date(dDate).getTime()
      }).length

      profiles.push({
        id: `cust-${key}`,
        name: entry.name,
        phone: entry.phone,
        businessName: entry.businessName,
        businessType: entry.businessType,
        city: entry.city,
        hubArea: entry.hubArea,
        totalOrders,
        totalSpent,
        lastOrderDate: lastOrder.createdAt,
        daysSinceLastOrder: Math.max(0, daysSince),
        itemsBought,
        loyaltyTier,
        loyaltyLabel,
        orders: sortedOrders,
        needsFollowUp: daysSince >= 7,
        overdueOrdersCount,
      })
    })

    return profiles.sort(
      (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    )
  }, [orders])

  // Filtered Customer Profiles for Display
  const filteredCustomers = useMemo(() => {
    return customerProfiles.filter((cust) => {
      if (customerHubFilter !== 'ALL' && cust.hubArea !== customerHubFilter) return false
      if (customerTierFilter !== 'ALL' && cust.loyaltyTier !== customerTierFilter) return false
      if (customerFollowUpFilter === 'NEED_FOLLOWUP' && !cust.needsFollowUp) return false
      if (customerFollowUpFilter === 'RECENT' && cust.needsFollowUp) return false

      if (customerSearchQuery.trim()) {
        const q = customerSearchQuery.toLowerCase()
        const match =
          cust.name.toLowerCase().includes(q) ||
          cust.businessName.toLowerCase().includes(q) ||
          cust.phone.toLowerCase().includes(q) ||
          cust.city.toLowerCase().includes(q) ||
          cust.itemsBought.some((it) => it.name.toLowerCase().includes(q))
        if (!match) return false
      }
      return true
    })
  }, [customerProfiles, customerHubFilter, customerTierFilter, customerFollowUpFilter, customerSearchQuery])

  // Format IDR helper
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Helper Follow-Up Template Generator
  const getFollowUpTemplateText = (
    cust: CustomerProfile,
    template: 'APPRECIATION_DISCOUNT' | 'RESTOCK_REMINDER' | 'GROSIR_OFFER' | 'CUSTOM'
  ): string => {
    const favoriteProduct = cust.itemsBought[0]?.name || 'produk beku HATOBA'
    const targetBusiness = cust.businessName ? `(${cust.businessName})` : ''

    switch (template) {
      case 'APPRECIATION_DISCOUNT':
        return `Halo ${cust.name} ${targetBusiness},\n\nTerima kasih atas kepercayaannya sudah berbelanja produk beku di *HATOBA Frozen Food*.\n\nSebagai bentuk apresiasi bagi pelanggan setia kami, khusus pesanan berikutnya kami ingin memberikan *Penawaran Spesial Apresiasi / Potongan Harga Khusus Rp 10.000 per pack* untuk pemesanan ${favoriteProduct}.\n\nKira-kira kapan jadwal pengiriman beku yang pas untuk operasional dapur Anda minggu ini? Kami siap kirimkan dengan standar cold chain −18°C. Terima kasih!`

      case 'RESTOCK_REMINDER':
        return `Halo ${cust.name} ${targetBusiness},\n\nSalam hangat dari *HATOBA Frozen Food*!\n\nMenanyakan untuk persediaan stok bahan baku di dapur Anda (terakhir order ${cust.daysSinceLastOrder} hari yang lalu), apakah persediaan ${favoriteProduct} masih aman atau sudah perlu dijadwalkan restock baru minggu ini?\n\nKami siap jadwalkan pengiriman cepat berpendingin agar operasional resto/warung tetap lancar tanpa kendala kehabisan stok. Ditunggu konfirmasinya ya!`

      case 'GROSIR_OFFER':
        return `Halo ${cust.name} ${targetBusiness},\n\nSemoga operasional bisnis kuliner Anda semakin sukses dan lancar!\n\nKami ingin menginformasikan bahwa untuk kebutuhan partai rutin ${targetBusiness || 'usaha Anda'}, HATOBA menyediakan program kemitraan B2B dengan *Harga Grosir Terbaik (mulai pembelian 5 pack)* serta fleksibilitas jadwal suplai berkala.\n\nJika ada kebutuhan pasokan baru atau ingin konsultasi varian tester, silakan hubungi kami kapan saja ya!`

      case 'CUSTOM':
      default:
        return `Halo ${cust.name} ${targetBusiness},\n\nSalam dari HATOBA Frozen Food Hub ${cust.hubArea}. Semoga operasional ${cust.businessName || 'dapur Anda'} berjalan lancar hari ini.\n\n`
    }
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
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-4 pt-24 sm:pt-32 pb-12">
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
    <div className="min-h-screen bg-[#FBF9F5] text-[#111613] pb-20 pt-20 sm:pt-24 lg:pt-28">
      {/* Top Navigation Bar */}
      <header className="sticky top-[64px] sm:top-[74px] lg:top-[80px] z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE4DC] px-4 sm:px-8 py-3.5 shadow-sm">
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
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pos'
                ? 'bg-[#111613] text-white shadow-md'
                : 'text-[#8C6B24] bg-[#FAF6F0] border border-[#E8DFD5] hover:bg-[#F2ECE1]'
            }`}
          >
            <Receipt className="w-4 h-4 text-[#C59B47]" />
            <span>Kasir POS (Cepat)</span>
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
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap relative ${
              activeTab === 'customers'
                ? 'bg-[#111613] text-white shadow-md'
                : 'text-[#48564F] hover:text-[#111613] hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 text-[#8C6B24]" />
            <span>Database Konsumen</span>
            <span className="text-[10px] text-gray-400 font-semibold">({customerProfiles.length})</span>
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

        {/* ======================= TAB: KASIR POS (CEPAT) ======================= */}
        {activeTab === 'pos' && (
          <PosCashierTab
            products={products}
            recentOrders={orders}
            onOrderCreated={async (newOrder) => {
              setOrders((prev) => [newOrder, ...prev])
              setSelectedOrderForPrint(newOrder)
              try {
                const [ordersRes, logsRes] = await Promise.all([
                  fetch('/api/admin/orders'),
                  fetch('/api/admin/logs'),
                ])
                const [ordersData, logsData] = await Promise.all([ordersRes.json(), logsRes.json()])
                if (ordersData.orders) setOrders(ordersData.orders)
                if (logsData.logs) setLogs(logsData.logs)
              } catch (e) {
                console.warn('Sync orders/logs error:', e)
              }
            }}
            onReprintOrder={(ord) => setSelectedOrderForPrint(ord)}
            onRefreshOrders={fetchAllData}
            showToast={showToast}
          />
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
                            <div className="flex items-center gap-1.5 mt-0.5 mb-1">
                              {ord.source === 'POS' || ord.referenceCode.includes('POS') ? (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FAF6F0] text-[#8C6B24] border border-[#E2D6C5]">
                                  POS KASIR
                                </span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  WEB ORDER
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-500 block">
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
                            {ord.adjustmentNotes && (
                              <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-tight">
                                <strong className="text-amber-950 block">⚠️ Penyesuaian Stok:</strong>
                                <span>{ord.adjustmentNotes}</span>
                              </div>
                            )}
                          </td>

                          {/* Total */}
                          <td className="py-4 px-4 align-top">
                            <span className="font-mono font-bold text-sm text-[#111613] block">
                              {formatIDR(ord.totalAmount)}
                            </span>
                            {ord.originalItems && (
                              <span className="text-[9px] text-gray-400 block mt-0.5">
                                (Order awal: {ord.originalItems.reduce((acc, it) => acc + it.quantity, 0)} pk)
                              </span>
                            )}
                          </td>

                          {/* Status & Payment Status */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1">
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

                              {/* Payment Status Badge */}
                              <div className="pt-0.5">
                                {ord.paymentStatus === 'LUNAS' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>LUNAS</span>
                                  </span>
                                ) : ord.paymentStatus === 'DP' ? (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    DP ({formatIDR(ord.paidAmount || 0)})
                                  </span>
                                ) : ord.paymentStatus === 'TEMPO' ? (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
                                    Tempo B2B
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    <Clock className="w-3 h-3 text-rose-600" />
                                    <span>Tagihan (Belum Bayar)</span>
                                  </span>
                                )}
                              </div>

                              {/* Due Date & Overdue Badge */}
                              {(() => {
                                const isPaid = ord.paymentStatus === 'LUNAS'
                                const dDate =
                                  ord.dueDate ||
                                  new Date(new Date(ord.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
                                const isOverdue =
                                  !isPaid &&
                                  ord.status !== 'REJECTED' &&
                                  Date.now() > new Date(dDate).getTime()
                                const daysOverdue = isOverdue
                                  ? Math.max(
                                      1,
                                      Math.floor((Date.now() - new Date(dDate).getTime()) / (1000 * 60 * 60 * 24))
                                    )
                                  : 0

                                return (
                                  <div className="pt-0.5 space-y-0.5">
                                    <span className="block text-[10px] text-gray-500">
                                      Jatuh Tempo: {new Date(dDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                    {isOverdue && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-200 text-rose-900 border border-rose-300">
                                        <AlertCircle className="w-2.5 h-2.5 text-rose-700" />
                                        <span>Terlambat {daysOverdue} Hari</span>
                                      </span>
                                    )}
                                  </div>
                                )
                              })()}

                              {ord.adjustmentNotes && (
                                <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  Stok Disesuaikan
                                </span>
                              )}
                              {ord.statusNotes && (
                                <span className="block text-[10px] text-gray-500 italic max-w-[140px]">
                                  {ord.statusNotes}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 align-top text-right space-y-1.5">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {ord.status !== 'VERIFIED' && (
                                <button
                                  onClick={() => openAdjustmentModal(ord)}
                                  title="Cek Stok & Terima Pesanan (Bisa Sesuaikan Kuantitas)"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
                                >
                                  <span>Cek &amp; Terima</span>
                                </button>
                              )}

                              {/* Payment Button (opens POS-style payment modal: Lunas Tunai/Transfer, DP, Campuran, Tempo) */}
                              {ord.status !== 'REJECTED' && (
                                <button
                                  onClick={() => openPaymentModal(ord)}
                                  title="Kelola pembayaran (Lunas Tunai/Transfer, DP, Campuran, Tempo, Batas Pembayaran)"
                                  className={`px-2.5 py-1 rounded-lg text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 ${
                                    ord.paymentStatus === 'LUNAS'
                                      ? 'bg-emerald-800 hover:bg-emerald-900'
                                      : 'bg-emerald-600 hover:bg-emerald-700'
                                  }`}
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>{ord.paymentStatus === 'LUNAS' ? 'Ubah Bayar' : 'Atur Bayar'}</span>
                                </button>
                              )}

                              {ord.status === 'VERIFIED' && (
                                <button
                                  onClick={() => openAdjustmentModal(ord)}
                                  title="Edit / Sesuaikan Kuantitas Stok Pesanan Ini"
                                  className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-semibold transition-all"
                                >
                                  Edit Stok
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
                                title="Cetak Nota / Simpan PDF / Bagikan Tagihan"
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

        {/* ======================= TAB: DATABASE KONSUMEN & CRM ======================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Header & Metrics Overview */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#111613] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#8C6B24]" />
                  <span>Database Konsumen &amp; CRM Pelanggan</span>
                </h3>
                <p className="text-xs text-[#5C6E65] mt-0.5">
                  Rekapitulasi riwayat pesanan, tingkat loyalitas mitra, jadwal restock, dan follow-up WhatsApp untuk apresiasi/bonus/diskon.
                </p>
              </div>

              {/* Quick Customer CSV Export */}
              <button
                type="button"
                onClick={() => {
                  if (customerProfiles.length === 0) {
                    alert('Belum ada data konsumen yang tersimpan.')
                    return
                  }
                  const headers = [
                    'Nama Pelanggan',
                    'Nama Usaha / Bisnis',
                    'Jenis Usaha',
                    'Nomor WhatsApp',
                    'Kota',
                    'Hub Layanan',
                    'Tingkat Loyalitas',
                    'Total Transaksi',
                    'Total Belanja (IDR)',
                    'Order Terakhir',
                    'Hari Sejak Order',
                    'Status Follow Up',
                  ]
                  const rows = customerProfiles.map((c) => [
                    `"${c.name.replace(/"/g, '""')}"`,
                    `"${(c.businessName || '-').replace(/"/g, '""')}"`,
                    `"${(c.businessType || '-').replace(/"/g, '""')}"`,
                    `"${c.phone}"`,
                    `"${c.city}"`,
                    `"${c.hubArea}"`,
                    `"${c.loyaltyLabel}"`,
                    c.totalOrders,
                    c.totalSpent,
                    `"${new Date(c.lastOrderDate).toLocaleDateString('id-ID')}"`,
                    c.daysSinceLastOrder,
                    c.needsFollowUp ? '"Perlu Restock / Follow-up"' : '"Aktif / Baru Order"',
                  ])
                  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.setAttribute('href', url)
                  link.setAttribute('download', `database_konsumen_hatoba_${new Date().toISOString().slice(0, 10)}.csv`)
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="px-4 py-2 rounded-xl border border-[#D8CEBE] hover:bg-[#FAF8F5] text-xs font-semibold text-[#111613] transition-all flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Data Konsumen (CSV)</span>
              </button>
            </div>

            {/* Top 4 Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DFD5] shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-[#5C6E65] block uppercase tracking-wider">
                  Total Konsumen
                </span>
                <div className="font-mono text-2xl font-bold text-[#111613]">
                  {customerProfiles.length}
                </div>
                <span className="text-[10px] text-gray-500">Unik terdata dari riwayat order</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-amber-900 block uppercase tracking-wider flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                  Mitra VIP &amp; Loyal
                </span>
                <div className="font-mono text-2xl font-bold text-amber-950">
                  {customerProfiles.filter((c) => c.loyaltyTier === 'VIP').length}
                </div>
                <span className="text-[10px] text-amber-800">Order &ge;4x atau belanja &ge;1,5 jt</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-emerald-900 block uppercase tracking-wider">
                  Total Omset Konsumen
                </span>
                <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-950">
                  {formatIDR(customerProfiles.reduce((s, c) => s + c.totalSpent, 0))}
                </div>
                <span className="text-[10px] text-emerald-800">Akumulasi nilai pesanan</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-rose-900 block uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-700" />
                  Perlu Follow-up
                </span>
                <div className="font-mono text-2xl font-bold text-rose-950">
                  {customerProfiles.filter((c) => c.needsFollowUp).length}
                </div>
                <span className="text-[10px] text-rose-800">&ge;7 hari belum order kembali</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD5] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama konsumen, usaha resto, nomor WhatsApp, kota, produk..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#8C6B24]"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Hub Filter */}
                <select
                  value={customerHubFilter}
                  onChange={(e) => setCustomerHubFilter(e.target.value as 'ALL' | 'Bali' | 'Yogyakarta')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs font-medium focus:outline-none"
                >
                  <option value="ALL">Semua Hub Layanan</option>
                  <option value="Bali">Hub Bali</option>
                  <option value="Yogyakarta">Hub D.I. Yogyakarta</option>
                </select>

                {/* Tier Filter */}
                <select
                  value={customerTierFilter}
                  onChange={(e) => setCustomerTierFilter(e.target.value as 'ALL' | 'VIP' | 'REGULAR' | 'NEW')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs font-medium focus:outline-none"
                >
                  <option value="ALL">Semua Tingkat Loyalitas</option>
                  <option value="VIP">Mitra VIP / Loyal</option>
                  <option value="REGULAR">Mitra Reguler (2-3x)</option>
                  <option value="NEW">Pelanggan Baru (1x)</option>
                </select>

                {/* Follow-up Filter */}
                <select
                  value={customerFollowUpFilter}
                  onChange={(e) => setCustomerFollowUpFilter(e.target.value as 'ALL' | 'NEED_FOLLOWUP' | 'RECENT')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs font-medium focus:outline-none"
                >
                  <option value="ALL">Semua Status Restock</option>
                  <option value="NEED_FOLLOWUP">Perlu Follow-up (&ge;7 hari)</option>
                  <option value="RECENT">Baru Order (&lt;7 hari)</option>
                </select>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-[#E8DFD5] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EAE4DC] bg-[#FAF8F5] text-[#5C6E65] font-bold">
                      <th className="py-3 px-4">Konsumen &amp; Usaha</th>
                      <th className="py-3 px-4">Kontak WhatsApp</th>
                      <th className="py-3 px-4">Tingkat Loyalitas</th>
                      <th className="py-3 px-4">Total Order &amp; Belanja</th>
                      <th className="py-3 px-4">Order Terakhir</th>
                      <th className="py-3 px-4">Produk Sering Dipesan</th>
                      <th className="py-3 px-4 text-right">Aksi Follow-up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE4DC]">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          Tidak ditemukan data konsumen yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const cleanPhone = (cust.phone || '').replace(/[^0-9]/g, '')
                        const targetPhone = cleanPhone.startsWith('0')
                          ? '62' + cleanPhone.slice(1)
                          : cleanPhone.startsWith('62')
                          ? cleanPhone
                          : '62' + cleanPhone

                        return (
                          <tr key={cust.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            {/* Konsumen & Bisnis */}
                            <td className="py-4 px-4 align-top">
                              <div className="font-bold text-[#111613] text-sm">{cust.name}</div>
                              {cust.businessName && (
                                <div className="text-[11px] font-semibold text-[#8C6B24]">
                                  {cust.businessName}
                                </div>
                              )}
                              <div className="text-[10px] text-gray-500">
                                {cust.city} &middot; Hub {cust.hubArea}
                              </div>
                            </td>

                            {/* Kontak WA */}
                            <td className="py-4 px-4 align-top">
                              <a
                                href={`https://wa.me/${targetPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-mono font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200"
                              >
                                <span>{cust.phone}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>

                            {/* Tingkat Loyalitas & Track Record */}
                            <td className="py-4 px-4 align-top">
                              {cust.loyaltyTier === 'VIP' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  <Sparkles className="w-3 h-3 text-amber-700" />
                                  <span>{cust.loyaltyLabel}</span>
                                </span>
                              ) : cust.loyaltyTier === 'REGULAR' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                                  <UserCheck className="w-3 h-3 text-blue-700" />
                                  <span>{cust.loyaltyLabel}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <span>{cust.loyaltyLabel}</span>
                                </span>
                              )}

                              {/* Track Record Kedisiplinan Pembayaran */}
                              <div className="pt-1">
                                {cust.overdueOrdersCount > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    <AlertCircle className="w-2.5 h-2.5 text-rose-700" />
                                    <span>{cust.overdueOrdersCount} Tagihan Terlambat</span>
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-emerald-700 font-medium block">
                                    ✓ Pembayaran Tertib
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Total Transaksi & Belanja */}
                            <td className="py-4 px-4 align-top">
                              <span className="font-mono font-bold text-sm text-[#111613] block">
                                {formatIDR(cust.totalSpent)}
                              </span>
                              <span className="text-[11px] text-gray-500 font-medium">
                                {cust.totalOrders} kali pesanan
                              </span>
                            </td>

                            {/* Order Terakhir */}
                            <td className="py-4 px-4 align-top">
                              <span className="block font-medium text-[11px] text-gray-800">
                                {new Date(cust.lastOrderDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              {cust.needsFollowUp ? (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  <Clock className="w-2.5 h-2.5 text-rose-600" />
                                  <span>{cust.daysSinceLastOrder} hari lalu (Restock)</span>
                                </span>
                              ) : (
                                <span className="inline-block mt-1 text-[10px] text-emerald-700 font-semibold">
                                  {cust.daysSinceLastOrder === 0
                                    ? 'Hari ini'
                                    : `${cust.daysSinceLastOrder} hari lalu`}
                                </span>
                              )}
                            </td>

                            {/* Produk Sering Dipesan */}
                            <td className="py-4 px-4 align-top">
                              <div className="space-y-1 max-w-[200px]">
                                {cust.itemsBought.slice(0, 3).map((it, idx) => (
                                  <div key={idx} className="text-[11px] text-gray-700 truncate">
                                    <span className="font-bold text-[#111613]">{it.totalQty}x</span>{' '}
                                    {it.name}
                                  </div>
                                ))}
                                {cust.itemsBought.length > 3 && (
                                  <span className="text-[9px] text-gray-400 italic">
                                    +{cust.itemsBought.length - 3} produk lainnya
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Action: Follow-up & Promo */}
                            <td className="py-4 px-4 align-top text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCustomerForFollowUp(cust)
                                  setFollowUpTemplate('APPRECIATION_DISCOUNT')
                                  setCustomFollowUpMessage(
                                    getFollowUpTemplateText(cust, 'APPRECIATION_DISCOUNT')
                                  )
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1.5 ml-auto"
                                title="Buka modal pesan apresiasi, diskon, atau pengingat restock WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Follow-up &amp; Promo</span>
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
                const maxDiscount = Math.max(
                  prod.discountPercent || 0,
                  ...prod.variants.map((v) => v.discountPercent || 0)
                )
                const highestOriginalPrice = Math.max(
                  prod.originalPrice || 0,
                  ...prod.variants.map((v) => v.originalPrice || 0)
                )
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
                          {maxDiscount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-crimson text-white">
                              -{maxDiscount}%
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
                              {highestOriginalPrice > lowestPrice && (
                                <span className="text-xs text-gray-400 line-through font-mono">
                                  {formatIDR(highestOriginalPrice)}
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#111613]">{log.title}</span>
                          {log.action === 'POS_TRANSACTION' && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Kasir POS
                            </span>
                          )}
                        </div>
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

      {/* ======================= MODAL: CEK STOK & TERIMA ORDER (DENGAN PENYESUAIAN) ======================= */}
      {adjustingOrder && (
        <div className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 flex justify-center items-start">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E8DFD5] shadow-2xl my-4 sm:my-8 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sm:px-8 sm:py-5 flex-shrink-0 bg-[#FBF9F5]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#8C6B24] bg-[#F2ECE1] px-2.5 py-0.5 rounded-full border border-[#D8CEBE]">
                    {adjustingOrder.referenceCode}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {new Date(adjustingOrder.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <h3 className="font-serif-title text-xl font-bold text-[#111613] mt-1">
                  Cek Stok &amp; Terima Pesanan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustingOrder(null)}
                className="w-9 h-9 rounded-full bg-white border border-[#EAE4DC] hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black font-bold text-sm transition-colors"
                title="Tutup Modal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6 space-y-5">
              {/* Info Konsumen & Tombol Chat WA */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-sm text-[#111613] block">{adjustingOrder.customerName}</span>
                  <span className="text-gray-600 block">
                    {adjustingOrder.businessName ? `${adjustingOrder.businessName} · ` : ''}
                    {adjustingOrder.city} ({adjustingOrder.hubArea})
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                      Promotor: {adjustingOrder.marketingName || 'Organik (Web Langsung)'}
                    </span>
                  </div>
                  {adjustingOrder.notes && (
                    <div className="mt-1 text-[11px] text-amber-900 bg-amber-50/80 p-1.5 rounded border border-amber-200">
                      <strong>Catatan Konsumen:</strong> {adjustingOrder.notes}
                    </div>
                  )}
                </div>

                <a
                  href={`https://wa.me/${adjustingOrder.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Halo ${adjustingOrder.customerName}, kami dari HATOBA Frozen Food mengenai pesanan ${adjustingOrder.referenceCode}...`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-full bg-[#1D6C48] hover:bg-[#155336] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm flex-shrink-0 transition-all"
                >
                  <span>Chat WA Konsumen ({adjustingOrder.phone})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Petunjuk Admin */}
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                ℹ️ <strong>Alur Konfirmasi Stok:</strong> Periksa ketersediaan stok fisik di gudang. Jika ada item yang kurang/kosong, hubungi konsumen via WhatsApp terlebih dahulu. Setelah sepakat, sesuaikan jumlah pack produk di bawah ini sebelum menerima order.
              </div>

              {/* Rincian Produk Pesanan (Bisa Diedit Qty / Tambah / Kurang) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111613] uppercase tracking-wider">
                    Daftar Produk Pesanan (Sesuaikan Kuantitas):
                  </label>
                  <span className="text-[11px] text-gray-500">
                    {adjustedItems.length} produk terpilih
                  </span>
                </div>

                <div className="space-y-2.5">
                  {adjustedItems.map((item, idx) => {
                    const isPartai = item.variantName.toLowerCase().includes('partai') || item.variantName.includes('5 porsi')
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white border border-[#EAE2D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-[#111613] text-sm">{item.productName}</h5>
                          <div className="flex items-center gap-2 text-gray-600 mt-0.5">
                            <span className="text-[11px] text-[#8C6B24] font-medium">{item.variantName}</span>
                            <span>•</span>
                            <span className="font-mono">{formatIDR(item.unitPrice)} / pk</span>
                          </div>
                          {isPartai && item.quantity >= 5 && (
                            <span className="inline-block mt-1 text-[9px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Diskon Partai Rp 10.000/pk aktif
                            </span>
                          )}
                        </div>

                        {/* Stepper Jumlah Pack */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                          <div className="flex items-center border border-[#D8CEBE] rounded-xl bg-[#FAF8F5] p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                const nextQty = item.quantity - 1
                                if (nextQty <= 0) {
                                  // Hapus item
                                  setAdjustedItems((prev) => prev.filter((_, i) => i !== idx))
                                } else {
                                  setAdjustedItems((prev) =>
                                    prev.map((it, i) => {
                                      if (i !== idx) return it
                                      const basePrice = it.unitPrice >= 65000 && it.unitPrice <= 75000 ? (nextQty >= 5 ? 65000 : 75000) : it.unitPrice
                                      return {
                                        ...it,
                                        quantity: nextQty,
                                        unitPrice: basePrice,
                                        subtotal: basePrice * nextQty,
                                      }
                                    })
                                  )
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-gray-700 active:scale-90 font-bold"
                              title="Kurangi"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0
                                if (val <= 0) {
                                  setAdjustedItems((prev) => prev.filter((_, i) => i !== idx))
                                } else {
                                  setAdjustedItems((prev) =>
                                    prev.map((it, i) => {
                                      if (i !== idx) return it
                                      return {
                                        ...it,
                                        quantity: val,
                                        subtotal: it.unitPrice * val,
                                      }
                                    })
                                  )
                                }
                              }}
                              className="w-12 text-center text-xs font-mono font-bold bg-transparent focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const nextQty = item.quantity + 1
                                setAdjustedItems((prev) =>
                                  prev.map((it, i) => {
                                    if (i !== idx) return it
                                    const basePrice = it.unitPrice >= 65000 && it.unitPrice <= 75000 ? (nextQty >= 5 ? 65000 : 75000) : it.unitPrice
                                    return {
                                      ...it,
                                      quantity: nextQty,
                                      unitPrice: basePrice,
                                      subtotal: basePrice * nextQty,
                                    }
                                  })
                                )
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-gray-700 active:scale-90 font-bold"
                              title="Tambah"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[90px]">
                            <span className="font-mono font-bold text-sm text-[#111613]">
                              {formatIDR(item.subtotal)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setAdjustedItems((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Hapus Produk Ini (Stok Kosong)"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {adjustedItems.length === 0 && (
                    <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                      Semua produk telah dihapus dari rincian. Jika stok kosong total, disarankan gunakan opsi Tolak Pesanan.
                    </div>
                  )}
                </div>

                {/* Ringkasan Perubahan Total */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-500 block">Total Kuantitas Baru:</span>
                    <strong className="text-sm font-mono text-[#111613]">
                      {adjustedItems.reduce((acc, it) => acc + it.quantity, 0)} pack
                    </strong>
                    {adjustingOrder.items && (
                      <span className="text-[10px] text-gray-400 block">
                        (Order awal: {adjustingOrder.items.reduce((acc, it) => acc + it.quantity, 0)} pack)
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-gray-500 block">Total Nilai Tagihan Baru:</span>
                    <strong className="text-base font-mono text-emerald-800">
                      {formatIDR(adjustedItems.reduce((acc, it) => acc + it.subtotal, 0))}
                    </strong>
                    {adjustingOrder.totalAmount !== adjustedItems.reduce((acc, it) => acc + it.subtotal, 0) && (
                      <span className="text-[10px] text-gray-400 block line-through">
                        Semula: {formatIDR(adjustingOrder.totalAmount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Catatan Penyesuaian Stok (WAJIB TERCATAT DI NOTA & INVOICE) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#111613] uppercase tracking-wider">
                    Catatan Penyesuaian Stok &amp; Kesepakatan WA:
                  </label>
                  <span className="text-[10px] text-[#8C6B24] font-semibold">
                    * Tertera di Nota &amp; Invoice Konsumen
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Misal: Stok Iga Sapi hanya ada 6 pack (order awal 10 pack). Telah dikonfirmasi dan disetujui konsumen via chat WhatsApp."
                  value={adjustmentNoteInput}
                  onChange={(e) => setAdjustmentNoteInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:ring-2 focus:ring-[#C59B47]/20 focus:border-[#C59B47] shadow-2xs"
                />
                <p className="text-[10px] text-gray-500">
                  Catatan ini akan tersimpan di sistem, dicetak pada Faktur Tagihan resmi &amp; Struk Nota kasir (status Tagihan Belum Bayar hingga dilunasi oleh admin), dan <strong>tidak muncul</strong> di Surat Jalan (DO).
                </p>
              </div>

              {/* Setting Batas Waktu Pembayaran Tagihan (Jumlah Hari) */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#111613] uppercase tracking-wider">
                    Batas Waktu Pembayaran (Tagihan):
                  </label>
                  <span className="text-[10px] text-[#8C6B24] font-bold">
                    Default 3 Hari
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={adjustmentDueDays}
                      onChange={(e) => setAdjustmentDueDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs font-mono font-bold text-[#111613] focus:outline-none focus:ring-2 focus:ring-[#C59B47]/20 focus:border-[#C59B47]"
                      placeholder="3"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-medium">Hari</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[3, 5, 6, 7, 14].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setAdjustmentDueDays(d)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          adjustmentDueDays === d
                            ? 'bg-[#111613] text-white font-bold'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {d}h
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-800 text-[11px] block">
                      Batas Maksimal Pembayaran Tertera di Tagihan:
                    </span>
                    <strong className="text-emerald-950 font-bold font-mono text-xs">
                      {new Date(
                        (adjustingOrder?.createdAt ? new Date(adjustingOrder.createdAt).getTime() : Date.now()) +
                          adjustmentDueDays * 24 * 60 * 60 * 1000
                      ).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 font-bold">
                    {adjustmentDueDays} Hari
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">
                  Admin cukup ubah jumlah hari (misal 6 hari), tanggal batas pembayaran otomatis menyesuaikan dan dicetak di Faktur Tagihan.
                </p>
              </div>

              {/* Field Promotor Marketing */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#111613] uppercase tracking-wider">
                  Staf Marketing / Promotor: <span className="text-gray-400 font-normal lowercase">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama staf marketing (kosongkan jika order organik)"
                  value={adjustmentMarketingInput}
                  onChange={(e) => setAdjustmentMarketingInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:ring-2 focus:ring-[#C59B47]/20 focus:border-[#C59B47] shadow-2xs"
                />
                <p className="text-[10px] text-gray-500">
                  Untuk pencatatan performa promotor di dashboard &amp; laporan komisi marketing.
                </p>
              </div>
            </div>

            {/* Footer Modal: Tombol Aksi */}
            <div className="px-6 py-4 sm:px-8 sm:py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 bg-[#FBF9F5]">
              <button
                type="button"
                onClick={() => setAdjustingOrder(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200/70 transition-colors"
              >
                Batal
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                {/* Opsi 1: Terima Tanpa Ubah */}
                <button
                  type="button"
                  disabled={adjustmentLoading}
                  onClick={() => handleSaveAdjustedOrder(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                  title="Stok tersedia lengkap sesuai order awal"
                >
                  Terima Sesuai Pesanan Awal
                </button>

                {/* Opsi 2: Terima dengan Penyesuaian */}
                <button
                  type="button"
                  disabled={adjustmentLoading}
                  onClick={() => handleSaveAdjustedOrder(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {adjustmentLoading ? 'Menyimpan...' : 'Terima dengan Penyesuaian'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: REJECT / NOTE PROMPT ======================= */}
      {updatingOrderId && pendingStatusAction && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex justify-center items-start sm:items-center">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DFD5] shadow-2xl my-6 sm:my-auto space-y-4">
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
        <div className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 flex justify-center items-start">
          <form
            onSubmit={handleSaveProduct}
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E8DFD5] shadow-2xl my-4 sm:my-8 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden"
          >
            {/* Header Modal Tetap di Atas */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sm:px-8 sm:py-5 flex-shrink-0 bg-white">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#111613]">
                  {editingProduct.id ? 'Edit Menu Produk' : 'Tambah Menu Baru'}
                </h3>
                <p className="text-xs text-gray-500">Katalog B2B &amp; Ritel HATOBA Frozen Food</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EAE4DC] hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black font-bold text-sm transition-colors"
                title="Tutup Modal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6 space-y-4">
              {/* Nama + Kategori */}
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
                    <option value="Daging & Tulang Pilihan">Daging &amp; Tulang Pilihan</option>
                    <option value="Kombinasi Aneka Jeroan & Daging">Kombinasi Aneka Jeroan &amp; Daging</option>
                    <option value="Paket Mix Komplit">Paket Mix Komplit</option>
                    <option value="Karkas & Potongan Khusus">Karkas &amp; Potongan Khusus</option>
                  </select>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-[#48564F] mb-1">Deskripsi Singkat:</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan keunggulan produk, tekstur, dan saran olahan..."
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47]"
                />
              </div>

              {/* 2 Gambar Produk: Kemasan & Sajian */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#111613] uppercase tracking-wider">
                    Foto Produk (Kemasan &amp; Sajian):
                  </label>
                  <span className="text-[10px] text-gray-500">
                    Upload langsung dari HP / Laptop atau masukkan URL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* 1. Foto Kemasan */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111613] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#C59B47]" />
                        Foto Kemasan (Pouch / Vacuum)
                      </span>
                      <span className="text-[9px] text-[#8C6B24] font-semibold bg-[#F5EFE6] px-2 py-0.5 rounded-full border border-[#E2D6C5]">
                        Tampilan Depan
                      </span>
                    </div>

                    {/* Preview Thumbnail */}
                    <div className="relative aspect-[4/3] w-full rounded-xl bg-white border border-[#E8DFD5] overflow-hidden flex items-center justify-center">
                      {editingProduct.packagingImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={editingProduct.packagingImage}
                          alt="Preview Kemasan"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = '/images/products/kemasan-babat.png'
                          }}
                        />
                      ) : (
                        <div className="text-center p-3 text-gray-400">
                          <ImageIcon className="w-7 h-7 mx-auto mb-1 opacity-40" />
                          <span className="text-[10px] block">Belum ada foto kemasan</span>
                        </div>
                      )}
                    </div>

                    {/* Tombol Upload dari HP / Laptop */}
                    <div>
                      <label
                        className={`w-full py-2 px-3 rounded-xl border border-dashed border-[#C59B47] bg-white hover:bg-[#FAF6F0] cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-[#8C6B24] transition-all shadow-sm ${
                          uploadingField === 'packaging' ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>
                          {uploadingField === 'packaging'
                            ? 'Mengunggah...'
                            : 'Upload dari HP / Laptop'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, 'packaging')
                          }}
                        />
                      </label>
                    </div>

                    {/* URL text fallback */}
                    <input
                      type="text"
                      placeholder="Atau URL: /images/products/kemasan-..."
                      value={editingProduct.packagingImage || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, packagingImage: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8CEBE] text-[10px] text-[#111613] font-mono focus:outline-none focus:border-[#C59B47]"
                    />
                  </div>

                  {/* 2. Foto Sajian */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111613] flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-[#1D6C48]" />
                        Foto Sajian (Masakan Olahan)
                      </span>
                      <span className="text-[9px] text-[#1D6C48] font-semibold bg-[#E8F4EE] px-2 py-0.5 rounded-full border border-[#BCE2CD]">
                        Tampilan Sajian
                      </span>
                    </div>

                    {/* Preview Thumbnail */}
                    <div className="relative aspect-[4/3] w-full rounded-xl bg-white border border-[#E8DFD5] overflow-hidden flex items-center justify-center">
                      {editingProduct.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={editingProduct.image}
                          alt="Preview Sajian"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = '/images/products/foto-babat.jpeg'
                          }}
                        />
                      ) : (
                        <div className="text-center p-3 text-gray-400">
                          <ImageIcon className="w-7 h-7 mx-auto mb-1 opacity-40" />
                          <span className="text-[10px] block">Belum ada foto sajian</span>
                        </div>
                      )}
                    </div>

                    {/* Tombol Upload dari HP / Laptop */}
                    <div>
                      <label
                        className={`w-full py-2 px-3 rounded-xl border border-dashed border-[#1D6C48] bg-white hover:bg-[#F3F9F5] cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-[#1D6C48] transition-all shadow-sm ${
                          uploadingField === 'serving' ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>
                          {uploadingField === 'serving'
                            ? 'Mengunggah...'
                            : 'Upload dari HP / Laptop'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, 'serving')
                          }}
                        />
                      </label>
                    </div>

                    {/* URL text fallback */}
                    <input
                      type="text"
                      placeholder="Atau URL: /images/products/foto-..."
                      value={editingProduct.image || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, image: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8CEBE] text-[10px] text-[#111613] font-mono focus:outline-none focus:border-[#C59B47]"
                    />
                  </div>
                </div>
              </div>

              {/* Badge + Ketersediaan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#48564F] mb-1">Badge / Label Produk:</label>
                  <input
                    type="text"
                    placeholder="Misal: Best Seller / Promo / Baru"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47]"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="availCheck"
                      checked={editingProduct.isAvailable !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                      className="rounded text-[#C59B47] focus:ring-[#C59B47]"
                    />
                    <label htmlFor="availCheck" className="text-xs text-[#111613] font-medium cursor-pointer">
                      Menu Aktif / Stok Tersedia
                    </label>
                  </div>
                </div>
              </div>

              {/* Varian Kemasan & Harga */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111613] uppercase tracking-wider">
                    Varian Kemasan, Harga &amp; Diskon
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
                {/* Header kolom */}
                <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3">
                  <div className="col-span-3">Nama Varian</div>
                  <div className="col-span-2">Tipe Kemasan</div>
                  <div className="col-span-1">Min Qty</div>
                  <div className="col-span-2">Harga 1-4 pk</div>
                  <div className="col-span-2">H. Coret</div>
                  <div className="col-span-1">Dis%</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editingProduct.variants?.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE4DC] grid grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Nama Varian"
                          value={v.name}
                          onChange={(e) => {
                            const newVars = [...(editingProduct.variants || [])]
                            newVars[idx] = { ...newVars[idx], name: e.target.value }
                            setEditingProduct({ ...editingProduct, variants: newVars })
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-[#D8CEBE] text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={v.packType || 'retail'}
                          onChange={(e) => {
                            const newVars = [...(editingProduct.variants || [])]
                            newVars[idx] = {
                              ...newVars[idx],
                              packType: e.target.value as 'retail' | 'partai',
                            }
                            setEditingProduct({ ...editingProduct, variants: newVars })
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-[#D8CEBE] text-xs"
                        >
                          <option value="retail">Ritel (1 Pk)</option>
                          <option value="partai">Partai (B2B)</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={v.minQty ?? 1}
                          onChange={(e) => {
                            const newVars = [...(editingProduct.variants || [])]
                            newVars[idx] = {
                              ...newVars[idx],
                              minQty: Math.max(1, parseInt(e.target.value) || 1),
                            }
                            setEditingProduct({ ...editingProduct, variants: newVars })
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-[#D8CEBE] text-xs text-center font-mono font-bold"
                          title="Minimal order dalam pack (bisa 1 pack)"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="50000"
                          value={v.price || ''}
                          onChange={(e) => {
                            const newVars = [...(editingProduct.variants || [])]
                            newVars[idx] = { ...newVars[idx], price: parseInt(e.target.value) || 0 }
                            setEditingProduct({ ...editingProduct, variants: newVars })
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-[#D8CEBE] text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={v.originalPrice || ''}
                          onChange={(e) => {
                            const newVars = [...(editingProduct.variants || [])]
                            newVars[idx] = { ...newVars[idx], originalPrice: parseInt(e.target.value) || 0 }
                            setEditingProduct({ ...editingProduct, variants: newVars })
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-[#D8CEBE] text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={v.discountPercent || ''}
                          onChange={(e) => {
                            const newVars = [...(editingProduct.variants || [])]
                            newVars[idx] = { ...newVars[idx], discountPercent: parseInt(e.target.value) || 0 }
                            setEditingProduct({ ...editingProduct, variants: newVars })
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-[#D8CEBE] text-xs text-center"
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
                            className="text-red-400 hover:text-red-600 font-bold"
                            title="Hapus varian"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-[11px] text-emerald-900 leading-relaxed">
                  💡 <strong>Ketentuan Harga Partai &amp; Minimal Order:</strong>
                  <br />
                  • <strong>Min Qty = 1:</strong> Konsumen dapat membeli mulai dari 1 pack (tidak dikunci minimal 10).
                  <br />
                  • <strong>Order 1–4 pack:</strong> Menggunakan harga dasar di kolom atas (contoh Iga Rp 130.000/pk, Babat/Iso Rp 75.000/pk, Paru Rp 80.000/pk).
                  <br />
                  • <strong>Order ≥5 pack:</strong> Otomatis mendapat <strong>potongan Rp 10.000 per pack</strong> (Iga menjadi Rp 120.000/pk, Babat/Iso Rp 65.000/pk, Paru Rp 70.000/pk).
                </div>
              </div>

            </div>

            {/* Footer Modal Tetap di Bawah */}
            <div className="px-6 py-4 sm:px-8 sm:py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 bg-[#FAF8F5]">
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200/70 transition-colors"
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
      )}

      {/* ======================= DUAL PRINT MODAL (THERMAL & SURAT JALAN) ======================= */}
      {selectedOrderForPrint && (
        <OrderPrintModal
          order={selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
          onMarkPaid={(ord) => {
            setSelectedOrderForPrint(null)
            openPaymentModal(ord)
          }}
        />
      )}

      {/* ======================= MODAL: KELOLA PEMBAYARAN (POS STYLE) ======================= */}
      {orderToMarkPaid && (
        <div className="fixed inset-0 z-[75] bg-black/65 backdrop-blur-sm overflow-y-auto p-4 flex justify-center items-center">
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DFD5] shadow-2xl space-y-4 my-auto max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 flex-shrink-0">
              <div>
                <h4 className="font-serif-title text-lg font-bold text-[#111613] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Kelola Status Pembayaran</span>
                </h4>
                <p className="text-xs text-gray-500">
                  Dukung pembayaran Cash Lunas, Transfer Lunas, DP, Sebagian Tempo, dan Full Tempo
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOrderToMarkPaid(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Order Details Summary */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nomor Referensi:</span>
                  <span className="font-mono font-bold text-[#8C6B24]">{orderToMarkPaid.referenceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama Pelanggan:</span>
                  <span className="font-semibold text-[#111613]">
                    {orderToMarkPaid.customerName}{' '}
                    {orderToMarkPaid.businessName ? `(${orderToMarkPaid.businessName})` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                  <span className="text-gray-600 font-bold">Total Nilai Pesanan:</span>
                  <span className="font-mono font-bold text-base text-emerald-800">
                    {formatIDR(orderToMarkPaid.totalAmount)}
                  </span>
                </div>
              </div>

              {/* 5 Payment Modes (Pill Buttons) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Pilih Skema / Metode Pembayaran:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPayMode('LUNAS_TRANSFER')
                      setPayMethodInput('Transfer Mandiri')
                      setPayAmountInput(String(orderToMarkPaid.totalAmount))
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      payMode === 'LUNAS_TRANSFER'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span>💳 Transfer Lunas</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Mandiri / QRIS</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPayMode('LUNAS_TUNAI')
                      setPayMethodInput('Tunai / Cash')
                      setPayAmountInput(String(orderToMarkPaid.totalAmount))
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      payMode === 'LUNAS_TUNAI'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span>💵 Tunai Lunas</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Uang pas / ada kembalian</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPayMode('DP')
                      setPayMethodInput('Transfer Mandiri')
                      setPayAmountInput(String(Math.round(orderToMarkPaid.totalAmount * 0.3)))
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      payMode === 'DP'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span>🪙 Uang Muka (DP)</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Sisa tagihan dicicil</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPayMode('CAMPURAN')
                      setPayMethodInput('Tunai / Cash')
                      setPayAmountInput(String(Math.round(orderToMarkPaid.totalAmount * 0.5)))
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      payMode === 'CAMPURAN'
                        ? 'border-blue-500 bg-blue-50 text-blue-950 font-bold shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span>⚖️ Sebagian + Tempo</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Bayar awal + tempo B2B</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPayMode('TEMPO')
                      setPayMethodInput('Full Tempo B2B')
                      setPayAmountInput('0')
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all col-span-2 sm:col-span-1 ${
                      payMode === 'TEMPO'
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span>⏳ Full Tempo B2B</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Bayar saat jatuh tempo</div>
                  </button>
                </div>
              </div>

              {/* Mode Specific Inputs */}
              {payMode === 'LUNAS_TRANSFER' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    Pilih Rekening Transfer Masuk:
                  </label>
                  <select
                    value={payMethodInput}
                    onChange={(e) => setPayMethodInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Transfer Mandiri">Transfer Mandiri (1370016639326 a.n Doni Kristiawan)</option>
                    <option value="Transfer Bank Lain">Transfer Bank Lain (Antar Bank)</option>
                    <option value="QRIS">QRIS Standar</option>
                  </select>
                </div>
              )}

              {payMode === 'LUNAS_TUNAI' && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">
                      Nominal Uang Tunai Diterima (Rp):
                    </label>
                    <input
                      type="number"
                      placeholder="Masukkan jumlah uang tunai dari konsumen..."
                      value={payAmountInput}
                      onChange={(e) => setPayAmountInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs font-mono font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  {(() => {
                    const parsed = parseFloat(payAmountInput) || 0
                    const kembalian = Math.max(0, parsed - orderToMarkPaid.totalAmount)
                    return (
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex justify-between text-xs">
                        <span className="text-gray-600">Uang Kembalian:</span>
                        <span className="font-mono font-bold text-emerald-800">{formatIDR(kembalian)}</span>
                      </div>
                    )
                  })()}
                </div>
              )}

              {(payMode === 'DP' || payMode === 'CAMPURAN') && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">
                        Metode Pembayaran di Awal:
                      </label>
                      <select
                        value={payMethodInput}
                        onChange={(e) => setPayMethodInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs font-semibold focus:outline-none focus:border-emerald-600"
                      >
                        <option value="Transfer Mandiri">Transfer Mandiri</option>
                        <option value="Tunai / Cash">Tunai / Cash</option>
                        <option value="QRIS">QRIS</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">
                        Nominal Dibayar (Rp):
                      </label>
                      <input
                        type="number"
                        placeholder="Jumlah yang dibayar..."
                        value={payAmountInput}
                        onChange={(e) => setPayAmountInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs font-mono font-bold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {(() => {
                    const parsed = parseFloat(payAmountInput) || 0
                    const sisa = Math.max(0, orderToMarkPaid.totalAmount - parsed)
                    return (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex justify-between text-xs">
                        <span className="text-amber-900 font-semibold">
                          {payMode === 'CAMPURAN' ? 'Sisa Masuk Tempo B2B:' : 'Sisa Tagihan (Piutang):'}
                        </span>
                        <span className="font-mono font-bold text-amber-950">{formatIDR(sisa)}</span>
                      </div>
                    )
                  })()}
                </div>
              )}

              {payMode === 'TEMPO' && (
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 space-y-1">
                  <div className="font-bold">Full Tempo B2B untuk Mitra Restoran:</div>
                  <p className="text-[11px] text-orange-900 leading-relaxed">
                    Seluruh nominal sebesar <strong>{formatIDR(orderToMarkPaid.totalAmount)}</strong> dicatat sebagai piutang jatuh tempo.
                  </p>
                </div>
              )}

              {/* Batas Waktu Pembayaran (Jatuh Tempo) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 block">
                    Batas Waktu Pelunasan / Jatuh Tempo:
                  </label>
                  <span className="text-[10px] text-[#8C6B24] font-bold">
                    Default 3 Hari
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={payDueDaysInput}
                      onChange={(e) => handlePayDueDaysChange(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs font-mono font-bold text-[#111613] focus:outline-none focus:border-emerald-600"
                      placeholder="3"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-medium">Hari</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[3, 5, 6, 7, 14, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handlePayDueDaysChange(d)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          payDueDaysInput === d
                            ? 'bg-emerald-700 text-white font-bold'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {d}h
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-Calculated Date Preview */}
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-amber-800 font-semibold block text-[11px]">
                      Tanggal Batas Maksimal Pembayaran:
                    </span>
                    <strong className="text-amber-950 font-mono text-xs">
                      {payDueDateInput
                        ? new Date(payDueDateInput).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : '-'}
                    </strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 font-bold">
                    {payDueDaysInput} Hari
                  </span>
                </div>

                <p className="text-[10px] text-gray-500">
                  Admin cukup ubah kolom hari (misal 6 hari), tanggal batas pembayaran otomatis menyesuaikan dan dicetak di Faktur &amp; Nota. Jika lewat tanggal ini dan belum lunas, sistem otomatis menandai status <strong>Terlambat</strong>.
                </p>
              </div>

              {/* Notes Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  Catatan Pembayaran (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Misal: Bukti transfer Mandiri a.n Hendra jam 14:15, tempo disetujui 7 hari"
                  value={payNotesInput}
                  onChange={(e) => setPayNotesInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setOrderToMarkPaid(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={payLoading}
                onClick={handleConfirmMarkPaid}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{payLoading ? 'Menyimpan...' : 'Simpan Pembayaran'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: FOLLOW-UP WHATSAPP & PROMO APRESIASI ======================= */}
      {selectedCustomerForFollowUp && (
        <div className="fixed inset-0 z-[75] bg-black/65 backdrop-blur-sm overflow-y-auto p-4 flex justify-center items-center">
          <div className="relative max-w-xl w-full bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DFD5] shadow-2xl space-y-4 my-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-serif-title text-lg font-bold text-[#111613] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>Follow-up Konsumen via WhatsApp</span>
                </h4>
                <p className="text-xs text-gray-500">
                  Kirimkan pesan apresiasi, diskon repeat order, atau pengingat restock bahan baku
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerForFollowUp(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Customer Snapshot */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-[#111613] text-sm">
                  {selectedCustomerForFollowUp.name}{' '}
                  {selectedCustomerForFollowUp.businessName
                    ? `(${selectedCustomerForFollowUp.businessName})`
                    : ''}
                </div>
                <div className="text-gray-500 text-[11px]">
                  {selectedCustomerForFollowUp.city} &middot; Hub {selectedCustomerForFollowUp.hubArea} &middot; WA: {selectedCustomerForFollowUp.phone}
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-emerald-800">
                  {formatIDR(selectedCustomerForFollowUp.totalSpent)}
                </span>
                <span className="text-[10px] text-gray-400 block">
                  {selectedCustomerForFollowUp.totalOrders}x order
                </span>
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Pilih Tema Pesan WhatsApp:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFollowUpTemplate('APPRECIATION_DISCOUNT')
                    setCustomFollowUpMessage(
                      getFollowUpTemplateText(selectedCustomerForFollowUp, 'APPRECIATION_DISCOUNT')
                    )
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${
                    followUpTemplate === 'APPRECIATION_DISCOUNT'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-semibold'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Gift className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Apresiasi &amp; Diskon Khusus</div>
                    <div className="text-[10px] text-gray-500">Potongan Rp 10.000 / pack repeat order</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFollowUpTemplate('RESTOCK_REMINDER')
                    setCustomFollowUpMessage(
                      getFollowUpTemplateText(selectedCustomerForFollowUp, 'RESTOCK_REMINDER')
                    )
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${
                    followUpTemplate === 'RESTOCK_REMINDER'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Pengingat Restock Dapur</div>
                    <div className="text-[10px] text-gray-500">
                      Tanya stok setelah {selectedCustomerForFollowUp.daysSinceLastOrder} hari
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFollowUpTemplate('GROSIR_OFFER')
                    setCustomFollowUpMessage(
                      getFollowUpTemplateText(selectedCustomerForFollowUp, 'GROSIR_OFFER')
                    )
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${
                    followUpTemplate === 'GROSIR_OFFER'
                      ? 'border-blue-500 bg-blue-50 text-blue-950 font-semibold'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Penawaran Grosir &amp; Partai</div>
                    <div className="text-[10px] text-gray-500">Program harga grosir &ge;5 pack &amp; B2B</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFollowUpTemplate('CUSTOM')
                    setCustomFollowUpMessage(
                      getFollowUpTemplateText(selectedCustomerForFollowUp, 'CUSTOM')
                    )
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${
                    followUpTemplate === 'CUSTOM'
                      ? 'border-stone-500 bg-stone-100 text-stone-900 font-semibold'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Pencil className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Tulis Pesan Sendiri</div>
                    <div className="text-[10px] text-gray-500">Pesan bebas kustom sesuai kebutuhan</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Editable Message Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                Review &amp; Edit Pesan WhatsApp Sebelum Dikirim:
              </label>
              <textarea
                rows={6}
                value={customFollowUpMessage}
                onChange={(e) => setCustomFollowUpMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs font-sans leading-relaxed focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedCustomerForFollowUp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleanPhone = (selectedCustomerForFollowUp.phone || '').replace(/[^0-9]/g, '')
                  const targetPhone = cleanPhone.startsWith('0')
                    ? '62' + cleanPhone.slice(1)
                    : cleanPhone.startsWith('62')
                    ? cleanPhone
                    : '62' + cleanPhone

                  const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
                    customFollowUpMessage
                  )}`
                  window.open(waUrl, '_blank')
                  showToast(
                    `Membuka WhatsApp untuk follow-up ${selectedCustomerForFollowUp.name}!`,
                    'success'
                  )
                  setSelectedCustomerForFollowUp(null)
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Buka &amp; Kirim via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-bottom-4 ${
            toast.type === 'success'
              ? 'bg-[#1D6C48] text-white'
              : 'bg-crimson text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}

