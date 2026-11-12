'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Snowflake,
  ShieldCheck,
  Truck,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Phone,
} from 'lucide-react'
import {
  CATALOG_PRODUCTS,
  RAW_PRODUCTS,
  CORPORATE_CONTACT,
  FOOTPRINT_LOCATIONS,
} from '@/lib/catalog-data'
import ProductCard from '@/components/commerce/ProductCard'
import { getStoredAttribution } from '@/lib/attribution'

export default function FrozenFoodPage() {
  const [selectedRaw, setSelectedRaw] = useState(RAW_PRODUCTS[0].name)
  const [rawName, setRawName] = useState('')
  const [rawPhone, setRawPhone] = useState('')
  const [rawBusinessType, setRawBusinessType] = useState('Restoran / Rumah Makan')
  const [rawCity, setRawCity] = useState('')
  const [rawQuantity, setRawQuantity] = useState('')
  const [rawNotes, setRawNotes] = useState('')
  const [rawMarketingName, setRawMarketingName] = useState('')

  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    text: string
    whatsappUrl?: string
  } | null>(null)

  const handleRawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawName || !rawPhone || !rawCity || !rawQuantity) {
      setFeedback({
        type: 'error',
        text: 'Mohon isi Nama, WhatsApp, Kota, dan Estimasi Kebutuhan.',
      })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      const attribution = getStoredAttribution()
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'RAW_INQUIRY',
          payload: {
            customerName: rawName,
            businessType: rawBusinessType,
            phone: rawPhone,
            city: rawCity,
            productRequested: selectedRaw,
            estimatedQuantity: rawQuantity,
            marketingName: rawMarketingName || undefined,
            notes: rawNotes,
          },
          attribution,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengirim formulir inquiry.')
      }

      setFeedback({
        type: 'success',
        text: `Inquiry berhasil dicatat dengan Nomor Referensi: ${data.referenceCode}. Mengarahkan ke WhatsApp sales...`,
        whatsappUrl: data.whatsappUrl,
      })

      if (data.whatsappUrl) {
        setTimeout(() => {
          window.open(data.whatsappUrl, '_blank')
        }, 1200)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala teknis.'
      setFeedback({
        type: 'error',
        text: `${msg} Silakan kontak manual via WhatsApp di ${CORPORATE_CONTACT.phone}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#FBF9F5] min-h-screen text-[#111613] pt-24 pb-20">
      {/* Hero Banner Frozen Food */}
      <section className="bg-white text-[#111613] py-20 sm:py-24 relative overflow-hidden border-b border-[#EAE4DC]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="block w-10 h-px bg-[#C59B47]" />
              <span className="text-[#9D772A] text-xs uppercase tracking-[0.3em] font-semibold">
                Divisi Komersial Pangan & Rantai Dingin
              </span>
            </div>
            <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111613] leading-tight">
              Katalog B2B{' '}
              <span className="gold-shimmer italic font-normal">HATOBA Frozen Food</span>
            </h1>
            <p className="text-[#48564F] text-base sm:text-lg leading-relaxed font-light">
              Pemasok terpercaya jeroan dan daging sapi higienis berstandar rantai dingin (-18°C) untuk
              Hotel, Restoran, Katering, dan Kafe (HORECA) dengan jangkauan operasional resmi di Bali &
              Yogyakarta.
            </p>
            <div className="pt-2 flex flex-wrap gap-6 text-xs">
              <div className="flex items-center gap-2 text-[#8C6B24]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B47]" />
                <span className="text-[#48564F]">Kemasan Vacuum Seal Kedap Udara</span>
              </div>
              <div className="flex items-center gap-2 text-[#8C6B24]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B47]" />
                <span className="text-[#48564F]">Pengiriman Rantai Dingin Terjadwal</span>
              </div>
              <div className="flex items-center gap-2 text-[#8C6B24]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B47]" />
                <span className="text-[#48564F]">Kemasan Bersertifikasi Halal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Packaged Catalog */}
      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EAE4DC] pb-6">
          <div>
            <h2 className="font-serif-title text-3xl font-bold text-[#111613]">
              Produk Siap Masak (Fixed Pack)
            </h2>
            <p className="text-[#5C6E65] text-sm mt-1">
              Pilih paket ritel atau grosir partai, masukkan ke keranjang, dan pesan langsung via WhatsApp.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={CORPORATE_CONTACT.catalogs.portrait}
              download
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C6B24] bg-white border border-[#D8CEBE] px-4 py-2.5 rounded-full hover:bg-[#FBF9F5] transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 text-[#8C6B24]" />
              <span>Unduh Brosur Emas (PDF)</span>
            </a>
          </div>
        </div>

        {/* 5 Certified Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATALOG_PRODUCTS.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Raw Materials Consultation Section (`RAW_INQUIRY`) */}
      <section id="bahan-mentah" className="bg-[#F7F4EE] text-[#111613] py-20 mt-12 border-t border-[#EAE4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Raw Explanation (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFE6] text-[#8C6B24] text-xs font-semibold uppercase tracking-wider border border-[#E2D6C5]">
                <span>Layanan Pasokan Industri</span>
              </div>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold leading-tight text-[#111613]">
                Permintaan Bahan Baku Mentah &{' '}
                <span className="gold-shimmer italic font-normal">Karkas Curah</span>
              </h2>
              <p className="text-[#48564F] text-sm leading-relaxed font-light">
                Untuk pengusaha katering, hotel bintang, dan industri olahan makanan yang memerlukan
                spesifikasi potongan khusus (custom cut) atau volume tonase mingguan/bulanan.
              </p>

              <div className="space-y-3 pt-2">
                <span className="text-xs uppercase tracking-wider text-[#8C6B24] font-bold block">
                  Komoditas Bahan Baku Tersedia:
                </span>
                {RAW_PRODUCTS.map((raw) => (
                  <div
                    key={raw.id}
                    className="p-3.5 rounded-xl bg-white border border-[#E8DFD5] text-xs flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <span className="font-bold text-[#111613] block">{raw.name}</span>
                      <span className="text-[#5C6E65]">{raw.category}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#8C6B24] bg-[#F5EFE6] px-2.5 py-1 rounded border border-[#E2D6C5]">
                      Inquiry B2B
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8DFD5] text-xs text-[#48564F] space-y-1 shadow-sm">
                <p className="font-semibold text-[#111613]">Ketentuan Harga Bahan Mentah:</p>
                <p>
                  Sesuai standar operasional, harga komoditas karkas mentah berfluktuasi mengikuti pasar
                  ternak hulu. Kami tidak mempublikasikan harga statis; penawaran harga terbaik dikonfirmasi
                  langsung oleh tim penjualan berdasarkan volume dan jadwal pengiriman Anda.
                </p>
              </div>
            </div>

            {/* Right Column: Inquiry Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#E2D6C5] shadow-xl shadow-stone-200/60">
              <h3 className="font-serif-title text-2xl font-bold text-[#111613] mb-2">
                Formulir Penawaran Bahan Mentah
              </h3>
              <p className="text-xs text-[#5C6E65] mb-6">
                Isi estimasi kebutuhan Anda untuk mendapatkan surat penawaran harga (quotation) resmi.
              </p>

              {feedback && (
                <div
                  className={`p-4 rounded-xl mb-6 text-xs flex items-start gap-3 ${
                    feedback.type === 'success'
                      ? 'bg-[#E8F4EE] text-[#1D6C48] border border-[#BCE2CD]'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#1D6C48]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  )}
                  <p className="font-semibold">{feedback.text}</p>
                </div>
              )}

              <form onSubmit={handleRawSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8C6B24] mb-1">
                    Pilih Bahan Baku yang Diminta: *
                  </label>
                  <select
                    value={selectedRaw}
                    onChange={(e) => setSelectedRaw(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-xs focus:outline-none focus:border-[#C59B47] focus:bg-white"
                  >
                    {RAW_PRODUCTS.map((r) => (
                      <option key={r.id} value={r.name} className="bg-white text-[#111613]">
                        {r.name} ({r.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#48564F] mb-1">Nama Pemohon: *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap"
                      value={rawName}
                      onChange={(e) => setRawName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-xs focus:outline-none focus:border-[#C59B47] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#48564F] mb-1">Nomor WhatsApp: *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0812xxxxxxx"
                      value={rawPhone}
                      onChange={(e) => setRawPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-xs focus:outline-none focus:border-[#C59B47] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#48564F] mb-1">Jenis Usaha: *</label>
                    <input
                      type="text"
                      required
                      placeholder="Restoran / Hotel / Katering"
                      value={rawBusinessType}
                      onChange={(e) => setRawBusinessType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-xs focus:outline-none focus:border-[#C59B47] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#48564F] mb-1">Kota / Hub Pengiriman: *</label>
                    <input
                      type="text"
                      required
                      placeholder="Denpasar / Yogyakarta"
                      value={rawCity}
                      onChange={(e) => setRawCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-xs focus:outline-none focus:border-[#C59B47] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#48564F] mb-1">
                    Estimasi Jumlah & Satuan Kebutuhan: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 50 kg per minggu / 200 kg kontrak bulanan"
                    value={rawQuantity}
                    onChange={(e) => setRawQuantity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-xs focus:outline-none focus:border-[#C59B47] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#48564F] mb-1">
                    Nama Tim Marketing (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="Nama perwakilan / referensi marketing (bila ada)"
                    value={rawMarketingName}
                    onChange={(e) => setRawMarketingName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-xs focus:outline-none focus:border-[#C59B47] focus:bg-white placeholder:text-gray-400"
                  />
                  <p className="text-[10px] text-[#718078] mt-1">
                    Diisi jika Anda memesan melalui rekomendasi staf marketing kami.
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-[#48564F] mb-1">Spesifikasi Tambahan:</label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Ketebalan potong, preferensi pengemasan curah, jadwal kirim subuh..."
                    value={rawNotes}
                    onChange={(e) => setRawNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-xs focus:outline-none focus:border-[#C59B47] focus:bg-white placeholder:text-gray-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-full font-bold text-white bg-crimson hover:bg-crimson-hover transition-all shadow-lg shadow-crimson/30 hover:shadow-crimson/50 flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
                  >
                    {loading ? (
                      <span className="animate-pulse">Menyiapkan Penawaran...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Chat Admin untuk Penawaran (WhatsApp)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

