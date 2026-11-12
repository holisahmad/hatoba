import React from 'react'
import {
  Utensils,
  Store,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Building2,
  ChefHat,
  ShoppingBag,
} from 'lucide-react'
import { PARTNER_CLIENTS } from '@/lib/catalog-data'

export default function PartnerShowcase() {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'Resto Bebakaran':
        return <Flame className="w-5 h-5 text-[#C59B47]" />
      case 'Rumah Makan':
        return <ChefHat className="w-5 h-5 text-[#8C6B24]" />
      case 'Katering & Resto':
        return <Utensils className="w-5 h-5 text-[#C59B47]" />
      case 'Ritel & Reseller':
        return <ShoppingBag className="w-5 h-5 text-[#8C6B24]" />
      default:
        return <Store className="w-5 h-5 text-[#9D772A]" />
    }
  }

  return (
    <section id="mitra-kuliner" className="py-24 bg-[#F7F4EE] border-y border-[#EAE4DC] relative overflow-hidden">
      {/* Subtle decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C59B47]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#8C6B24]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D8CEBE] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6B24]">
              Kepercayaan Mitra Kuliner
            </span>
          </div>

          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111613] leading-tight">
            Dipercaya Dapur Restoran &amp;{' '}
            <span className="italic font-normal text-[#8C6B24]">Pelaku Usaha Pangan</span>
          </h2>

          <div className="ornament-divider max-w-xs mx-auto my-3">
            <span className="text-[#C59B47] text-xs">✦</span>
          </div>

          <p className="text-[#48564F] text-sm sm:text-base leading-relaxed font-light">
            Mulai dari rumah makan tradisional legendaris, resto spesialis bakaran, katering, hingga gerai ritel pangan mengandalkan kualitas konsisten dan standar rantai dingin HATOBA Frozen Food setiap hari.
          </p>
        </div>

        {/* Partner Cards Grid (9 Clients) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {PARTNER_CLIENTS.map((partner) => (
            <div
              key={partner.id}
              className="group p-6 rounded-2xl bg-white border border-[#E8DFD5] hover:border-[#C59B47] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FBF9F5] border border-[#EAE4DC] group-hover:border-[#C59B47]/40 flex items-center justify-center transition-colors">
                    {getIconForType(partner.type)}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {partner.badge}
                  </span>
                </div>

                <h3 className="font-serif-title text-xl font-bold text-[#111613] group-hover:text-[#8C6B24] transition-colors leading-snug">
                  {partner.name}
                </h3>

                <p className="text-xs text-[#5C6E65] mt-1.5 font-light">
                  {partner.category}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F2ECE1] flex items-center justify-between text-[11px] text-[#718078]">
                <span className="font-medium text-[#111613]/80">{partner.type}</span>
                <span className="text-[#9D772A] font-light">Pasokan Rutin Terjadwal</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Highlight Strip & Call to Action */}
        <div className="rounded-3xl bg-white border border-[#D8CEBE] p-7 sm:p-9 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-[#111613]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B47]" />
                Higienis Tanpa Bau Prengus
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B47]" />
                Kemasan Vacuum Seal (−18°C)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B47]" />
                Layanan Hub Bali &amp; D.I. Yogyakarta
              </span>
            </div>
            <p className="text-xs text-[#5C6E65] font-light max-w-xl">
              Tertarik menghemat waktu persiapan dapur hingga berjam-jam dengan mutu bahan baku yang selalu prima?
            </p>
          </div>

          <a
            href="https://wa.me/628217368358?text=Halo%20HATOBA%20Group%2C%20saya%20tertarik%20untuk%20menjalin%20kemitraan%20pasokan%20bahan%20baku%20kuliner%20untuk%20usaha%20saya."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-white bg-crimson hover:bg-crimson-hover shadow-md shadow-crimson/25 transition-all text-xs tracking-wide flex-shrink-0"
          >
            <span>Bermitra dengan HATOBA</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
