'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  productId: string
  productName: string
  variantId: string
  variantName: string
  weight: string
  price: number
  basePrice?: number
  packType?: 'retail' | 'partai'
  quantity: number
  packagingImage: string
  minQty: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId: string) => void
  updateQuantity: (productId: string, variantId: string, qty: number) => void
  clearCart: () => void
  totalCount: number
  totalAmount: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Initialize from session storage if present
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('hatoba_cart')
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem('hatoba_cart', JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const index = prev.findIndex(
        (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
      )
      if (index > -1) {
        const updated = [...prev]
        const curr = updated[index]
        const newQty = curr.quantity + newItem.quantity
        const basePrice = curr.basePrice || newItem.basePrice || curr.price
        const isPartai = curr.packType === 'partai' || newItem.packType === 'partai' || curr.variantId.includes('partai')
        const effectivePrice = isPartai && newQty >= 5 ? Math.max(0, basePrice - 10000) : basePrice
        updated[index] = {
          ...curr,
          quantity: newQty,
          basePrice,
          price: effectivePrice,
        }
        return updated
      }

      const basePrice = newItem.basePrice || newItem.price
      const isPartai = newItem.packType === 'partai' || newItem.variantId.includes('partai')
      const effectivePrice = isPartai && newItem.quantity >= 5 ? Math.max(0, basePrice - 10000) : basePrice

      return [
        ...prev,
        {
          ...newItem,
          basePrice,
          price: effectivePrice,
        },
      ]
    })
    setIsCartOpen(true)
  }

  const removeItem = (productId: string, variantId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    )
  }

  const updateQuantity = (productId: string, variantId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId, variantId)
      return
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId && i.variantId === variantId) {
          const isPartai = i.packType === 'partai' || i.variantId.includes('partai')
          const basePrice = i.basePrice || i.price
          const effectivePrice = isPartai && qty >= 5 ? Math.max(0, basePrice - 10000) : basePrice
          return {
            ...i,
            quantity: qty,
            basePrice,
            price: effectivePrice,
          }
        }
        return i
      })
    )
  }

  const clearCart = () => setItems([])

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalAmount = items.reduce((acc, item) => {
    const isPartai = item.packType === 'partai' || item.variantId.includes('partai')
    const basePrice = item.basePrice || item.price
    const effectivePrice = isPartai && item.quantity >= 5 ? Math.max(0, basePrice - 10000) : item.price
    return acc + effectivePrice * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

