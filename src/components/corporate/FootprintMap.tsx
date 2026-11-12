'use client'

import React, { useState } from 'react'
import { MapPin, Phone, Building2, Truck, Calendar, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react'
import { FOOTPRINT_LOCATIONS, FootprintLocation } from '@/lib/catalog-data'

export default function FootprintMap() {
  const [selectedLocation, setSelectedLocation] = useState<FootprintLocation>(
    FOOTPRINT_LOCATIONS[0] // Bali default
  )

  return (
    <section id="jejak-operasional" className="py-28 bg-white relative overflow-hidden border-t border-[#EAE4DC]">
      {/* Anchor for 'Tentang Kami' nav link */}
      <div id="tentang" className="absolute -top-24 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">

        {/* Section Header with Ornament Divider */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="block w-8 h-px bg-[#C59B47]/60" />
            <span className="text-[#9D772A] text-xs uppercase tracking-[0.3em] font-semibold">
              Corporate Footprint & Logistik
            </span>
            <span className="block w-8 h-px bg-[#C59B47]/60" />
          </div>

          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111613] leading-tight">
            Profil Korporat &{' '}
            <span className="italic gold-shimmer font-normal">Jejak Operasional</span>
          </h2>

          <div className="ornament-divider max-w-xs mx-auto my-4">
            <span className="text-[#C59B47] text-xs">✦</span>
          </div>

          <p className="text-[#48564F] text-sm sm:text-base leading-relaxed">
            Transformasi HATOBA Group dari pemasok bahan baku beku higienis menjadi grup usaha terpadu
            dengan infrastruktur rantai dingin mandiri, fasilitas pemrosesan terstandarisasi, dan jangkauan regional yang terpercaya.
          </p>
        </div>

        {/* 2-Column High-Craft Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* Left Column: Interactive Hub Selection Tabs (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h3 className="font-serif-title text-2xl font-bold text-[#111613]">
                Pusat Kendali & Hub Distribusi
              </h3>
              <p className="text-sm text-[#48564F] leading-relaxed font-light">
                Setiap fasilitas operasional HATOBA dilengkapi standar penyimpanan beku ketat (-18°C)
                serta armada pendingin terjadwal guna memastikan integritas mutu daging dan jeroan hingga ke dapur mitra.
              </p>
            </div>

            {/* Hub Selector Cards */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold tracking-wider text-[#9D772A] uppercase block mb-1">
                Pilih Titik Operasional:
              </span>

              <div className="space-y-3">
                {FOOTPRINT_LOCATIONS.map((loc) => {
                  const isSelected = selectedLocation.id === loc.id
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setSelectedLocation(loc)}
                      className={`w-full text-left p-5 rounded-2xl transition-all duration-300 flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[#F7F3EC] border-[#C59B47] shadow-md translate-x-1'
                          : 'bg-[#FAF8F5] border-[#E8DFD5] hover:border-[#C59B47]/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-[#C59B47]/15 text-[#8C6B24] border-[#C59B47]/40'
                              : 'bg-white text-gray-500 border-gray-200'
                          }`}
                        >
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#111613] font-serif-title">
                              {loc.name.split(' —')[0]}
                            </h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                                loc.status === 'ACTIVE'
                                  ? 'bg-[#E8F4EE] text-[#1D6C48] border border-[#BCE2CD]'
                                  : 'bg-[#F5EFE6] text-[#8C6B24] border border-[#E2D6C5]'
                              }`}
                            >
                              {loc.status === 'ACTIVE' ? 'Aktif' : 'Rencana 2027'}
                            </span>
                          </div>
                          <p className="text-xs text-[#5C6E65] mt-0.5">{loc.role}</p>
                        </div>
                      </div>

                      <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#C59B47]' : 'bg-transparent'}`} />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Strategic Value Micro-Card */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD5] text-xs text-[#48564F] space-y-2">
              <div className="flex items-center gap-2 text-[#8C6B24] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#8C6B24] flex-shrink-0" />
                <span>Kepatuhan Area Layanan Resmi</span>
              </div>
              <p className="text-[#5C6E65] leading-relaxed text-[11px]">
                Distribusi reguler saat ini diprioritaskan untuk mitra B2B di Bali dan Yogyakarta.
                Pengiriman di luar hub aktif dilayani melalui skema kargo rantai dingin khusus dengan konfirmasi admin.
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Hub Operational Spec Showcase (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#FAF8F5] border border-[#E2D6C5] p-7 sm:p-9 shadow-xl shadow-stone-200/60 relative luxury-card">

              {/* Decorative corner lines */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-[#C59B47]/40 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-[#C59B47]/40 pointer-events-none" />

              {/* Hub Title Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8DFD5]">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9D772A] block mb-1">
                    Spesifikasi Fasilitas Hub
                  </span>
                  <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#111613]">
                    {selectedLocation.name}
                  </h3>
                </div>

                <span
                  className={`text-xs px-3.5 py-1.5 rounded-full font-mono font-semibold ${
                    selectedLocation.status === 'ACTIVE'
                      ? 'bg-[#E8F4EE] text-[#1D6C48] border border-[#BCE2CD]'
                      : 'bg-[#F5EFE6] text-[#8C6B24] border border-[#E2D6C5]'
                  }`}
                >
                  {selectedLocation.status === 'ACTIVE'
                    ? 'Hub Operasional Aktif'
                    : 'Target Ekspansi 2027'}
                </span>
              </div>

              {/* Hub Narrative Description */}
              <p className="text-[#48564F] text-sm sm:text-base leading-relaxed my-6 font-light">
                {selectedLocation.description}
              </p>

              {/* Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-xl bg-white border border-[#EAE4DC] shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6B24]">
                    <Truck className="w-4 h-4" />
                    <span>Infrastruktur Operasional</span>
                  </div>
                  <p className="text-xs text-[#111613] font-medium">
                    {selectedLocation.status === 'ACTIVE'
                      ? 'Cold Storage -18°C & Kontrol Suhu Terpadu'
                      : 'Fasilitas Cold Hub Terencana (Jawa Barat)'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EAE4DC] shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6B24]">
                    <Calendar className="w-4 h-4" />
                    <span>Layanan Pengiriman</span>
                  </div>
                  <p className="text-xs text-[#111613] font-medium">
                    {selectedLocation.status === 'ACTIVE'
                      ? 'Pengiriman Terjadwal Armada Berpendingin'
                      : 'Penetrasi Koridor Logistik Jawa Barat 2027'}
                  </p>
                </div>
              </div>

              {/* Coverage Tags */}
              <div className="space-y-2 mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6E65] block">
                  Jangkauan Area Utama:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedLocation.coverage.map((area, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 rounded-full bg-white text-[#2D3A32] border border-[#EAE4DC] shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#8C6B24]" />
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Address & Contact Footer */}
              <div className="pt-6 border-t border-[#E8DFD5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-[#5C6E65] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#2D3A32] font-medium">
                    <Building2 className="w-3.5 h-3.5 text-[#8C6B24] flex-shrink-0" />
                    <span>{selectedLocation.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#8C6B24] flex-shrink-0" />
                    <span>Kontak Hub: {selectedLocation.phone || '+62 821-7368-358'}</span>
                  </div>
                </div>

                <a
                  href="#kontak-form"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#8C6B24] hover:text-[#111613] border border-[#C59B47] hover:border-[#8C6B24] hover:bg-white transition-colors bg-white/70 shadow-sm"
                >
                  <span>Konsultasi Pasokan Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
