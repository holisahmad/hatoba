'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Download, FileText, CheckCircle2 } from 'lucide-react'
import { CORPORATE_CONTACT } from '@/lib/catalog-data'

export default function HeroCorporate() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FBF9F5] pt-32 pb-28">
      {/* ── Background: Warm subtle ivory sheen ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F4EE] via-[#FBF9F5] to-[#F5F1E9]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#EFE8DC]/60 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F5] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Editorial Corporate Copy (7 cols) */}
          <div className="lg:col-span-7 text-left">
            {/* Eyebrow tag with horizontal line */}
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-10 h-px bg-[#C59B47]" />
              <span className="text-[#9D772A] text-xs uppercase tracking-[0.3em] font-semibold">
                Holding Group & Ekosistem Bisnis Terpadu
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-bold text-[#111613] tracking-tight leading-[1.12] mb-6">
              Membangun Ekosistem Bisnis,
              <br />
              <span className="italic gold-shimmer font-normal">Terintegrasi</span> & Berkelanjutan
            </h1>

            {/* Sub-headline */}
            <p className="text-[#48564F] text-base sm:text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl">
              HATOBA Group mengakselerasi pertumbuhan lintas sektor melalui sinergi rantai pasok pangan higienis,
              jaringan ritel kuliner autentik, dan agribisnis peternakan terintegrasi dari hulu hingga ke hilir.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 mb-10">
              <Link
                href="/#ekosistem"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-semibold text-white bg-crimson hover:bg-crimson-hover transition-all duration-300 shadow-xl shadow-crimson/25 hover:shadow-crimson/40 hover:-translate-y-0.5 tracking-wide text-sm"
              >
                <span>Jelajahi Unit Bisnis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={CORPORATE_CONTACT.catalogs.portrait}
                download
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-[#8C6B24] hover:text-[#111613] border border-[#C59B47] hover:border-[#8C6B24] hover:bg-[#F2ECE1] transition-all duration-300 bg-white/80 shadow-sm text-sm tracking-wide"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Company Profile (PDF)</span>
              </a>
            </div>

            {/* Trust Quote / Micro-statement */}
            <div className="border-l-2 border-[#C59B47] pl-4 text-xs text-[#5C6E65] italic">
              &ldquo;Menjaga integritas rantai pasok dari hulu peternakan hingga meja pelanggan dengan standar mutu tertinggi.&rdquo;
            </div>
          </div>

          {/* Right: Editorial Lookbook Frame (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative gold frame */}
              <div className="absolute -top-4 -left-4 w-40 h-40 border-2 border-[#C59B47]/30 rounded-3xl z-0 hidden sm:block pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-40 h-40 border-2 border-[#C59B47]/20 rounded-3xl z-0 hidden sm:block pointer-events-none" />

              {/* Main Lookbook Showcase Card */}
              <div className="relative z-10 rounded-3xl bg-white border border-[#E8DFD5] p-6 sm:p-7 shadow-xl shadow-stone-200/70 overflow-hidden luxury-card">
                
                {/* Header of card */}
                <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#9D772A] border border-[#E2D6C5]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#9D772A] font-semibold">
                        Unit Bisnis Utama
                      </span>
                      <h4 className="text-sm font-bold text-[#111613] font-serif-title">
                        HATOBA Frozen Food
                      </h4>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#E8F4EE] text-[#1D6C48] border border-[#BCE2CD] font-semibold">
                    Operasional Aktif
                  </span>
                </div>

                {/* Hero Product Photo */}
                <div className="relative my-5 aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 border border-[#E8DFD5] group">
                  <Image
                    src="/images/products/kemasan-iga.png"
                    alt="Kemasan Iga Sapi Frozen HATOBA Vacuum Seal -18C"
                    fill
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between text-white">
                    <div>
                      <span className="text-xs font-semibold block">
                        Iga Sapi Pilihan Vacuum Sealed
                      </span>
                      <span className="text-[10px] text-gray-300">
                        Standar Higienis HORECA • Alami & Segar
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#F5D895] font-mono px-2 py-0.5 rounded bg-black/40 border border-gold/40">
                      -18°C
                    </span>
                  </div>
                </div>

                {/* Micro specs */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
                    <span className="text-[10px] text-[#718078] uppercase tracking-wider block">Katalog Ritel</span>
                    <span className="text-xs font-semibold text-[#111613]">5 Varian Siap Kirim</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
                    <span className="text-[10px] text-[#718078] uppercase tracking-wider block">Wilayah Hub</span>
                    <span className="text-xs font-semibold text-[#8C6B24]">Bali & Yogyakarta</span>
                  </div>
                </div>

                {/* Bottom link to B2B Catalog */}
                <Link
                  href="/frozen-food"
                  className="w-full py-3 rounded-xl bg-[#F5EFE6] hover:bg-[#ECE3D5] border border-[#D8CEBE] text-xs font-bold text-[#7A5B18] hover:text-[#111613] flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Buka Katalog Produk B2B</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Floating Small Accent Card */}
              <div className="absolute -bottom-5 -left-5 hidden sm:block p-3.5 rounded-2xl bg-white/95 border border-[#D8CEBE] shadow-xl backdrop-blur-md max-w-[210px] z-20">
                <span className="text-[10px] font-bold text-[#9D772A] uppercase tracking-wider block mb-0.5">
                  Roadmap 2027
                </span>
                <p className="text-[11px] text-[#48564F] leading-snug">
                  Persiapan Hub Distribusi Baru di Koridor Jawa Barat (Bandung).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar at bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="bg-white/95 backdrop-blur-md border-t border-x border-[#EAE4DC] rounded-t-2xl px-6 sm:px-10 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 shadow-lg shadow-stone-200/50">
            {[
              { value: '100% Higienis', label: 'Standar Mutu & Keamanan' },
              { value: '-18°C', label: 'Rantai Dingin Terkendali' },
              { value: 'Bali & Jogja', label: 'Hub Distribusi Aktif' },
              { value: 'Ekspansi 2027', label: 'Peta Jalan Jawa Barat' },
            ].map((stat, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-[#8C6B24] font-serif-title">
                  {stat.value}
                </div>
                <div className="text-[#5C6E65] text-xs mt-0.5 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
