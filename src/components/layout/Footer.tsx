import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Download,
  ShieldCheck,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react'
import { CORPORATE_CONTACT, FOOTPRINT_LOCATIONS } from '@/lib/catalog-data'

export default function Footer() {
  return (
    <footer className="bg-[#070908] text-gray-300 border-t border-gold/20 relative overflow-hidden">
      {/* Decorative top gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Column 1: Brand & Holding Identity */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/images/branding/logo-hatoba-gold.png"
                  alt="HATOBA Group Logo"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(197,155,71,0.3)]"
                />
              </div>
              <div>
                <span className="font-cinzel text-xl font-bold tracking-[0.2em] text-white">
                  HATOBA
                </span>
                <span className="block text-[10px] tracking-[0.3em] uppercase text-gold font-semibold">
                  GROUP
                </span>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed">
              Membangun ekosistem bisnis terintegrasi dan berkelanjutan di sektor pangan terpadu,
              jaringan kuliner Nusantara, agribisnis hulu, dan pengelolaan likuiditas strategis.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={CORPORATE_CONTACT.catalogs.portrait}
                download
                className="inline-flex items-center gap-2 text-xs font-semibold text-gold hover:text-gold-light border border-gold/30 hover:border-gold px-4 py-2 rounded-lg bg-obsidian-900/60 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Katalog Produk B2B (PDF)</span>
              </a>
            </div>
          </div>

          {/* Column 2: Ekosistem & Lini Bisnis */}
          <div>
            <h4 className="text-white font-cinzel text-sm uppercase tracking-wider font-semibold border-b border-gold/30 pb-2 mb-4">
              Pilar Ekosistem
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/frozen-food"
                  className="hover:text-gold transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
                    HATOBA Frozen Food
                  </span>
                  <span className="text-[10px] bg-emerald-light/40 text-emerald-accent border border-emerald-accent/40 px-1.5 py-0.5 rounded">
                    Aktif
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#ekosistem"
                  className="hover:text-gold transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
                    HATOBA Culinary & Resto
                  </span>
                  <span className="text-[10px] bg-gold/10 text-gold border border-gold/30 px-1.5 py-0.5 rounded">
                    Tahap Lanjut
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#ekosistem"
                  className="hover:text-gold transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
                    HATOBA Agro & Livestock
                  </span>
                  <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded">
                    Hulu
                  </span>
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/#peta-jalan"
                  className="text-xs text-gold hover:underline flex items-center gap-1 font-semibold"
                >
                  Lihat Peta Jalan Ekspansi 2027
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Titik Jejak Operasional */}
          <div>
            <h4 className="text-white font-cinzel text-sm uppercase tracking-wider font-semibold border-b border-gold/30 pb-2 mb-4">
              Jejak Operasional
            </h4>
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-obsidian-900/60 border border-gold/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">Bali (Headquarters)</span>
                  <span className="text-[9px] bg-emerald-accent/20 text-emerald-accent px-1.5 py-0.5 rounded font-mono">
                    Produksi
                  </span>
                </div>
                <p className="text-gray-400">Denpasar / Badung, Bali</p>
                <p className="text-gray-500 mt-1">Fasilitas Pemrosesan & Cold Storage -18°C</p>
              </div>

              <div className="p-3 rounded-lg bg-obsidian-900/60 border border-gold/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">Yogyakarta (Regional Hub)</span>
                  <span className="text-[9px] bg-emerald-accent/20 text-emerald-accent px-1.5 py-0.5 rounded font-mono">
                    Distribusi
                  </span>
                </div>
                <p className="text-gray-400">Sleman / Kota Yogyakarta, D.I. Yogyakarta</p>
                <p className="text-gray-500 mt-1">Pusat Distribusi Wilayah Jawa Bagian Tengah</p>
              </div>

              <div className="p-2.5 rounded-lg bg-obsidian-900/40 border border-dashed border-gray-700">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Bandung (Ekspansi 2027)</span>
                  <span className="text-[9px] bg-gold/10 text-gold px-1.5 py-0.5 rounded">
                    Roadmap
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Kontak Resmi & Jam Kerja */}
          <div>
            <h4 className="text-white font-cinzel text-sm uppercase tracking-wider font-semibold border-b border-gold/30 pb-2 mb-4">
              Kontak Korporat
            </h4>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-gray-400">WhatsApp Bisnis & Hotline:</span>
                  <a
                    href={`https://wa.me/${CORPORATE_CONTACT.phoneClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white hover:text-gold transition-colors text-sm"
                  >
                    {CORPORATE_CONTACT.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-gray-400">Email Korporat:</span>
                  <span className="text-gray-200">{CORPORATE_CONTACT.email}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-gray-400">Waktu Operasional:</span>
                  <span className="text-gray-200">{CORPORATE_CONTACT.workingHours}</span>
                </div>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-dark/40 border border-emerald-light/40 text-[11px] text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Jaminan Rantai Dingin Higienis & Standar Keamanan Pangan</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Compliance Statement */}
        <div className="py-6 border-t border-white/10 text-xs text-gray-500 leading-relaxed space-y-2">
          <p>
            <strong className="text-gray-400">Pernyataan Wilayah Layanan & Kepatuhan:</strong>{' '}
            Cakupan layanan distribusi rantai dingin HATOBA Frozen Food saat ini berpusat di wilayah operasional resmi
            Bali dan Yogyakarta. Pengembangan wilayah Jawa Barat (Bandung) dijadwalkan pada roadmap tahun 2027.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© <span suppressHydrationWarning>{new Date().getFullYear()}</span> HATOBA Group. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center space-x-6">
            <Link href="/kebijakan-privasi" className="hover:text-gold transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/syarat-ketentuan" className="hover:text-gold transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/frozen-food" className="text-gold hover:underline">
              Katalog B2B HATOBA
            </Link>
            <Link href="/admin" className="hover:text-gold transition-colors">
              Panel Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

