'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  productId: string
  productName: string
  variantId: string
  variantName: string
  weight: string
  price: number
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
        updated[index].quantity += newItem.quantity
        return updated
      }
      return [...prev, newItem]
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
          return { ...i, quantity: qty }
        }
        return i
      })
    )
  }

  const clearCart = () => setItems([])

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

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

