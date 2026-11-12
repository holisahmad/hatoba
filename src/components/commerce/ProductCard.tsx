'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Plus, Minus, ShoppingBag, Snowflake, Check, ShieldCheck } from 'lucide-react'
import { ProductItem, ProductVariant } from '@/lib/catalog-data'
import { useCart } from '@/lib/cart-context'
import { formatRupiah } from '@/lib/whatsapp'

interface ProductCardProps {
  product: ProductItem
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0])
  const [quantity, setQuantity] = useState<number>(product.variants[0].minQty)
  const [showPackaging, setShowPackaging] = useState<boolean>(true)
  const [addedToast, setAddedToast] = useState<boolean>(false)

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    if (quantity < variant.minQty) {
      setQuantity(variant.minQty)
    }
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      weight: selectedVariant.weight,
      price: selectedVariant.price,
      quantity,
      packagingImage: product.packagingImage,
      minQty: selectedVariant.minQty,
    })

    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 2000)
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
        <div className="p-6 sm:p-7">
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
              Pilihan Kemasan & Porsi:
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
          <div className="mt-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span className="font-light">Estimasi Porsi:</span>
              <strong className="text-[#141615] font-serif-title">{selectedVariant.portion}</strong>
            </div>
            {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
              <div className="flex justify-between text-[#B8292F] font-semibold text-[11px]">
                <span>Hemat:</span>
                <strong>{formatRupiah(selectedVariant.originalPrice - selectedVariant.price)} / pack</strong>
              </div>
            )}
            {selectedVariant.minQty > 1 && (
              <div className="flex justify-between text-[#B8292F] font-medium text-[11px]">
                <span>Ketentuan Order:</span>
                <strong>Min. {selectedVariant.minQty} pack</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Add to Cart CTA */}
      <div className="p-6 sm:p-7 pt-0 border-t border-gray-100 mt-2">
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
          <button
            type="button"
            suppressHydrationWarning
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              addedToast
                ? 'bg-[#0D281E] text-white'
                : 'bg-gold hover:bg-amber-400 text-obsidian-950 shadow-gold/20 hover:shadow-gold/40'
            }`}
          >
            {addedToast ? (
              <>
                <Check className="w-4 h-4 text-emerald-accent" />
                <span>Masuk Keranjang!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>+ Keranjang ({formatRupiah(selectedVariant.price * quantity)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
