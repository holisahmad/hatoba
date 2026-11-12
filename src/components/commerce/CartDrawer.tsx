'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  Utensils,
  AlertTriangle,
  CheckCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatRupiah } from '@/lib/whatsapp'
import { getStoredAttribution } from '@/lib/attribution'

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    totalAmount,
    totalCount,
    clearCart,
  } = useCart()

  const [customerName, setCustomerName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('Restoran / Cafe')
  const [phone, setPhone] = useState('')
  const [hubArea, setHubArea] = useState<'Bali' | 'Yogyakarta' | 'Luar Area Layanan'>('Bali')
  const [city, setCity] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [orderSuccess, setOrderSuccess] = useState<{
    referenceCode: string
    whatsappUrl: string
  } | null>(null)

  if (!isCartOpen) return null

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !phone || !city) {
      setErrorMsg('Mohon isi Nama, Nomor WhatsApp, dan Kota pengiriman.')
      return
    }

    if (items.length === 0) {
      setErrorMsg('Keranjang belanja masih kosong.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const attribution = getStoredAttribution()
      const payload = {
        order: {
          customerName,
          businessName,
          businessType,
          phone,
          hubArea,
          city,
          notes,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        },
        attribution,
      }

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses pesanan.')
      }

      setOrderSuccess({
        referenceCode: data.referenceCode,
        whatsappUrl: data.whatsappUrl,
      })

      clearCart()

      // Redirect to WhatsApp
      if (data.whatsappUrl) {
        setTimeout(() => {
          window.open(data.whatsappUrl, '_blank')
        }, 1200)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses pesanan.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E2D6C5] shadow-2xl flex flex-col text-[#111613]">
          {/* Header */}
          <div className="p-6 border-b border-[#EAE4DC] flex items-center justify-between bg-[#FBF9F5]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8C6B24]" />
              <h3 className="font-serif-title text-lg font-bold text-[#111613]">
                Keranjang Pemesanan B2B
              </h3>
              <span className="text-xs bg-[#F2ECE1] text-[#8C6B24] px-2 py-0.5 rounded-full font-mono font-bold border border-[#D8CEBE]">
                {totalCount}
              </span>
            </div>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {orderSuccess ? (
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E8F4EE] flex items-center justify-center text-[#1D6C48]">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="font-serif-title text-2xl font-bold text-[#111613]">
                Pesanan Berhasil Dicatat!
              </h4>
              <p className="text-xs font-mono text-[#8C6B24] bg-[#F5EFE6] px-3 py-1.5 rounded-full border border-[#E2D6C5]">
                Nomor Pesanan: {orderSuccess.referenceCode}
              </p>
              <p className="text-xs text-[#5C6E65] leading-relaxed max-w-xs">
                Rincian pesanan Anda telah tersimpan secara resmi di server HATOBA. Halaman WhatsApp akan
                terbuka untuk verifikasi ketersediaan stok dengan admin operasional kami.
              </p>
              <a
                href={orderSuccess.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full text-xs font-bold text-white bg-crimson hover:bg-crimson-hover shadow-lg transition-all"
              >
                Buka Chat WhatsApp Sekarang
              </a>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setOrderSuccess(null)
                  setIsCartOpen(false)
                }}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                Tutup Jendela
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <ShoppingBag className="w-12 h-12 mx-auto text-gray-400" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#111613]">Keranjang pesanan masih kosong.</p>
                      <p className="text-xs text-[#718078] max-w-xs mx-auto">
                        Pilih produk jeroan & daging sapi dari menu katalog HATOBA Frozen Food untuk memulai pesanan.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href="/frozen-food#katalog"
                        onClick={() => setIsCartOpen(false)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C59B47] text-white font-bold text-xs hover:bg-[#8C6B24] transition-all shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Buka Menu & Tambah Produk</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Action Bar: Tambah Produk Baru & Kosongkan */}
                    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#E2D6C5]">
                      <Link
                        href="/frozen-food#katalog"
                        onClick={() => setIsCartOpen(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C6B24] hover:text-[#111613] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Tambah / Ganti Menu Lain</span>
                      </Link>
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={clearCart}
                        className="text-[11px] text-gray-400 hover:text-crimson transition-colors"
                      >
                        Hapus Semua
                      </button>
                    </div>

                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId}`}
                        className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8DFD5] flex gap-3 relative group shadow-sm"
                      >
                        <div className="relative w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-[#EAE4DC]">
                          <Image
                            src={item.packagingImage}
                            alt={item.productName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-[#111613] truncate">{item.productName}</h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[#8C6B24] font-medium">{item.variantName}</span>
                            <span className="text-gray-300">•</span>
                            <Link
                              href={`/frozen-food#${item.productId}`}
                              onClick={() => setIsCartOpen(false)}
                              className="text-[10px] text-gray-500 hover:text-[#8C6B24] flex items-center gap-0.5 underline transition-colors"
                            >
                              <span>Ganti</span>
                              <ArrowUpRight className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                          <p className="text-[11px] text-[#5C6E65] mt-0.5">
                            {formatRupiah(item.price)} / pack
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-[#D8CEBE]">
                              <button
                                type="button"
                                suppressHydrationWarning
                                onClick={() =>
                                  updateQuantity(item.productId, item.variantId, item.quantity - 1)
                                }
                                className="p-1 hover:text-[#8C6B24] text-gray-500"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-mono font-bold px-1.5 text-[#111613]">{item.quantity}</span>
                              <button
                                type="button"
                                suppressHydrationWarning
                                onClick={() =>
                                  updateQuantity(item.productId, item.variantId, item.quantity + 1)
                                }
                                className="p-1 hover:text-[#8C6B24] text-gray-500"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-bold text-[#111613] font-mono">
                              {formatRupiah(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-crimson transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {/* Subtotal Display */}
                {items.length > 0 && (
                  <div className="pt-4 border-t border-[#EAE4DC] flex items-center justify-between">
                    <span className="text-xs text-[#5C6E65]">Total Estimasi Produk:</span>
                    <span className="text-lg font-bold text-[#8C6B24] font-mono">
                      {formatRupiah(totalAmount)}
                    </span>
                  </div>
                )}

                {/* Checkout Fields */}
                {items.length > 0 && (
                  <form onSubmit={handleCheckout} className="pt-6 border-t border-[#EAE4DC] space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C6B24]">
                      Data Pemesan & Pengiriman
                    </h4>

                    {errorMsg && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                        {errorMsg}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] text-[#48564F] mb-1">Nama Pemesan: *</label>
                      <input
                        type="text"
                        required
                        suppressHydrationWarning
                        placeholder="Nama Lengkap / PIC"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47] focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-[#48564F] mb-1">Nama Usaha:</label>
                        <input
                          type="text"
                          suppressHydrationWarning
                          placeholder="Resto / Katering (Opsional)"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#48564F] mb-1">Nomor WhatsApp: *</label>
                        <input
                          type="tel"
                          required
                          suppressHydrationWarning
                          placeholder="0812xxxxxxx"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Service Area Selector */}
                    <div>
                      <label className="block text-[11px] text-[#48564F] mb-1">Hub Layanan: *</label>
                      <select
                        value={hubArea}
                        suppressHydrationWarning
                        onChange={(e) =>
                          setHubArea(e.target.value as 'Bali' | 'Yogyakarta' | 'Luar Area Layanan')
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47] focus:bg-white"
                      >
                        <option value="Bali">Hub Bali (Denpasar, Badung, Gianyar dsk)</option>
                        <option value="Yogyakarta">Hub Yogyakarta (Sleman, Jogja, Bantul dsk)</option>
                        <option value="Luar Area Layanan">Luar Area (Perlu Konfirmasi Kargo)</option>
                      </select>
                    </div>

                    {hubArea === 'Luar Area Layanan' && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                        <span>
                          Pengiriman reguler saat ini berpusat di Bali & Yogyakarta. Pengiriman ke kota lain
                          memerlukan penyesuaian kargo beku khusus.
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] text-[#48564F] mb-1">Kota / Kecamatan: *</label>
                      <input
                        type="text"
                        required
                        suppressHydrationWarning
                        placeholder="Contoh: Denpasar Selatan"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#48564F] mb-1">Catatan Pengiriman:</label>
                      <input
                        type="text"
                        suppressHydrationWarning
                        placeholder="Jam kirim atau instruksi khusus (opsional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:border-[#C59B47] focus:bg-white"
                      />
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        type="submit"
                        disabled={loading}
                        suppressHydrationWarning
                        className="w-full py-3.5 rounded-full text-xs font-bold text-white bg-crimson hover:bg-crimson-hover shadow-lg shadow-crimson/25 hover:shadow-crimson/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="animate-pulse">Menyimpan & Mengalihkan...</span>
                        ) : (
                          <>
                            <span>Proses Pesanan & Lanjutkan ke WhatsApp</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <Link
                        href="/frozen-food#katalog"
                        onClick={() => setIsCartOpen(false)}
                        className="w-full py-2.5 rounded-full border border-[#C59B47] text-[#8C6B24] hover:bg-[#FAF8F5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Produk Lain dari Menu</span>
                      </Link>
                    </div>

                    <p className="text-[10px] text-gray-500 text-center">
                      Harga final dan ongkos kirim dikonfirmasi oleh staf admin via WhatsApp.
                    </p>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

