'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Snowflake,
  UtensilsCrossed,
  Wheat,
  Clock,
  ArrowUpRight,
  X,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { BUSINESS_UNITS, BusinessUnit } from '@/lib/catalog-data'

export default function BentoEcosystem() {
  const [activeModalUnit, setActiveModalUnit] = useState<BusinessUnit | null>(null)

  const getUnitIcon = (code: string) => {
    switch (code) {
      case 'FROZEN_FOOD':
        return <Snowflake className="w-6 h-6 text-gold" />
      case 'CULINARY':
        return <UtensilsCrossed className="w-6 h-6 text-gold" />
      case 'AGRO_LIVESTOCK':
        return <Wheat className="w-6 h-6 text-amber-400" />
      default:
        return <Snowflake className="w-6 h-6 text-gold" />
    }
  }

  return (
    <section id="ekosistem" className="py-28 bg-[#F7F4EE] relative overflow-hidden border-t border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="block w-8 h-px bg-[#C59B47]/60" />
            <span className="text-[#9D772A] text-xs uppercase tracking-[0.3em] font-semibold">
              Sinergi Hulu ke Hilir
            </span>
            <span className="block w-8 h-px bg-[#C59B47]/60" />
          </div>

          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111613] leading-tight">
            Ekosistem &{' '}
            <span className="italic gold-shimmer font-normal">Pilar Bisnis Terpadu</span>
          </h2>

          <div className="ornament-divider max-w-xs mx-auto my-4">
            <span className="text-[#C59B47] text-xs">✦</span>
          </div>

          <p className="text-[#48564F] text-sm sm:text-base leading-relaxed font-light">
            Menghubungkan rantai nilai komprehensif mulai dari hulu peternakan mandiri, rantai pasok beku bersuhu terkendali,
            hingga etalase jaringan restoran autentik Nusantara.
          </p>
        </div>

        {/* 3 Executive Pillar Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Pillar 1: HATOBA Frozen Food (Flagship Hero Card - 12 Cols) */}
          <div className="lg:col-span-12 rounded-3xl bg-white border border-[#E2D6C5] p-8 sm:p-10 shadow-xl shadow-stone-200/70 relative overflow-hidden luxury-card">
            {/* Watermark Numeral */}
            <span className="absolute -top-4 -right-2 text-8xl sm:text-9xl font-bold font-serif-title text-black/[0.04] select-none pointer-events-none">
              01
            </span>

            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F5EFE6] flex items-center justify-center border border-[#E2D6C5] text-[#9D772A] shadow-sm">
                    {getUnitIcon(BUSINESS_UNITS[0].code)}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#9D772A] font-semibold block">
                      Pilar Utama • Rantai Pasok Pangan
                    </span>
                    <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#111613]">
                      {BUSINESS_UNITS[0].name}
                    </h3>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E8F4EE] text-[#1D6C48] border border-[#BCE2CD] font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#1D6C48]" />
                  Operasional Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <p className="text-sm sm:text-base text-[#48564F] leading-relaxed font-light">
                    {BUSINESS_UNITS[0].description}
                  </p>
                  <blockquote className="border-l-2 border-[#C59B47] pl-4 text-xs italic text-[#5C6E65] font-serif-title">
                    &ldquo;Menghadirkan jeroan dan daging sapi olahan berstandar higienis vacuum sealed untuk memenuhi kebutuhan hotel, restoran, dan katering di Bali & Yogyakarta.&rdquo;
                  </blockquote>
                </div>

                <div className="lg:col-span-5 bg-[#FAF8F5] p-6 rounded-2xl border border-[#EAE4DC] space-y-3">
                  <div className="text-xs font-semibold text-[#8C6B24] uppercase tracking-wider">
                    Keunggulan Rantai Dingin:
                  </div>
                  <div className="space-y-2">
                    {BUSINESS_UNITS[0].highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#3E4D45]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C59B47] flex-shrink-0 mt-1.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics & Actions Bar */}
              <div className="pt-6 border-t border-[#F0EAE1] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-6 text-xs text-[#5C6E65]">
                  {BUSINESS_UNITS[0].metrics.map((m, idx) => (
                    <div key={idx}>
                      <span className="block text-[10px] uppercase text-[#718078] tracking-wider">{m.label}</span>
                      <span className="font-semibold text-[#111613] text-sm font-serif-title">{m.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setActiveModalUnit(BUSINESS_UNITS[0])}
                    className="px-5 py-2.5 text-xs text-[#2D3A32] hover:text-[#111613] border border-[#D8CEBE] hover:border-[#C59B47] rounded-full transition-colors font-medium bg-[#FAF8F5]"
                  >
                    Rincian Divisi
                  </button>
                  <Link
                    href="/frozen-food"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-crimson hover:bg-crimson-hover shadow-md shadow-crimson/25 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Buka Katalog B2B</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 2: HATOBA Culinary & Resto (6 Cols) */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-[#E8DFD5] hover:border-[#C59B47]/60 p-8 flex flex-col justify-between shadow-lg shadow-stone-200/50 relative overflow-hidden luxury-card">
            {/* Watermark Numeral */}
            <span className="absolute -top-4 -right-2 text-8xl font-bold font-serif-title text-black/[0.04] select-none pointer-events-none">
              02
            </span>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F5EFE6] flex items-center justify-center border border-[#E2D6C5] text-[#9D772A]">
                  {getUnitIcon(BUSINESS_UNITS[1].code)}
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F5EFE6] text-[#8C6B24] border border-[#E2D6C5] font-mono">
                  <Clock className="w-3 h-3" />
                  Tahap Pengembangan
                </span>
              </div>

              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9D772A] font-semibold block mb-1">
                Pilar Hilir • Jaringan Kuliner Ritel
              </span>
              <h3 className="font-serif-title text-2xl font-bold text-[#111613] mb-2">
                {BUSINESS_UNITS[1].name}
              </h3>
              <p className="text-xs text-[#5C6E65] italic mb-4 font-serif-title">
                {BUSINESS_UNITS[1].tagline}
              </p>
              <p className="text-sm text-[#48564F] leading-relaxed mb-6 font-light">
                {BUSINESS_UNITS[1].description}
              </p>

              <div className="space-y-2 mb-6">
                {BUSINESS_UNITS[1].highlights.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#3E4D45]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C59B47] flex-shrink-0 mt-1.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-[#F0EAE1] flex items-center justify-between">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setActiveModalUnit(BUSINESS_UNITS[1])}
                className="text-xs text-[#8C6B24] hover:underline font-semibold flex items-center gap-1"
              >
                Pelajari Konsep Resto
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/#kontak-form"
                className="text-xs text-[#2D3A32] hover:text-[#111613] border border-[#D8CEBE] hover:border-[#C59B47] px-4 py-2 rounded-full transition-colors bg-[#FAF8F5]"
              >
                Kemitraan Resto
              </Link>
            </div>
          </div>

          {/* Pillar 3: HATOBA Agro & Livestock (6 Cols) */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-[#E8DFD5] hover:border-[#C59B47]/60 p-8 flex flex-col justify-between shadow-lg shadow-stone-200/50 relative overflow-hidden luxury-card">
            {/* Watermark Numeral */}
            <span className="absolute -top-4 -right-2 text-8xl font-bold font-serif-title text-black/[0.04] select-none pointer-events-none">
              03
            </span>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] flex items-center justify-center border border-[#F2DEB0] text-[#B37A12]">
                  {getUnitIcon(BUSINESS_UNITS[2].code)}
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FFF8E7] text-[#B37A12] border border-[#F2DEB0] font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#B37A12]" />
                  Ekspansi Hulu
                </span>
              </div>

              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B37A12] font-semibold block mb-1">
                Pilar Hulu • Peternakan Terpadu
              </span>
              <h3 className="font-serif-title text-2xl font-bold text-[#111613] mb-2">
                {BUSINESS_UNITS[2].name}
              </h3>
              <p className="text-xs text-[#5C6E65] italic mb-4 font-serif-title">
                {BUSINESS_UNITS[2].tagline}
              </p>
              <p className="text-sm text-[#48564F] leading-relaxed mb-6 font-light">
                {BUSINESS_UNITS[2].description}
              </p>

              <div className="space-y-2 mb-6">
                {BUSINESS_UNITS[2].highlights.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#3E4D45]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B37A12] flex-shrink-0 mt-1.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-[#F0EAE1] flex items-center justify-between">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setActiveModalUnit(BUSINESS_UNITS[2])}
                className="text-xs text-[#B37A12] hover:underline font-semibold flex items-center gap-1"
              >
                Jaringan Peternakan
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/#kontak-form"
                className="text-xs text-[#2D3A32] hover:text-[#111613] border border-[#D8CEBE] hover:border-[#B37A12] px-4 py-2 rounded-full transition-colors bg-[#FAF8F5]"
              >
                Kerja Sama Peternak
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Detail Modal */}
      {activeModalUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white border border-[#E2D6C5] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#111613]">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveModalUnit(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F5EFE6] flex items-center justify-center border border-[#E2D6C5]">
                {getUnitIcon(activeModalUnit.code)}
              </div>
              <div>
                <span className="text-[10px] text-[#9D772A] uppercase tracking-wider font-semibold block">
                  {activeModalUnit.badge}
                </span>
                <h4 className="font-serif-title text-2xl font-bold">{activeModalUnit.name}</h4>
              </div>
            </div>

            <p className="text-sm text-[#48564F] leading-relaxed mb-6 font-light">
              {activeModalUnit.description}
            </p>

            <div className="space-y-3 mb-6 bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE4DC]">
              <h5 className="text-xs font-semibold text-[#8C6B24] uppercase tracking-wider">
                Rencana & Nilai Strategis Divisi:
              </h5>
              <div className="space-y-2">
                {activeModalUnit.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#3E4D45]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C59B47] flex-shrink-0 mt-1.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EAE1]">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setActiveModalUnit(null)}
                className="px-5 py-2.5 rounded-full text-xs text-[#5C6E65] hover:text-[#111613] border border-[#D8CEBE] transition-colors"
              >
                Tutup
              </button>
              <Link
                href={activeModalUnit.ctaHref}
                onClick={() => setActiveModalUnit(null)}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-crimson hover:bg-crimson-hover shadow-md transition-all"
              >
                {activeModalUnit.ctaText}
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
