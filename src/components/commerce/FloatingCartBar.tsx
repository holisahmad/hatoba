'use client'

import React from 'react'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatRupiah } from '@/lib/whatsapp'

export default function FloatingCartBar() {
  const { totalCount, totalAmount, isCartOpen, setIsCartOpen, items } = useCart()

  if (totalCount === 0 || isCartOpen) {
    return null
  }

  return (
    <aside
      aria-label="Ringkasan Keranjang Belanja"
      className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-lg transition-all duration-300 pointer-events-auto"
    >
      <div className="bg-[#111613]/95 backdrop-blur-md text-white rounded-2xl sm:rounded-full px-3.5 py-2.5 sm:px-6 sm:py-3 border border-[#C59B47]/60 shadow-2xl shadow-black/50 flex items-center justify-between gap-3">
        {/* Left: Info Keranjang */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C59B47] text-[#111613] flex items-center justify-center font-bold shadow-md">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#111613]" />
            </div>
            <span className="absolute -top-1 -right-1 bg-crimson text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-[#111613]">
              {totalCount}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-300 truncate">
              {totalCount} pack ({items.length} menu)
            </span>
            <span className="font-mono font-bold text-xs sm:text-base text-emerald-400 leading-tight truncate">
              {formatRupiah(totalAmount)}
            </span>
          </div>
        </div>

        {/* Right: Tombol Buka Keranjang */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-crimson hover:bg-crimson-hover text-white text-xs font-bold transition-all shadow-md shadow-crimson/30 active:scale-95 flex items-center gap-1.5 sm:gap-2"
        >
          <span>Keranjang</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </aside>
  )
}
