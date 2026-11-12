'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Snowflake, ShieldCheck, FileText, ArrowRight } from 'lucide-react'
import { CATALOG_PRODUCTS, CORPORATE_CONTACT, ProductItem } from '@/lib/catalog-data'
import ProductCard from './ProductCard'

export default function ProductCatalogSection() {
  const [filter, setFilter] = useState<'ALL' | 'JEROAN' | 'IGA' | 'MIX'>('ALL')
  const [products, setProducts] = useState<ProductItem[]>(CATALOG_PRODUCTS)

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
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
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
