'use client'

import React, { useState } from 'react'
import {
  Send,
  Phone,
  Building,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { CORPORATE_CONTACT } from '@/lib/catalog-data'
import { getStoredAttribution } from '@/lib/attribution'

const CATEGORY_OPTIONS = [
  { id: 'b2b', label: 'Pemesanan B2B / HORECA & Reseller' },
  { id: 'resto', label: 'Kemitraan Restoran & Properti' },
  { id: 'supplier', label: 'Kerja Sama Pemasok / Peternakan' },
  { id: 'corporate', label: 'Hubungan Korporat & Kemitraan Strategis' },
]

export default function SmartInquiryForm() {
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].label)
  const [fullName, setFullName] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [marketingName, setMarketingName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    text: string
    refCode?: string
    whatsappUrl?: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !phone || !city) {
      setFeedback({
        type: 'error',
        text: 'Mohon lengkapi Nama Lengkap, Nomor WhatsApp, dan Kota domisili Anda.',
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
          type: 'CORPORATE_INQUIRY',
          payload: {
            category,
            fullName,
            institutionName,
            marketingName: marketingName.trim() || undefined,
            phone,
            city,
            email,
            message,
          },
          attribution,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan inquiry.')
      }

      setFeedback({
        type: 'success',
        text: `Inquiry kemitraan berhasil dicatat dengan Nomor Registrasi: ${data.referenceCode}. Sistem akan mengarahkan Anda ke WhatsApp resmi...`,
        refCode: data.referenceCode,
        whatsappUrl: data.whatsappUrl,
      })

      // Clean inputs
      setMessage('')
      setMarketingName('')

      // Safe redirect to WhatsApp
      if (data.whatsappUrl) {
        setTimeout(() => {
          window.open(data.whatsappUrl, '_blank')
        }, 1200)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala teknis.'
      setFeedback({
        type: 'error',
        text: `${msg} Silakan hubungi langsung WhatsApp kami di ${CORPORATE_CONTACT.phone}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="kontak-form" className="py-28 bg-[#FBF9F5] relative overflow-hidden border-t border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="block w-8 h-px bg-[#C59B47]/60" />
            <span className="text-[#9D772A] text-xs uppercase tracking-[0.3em] font-semibold">
              Executive Consultation & Partnership
            </span>
            <span className="block w-8 h-px bg-[#C59B47]/60" />
          </div>

          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111613] leading-tight">
            Portal Kemitraan &{' '}
            <span className="italic gold-shimmer font-normal">Kontak Korporat</span>
          </h2>

          <div className="ornament-divider max-w-xs mx-auto my-4">
            <span className="text-[#C59B47] text-xs">✦</span>
          </div>

          <p className="text-[#48564F] text-sm sm:text-base leading-relaxed font-light">
            Hubungi tim manajemen HATOBA Group untuk negosiasi pasokan HORECA, kemitraan jaringan restoran,
            kerja sama peternakan binaan, maupun dialog korporat strategis.
          </p>
        </div>

        {/* 2-Column High-Craft Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          
          {/* Left Column: Corporate Office Contacts (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h3 className="font-serif-title text-2xl font-bold text-[#111613]">
                Komitmen Pelayanan Profesional
              </h3>
              <p className="text-sm text-[#48564F] leading-relaxed font-light">
                Setiap inquiry kemitraan dicatat secara resmi ke dalam sistem perbendaharaan holding grup sebelum dialihkan langsung ke PIC yang berwenang demi ketepatan data dan transparansi komisi promosi.
              </p>
              
              <blockquote className="border-l-2 border-[#C59B47] pl-4 py-1 italic text-xs text-[#5C6E65] font-serif-title">
                &ldquo;Kemitraan yang hebat dibangun di atas integritas pasokan, konsistensi spesifikasi, dan kepercayaan timbal balik.&rdquo;
              </blockquote>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center text-[#9D772A] border border-[#E2D6C5] flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="text-[#718078] uppercase tracking-wider block text-[10px]">WhatsApp Resmi Korporat</span>
                  <a
                    href={`https://wa.me/${CORPORATE_CONTACT.phoneClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-[#111613] hover:text-[#8C6B24] transition-colors font-mono"
                  >
                    {CORPORATE_CONTACT.phone}
                  </a>
                  <p className="text-[#5C6E65] text-[11px] mt-0.5">Senin - Sabtu: 08.00 - 18.00 WITA</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center text-[#9D772A] border border-[#E2D6C5] flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="text-[#718078] uppercase tracking-wider block text-[10px]">Email Korespondensi</span>
                  <span className="text-sm font-semibold text-[#111613]">{CORPORATE_CONTACT.email}</span>
                  <p className="text-[#5C6E65] text-[11px] mt-0.5">Respon resmi maksimal 1x24 jam kerja</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center text-[#9D772A] border border-[#E2D6C5] flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="text-[#718078] uppercase tracking-wider block text-[10px]">Kantor Pusat (HQ)</span>
                  <span className="text-sm font-semibold text-[#111613] block">Bali, Indonesia</span>
                  <span className="text-[#5C6E65] text-[11px] block mt-0.5">
                    Hub Regional: DI Yogyakarta • Roadmap 2027: Bandung
                  </span>
                </div>
              </div>
            </div>

            {/* Catalog Download Badge */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2D6C5] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#8C6B24] flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#111613] block">Katalog Produk B2B (Emas)</span>
                  <span className="text-[11px] text-[#5C6E65] font-light">PDF Rincian Spesifikasi & Portofolio</span>
                </div>
              </div>
              <a
                href={CORPORATE_CONTACT.catalogs.portrait}
                download
                className="text-xs font-bold text-[#8C6B24] hover:text-[#111613] underline decoration-[#C59B47]/60"
              >
                Unduh PDF
              </a>
            </div>
          </div>

          {/* Right Column: Smart Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white p-7 sm:p-10 border border-[#E2D6C5] shadow-xl shadow-stone-200/60 relative luxury-card">
              
              {/* Decorative corner lines */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-[#C59B47]/40 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-[#C59B47]/40 pointer-events-none" />

              <div className="mb-8">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9D772A] block mb-1">
                  Formulir Pintar Kemitraan
                </span>
                <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#111613]">
                  Pengajuan Kemitraan & Penawaran
                </h3>
                <p className="text-xs text-[#5C6E65] mt-1 font-light">
                  Pilih kategori tujuan Anda untuk menghubungkan data langsung ke PIC yang berwenang.
                </p>
              </div>

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
                  <div>
                    <p className="font-semibold">{feedback.text}</p>
                    {feedback.whatsappUrl && (
                      <a
                        href={feedback.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-[#1D6C48] font-bold underline"
                      >
                        Buka percakapan WhatsApp sekarang
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8C6B24] mb-1.5">
                    Tujuan Kemitraan / Kontak: *
                  </label>
                  <select
                    value={category}
                    suppressHydrationWarning
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-sm focus:outline-none focus:border-[#C59B47] focus:bg-white transition-colors"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.label} className="bg-white text-[#111613]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#48564F] mb-1">Nama Lengkap PIC: *</label>
                    <input
                      type="text"
                      required
                      suppressHydrationWarning
                      placeholder="Contoh: Bpk. Hendra"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-sm focus:outline-none focus:border-[#C59B47] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#48564F] mb-1">
                      Nomor WhatsApp Aktif: *
                    </label>
                    <input
                      type="tel"
                      required
                      suppressHydrationWarning
                      placeholder="0812xxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-sm focus:outline-none focus:border-[#C59B47] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Institution & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#48564F] mb-1">
                      Nama Perusahaan / Restoran:
                    </label>
                    <input
                      type="text"
                      suppressHydrationWarning
                      placeholder="Contoh: Resto Sedap Rasa (Opsional)"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-sm focus:outline-none focus:border-[#C59B47] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#48564F] mb-1">Kota Domisili: *</label>
                    <input
                      type="text"
                      required
                      suppressHydrationWarning
                      placeholder="Contoh: Denpasar / Sleman / Bandung"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-sm focus:outline-none focus:border-[#C59B47] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Email & Marketing Name (Requested for bonus / commission tracking) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#48564F] mb-1">Alamat Email (Opsional):</label>
                    <input
                      type="email"
                      suppressHydrationWarning
                      placeholder="nama@perusahaan.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-sm focus:outline-none focus:border-[#C59B47] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8C6B24] font-medium mb-1 flex items-center justify-between">
                      <span>Nama Marketing / Referral:</span>
                      <span className="text-[10px] text-[#718078] font-normal">Opsional</span>
                    </label>
                    <input
                      type="text"
                      suppressHydrationWarning
                      placeholder="Contoh: Bpk. Rizal / Tim Sales"
                      value={marketingName}
                      onChange={(e) => setMarketingName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#C59B47]/50 text-[#111613] text-sm focus:outline-none focus:border-[#C59B47] focus:bg-white placeholder:text-gray-400"
                    />
                    <span className="text-[10px] text-[#718078] mt-1 block font-light">
                      Tulis nama staf marketing pembawa info untuk pencatatan komisi & bonus promosi.
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs text-[#48564F] mb-1">
                    Rincian Kebutuhan / Pesan Kemitraan:
                  </label>
                  <textarea
                    rows={3}
                    suppressHydrationWarning
                    placeholder="Tuliskan estimasi tonase, jenis potongan daging/jeroan, atau topik kerja sama yang ingin didiskusikan..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D8CEBE] text-[#111613] text-sm focus:outline-none focus:border-[#C59B47] focus:bg-white placeholder:text-gray-400 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    suppressHydrationWarning
                    className="w-full py-4 rounded-full font-bold text-xs sm:text-sm text-white bg-crimson hover:bg-crimson-hover transition-all duration-300 shadow-lg shadow-crimson/30 hover:shadow-crimson/50 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="animate-pulse">Menghubungkan ke Sistem...</span>
                    ) : (
                      <>
                        <span>Kirim Inquiry Kemitraan Resmi</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-[#718078] text-center font-light pt-2">
                  Data Anda dilindungi kebijakan privasi korporat HATOBA Group.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
