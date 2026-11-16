'use client'

import React from 'react'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export default function FloatingCartBar() {
  const { totalCount, totalAmount, isCartOpen, setIsCartOpen, items } = useCart()

  if (totalCount === 0 || isCartOpen) {
    return null
  }

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <aside
      aria-label="Ringkasan Keranjang Belanja"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl transition-all duration-300 pointer-events-auto"
    >
      <div className="bg-[#111613]/95 backdrop-blur-md text-white rounded-2xl sm:rounded-full p-3 sm:px-6 sm:py-3 border border-[#C59B47]/50 shadow-2xl shadow-black/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Info Keranjang */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#C59B47] text-[#111613] flex items-center justify-center font-bold shadow-md">
              <ShoppingBag className="w-5 h-5 text-[#111613]" />
            </div>
            <span className="absolute -top-1 -right-1 bg-crimson text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#111613]">
              {totalCount}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] text-gray-300 uppercase tracking-wider font-semibold">
                Keranjang:
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#C59B47] font-medium">
                {totalCount} pack ({items.length} menu)
              </span>
            </div>
            <span className="font-mono font-bold text-sm sm:text-base text-emerald-400 leading-tight">
              {formatIDR(totalAmount)}
            </span>
          </div>
        </div>

        {/* Right: Tombol Buka Keranjang */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-crimson hover:bg-crimson-hover text-white text-xs font-bold transition-all shadow-md shadow-crimson/30 hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <span>Lihat Keranjang</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}
