'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Snowflake, ShieldCheck, FileText, ArrowRight, MessageCircle, CheckSquare, Square } from 'lucide-react'
import { CATALOG_PRODUCTS, RAW_PRODUCTS, CORPORATE_CONTACT, ProductItem, formatRawInquiryWhatsApp } from '@/lib/catalog-data'
import ProductCard from './ProductCard'

export default function ProductCatalogSection() {
  const [filter, setFilter] = useState<'ALL' | 'JEROAN' | 'IGA' | 'MIX' | 'RAW'>('ALL')
  const [products, setProducts] = useState<ProductItem[]>(CATALOG_PRODUCTS)

  // State for Raw Product Interactive Quick Inquiry
  const [selectedRawIds, setSelectedRawIds] = useState<string[]>(['raw-paru-fresh-frozen', 'raw-babat-fresh-frozen'])
  const [rawEstQty, setRawEstQty] = useState<{ [id: string]: string }>({
    'raw-paru-fresh-frozen': '2 Dus',
    'raw-babat-fresh-frozen': '25 Kg',
    'raw-iga-fresh-frozen': '15 Kg',
  })
  const [rawCustomerName, setRawCustomerName] = useState('')
  const [rawCustomerCity, setRawCustomerCity] = useState('')

  useEffect(() => {
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products.filter((p: any) => p.isAvailable !== false))
        }
      })
      .catch(() => {})
  }, [])

  const filteredProducts = products.filter((prod) => {
    const cat = (prod.category || '').toLowerCase()
    const id = (prod.id || '').toLowerCase()
    if (filter === 'JEROAN') return cat.includes('jeroan') || id.includes('babat') || id.includes('iso') || id.includes('paru')
    if (filter === 'IGA') return cat.includes('daging') || cat.includes('iga') || id.includes('iga')
    if (filter === 'MIX') return cat.includes('mix') || cat.includes('kombinasi') || id.includes('mix')
    return true
  })

  const toggleRawSelect = (id: string) => {
    setSelectedRawIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSendRawInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedItems = RAW_PRODUCTS.filter((r) => selectedRawIds.includes(r.id)).map((r) => ({
      name: r.name,
      unitShort: r.unitShort,
      estQuantity: rawEstQty[r.id] || '',
    }))

    if (selectedItems.length === 0) {
      alert('Silakan pilih minimal 1 produk mentah yang ingin ditanyakan.')
      return
    }

    const waUrl = formatRawInquiryWhatsApp(selectedItems, {
      name: rawCustomerName || undefined,
      city: rawCustomerCity || undefined,
    })

    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="katalog-b2b" className="py-28 bg-[#FAF8F5] relative text-[#141615] overflow-hidden">
      <div id="katalog" className="absolute -top-24 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="block w-8 h-px bg-[#C59B47]/60" />
            <span className="text-[#9D772A] text-xs uppercase tracking-[0.3em] font-semibold">
              Katalog Komersial B2B & HORECA
            </span>
            <span className="block w-8 h-px bg-[#C59B47]/60" />
          </div>

          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141615] leading-tight">
            Produk Pilihan{' '}
            <span className="italic text-[#0D281E] font-normal">HATOBA Frozen Food</span>
          </h2>

          <div className="ornament-divider max-w-xs mx-auto my-4">
            <span className="text-[#C59B47] text-xs">✦</span>
          </div>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light">
            Dipersiapkan dengan standar higienis mutu tinggi, kemasan vacuum seal kedap udara, dan
            pembekuan alami pada suhu -18°C untuk menjaga keaslian nutrisi, aroma segar, dan cita rasa autentik Nusantara.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setFilter('ALL')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${filter === 'ALL'
                  ? 'bg-[#0D281E] text-white shadow-lg shadow-[#0D281E]/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              Semua Menu (5)
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setFilter('JEROAN')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${filter === 'JEROAN'
                  ? 'bg-[#0D281E] text-white shadow-lg shadow-[#0D281E]/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              Jeroan Olahan (Babat, Iso, Paru)
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setFilter('IGA')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${filter === 'IGA'
                  ? 'bg-[#0D281E] text-white shadow-lg shadow-[#0D281E]/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              Iga Sapi Premium
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setFilter('MIX')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${filter === 'MIX'
                  ? 'bg-[#0D281E] text-white shadow-lg shadow-[#0D281E]/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              Mix 4 Lauk Komplit
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setFilter('RAW')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${filter === 'RAW'
                  ? 'bg-amber-800 text-white shadow-lg shadow-amber-900/25'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                }`}
            >
              <span>🥩 Bahan Mentah (Harga Nego)</span>
            </button>
          </div>
        </div>

        {/* Product Cards Grid (Hidden when RAW filter is active) */}
        {filter !== 'RAW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

        {/* ======================= INTERACTIVE RAW PRODUCTS SECTION ======================= */}
        <div id="produk-mentah-inquiry" className={`rounded-3xl bg-white border-2 border-[#D8CEBE] p-6 sm:p-10 mb-16 shadow-xl shadow-stone-200/50 space-y-8 ${filter === 'RAW' ? 'ring-4 ring-amber-400/40' : ''}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EAE4DC] pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Harga Pasar Fluktuatif Harian</span>
              </div>
              <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#111613]">
                Bahan Baku Mentah Fresh Frozen (Babat, Paru Dus, Iga)
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm mt-1 max-w-2xl font-light">
                Karena harga komoditas daging mentah berfluktuasi harian mengikuti pasar hulu, harga tidak dicantumkan statis. Centang produk yang Anda butuhkan untuk langsung mendapatkan pricelist &amp; stok hari ini dari Admin via WhatsApp.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-cyan-900 bg-cyan-50 px-3 py-1.5 rounded-xl border border-cyan-200 flex-shrink-0">
              ❄️ Standar Cold Chain -18°C
            </span>
          </div>

          <form onSubmit={handleSendRawInquiry} className="space-y-6">
            {/* 3 Raw Products Interactive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {RAW_PRODUCTS.map((raw) => {
                const isSelected = selectedRawIds.includes(raw.id)
                return (
                  <div
                    key={raw.id}
                    onClick={() => toggleRawSelect(raw.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-[#FAF6EE] border-[#8C6B24] shadow-md shadow-amber-900/10'
                        : 'bg-[#FAF8F5] border-gray-200 hover:border-gray-300 opacity-80'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white border border-gray-300 text-gray-700">
                          Satuan: {raw.unitShort}
                        </span>
                        <div className="text-amber-800">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-amber-800" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-serif-title text-lg font-bold text-[#111613] leading-snug">
                          {raw.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                          {raw.description}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-gray-100 text-[11px] font-mono text-gray-600">
                        {raw.packagingNote}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-dashed border-gray-200" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                        Estimasi Kebutuhan:
                      </label>
                      <input
                        type="text"
                        value={rawEstQty[raw.id] || ''}
                        onChange={(e) => setRawEstQty({ ...rawEstQty, [raw.id]: e.target.value })}
                        placeholder={`Contoh: ${raw.unitShort === 'Dus' ? '2 Dus' : '25 Kg'}`}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs font-mono font-bold text-[#111613] focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Customer Contact & WhatsApp Trigger */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#111613] text-white flex flex-col lg:flex-row items-center justify-between gap-5">
              <div className="w-full lg:w-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-300 text-[11px] font-semibold mb-1">
                    Nama / Nama Usaha Anda:
                  </label>
                  <input
                    type="text"
                    value={rawCustomerName}
                    onChange={(e) => setRawCustomerName(e.target.value)}
                    placeholder="Contoh: RM Padang Minang / Resto Sedap"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-[11px] font-semibold mb-1">
                    Kota / Lokasi Pengiriman:
                  </label>
                  <input
                    type="text"
                    value={rawCustomerCity}
                    onChange={(e) => setRawCustomerCity(e.target.value)}
                    placeholder="Contoh: Yogyakarta / Denpasar / Luar Kota"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={selectedRawIds.length === 0}
                className="w-full lg:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Tanya Stok &amp; Pricelist ({selectedRawIds.length} Produk) via WhatsApp</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Editorial Banner (Download Catalog & Full Page Link) */}
        <div className="rounded-3xl bg-[#FAF8F5] border border-[#E2D6C5] p-8 sm:p-10 text-[#111613] flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-stone-200/50">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9D772A] block">
              Katalog Lengkap & Permintaan Karkas Mentah
            </span>
            <h3 className="font-serif-title text-2xl font-bold text-[#111613]">
              Butuh Pasokan Tonase Khusus atau Karkas Segar?
            </h3>
            <p className="text-[#48564F] text-xs sm:text-sm font-light max-w-xl">
              Selain produk fixed pack ritel & partai, kami melayani pemesanan karkas mentah dan jeroan segar partai besar dengan kontrak pasokan rutin khusus industri HORECA.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-shrink-0">
            <a
              href={CORPORATE_CONTACT.catalogs.portrait}
              download
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#C59B47] text-[#8C6B24] hover:text-[#111613] hover:bg-white bg-white/80 text-xs font-semibold transition-all shadow-sm"
            >
              <FileText className="w-4 h-4 text-[#8C6B24]" />
              <span>Unduh Katalog Produk (PDF)</span>
            </a>
            <Link
              href="/frozen-food"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-crimson hover:bg-crimson-hover text-white text-xs font-bold transition-all shadow-md shadow-crimson/25"
            >
              <span>Halaman Khusus Frozen Food</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
