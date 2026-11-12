'use client'

import React from 'react'
import { ShieldCheck, Snowflake, CheckCircle, Handshake } from 'lucide-react'
import { GROUP_SYNERGIES } from '@/lib/catalog-data'

export default function SynergyPillars() {
  return (
    <section id="kemitraan" className="py-28 bg-[#F7F4EE] relative overflow-hidden border-t border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="block w-8 h-px bg-[#C59B47]/60" />
            <span className="text-[#9D772A] text-xs uppercase tracking-[0.3em] font-semibold">
              Why Partner with HATOBA Group
            </span>
            <span className="block w-8 h-px bg-[#C59B47]/60" />
          </div>

          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111613] leading-tight">
            Keunggulan Sinergi{' '}
            <span className="italic gold-shimmer font-normal">Ekosistem Grup</span>
          </h2>

          <div className="ornament-divider max-w-xs mx-auto my-4">
            <span className="text-[#C59B47] text-xs">✦</span>
          </div>

          <p className="text-[#48564F] text-sm sm:text-base leading-relaxed font-light">
            Fondasi kemitraan institusional yang memadukan keandalan suplai, efisiensi rantai pasok mandiri,
            dan komitmen integritas mutu untuk mendukung kesuksesan mitra kuliner Nusantara.
          </p>
        </div>

        {/* 3 Luxury Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {GROUP_SYNERGIES.map((pillar, idx) => {
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between p-8 rounded-3xl bg-white border border-[#E8DFD5] hover:border-[#C59B47]/60 transition-all duration-300 shadow-lg shadow-stone-200/50 luxury-card overflow-hidden"
              >
                {/* Watermark Numeral */}
                <span className="absolute -top-3 -right-1 text-7xl font-bold font-serif-title text-black/[0.04] select-none pointer-events-none">
                  0{idx + 1}
                </span>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-[#F5EFE6] border border-[#E2D6C5] flex items-center justify-center text-[#9D772A] mb-6 group-hover:scale-105 group-hover:border-[#C59B47] transition-all duration-300 shadow-sm">
                    {idx === 0 && <ShieldCheck className="w-7 h-7" />}
                    {idx === 1 && <Snowflake className="w-7 h-7" />}
                    {idx === 2 && <Handshake className="w-7 h-7" />}
                  </div>

                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#9D772A] font-semibold block mb-2">
                    Keunggulan Sinergi 0{idx + 1}
                  </span>
                  
                  <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-[#111613] mb-2 group-hover:text-[#8C6B24] transition-colors">
                    {pillar.title}
                  </h3>
                  
                  <p className="text-xs text-[#5C6E65] italic mb-4 font-serif-title">
                    {pillar.subtitle}
                  </p>
                  
                  <p className="text-sm text-[#48564F] leading-relaxed font-light">
                    {pillar.description}
                  </p>
                </div>

                <div className="relative z-10 pt-6 mt-8 border-t border-[#F0EAE1] flex items-center gap-2 text-xs text-[#8C6B24]">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[#3E4D45] font-medium">Standar Profesional Terverifikasi</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
