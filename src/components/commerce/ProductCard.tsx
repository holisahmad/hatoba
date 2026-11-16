'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Plus, Minus, ShoppingBag, Snowflake, ShieldCheck, ShoppingCart, Check } from 'lucide-react'
import { ProductItem, ProductVariant, getEffectiveUnitPrice } from '@/lib/catalog-data'
import { useCart } from '@/lib/cart-context'
import { formatRupiah } from '@/lib/whatsapp'

interface ProductCardProps {
  product: ProductItem
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, updateQuantity, removeItem, items, setIsCartOpen } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0])
  const [quantity, setQuantity] = useState<number>(product.variants[0].minQty)
  const [showPackaging, setShowPackaging] = useState<boolean>(true)

  // Check if this product+variant is already in cart
  const cartItem = items.find(
    (i) => i.productId === product.id && i.variantId === selectedVariant.id
  )
  const qtyInCart = cartItem?.quantity ?? 0
  const isInCart = qtyInCart > 0

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    if (quantity < variant.minQty) {
      setQuantity(variant.minQty)
    }
  }

  const handleAddToCart = () => {
    const effectivePrice = getEffectiveUnitPrice(selectedVariant, quantity)
    addItem(
      {
        productId: product.id,
        productName: product.name,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        weight: selectedVariant.weight,
        price: effectivePrice,
        basePrice: selectedVariant.price,
        packType: selectedVariant.packType,
        quantity,
        packagingImage: product.packagingImage,
        minQty: selectedVariant.minQty,
      },
      false // jangan auto-buka drawer — user klik "Lihat Keranjang" di FloatingCartBar
    )
  }

  const handleIncreaseCart = () => {
    if (cartItem) {
      updateQuantity(product.id, selectedVariant.id, qtyInCart + 1)
    }
  }

  const handleDecreaseCart = () => {
    if (cartItem) {
      if (qtyInCart <= cartItem.minQty) {
        removeItem(product.id, selectedVariant.id)
      } else {
        updateQuantity(product.id, selectedVariant.id, qtyInCart - 1)
      }
    }
  }

  return (
    <div
      id={product.slug}
      className="rounded-3xl bg-white border border-[#E8E4DC] hover:border-[#C59B47]/60 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group text-[#141615] luxury-card"
    >
      <div>
        {/* Image Container with Toggle */}
        <div className="relative aspect-[4/3] w-full bg-[#F5F2EB] overflow-hidden">
          <Image
            src={showPackaging ? product.packagingImage : product.image}
            alt={`${product.name} HATOBA Frozen Food`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-1.5 absolute top-3.5 left-3.5 z-10">
            {((product as { badge?: string }).badge) ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/85 text-gold px-3 py-1 rounded-full border border-gold/40 backdrop-blur-md">
                {(product as { badge?: string }).badge}
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/80 text-gold px-3 py-1 rounded-full border border-gold/40 backdrop-blur-md">
                Vacuum Sealed
              </span>
            )}

            {selectedVariant.discountPercent && selectedVariant.discountPercent > 0 ? (
              <span className="text-[10px] font-bold bg-crimson text-white px-2.5 py-1 rounded-full shadow-md">
                -{selectedVariant.discountPercent}%
              </span>
            ) : selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price ? (
              <span className="text-[10px] font-bold bg-crimson text-white px-2.5 py-1 rounded-full shadow-md">
                PROMO
              </span>
            ) : null}

            <span className="text-[10px] font-bold bg-[#0D281E]/90 text-white px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
              <Snowflake className="w-3 h-3 text-emerald-accent" />
              -18°C
            </span>
          </div>

          {/* In-Cart Badge overlay */}
          {isInCart && (
            <div className="absolute top-3.5 right-3.5 z-10 bg-[#0D281E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <ShoppingCart className="w-3 h-3" />
              {qtyInCart} pack
            </div>
          )}

          {/* Toggle Picture Button */}
          <div className="absolute bottom-3 right-3 flex items-center rounded-full bg-black/80 p-0.5 border border-white/20 backdrop-blur-md text-[10px] font-semibold text-white">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowPackaging(true)}
              className={`px-3 py-1 rounded-full transition-colors ${
                showPackaging ? 'bg-gold text-obsidian-950 font-bold' : 'hover:text-gold'
              }`}
            >
              Kemasan
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowPackaging(false)}
              className={`px-3 py-1 rounded-full transition-colors ${
                !showPackaging ? 'bg-gold text-obsidian-950 font-bold' : 'hover:text-gold'
              }`}
            >
              Sajian
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="uppercase tracking-wider font-medium text-[10px] text-gold">{product.category}</span>
            <span className="text-[#0D281E] font-semibold flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Higienis
            </span>
          </div>

          <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-[#141615] group-hover:text-[#0D281E] transition-colors leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed font-light">
            {product.shortDescription}
          </p>

          {/* Variant Selector Tabs */}
          <div className="mt-5 space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
              Pilihan Kemasan &amp; Porsi:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant.id === v.id
                const hasDiscount = (v.discountPercent && v.discountPercent > 0) || (v.originalPrice && v.originalPrice > v.price)
                return (
                  <button
                    key={v.id}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => handleVariantChange(v)}
                    className={`p-3 rounded-xl text-left border transition-all relative ${
                      isSelected
                        ? 'border-gold bg-[#FAF4E8] shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/60'
                    }`}
                  >
                    {hasDiscount && (
                      <span className="absolute -top-2 right-2 bg-crimson text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        {v.discountPercent ? `-${v.discountPercent}%` : 'PROMO'}
                      </span>
                    )}
                    <span className="block text-xs font-bold text-[#141615] truncate">
                      {v.name || (v.packType === 'retail' ? 'Ritel (1 Pk)' : 'Partai (B2B)')}
                    </span>
                    <span className="block text-[11px] text-gray-500">{v.weight}</span>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs font-bold text-[#0D281E] font-mono">
                        {formatRupiah(v.price)}
                      </span>
                      {v.originalPrice && v.originalPrice > v.price && (
                        <span className="text-[10px] text-gray-400 line-through font-mono">
                          {formatRupiah(v.originalPrice)}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Variant Specs */}
          <div className="mt-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-xs text-gray-600 space-y-1.5">
            <div className="flex justify-between">
              <span className="font-light">Estimasi Porsi:</span>
              <strong className="text-[#141615] font-serif-title">{selectedVariant.portion}</strong>
            </div>

            {selectedVariant.packType === 'partai' ? (
              <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/70 text-[11px] space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-emerald-900">Skema Harga Partai:</span>
                  <span className="font-bold font-mono text-emerald-800">Bisa order mulai 1 pack</span>
                </div>
                <div className="text-emerald-700 leading-snug">
                  • 1–4 pack: <strong>{formatRupiah(selectedVariant.price)}</strong> / pack
                  <br />
                  • ≥5 pack: <strong className="text-emerald-900 underline">{formatRupiah(selectedVariant.price - 10000)}</strong> / pack (Potongan Rp 10.000/pk)
                </div>
              </div>
            ) : null}

            {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
              <div className="flex justify-between text-[#B8292F] font-semibold text-[11px]">
                <span>Hemat:</span>
                <strong>{formatRupiah(selectedVariant.originalPrice - selectedVariant.price)} / pack</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Add to Cart CTA */}
      <div className="p-4 sm:p-6 pt-0 border-t border-gray-100 mt-2">
        {isInCart ? (
          /* ── State: Sudah ada di keranjang — tampilkan counter inline ── */
          <div className="flex flex-col gap-2.5 pt-4">
            {/* Counter Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center border border-[#C59B47] rounded-xl bg-[#FAF4E8] p-1 shadow-sm">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handleDecreaseCart}
                  className="p-2 hover:bg-white rounded-lg transition-colors text-[#141615]"
                  aria-label="Kurangi dari keranjang"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold font-mono text-[#141615]">
                  {qtyInCart}
                </span>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handleIncreaseCart}
                  className="p-2 hover:bg-white rounded-lg transition-colors text-[#141615]"
                  aria-label="Tambah di keranjang"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tombol buka keranjang */}
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setIsCartOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#0D281E] hover:bg-[#163520] text-white transition-all shadow-md"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Di Keranjang — Lihat</span>
              </button>
            </div>

            {/* Tambah produk lagi */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={handleAddToCart}
              className="w-full py-2 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border border-[#C59B47] text-[#0D281E] hover:bg-[#FAF4E8] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                Tambah {quantity} pack lagi ({formatRupiah(getEffectiveUnitPrice(selectedVariant, qtyInCart + quantity) * quantity)})
              </span>
            </button>
          </div>
        ) : (
          /* ── State: Belum di keranjang — tampilkan quantity picker + tombol tambah ── */
          <div className="flex items-center justify-between pt-4 gap-3">
            {/* Quantity Controls */}
            <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  const next = quantity - 1
                  if (next >= selectedVariant.minQty) setQuantity(next)
                }}
                disabled={quantity <= selectedVariant.minQty}
                className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-30 text-gray-700"
                aria-label="Kurangi Jumlah"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-8 text-center text-xs font-bold font-mono text-[#141615]">
                {quantity}
              </span>

              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-700"
                aria-label="Tambah Jumlah"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            {(() => {
              const effectiveUnitPrice = getEffectiveUnitPrice(selectedVariant, quantity)
              const isDiscountActive = selectedVariant.packType === 'partai' && quantity >= 5

              return (
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all shadow-md bg-gold hover:bg-amber-400 text-obsidian-950 shadow-gold/20 hover:shadow-gold/40"
                >
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>＋ Tambah ke Pesanan ({formatRupiah(effectiveUnitPrice * quantity)})</span>
                  </div>
                  {isDiscountActive && (
                    <span className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                      Hemat Rp {(10000 * quantity).toLocaleString('id-ID')}
                    </span>
                  )}
                </button>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
