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
  AlertTriangle,
  CheckCircle,
  MessageCircle,
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
      setErrorMsg('Mohon isi Nama, Nomor WhatsApp, dan Kota/Kecamatan pengiriman.')
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
          businessType: 'Restoran / Cafe',
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
      {/* Backdrop with fade animation */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Drawer Container - Mobile First (100% width on mobile, max-w-md on desktop) */}
      <aside
        aria-label="Keranjang Belanja"
        className="fixed inset-y-0 right-0 w-full sm:max-w-md md:max-w-lg bg-[#FAF8F5] shadow-2xl flex flex-col text-[#111613] z-50 overflow-hidden border-l border-[#E2D6C5] transition-transform duration-300 ease-out"
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#EAE4DC] flex items-center justify-between bg-white shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF4E8] border border-[#C59B47]/40 flex items-center justify-center text-[#9D772A] flex-shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#111613] leading-tight">
                Keranjang Pemesanan
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#5C6E65]">
                {totalCount} pack terpilih
              </p>
            </div>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setIsCartOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Tutup Keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {orderSuccess ? (
          <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-[#E8F4EE] flex items-center justify-center text-[#1D6C48] shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="font-serif-title text-xl sm:text-2xl font-bold text-[#111613]">
              Pesanan Berhasil Dicatat!
            </h4>
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-[#F2ECE1] border border-[#D8CEBE] text-xs font-mono font-bold text-[#8C6B24]">
              No. Ref: {orderSuccess.referenceCode}
            </div>
            <p className="text-xs sm:text-sm text-[#5C6E65] leading-relaxed max-w-xs">
              Rincian pesanan Anda telah tersimpan resmi di sistem HATOBA. Halaman WhatsApp akan terbuka untuk verifikasi ketersediaan stok &amp; jadwal pengiriman.
            </p>
            <div className="w-full max-w-xs pt-2 space-y-2">
              <a
                href={orderSuccess.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-full text-xs sm:text-sm font-bold text-white bg-crimson hover:bg-crimson-hover shadow-lg shadow-crimson/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Buka Chat WhatsApp</span>
              </a>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setOrderSuccess(null)
                  setIsCartOpen(false)
                }}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        ) : (
          /* Main Content: Scrollable Area */
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {items.length === 0 ? (
              <div className="p-6 py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF4E8] flex items-center justify-center text-gray-400 border border-[#EAE2D5]">
                  <ShoppingBag className="w-8 h-8 text-[#C59B47]" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#111613]">Keranjang pesanan masih kosong</p>
                  <p className="text-xs text-[#718078] max-w-xs mx-auto leading-relaxed">
                    Pilih produk jeroan dan daging sapi beku higienis dari katalog HATOBA untuk memulai order.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/frozen-food#katalog"
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold hover:bg-amber-400 text-obsidian-950 font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lihat Menu &amp; Pesan Produk</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 space-y-4">
                {/* Action Bar: Tambah Produk & Kosongkan */}
                <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-white border border-[#EAE2D5] shadow-xs">
                  <Link
                    href="/frozen-food#katalog"
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C6B24] hover:text-[#111613] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Menu Lain</span>
                  </Link>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={clearCart}
                    className="text-[11px] text-gray-400 hover:text-crimson transition-colors"
                  >
                    Kosongkan
                  </button>
                </div>

                {/* List Items */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const isPartai = item.packType === 'partai' || item.variantId.includes('partai')
                    const isDiscountActive = isPartai && item.quantity >= 5

                    return (
                      <div
                        key={`${item.productId}-${item.variantId}`}
                        className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EAE2D5] shadow-xs flex flex-col gap-2.5 transition-all"
                      >
                        {/* Top: Image + Info + Trash Button */}
                        <div className="flex items-start gap-3">
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#FAF8F5] overflow-hidden flex-shrink-0 border border-[#EAE4DC]">
                            <Image
                              src={item.packagingImage}
                              alt={item.productName}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0 pr-1">
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="text-xs sm:text-sm font-bold text-[#111613] truncate leading-snug">
                                {item.productName}
                              </h5>
                              <button
                                type="button"
                                suppressHydrationWarning
                                onClick={() => removeItem(item.productId, item.variantId)}
                                className="p-1 -mr-1 -mt-0.5 text-gray-400 hover:text-crimson active:scale-90 transition-colors flex-shrink-0"
                                aria-label="Hapus item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[11px] text-[#8C6B24] font-semibold">
                                {item.variantName}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-[11px] text-[#5C6E65] font-mono">
                                {formatRupiah(item.price)}/pk
                              </span>
                            </div>

                            {/* Info Skema Diskon Partai */}
                            {isPartai && (
                              <div className="mt-1">
                                {isDiscountActive ? (
                                  <span className="inline-block text-[9px] sm:text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200/60">
                                    ✓ Diskon Rp 10.000/pk aktif ({item.quantity} pk)
                                  </span>
                                ) : (
                                  <span className="inline-block text-[9px] sm:text-[10px] bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded-md border border-amber-200/60">
                                    Tambah {5 - item.quantity} pk lagi untuk diskon Rp 10.000/pk
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom: Stepper Quantity & Subtotal Item */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          {/* Stepper */}
                          <div className="flex items-center border border-[#D8CEBE] rounded-xl bg-[#FAF8F5] p-0.5 shadow-2xs">
                            <button
                              type="button"
                              suppressHydrationWarning
                              onClick={() => {
                                if (item.quantity <= (item.minQty || 1)) {
                                  removeItem(item.productId, item.variantId)
                                } else {
                                  updateQuantity(item.productId, item.variantId, item.quantity - 1)
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-gray-700 active:scale-90 transition-colors"
                              aria-label="Kurangi jumlah"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-bold text-[#111613]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              suppressHydrationWarning
                              onClick={() =>
                                updateQuantity(item.productId, item.variantId, item.quantity + 1)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-gray-700 active:scale-90 transition-colors"
                              aria-label="Tambah jumlah"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 block -mb-0.5">Subtotal</span>
                            <span className="text-xs sm:text-sm font-bold text-[#111613] font-mono">
                              {formatRupiah(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Total Estimasi Belanja */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EAE2D5] shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#5C6E65] block">Total Estimasi Produk:</span>
                    <span className="text-[10px] text-gray-400">({totalCount} pack total)</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-emerald-800 font-mono">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>

                {/* Form Data Pemesan */}
                <form onSubmit={handleCheckout} className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8C6B24]">
                      Data Pengiriman &amp; Pemesan
                    </h4>
                    <span className="text-[10px] text-gray-400">* Wajib diisi</span>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-snug">
                      {errorMsg}
                    </div>
                  )}

                  {/* Field Nama */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#48564F] mb-1">
                      Nama Pemesan / PIC: *
                    </label>
                    <input
                      type="text"
                      required
                      suppressHydrationWarning
                      placeholder="Nama lengkap Anda"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C59B47]/20 focus:border-[#C59B47] transition-all shadow-2xs"
                    />
                  </div>

                  {/* Responsive Row: Nama Usaha & WhatsApp (Stacked on small mobile, 2-cols on tablet+) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#48564F] mb-1">
                        Nama Usaha: <span className="text-gray-400 font-normal">(Opsional)</span>
                      </label>
                      <input
                        type="text"
                        suppressHydrationWarning
                        placeholder="Resto / Katering / Pribadi"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C59B47]/20 focus:border-[#C59B47] transition-all shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#48564F] mb-1">
                        Nomor WhatsApp: *
                      </label>
                      <input
                        type="tel"
                        required
                        suppressHydrationWarning
                        placeholder="Contoh: 08123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C59B47]/20 focus:border-[#C59B47] transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Service Area Selector */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#48564F] mb-1">
                      Hub Layanan Pengiriman: *
                    </label>
                    <div className="relative">
                      <select
                        value={hubArea}
                        suppressHydrationWarning
                        onChange={(e) =>
                          setHubArea(e.target.value as 'Bali' | 'Yogyakarta' | 'Luar Area Layanan')
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] focus:outline-none focus:ring-2 focus:ring-[#C59B47]/20 focus:border-[#C59B47] transition-all appearance-none shadow-2xs cursor-pointer"
                      >
                        <option value="Bali">Hub Bali (Denpasar, Badung, Gianyar, Tabanan dsk)</option>
                        <option value="Yogyakarta">Hub Yogyakarta (Sleman, Kota Jogja, Bantul dsk)</option>
                        <option value="Luar Area Layanan">Luar Area (Kargo Beku Port-to-Port / Khusus)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {hubArea === 'Luar Area Layanan' && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        Pengiriman reguler saat ini berpusat di Bali &amp; Yogyakarta. Pengiriman ke luar area dilayani via ekspedisi thermo/frozen kargo.
                      </span>
                    </div>
                  )}

                  {/* Kota / Kecamatan */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#48564F] mb-1">
                      Kota / Kecamatan Pengiriman: *
                    </label>
                    <input
                      type="text"
                      required
                      suppressHydrationWarning
                      placeholder="Contoh: Kuta Selatan, Badung / Sleman"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C59B47]/20 focus:border-[#C59B47] transition-all shadow-2xs"
                    />
                  </div>

                  {/* Catatan Tambahan */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#48564F] mb-1">
                      Catatan Pengiriman: <span className="text-gray-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      suppressHydrationWarning
                      placeholder="Waktu terima, patokan lokasi, dll"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#111613] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C59B47]/20 focus:border-[#C59B47] transition-all shadow-2xs"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 pb-6 space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      suppressHydrationWarning
                      className="w-full min-h-[48px] py-3.5 px-4 rounded-full text-xs sm:text-sm font-bold text-white bg-crimson hover:bg-crimson-hover shadow-lg shadow-crimson/25 hover:shadow-crimson/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="animate-pulse">Menyimpan &amp; Membuka WhatsApp...</span>
                      ) : (
                        <>
                          <span>Lanjut ke WhatsApp ({formatRupiah(totalAmount)})</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <Link
                      href="/frozen-food#katalog"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-2.5 px-4 rounded-full border border-[#C59B47] text-[#8C6B24] hover:bg-[#FAF4E8] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Menu Lain dari Katalog</span>
                    </Link>

                    <p className="text-[10px] text-gray-500 text-center pt-1 leading-snug">
                      Harga final &amp; jadwal kurir dikonfirmasi oleh staf operasional HATOBA via WhatsApp resmi.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
