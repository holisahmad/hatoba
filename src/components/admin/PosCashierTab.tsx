'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  Phone,
  Building,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Search,
  Banknote,
  CreditCard,
  Clock,
  Printer,
  ShoppingBag,
  Scale,
  X,
} from 'lucide-react'
import { AdminProduct, AdminOrder } from '@/lib/admin-store'
import { RAW_PRODUCTS } from '@/lib/catalog-data'

interface PosCartItem {
  productId: string
  productName: string
  variantId: string
  variantName: string
  unitPrice: number
  basePrice?: number
  isPartai?: boolean
  quantity: number
  subtotal: number
  unit?: string
  isRawProduct?: boolean
  notes?: string
}

interface PosCashierTabProps {
  products: AdminProduct[]
  recentOrders?: AdminOrder[]
  onOrderCreated: (newOrder: AdminOrder) => void
  onReprintOrder?: (order: AdminOrder) => void
  onRefreshOrders?: () => void
  showToast: (msg: string, type: 'success' | 'error') => void
}

export default function PosCashierTab({
  products,
  recentOrders = [],
  onOrderCreated,
  onReprintOrder,
  onRefreshOrders,
  showToast,
}: PosCashierTabProps) {
  // Search product
  const [productSearch, setProductSearch] = useState('')

  // Cart state
  const [cart, setCart] = useState<PosCartItem[]>([])

  // Customer form
  const [customerName, setCustomerName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [hubArea, setHubArea] = useState<'Bali' | 'Yogyakarta'>('Bali')
  const [city, setCity] = useState('Denpasar')
  const [marketingName, setMarketingName] = useState('')
  const [notes, setNotes] = useState('')

  // Payment form
  const [paymentMode, setPaymentMode] = useState<'LUNAS' | 'DP' | 'TEMPO' | 'CAMPURAN'>('LUNAS')
  // paymentMethod: metode tunai/non-tunai (tidak termasuk Tempo — Tempo adalah paymentMode)
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Transfer BCA' | 'Transfer Mandiri' | 'QRIS'>('Tunai')
  const [paymentStatus, setPaymentStatus] = useState<'LUNAS' | 'DP' | 'TEMPO' | 'BELUM_BAYAR'>('LUNAS')
  const [paidAmountInput, setPaidAmountInput] = useState<string>('')
  const [discountNominal, setDiscountNominal] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<'POS' | 'ALL'>('POS')
  const [isRefreshingHistory, setIsRefreshingHistory] = useState(false)

  // Raw Product (Nego WA) state
  const [showRawModal, setShowRawModal] = useState(false)
  const [rawProductName, setRawProductName] = useState('Babat Fresh Frozen')
  const [rawCustomProductName, setRawCustomProductName] = useState('')
  const [rawUnit, setRawUnit] = useState<string>('Kg')
  const [rawQty, setRawQty] = useState('')
  const [rawUnitPrice, setRawUnitPrice] = useState('')
  const [rawItemNote, setRawItemNote] = useState('')

  const handleAddRawProductToCart = (e: React.FormEvent) => {
    e.preventDefault()
    const targetName = rawProductName === 'Lainnya' ? rawCustomProductName.trim() : rawProductName
    if (!targetName) {
      showToast('Nama produk mentah wajib diisi.', 'error')
      return
    }

    const parsedQty = parseFloat(rawQty)
    if (isNaN(parsedQty) || parsedQty <= 0) {
      showToast('Kuantitas / timbangan harus berupa angka lebih dari 0.', 'error')
      return
    }

    const cleanPrice = parseFloat(rawUnitPrice.replace(/[^0-9]/g, ''))
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      showToast('Harga kesepakatan nego harus lebih dari Rp 0.', 'error')
      return
    }

    const subtotal = Math.round(parsedQty * cleanPrice)
    const newItem: PosCartItem = {
      productId: `raw-${Date.now()}`,
      productName: targetName,
      variantId: `nego-${Date.now()}`,
      variantName: `Nego (${rawUnit})`,
      unitPrice: cleanPrice,
      basePrice: cleanPrice,
      quantity: parsedQty,
      subtotal,
      unit: rawUnit,
      isRawProduct: true,
      notes: rawItemNote.trim() || undefined,
    }

    setCart((prev) => [...prev, newItem])
    setShowRawModal(false)
    setRawQty('')
    setRawUnitPrice('')
    setRawItemNote('')
    setRawCustomProductName('')
    showToast(`${targetName} (${parsedQty} ${rawUnit}) berhasil ditambahkan ke keranjang POS.`, 'success')
  }

  // Calculations
  const rawSubtotal = cart.reduce((sum, it) => sum + it.subtotal, 0)
  const finalTotal = Math.max(0, rawSubtotal - (discountNominal || 0))

  // Paid amount logic per mode:
  // - LUNAS: full payment (Tunai may have input for change calculation, non-cash = full)
  // - DP: partial upfront, rest = piutang (not tempo, just unsettled debt)
  // - TEMPO: 0 paid now, full amount = piutang tempo
  // - CAMPURAN: partial paid via cash/transfer NOW + rest explicitly = piutang tempo
  const parsedInput = paidAmountInput.trim() !== '' ? parseFloat(paidAmountInput.replace(/[^0-9]/g, '')) : NaN
  let paidAmount: number
  if (paymentMode === 'TEMPO') {
    paidAmount = 0
  } else if (paymentMode === 'LUNAS' && paymentMethod === 'Tunai' && !isNaN(parsedInput)) {
    paidAmount = parsedInput
  } else if (paymentMode === 'LUNAS') {
    paidAmount = finalTotal
  } else {
    // DP or CAMPURAN: use the input field
    paidAmount = isNaN(parsedInput) ? 0 : parsedInput
  }

  const changeAmount = Math.max(0, paidAmount - finalTotal)
  const shortfallAmount = Math.max(0, finalTotal - paidAmount)
  const isUnderpaid = paidAmount < finalTotal

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Add variant to POS Cart (with Partai Tier Pricing: ≥5 pack dapat potongan Rp 10.000/pack)
  const handleAddToCart = (product: AdminProduct, variant: any) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.productId === product.id && it.variantId === variant.id
      )

      const isPartai = variant.packType === 'partai' || variant.id.includes('partai')
      const basePrice = variant.price

      if (existingIdx !== -1) {
        const next = [...prev]
        const curr = next[existingIdx]
        const newQty = curr.quantity + 1
        const effectiveUnitPrice = isPartai && newQty >= 5 ? Math.max(0, basePrice - 10000) : basePrice
        next[existingIdx] = {
          ...curr,
          quantity: newQty,
          unitPrice: effectiveUnitPrice,
          subtotal: newQty * effectiveUnitPrice,
        }
        return next
      }

      const effectiveUnitPrice = isPartai && 1 >= 5 ? Math.max(0, basePrice - 10000) : basePrice
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.name,
          unitPrice: effectiveUnitPrice,
          basePrice,
          isPartai,
          quantity: 1,
          subtotal: effectiveUnitPrice,
        },
      ]
    })
  }

  // Update Qty
  const handleUpdateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev]
      const curr = next[index]
      const newQty = curr.quantity + delta
      if (newQty <= 0) {
        return next.filter((_, i) => i !== index)
      }

      if (curr.isRawProduct) {
        next[index] = {
          ...curr,
          quantity: newQty,
          subtotal: Math.round(newQty * curr.unitPrice),
        }
        return next
      }

      const prod = products.find((p) => p.id === curr.productId)
      const v = prod?.variants.find((v) => v.id === curr.variantId)
      const basePrice = curr.basePrice || v?.price || curr.unitPrice
      const isPartai = curr.isPartai || curr.variantId.includes('partai') || v?.packType === 'partai'
      const effectiveUnitPrice = isPartai && newQty >= 5 ? Math.max(0, basePrice - 10000) : basePrice

      next[index] = {
        ...curr,
        quantity: newQty,
        unitPrice: effectiveUnitPrice,
        subtotal: newQty * effectiveUnitPrice,
      }
      return next
    })
  }

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  // Reset Form
  const handleReset = () => {
    setCart([])
    setCustomerName('')
    setBusinessName('')
    setPhone('')
    setMarketingName('')
    setNotes('')
    setPaidAmountInput('')
    setDiscountNominal(0)
    setPaymentMode('LUNAS')
    setPaymentMethod('Tunai')
  }

  // Quick Preset Pay
  const handlePresetPay = (amount: number) => {
    setPaidAmountInput(amount.toString())
  }

  // Process POS Order
  const handleProcessOrder = async () => {
    if (!customerName.trim()) {
      showToast('Nama pelanggan wajib diisi.', 'error')
      return
    }

    if (cart.length === 0) {
      showToast('Keranjang kasir masih kosong. Pilih menu terlebih dahulu.', 'error')
      return
    }

    setLoading(true)

    try {
      // Payment status rules:
      // - LUNAS  → Status LUNAS, Order VERIFIED
      // - DP     → Status DP (uang muka / cicilan), Order PENDING
      // - TEMPO  → Status TEMPO (full kredit), Order PENDING
      // - CAMPURAN → Status DP (bayar sebagian sekarang + sisa jadi piutang tempo), Order PENDING
      let autoPaymentStatus: 'LUNAS' | 'DP' | 'TEMPO' | 'BELUM_BAYAR' = 'LUNAS'
      let autoStatusNotes = ''
      let autoOrderStatus: 'VERIFIED' | 'PENDING' = 'VERIFIED'
      // paymentMethod label untuk struk (CAMPURAN = metode bayar + Tempo B2B)
      const displayMethod = paymentMode === 'CAMPURAN' ? `${paymentMethod} + Tempo B2B` : paymentMethod
      const displayMethodForDB = paymentMode === 'TEMPO' ? 'Tempo B2B' : displayMethod

      if (paymentMode === 'TEMPO') {
        autoPaymentStatus = 'TEMPO'
        autoOrderStatus = 'PENDING'
        autoStatusNotes = `Full Tempo B2B — Tagihan: ${formatIDR(finalTotal)} (dibayar sesuai jatuh tempo)`
      } else if (paymentMode === 'DP') {
        if (paidAmount <= 0) {
          showToast('Nominal DP wajib diisi lebih dari Rp 0.', 'error')
          setLoading(false)
          return
        }
        if (paidAmount >= finalTotal) {
          autoPaymentStatus = 'LUNAS'
          autoOrderStatus = 'VERIFIED'
          autoStatusNotes = `Lunas via ${paymentMethod} — Dibayar: ${formatIDR(paidAmount)}${changeAmount > 0 ? `, Kembali: ${formatIDR(changeAmount)}` : ''}`
        } else {
          autoPaymentStatus = 'DP'
          autoOrderStatus = 'PENDING'
          autoStatusNotes = `DP via ${paymentMethod} — Masuk: ${formatIDR(paidAmount)}, Sisa Piutang: ${formatIDR(shortfallAmount)}`
        }
      } else if (paymentMode === 'CAMPURAN') {
        if (paidAmount <= 0) {
          showToast('Nominal yang dibayar sekarang wajib diisi lebih dari Rp 0.', 'error')
          setLoading(false)
          return
        }
        if (paidAmount >= finalTotal) {
          // Dibayar penuh, tidak perlu tempo
          autoPaymentStatus = 'LUNAS'
          autoOrderStatus = 'VERIFIED'
          autoStatusNotes = `Lunas via ${paymentMethod} — Dibayar: ${formatIDR(paidAmount)}${changeAmount > 0 ? `, Kembali: ${formatIDR(changeAmount)}` : ''}`
        } else {
          autoPaymentStatus = 'DP'
          autoOrderStatus = 'PENDING'
          autoStatusNotes = `Campuran: Dibayar ${formatIDR(paidAmount)} via ${paymentMethod}, Sisa ${formatIDR(shortfallAmount)} masuk Tempo B2B (piutang jatuh tempo)`
        }
      } else {
        // LUNAS
        if (paymentMethod === 'Tunai' && paidAmount < finalTotal) {
          showToast(`Uang tunai kurang dari total tagihan. Pilih 'DP' atau 'Campuran + Tempo' jika pelanggan tidak bayar penuh.`, 'error')
          setLoading(false)
          return
        }
        autoPaymentStatus = 'LUNAS'
        autoOrderStatus = 'VERIFIED'
        autoStatusNotes = `Lunas via ${paymentMethod} — Dibayar: ${formatIDR(paidAmount)}${changeAmount > 0 ? `, Kembali: ${formatIDR(changeAmount)}` : ''}`
      }

      const payload = {
        customerName: customerName.trim(),
        businessName: businessName.trim() || undefined,
        phone: phone.trim() || '-',
        hubArea,
        city: city.trim() || (hubArea === 'Bali' ? 'Denpasar' : 'Yogyakarta'),
        marketingName: marketingName.trim() || 'Kasir POS',
        notes: notes.trim() || undefined,
        items: cart.map((c) => ({
          productName: c.productName,
          variantName: c.variantName,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          subtotal: c.subtotal,
          unit: c.unit,
          isRawProduct: c.isRawProduct,
          notes: c.notes,
        })),
        totalAmount: finalTotal,
        paymentMethod: displayMethodForDB,
        paymentStatus: autoPaymentStatus,
        paidAmount,
        changeAmount: changeAmount > 0 ? changeAmount : 0,
        status: autoOrderStatus,
        source: 'POS',
        statusNotes: autoStatusNotes,
      }

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan transaksi POS.')
      }

      showToast(`Transaksi ${json.order.referenceCode} berhasil disimpan!`, 'success')
      onOrderCreated(json.order)
      handleReset()
    } catch (err: any) {
      console.error('POS Checkout Error:', err)
      showToast(err.message || 'Gagal memproses transaksi kasir.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Filter products by search
  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true
    const q = productSearch.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ================= LEFT COLUMN: CATALOG SELECTOR (7 COLS) ================= */}
      <div className="lg:col-span-7 space-y-4">
        {/* Search Bar & Title */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-title text-xl font-bold text-[#111613]">
              Pilih Menu Produk (POS)
            </h2>
            <p className="text-xs text-[#5C6E65]">
              Klik varian kemasan untuk menambahkan langsung ke kasir.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Quick Action: Input Produk Mentah Hasil Nego WA */}
        <div className="bg-gradient-to-r from-[#FAF6EE] to-[#F5EFE6] border border-[#E2D6C5] p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#111613] flex items-center gap-2">
                <span>Produk Mentah Fresh Frozen (Harga Nego)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-bold">
                  B2B Nego
                </span>
              </div>
              <p className="text-[11px] text-[#5C6E65]">
                Babat (Kg), Paru (Dus 15-20kg), Iga (Kg) dengan harga &amp; satuan hasil kesepakatan chat WA.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRawModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Produk Mentah / Nego</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white p-4 rounded-2xl border border-[#E8DFD5] hover:border-[#C59B47]/60 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-[#FAF8F5] border border-[#EAE4DC] overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={prod.image || '/images/products/foto-babat.jpeg'}
                      alt={prod.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C6B24] block">
                      {prod.category}
                    </span>
                    <h3 className="font-serif-title font-bold text-base text-[#111613] truncate">
                      {prod.name}
                    </h3>
                    <span className="text-[11px] text-[#5C6E65]">
                      {prod.variants.length} varian tersedia
                    </span>
                  </div>
                </div>
              </div>

              {/* Variant Buttons */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                {prod.variants.map((v) => {
                  const isPartai = v.packType === 'partai' || v.id.includes('partai')
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleAddToCart(prod, v)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#EAE4DC] hover:border-[#C59B47] text-left flex items-center justify-between text-xs transition-colors group"
                    >
                      <div>
                        <span className="font-semibold text-[#111613] block group-hover:text-[#8C6B24]">
                          {v.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <span>{v.weight || v.portion}</span>
                          {isPartai && (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">
                              ≥5 pk: {formatIDR(v.price - 10000)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-800">
                          {formatIDR(v.price)}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-white border border-gray-300 group-hover:bg-[#8C6B24] group-hover:text-white flex items-center justify-center text-xs font-bold transition-colors">
                          +
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RIGHT COLUMN: POS TRANSACTION PANEL (5 COLS) ================= */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DFD5] shadow-lg shadow-stone-200/50 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] border border-[#E2D6C5] flex items-center justify-center">
                <Receipt className="w-4 h-4 text-[#8C6B24]" />
              </div>
              <h3 className="font-serif-title font-bold text-lg text-[#111613]">
                Rincian Transaksi
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Kosongkan</span>
              </button>
            )}
          </div>

          {/* Customer Data */}
          <div className="space-y-3 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EAE4DC] text-xs">
            <span className="font-bold text-[11px] text-[#48564F] uppercase tracking-wider block">
              Data Pelanggan / Dapur
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">Nama Pemesan: *</label>
                <input
                  type="text"
                  required
                  placeholder="Bpk. Hendra"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#C59B47]"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">Nama Usaha / Resto:</label>
                <input
                  type="text"
                  placeholder="Warung Bu Kris"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#C59B47]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">No. Telepon / WA:</label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#C59B47]"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">Hub Operasional:</label>
                <select
                  value={hubArea}
                  onChange={(e) => {
                    const nextHub = e.target.value as 'Bali' | 'Yogyakarta'
                    setHubArea(nextHub)
                    setCity(nextHub === 'Bali' ? 'Denpasar' : 'Yogyakarta')
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#C59B47]"
                >
                  <option value="Bali">Hub Bali (Denpasar)</option>
                  <option value="Yogyakarta">Hub D.I. Yogyakarta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 block mb-0.5">
                Staf Marketing / Promotor: <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Nama staf sales / promotor (default: Kasir POS)"
                value={marketingName}
                onChange={(e) => setMarketingName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8CEBE] text-xs focus:outline-none focus:border-[#C59B47]"
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-2">
            <span className="font-bold text-[11px] text-[#48564F] uppercase tracking-wider block">
              Daftar Pesanan ({cart.length} item)
            </span>

            {cart.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Keranjang kasir masih kosong.
                <div className="text-[10px] text-gray-400">Pilih produk di sebelah kiri.</div>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {cart.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#FCFAF7] border border-[#EAE4DC] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[#111613] truncate flex items-center gap-1.5">
                        <span>{it.productName}</span>
                        {it.isRawProduct && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold uppercase whitespace-nowrap">
                            Nego ({it.unit || 'Kg'})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                        <span>{it.variantName}</span>
                        {it.notes && (
                          <span className="text-[9px] text-gray-600 italic">· {it.notes}</span>
                        )}
                        {(it.isPartai || it.variantId.includes('partai')) && it.quantity >= 5 && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                            Diskon Rp 10rb/pk
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-emerald-800 font-bold">
                        {formatIDR(it.unitPrice)} {it.unit ? `/ ${it.unit}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(idx, -1)}
                        className="w-6 h-6 rounded-md bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold px-1 text-center text-xs whitespace-nowrap">
                        {it.quantity} {it.unit ? it.unit : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(idx, 1)}
                        className="w-6 h-6 rounded-md bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="w-6 h-6 rounded-md text-gray-400 hover:text-red-600 flex items-center justify-center ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment & Calculation */}
          <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
            {/* Discount Optional */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-600">Diskon Khusus (Rp):</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={discountNominal || ''}
                onChange={(e) => setDiscountNominal(Math.max(0, Number(e.target.value)))}
                className="w-28 px-2 py-1 rounded-lg bg-[#FAF8F5] border border-[#D8CEBE] text-right font-mono text-xs focus:outline-none focus:border-[#C59B47]"
              />
            </div>

            {/* Total Display */}
            <div className="p-3.5 rounded-2xl bg-[#111613] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider">
                  Total Bayar
                </span>
                <span className="text-xs text-[#C59B47]">
                  {cart.reduce((s, i) => s + i.quantity, 0)} Total Pack
                </span>
              </div>
              <div className="font-serif-title font-bold text-xl text-[#C59B47]">
                {formatIDR(finalTotal)}
              </div>
            </div>

            {/* ===== PAYMENT MODE SELECTOR ===== */}
            <div>
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1.5">
                Mode Pembayaran:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { mode: 'LUNAS',    label: '✓ Lunas Penuh',      desc: 'Bayar semua sekarang',       color: 'emerald' },
                    { mode: 'DP',       label: '★ DP / Cicilan',      desc: 'Sebagian bayar, sisa piutang', color: 'amber' },
                    { mode: 'TEMPO',    label: '◷ Full Tempo',        desc: 'Semua ditangguhkan',          color: 'orange' },
                    { mode: 'CAMPURAN', label: '⟳ Bayar + Tempo',    desc: 'Bayar item tertentu + sisanya tempo', color: 'blue' },
                  ] as const
                ).map(({ mode, label, desc, color }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setPaymentMode(mode)
                      setPaidAmountInput('')
                      setPaymentStatus(mode === 'TEMPO' ? 'TEMPO' : 'LUNAS')
                    }}
                    className={`py-2 px-2.5 rounded-xl text-left border transition-all ${
                      paymentMode === mode
                        ? color === 'emerald'
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : color === 'amber'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : color === 'orange'
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-tight">{label}</div>
                    <div className={`text-[9px] leading-snug mt-0.5 ${paymentMode === mode ? 'opacity-80' : 'text-gray-400'}`}>
                      {desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ===== PAYMENT DETAILS per MODE ===== */}
            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE4DC] space-y-2.5 text-xs">

              {/* MODE: TEMPO (full credit, no cash) */}
              {paymentMode === 'TEMPO' && (
                <div className="space-y-1.5">
                  <div className="font-bold text-orange-800 flex items-center justify-between">
                    <span>Full Tempo B2B — Tagihan Ditangguhkan</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-mono">TEMPO</span>
                  </div>
                  <p className="text-[11px] text-orange-800 leading-relaxed">
                    Seluruh tagihan <strong className="font-mono">{formatIDR(finalTotal)}</strong> ditangguhkan sebagai
                    piutang jatuh tempo. Tidak ada pembayaran di meja kasir hari ini.
                  </p>
                </div>
              )}

              {/* MODE: CAMPURAN (partial cash/transfer NOW + rest to Tempo) */}
              {paymentMode === 'CAMPURAN' && (
                <div className="space-y-2.5">
                  <div className="font-bold text-blue-800 flex items-center justify-between">
                    <span>Bayar Sebagian + Sisa Tempo B2B</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">CAMPURAN</span>
                  </div>
                  <p className="text-[10px] text-blue-700">
                    Contoh: order 3 menu, bayar menu 1 sekarang via transfer, menu 2 &amp; 3 masuk tempo/piutang.
                  </p>

                  {/* Metode bayar untuk bagian yang dibayar sekarang */}
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Metode Bayar (untuk nominal sekarang):</label>
                    <div className="grid grid-cols-2 gap-1">
                      {(['Tunai', 'Transfer BCA', 'Transfer Mandiri', 'QRIS'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-1 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                            paymentMethod === m
                              ? 'bg-blue-700 text-white border-blue-700'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Nominal Dibayar Sekarang ({paymentMethod}):</span>
                    <input
                      type="number"
                      placeholder="Contoh: 72500"
                      value={paidAmountInput}
                      onChange={(e) => setPaidAmountInput(e.target.value)}
                      className="w-32 px-2.5 py-1 rounded-lg bg-white border border-blue-300 text-right font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {paidAmount > 0 && (
                    <div className="pt-1 border-t border-gray-200 space-y-1">
                      <div className="flex justify-between text-gray-600">
                        <span>Total Tagihan:</span>
                        <span className="font-mono font-bold">{formatIDR(finalTotal)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Dibayar sekarang ({paymentMethod}):</span>
                        <span className="font-mono">{formatIDR(Math.min(paidAmount, finalTotal))}</span>
                      </div>
                      {paidAmount < finalTotal ? (
                        <div className="flex justify-between font-bold text-orange-700 text-sm">
                          <span>Masuk Tempo (Piutang):</span>
                          <span className="font-mono">{formatIDR(shortfallAmount)}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-700 font-semibold text-right">
                          ✓ Lunas penuh — tidak ada bagian tempo
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MODE: DP (down payment / cicilan, sisa piutang biasa) */}
              {paymentMode === 'DP' && (
                <div className="space-y-2.5">
                  <div className="font-bold text-amber-800 flex items-center justify-between">
                    <span>DP / Cicilan — Sisa Jadi Piutang</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">DP</span>
                  </div>

                  {/* Metode bayar DP */}
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Metode Bayar DP:</label>
                    <div className="grid grid-cols-2 gap-1">
                      {(['Tunai', 'Transfer BCA', 'Transfer Mandiri', 'QRIS'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-1 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                            paymentMethod === m
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Nominal DP Diterima:</span>
                    <input
                      type="number"
                      placeholder="Contoh: 50000"
                      value={paidAmountInput}
                      onChange={(e) => setPaidAmountInput(e.target.value)}
                      className="w-32 px-2.5 py-1 rounded-lg bg-white border border-amber-400 text-right font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {paidAmount > 0 && (
                    <div className="pt-1 border-t border-gray-200 space-y-1">
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>DP Masuk ({paymentMethod}):</span>
                        <span className="font-mono">{formatIDR(Math.min(paidAmount, finalTotal))}</span>
                      </div>
                      {paidAmount < finalTotal ? (
                        <div className="flex justify-between font-bold text-amber-800">
                          <span>Sisa Piutang (belum lunas):</span>
                          <span className="font-mono text-sm">{formatIDR(shortfallAmount)}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-700 font-semibold text-right">
                          ✓ Nominal melebihi tagihan — otomatis LUNAS
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MODE: LUNAS (full payment now) */}
              {paymentMode === 'LUNAS' && (
                <div className="space-y-2.5">
                  <div className="font-bold text-emerald-800 flex items-center justify-between">
                    <span>Bayar Lunas Sekarang</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">LUNAS</span>
                  </div>

                  {/* Metode bayar Lunas */}
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Metode Pembayaran:</label>
                    <div className="grid grid-cols-2 gap-1">
                      {(['Tunai', 'Transfer BCA', 'Transfer Mandiri', 'QRIS'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(m)
                            if (m !== 'Tunai') setPaidAmountInput('')
                          }}
                          className={`py-1 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                            paymentMethod === m
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input uang tunai (opsional, untuk hitung kembalian) */}
                  {paymentMethod === 'Tunai' ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Uang Tunai Diterima:</span>
                        <input
                          type="number"
                          placeholder={finalTotal.toString()}
                          value={paidAmountInput}
                          onChange={(e) => setPaidAmountInput(e.target.value)}
                          className="w-32 px-2.5 py-1 rounded-lg bg-white border border-[#D8CEBE] text-right font-mono font-bold text-xs focus:outline-none focus:border-[#C59B47]"
                        />
                      </div>
                      <div className="flex gap-1.5 justify-end">
                        {[finalTotal, 50000, 100000, 200000, 500000].map((pr, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handlePresetPay(pr)}
                            className="px-2 py-0.5 rounded bg-white border border-gray-300 text-[10px] text-gray-600 hover:bg-gray-100 font-mono"
                          >
                            {pr === finalTotal ? 'Pas' : pr >= 1000 ? `${pr / 1000}k` : pr}
                          </button>
                        ))}
                      </div>
                      {changeAmount > 0 ? (
                        <div className="flex items-center justify-between font-mono font-bold text-xs text-emerald-800 pt-1">
                          <span>Uang Kembalian:</span>
                          <span>{formatIDR(changeAmount)}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-700 font-medium text-right pt-0.5">
                          ✓ Uang Pas / Transfer Penuh
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center justify-between">
                      <div>
                        <div className="font-bold">Lunas via {paymentMethod}</div>
                        <div className="text-[10px] text-emerald-700">Dana diterima penuh.</div>
                      </div>
                      <div className="font-mono font-bold text-emerald-800 text-sm">{formatIDR(finalTotal)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="button"
            onClick={handleProcessOrder}
            disabled={loading || cart.length === 0}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-crimson hover:bg-crimson-hover shadow-lg shadow-crimson/25 transition-all flex items-center justify-center gap-2 text-xs tracking-wide disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses Transaksi...</span>
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                <span>Selesaikan &amp; Cetak Transaksi ({formatIDR(finalTotal)})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= BOTTOM: RIWAYAT TRANSAKSI POS & CETAK ULANG ================= */}
      <div className="lg:col-span-12 mt-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD5] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FAF6F0] border border-[#E2D6C5] flex items-center justify-center">
              <Printer className="w-3.5 h-3.5 text-[#8C6B24]" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-base text-[#111613]">
                Riwayat Transaksi Kasir POS (Cetak Ulang)
              </h3>
              <p className="text-[11px] text-[#5C6E65]">
                Daftar transaksi kasir yang bisa dicetak ulang kapan saja (Invoice Konsumen, Struk Thermal, atau Surat Jalan DO).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle POS vs ALL */}
            <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE4DC] text-xs">
              <button
                type="button"
                onClick={() => setHistoryFilter('POS')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  historyFilter === 'POS'
                    ? 'bg-white text-[#8C6B24] shadow-xs border border-[#E2D6C5]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Kasir POS ({recentOrders.filter((o) => o.source === 'POS' || o.referenceCode.includes('POS')).length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  historyFilter === 'ALL'
                    ? 'bg-white text-[#8C6B24] shadow-xs border border-[#E2D6C5]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Semua Order ({recentOrders.length})
              </button>
            </div>

            {/* Refresh Button */}
            {onRefreshOrders && (
              <button
                type="button"
                onClick={async () => {
                  setIsRefreshingHistory(true)
                  try {
                    await onRefreshOrders()
                  } finally {
                    setTimeout(() => setIsRefreshingHistory(false), 500)
                  }
                }}
                disabled={isRefreshingHistory}
                title="Muat ulang riwayat transaksi"
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#EAE4DC] text-[#8C6B24] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingHistory ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </button>
            )}
          </div>
        </div>

        {(() => {
          const displayedOrders =
            historyFilter === 'POS'
              ? recentOrders.filter((o) => o.source === 'POS' || o.referenceCode.includes('POS'))
              : recentOrders

          if (displayedOrders.length === 0) {
            return (
              <div className="py-8 text-center text-xs text-gray-400 space-y-2">
                <p>Belum ada transaksi dari kasir POS yang tercatat.</p>
                {recentOrders.length > 0 && historyFilter === 'POS' && (
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('ALL')}
                    className="text-[#8C6B24] font-semibold underline text-xs"
                  >
                    Lihat {recentOrders.length} transaksi dari Web Storefront
                  </button>
                )}
              </div>
            )
          }

          return (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-[11px] text-left">
                    <th className="py-2 px-3">No. Ref</th>
                    <th className="py-2 px-3">Waktu</th>
                    <th className="py-2 px-3">Pelanggan / Resto</th>
                    <th className="py-2 px-3">Daftar Menu</th>
                    <th className="py-2 px-3">Total Tagihan</th>
                    <th className="py-2 px-3">Metode &amp; Status</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayedOrders.slice(0, 20).map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-[#8C6B24]">
                        {ord.referenceCode}
                      </td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                        {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#111613]">{ord.customerName}</div>
                        <div className="text-[10px] text-gray-500">
                          {ord.businessName ? `${ord.businessName} · ` : ''}{ord.city}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 max-w-[200px] truncate">
                        {ord.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                        {formatIDR(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.paymentStatus === 'LUNAS' || ord.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ord.paymentStatus === 'DP'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : ord.paymentStatus === 'TEMPO'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {ord.paymentStatus || ord.paymentMethod || 'Tunai'}
                        </span>
                        {ord.statusNotes && (
                          <div className="text-[10px] text-gray-400 mt-0.5 max-w-[180px] truncate" title={ord.statusNotes}>
                            {ord.statusNotes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onReprintOrder && onReprintOrder(ord)}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#D8CEBE] hover:border-[#8C6B24] text-[#8C6B24] font-semibold text-xs transition-all shadow-2xs flex items-center gap-1.5 ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Ulang</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })()}
      </div>

      {/* MODAL INPUT PRODUK MENTAH / NEGO */}
      {showRawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] border border-[#E2D6C5] flex items-center justify-center text-amber-800">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-lg text-[#111613]">
                    Input Produk Mentah / Harga Nego
                  </h3>
                  <p className="text-[11px] text-[#5C6E65]">
                    Invoice produk mentah dengan satuan &amp; harga kesepakatan via chat WA.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRawModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRawProductToCart} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pilih Produk Mentah: *
                </label>
                <select
                  value={rawProductName}
                  onChange={(e) => {
                    const val = e.target.value
                    setRawProductName(val)
                    if (val === 'Babat Fresh Frozen' || val === 'Iga Fresh Frozen') {
                      setRawUnit('Kg')
                    } else if (val === 'Paru Fresh Frozen') {
                      setRawUnit('Dus')
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-gray-300 text-xs text-[#111613] font-semibold focus:outline-none focus:border-amber-600 focus:bg-white"
                >
                  <option value="Babat Fresh Frozen">Babat Fresh Frozen (Default: Kg)</option>
                  <option value="Paru Fresh Frozen">Paru Fresh Frozen (Default: Dus 15–20 Kg)</option>
                  <option value="Iga Fresh Frozen">Iga Fresh Frozen (Default: Kg)</option>
                  <option value="Lainnya">Produk Mentah Lainnya (Custom Input)</option>
                </select>
              </div>

              {rawProductName === 'Lainnya' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Produk Mentah Custom: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lidah Sapi Frozen / Buntut Sapi"
                    value={rawCustomProductName}
                    onChange={(e) => setRawCustomProductName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-gray-300 text-xs text-[#111613] focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Satuan Penjualan: *
                  </label>
                  <select
                    value={rawUnit}
                    onChange={(e) => setRawUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-gray-300 text-xs text-[#111613] font-semibold focus:outline-none focus:border-amber-600 focus:bg-white"
                  >
                    <option value="Kg">Kilogram (Kg)</option>
                    <option value="Dus">Dus (Karton)</option>
                    <option value="Pack">Pack</option>
                    <option value="Ekor">Ekor / Bagian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Kuantitas / Timbangan: *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="Contoh: 37.5 atau 2"
                    value={rawQty}
                    onChange={(e) => setRawQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-gray-300 text-xs font-mono font-bold text-[#111613] focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Harga Kesepakatan Nego (Rp/{rawUnit}): *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 75.000"
                    value={rawUnitPrice}
                    onChange={(e) => setRawUnitPrice(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-gray-300 text-xs font-mono font-bold text-[#111613] focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Harga kesepakatan harian per {rawUnit} hasil komunikasi dengan konsumen.
                </p>
              </div>

              {/* Subtotal Calculation Preview */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                <span className="text-amber-900 font-semibold">Subtotal Terhitung:</span>
                <span className="font-mono font-black text-amber-950 text-base">
                  {formatIDR(
                    Math.round(
                      (parseFloat(rawQty) || 0) *
                      (parseFloat(rawUnitPrice.replace(/[^0-9]/g, '')) || 0)
                    )
                  )}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Catatan / Keterangan Nego: <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kesepakatan via WA Bpk. Hendra @ Rp 75rb/kg"
                  value={rawItemNote}
                  onChange={(e) => setRawItemNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-gray-300 text-xs text-[#111613] focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRawModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan ke Kasir</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

