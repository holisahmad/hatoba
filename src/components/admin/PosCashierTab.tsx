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
} from 'lucide-react'
import { AdminProduct, AdminOrder } from '@/lib/admin-store'

interface PosCartItem {
  productId: string
  productName: string
  variantId: string
  variantName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

interface PosCashierTabProps {
  products: AdminProduct[]
  recentOrders?: AdminOrder[]
  onOrderCreated: (newOrder: AdminOrder) => void
  onReprintOrder?: (order: AdminOrder) => void
  showToast: (msg: string, type: 'success' | 'error') => void
}

export default function PosCashierTab({
  products,
  recentOrders = [],
  onOrderCreated,
  onReprintOrder,
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
  const [notes, setNotes] = useState('')

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Transfer BCA' | 'Transfer Mandiri' | 'Tempo B2B' | 'QRIS'>('Tunai')
  const [paymentStatus, setPaymentStatus] = useState<'LUNAS' | 'DP' | 'TEMPO' | 'BELUM_BAYAR'>('LUNAS')
  const [paidAmountInput, setPaidAmountInput] = useState<string>('')
  const [discountNominal, setDiscountNominal] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  // Calculations
  const rawSubtotal = cart.reduce((sum, it) => sum + it.subtotal, 0)
  const finalTotal = Math.max(0, rawSubtotal - (discountNominal || 0))
  const parsedPaid = paidAmountInput.trim() !== '' ? Number(paidAmountInput) : finalTotal
  const paidAmount = isNaN(parsedPaid) ? finalTotal : parsedPaid
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

  // Add variant to POS Cart
  const handleAddToCart = (product: AdminProduct, variant: any) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.productId === product.id && it.variantId === variant.id
      )

      if (existingIdx !== -1) {
        const next = [...prev]
        const curr = next[existingIdx]
        const newQty = curr.quantity + 1
        next[existingIdx] = {
          ...curr,
          quantity: newQty,
          subtotal: newQty * curr.unitPrice,
        }
        return next
      }

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.name,
          unitPrice: variant.price,
          quantity: 1,
          subtotal: variant.price,
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
      next[index] = {
        ...curr,
        quantity: newQty,
        subtotal: newQty * curr.unitPrice,
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
    setNotes('')
    setPaidAmountInput('')
    setDiscountNominal(0)
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
      // Automatic detection of Payment Status based on amount paid:
      let autoPaymentStatus = paymentStatus
      let autoStatusNotes = ''
      let autoOrderStatus: 'VERIFIED' | 'PENDING' = 'VERIFIED'

      if (paymentMethod === 'Tempo B2B') {
        autoPaymentStatus = 'TEMPO'
        autoOrderStatus = 'PENDING'
        autoStatusNotes = 'Tempo B2B (Jatuh tempo sesuai kesepakatan)'
      } else if (isUnderpaid && paidAmount > 0) {
        autoPaymentStatus = 'DP'
        autoOrderStatus = 'PENDING'
        autoStatusNotes = `DP Diterima: ${formatIDR(paidAmount)} (Sisa Tagihan: ${formatIDR(shortfallAmount)})`
      } else if (paidAmount === 0) {
        autoPaymentStatus = 'BELUM_BAYAR'
        autoOrderStatus = 'PENDING'
        autoStatusNotes = 'Belum Ada Pembayaran'
      } else {
        autoPaymentStatus = 'LUNAS'
        autoOrderStatus = 'VERIFIED'
        autoStatusNotes = `Lunas via ${paymentMethod} (${formatIDR(paidAmount)}${changeAmount > 0 ? `, Kembali: ${formatIDR(changeAmount)}` : ''})`
      }

      const payload = {
        customerName: customerName.trim(),
        businessName: businessName.trim() || undefined,
        phone: phone.trim() || '-',
        hubArea,
        city: city.trim() || (hubArea === 'Bali' ? 'Denpasar' : 'Yogyakarta'),
        notes: notes.trim() || undefined,
        items: cart.map((c) => ({
          productName: c.productName,
          variantName: c.variantName,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          subtotal: c.subtotal,
        })),
        totalAmount: finalTotal,
        paymentMethod,
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
                {prod.variants.map((v) => (
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
                      <span className="text-[10px] text-gray-500">{v.weight || v.portion}</span>
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
                ))}
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
                      <div className="font-semibold text-[#111613] truncate">{it.productName}</div>
                      <div className="text-[10px] text-gray-500 truncate">{it.variantName}</div>
                      <div className="font-mono text-emerald-800 font-bold">
                        {formatIDR(it.unitPrice)}
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
                      <span className="font-mono font-bold w-6 text-center text-xs">
                        {it.quantity}
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

            {/* Payment Method Selector */}
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Metode Pembayaran:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Tunai', 'Transfer BCA', 'Transfer Mandiri', 'QRIS', 'Tempo B2B'] as const).map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m)
                        if (m === 'Tempo B2B') setPaymentStatus('TEMPO')
                        else setPaymentStatus('LUNAS')
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                        paymentMethod === m
                          ? 'bg-[#8C6B24] text-white border-[#8C6B24]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {m}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Amount Paid & Calculation (For Tunai or DP) */}
            <div className="space-y-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE4DC]">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Nominal Diterima / Dibayar:</span>
                <input
                  type="number"
                  placeholder={finalTotal.toString()}
                  value={paidAmountInput}
                  onChange={(e) => setPaidAmountInput(e.target.value)}
                  className="w-32 px-2.5 py-1 rounded-lg bg-white border border-[#D8CEBE] text-right font-mono font-bold text-xs focus:outline-none focus:border-[#C59B47]"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1.5 justify-end">
                {[finalTotal, 50000, 100000, 200000, 500000].map((pr, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePresetPay(pr)}
                    className="px-2 py-0.5 rounded bg-white border border-gray-300 text-[10px] text-gray-600 hover:bg-gray-100 font-mono"
                  >
                    {pr >= 1000 ? `${pr / 1000}k` : pr}
                  </button>
                ))}
              </div>

              {/* Dynamic Status: Kembalian vs Kurang Bayar (DP) */}
              <div className="pt-1.5 border-t border-gray-200">
                {isUnderpaid && paidAmount > 0 ? (
                  <div className="flex items-center justify-between font-mono font-bold text-xs text-amber-800">
                    <span>Sisa Tagihan (Status DP):</span>
                    <span>{formatIDR(shortfallAmount)}</span>
                  </div>
                ) : changeAmount > 0 ? (
                  <div className="flex items-center justify-between font-mono font-bold text-xs text-emerald-800">
                    <span>Uang Kembalian:</span>
                    <span>{formatIDR(changeAmount)}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between font-mono text-xs text-emerald-700 font-semibold">
                    <span>Status:</span>
                    <span>✓ Lunas (Uang Pas)</span>
                  </div>
                )}
              </div>
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
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
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
          <span className="text-xs font-semibold text-[#8C6B24] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#EAE4DC]">
            {recentOrders.filter((o) => o.source === 'POS' || o.referenceCode.includes('POS')).length} Transaksi POS
          </span>
        </div>

        {recentOrders.filter((o) => o.source === 'POS' || o.referenceCode.includes('POS')).length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            Belum ada transaksi dari kasir POS hari ini. Transaksi baru akan muncul di sini.
          </div>
        ) : (
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
                {recentOrders
                  .filter((o) => o.source === 'POS' || o.referenceCode.includes('POS'))
                  .slice(0, 10)
                  .map((ord) => (
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
                      <td className="py-3 px-3 whitespace-nowrap">
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
        )}
      </div>
    </div>
  )
}

