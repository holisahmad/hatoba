'use client'

import React, { useState } from 'react'
import { Calendar, Flag, CheckCircle, ArrowRight } from 'lucide-react'
import { STRATEGIC_ROADMAP } from '@/lib/catalog-data'

export default function StrategicRoadmap() {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0)
  const currentPhase = STRATEGIC_ROADMAP[activePhaseIndex]

  return (
    <section id="peta-jalan" className="py-28 bg-white relative overflow-hidden border-t border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="block w-8 h-px bg-[#C59B47]/60" />
            <span className="text-[#9D772A] text-xs uppercase tracking-[0.3em] font-semibold">
              Visi Jangka Panjang 2024 - 2027+
            </span>
            <span className="block w-8 h-px bg-[#C59B47]/60" />
          </div>

          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111613] leading-tight">
            Peta Jalan Pertumbuhan{' '}
            <span className="italic gold-shimmer font-normal">(Strategic Roadmap)</span>
          </h2>

          <div className="ornament-divider max-w-xs mx-auto my-4">
            <span className="text-[#C59B47] text-xs">✦</span>
          </div>

          <p className="text-[#48564F] text-sm sm:text-base leading-relaxed font-light">
            Tahapan ekspansi terencana dan alokasi modal disiplin HATOBA Group dari fondasi rantai dingin
            Bali & Yogyakarta hingga kemandirian hulu peternakan terintegrasi.
          </p>
        </div>

        {/* 4 Phase Flow (Cards with delicate golden connectors) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STRATEGIC_ROADMAP.map((item, index) => {
            const isActive = index === activePhaseIndex
            return (
              <button
                key={index}
                type="button"
                suppressHydrationWarning
                onClick={() => setActivePhaseIndex(index)}
                className={`text-left p-6 sm:p-7 rounded-2xl transition-all duration-300 border flex flex-col justify-between relative luxury-card ${isActive
                    ? 'bg-[#F7F3EC] border-[#C59B47] shadow-lg -translate-y-1'
                    : 'bg-[#FAF8F5] border-[#E8DFD5] hover:border-[#C59B47]/50 hover:bg-white'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#8C6B24] px-2.5 py-1 rounded bg-[#F2ECE1] border border-[#D8CEBE]">
                      {item.phase}
                    </span>
                    <span className="text-xs font-serif-title text-[#718078]">
                      {item.year}
                    </span>
                  </div>

                  <h3 className="font-serif-title text-lg font-bold text-[#111613] mb-1 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#8C6B24] font-medium mb-4">
                    {item.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAE4DC] flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold ${item.status === 'active'
                        ? 'text-[#1D6C48]'
                        : item.status === 'next'
                          ? 'text-[#8C6B24]'
                          : 'text-gray-400'
                      }`}
                  >
                    {item.status === 'active'
                      ? '● Fase Berjalan'
                      : item.status === 'next'
                        ? '✦ Prioritas 2027'
                        : '○ Target Lanjutan'}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#8C6B24]' : 'text-gray-400'}`} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Phase Detail Showcase Card */}
        <div className="rounded-3xl bg-[#FAF8F5] border border-[#E2D6C5] p-8 sm:p-10 shadow-xl shadow-stone-200/60 relative overflow-hidden luxury-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left: Narrative (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F2ECE1] text-[#8C6B24] border border-[#D8CEBE] font-mono">
                  {currentPhase.phase} • {currentPhase.year}
                </span>
                <span className="text-xs text-[#718078] tracking-wider uppercase font-medium">
                  {currentPhase.subtitle}
                </span>
              </div>

              <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#111613]">
                {currentPhase.title}
              </h3>

              <p className="text-[#48564F] text-sm sm:text-base leading-relaxed font-light">
                {currentPhase.description}
              </p>
            </div>

            {/* Right: Key Deliverables (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#EAE4DC] shadow-sm space-y-3">
              <span className="text-xs font-semibold text-[#8C6B24] uppercase tracking-wider block">
                Target Capaian Strategis:
              </span>
              <div className="space-y-2.5">
                {currentPhase.deliverables.map((deliv, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#2D3A32]">
                    <CheckCircle className="w-4 h-4 text-[#8C6B24] flex-shrink-0 mt-0.5" />
                    <span>{deliv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
