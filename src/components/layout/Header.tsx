'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Menu, X, ArrowUpRight, PhoneCall } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { CORPORATE_CONTACT } from '@/lib/catalog-data'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalCount, setIsCartOpen } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#EAE4DC] shadow-sm py-3'
          : 'bg-[#FBF9F5]/90 backdrop-blur-sm border-b border-[#EAE4DC]/60 py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Logo Monogram Emas HATOBA GROUP */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/branding/logo-hatoba-gold.png"
                alt="HATOBA Group Logo Monogram Emas"
                width={88}
                height={88}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(197,155,71,0.25)]"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel tracking-[0.22em] text-lg sm:text-xl font-bold text-[#111613] group-hover:text-[#C59B47] transition-colors">
                HATOBA
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-[#9D772A] font-semibold -mt-1">
                GROUP
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium">
            <Link
              href="/#tentang"
              className="text-[#2D3A32] hover:text-[#C59B47] transition-colors duration-200"
            >
              Tentang Kami
            </Link>
            <Link
              href="/#ekosistem"
              className="text-[#2D3A32] hover:text-[#C59B47] transition-colors duration-200"
            >
              Ekosistem Bisnis
            </Link>
            <Link
              href="/#peta-jalan"
              className="text-[#2D3A32] hover:text-[#C59B47] transition-colors duration-200 flex items-center gap-1.5"
            >
              Peta Jalan
              <span className="text-[10px] bg-[#F2ECE1] text-[#9D772A] border border-[#D8CEBE] px-1.5 py-0.5 rounded-full font-mono font-medium">
                2027
              </span>
            </Link>
            <Link
              href="/#jejak-operasional"
              className="text-[#2D3A32] hover:text-[#C59B47] transition-colors duration-200"
            >
              Jejak Operasional
            </Link>
            <Link
              href="/#kemitraan"
              className="text-[#2D3A32] hover:text-[#C59B47] transition-colors duration-200"
            >
              Kemitraan
            </Link>
          </nav>

          {/* Right: Dual CTAs + Cart Drawer Button */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Cart Button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full text-[#9D772A] bg-[#F2ECE1] hover:bg-[#EAE2D2] border border-[#D8CEBE] hover:border-[#C59B47] transition-all duration-200 focus:outline-none shadow-sm"
              aria-label="Buka Keranjang Pemesanan B2B"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-crimson text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>

            {/* CTA 1: Katalog B2B (Garis Tepi Emas) */}
            <Link
              href="/frozen-food"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold text-[#8C6B24] border border-[#C59B47] rounded-full hover:bg-[#C59B47] hover:text-white transition-all duration-300 shadow-sm"
            >
              <span>Katalog B2B</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* CTA 2: Hubungi Korporat (Isi Crimson / Emas) */}
            <Link
              href="/#kontak-form"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs md:text-sm font-semibold text-white bg-crimson hover:bg-crimson-hover rounded-full transition-all duration-300 shadow-md shadow-crimson/25 hover:shadow-crimson/40"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Hubungi Korporat</span>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#2D3A32] hover:text-[#C59B47] focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#EAE4DC] px-6 py-6 transition-all duration-300 shadow-xl">
          <div className="flex flex-col space-y-4">
            <Link
              href="/#tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#2D3A32] hover:text-[#C59B47] py-1"
            >
              Tentang Kami
            </Link>
            <Link
              href="/#ekosistem"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#2D3A32] hover:text-[#C59B47] py-1"
            >
              Ekosistem Bisnis
            </Link>
            <Link
              href="/#peta-jalan"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#2D3A32] hover:text-[#C59B47] py-1 flex items-center justify-between"
            >
              <span>Peta Jalan Pertumbuhan</span>
              <span className="text-[11px] bg-[#F2ECE1] text-[#9D772A] border border-[#D8CEBE] px-2 py-0.5 rounded-full font-mono">
                2027
              </span>
            </Link>
            <Link
              href="/#jejak-operasional"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#2D3A32] hover:text-[#C59B47] py-1"
            >
              Jejak Operasional (Bali & DIY)
            </Link>
            <Link
              href="/#kemitraan"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#2D3A32] hover:text-[#C59B47] py-1"
            >
              Kemitraan
            </Link>
            <Link
              href="/frozen-food"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#8C6B24] hover:text-[#C59B47] py-1 flex items-center justify-between"
            >
              <span>Katalog Frozen Food B2B</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <div className="pt-4 border-t border-[#EAE4DC] flex flex-col gap-3">
              <Link
                href="/frozen-food"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-[#8C6B24] border border-[#C59B47] rounded-full hover:bg-[#FBF9F5]"
              >
                Buka Katalog Produk B2B
              </Link>
              <Link
                href="/#kontak-form"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-crimson hover:bg-crimson-hover rounded-full shadow-md"
              >
                Hubungi Korporat (+62 821-7368-358)
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

