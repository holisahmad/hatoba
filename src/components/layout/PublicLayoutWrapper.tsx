'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/commerce/CartDrawer'
import FloatingCartBar from '@/components/commerce/FloatingCartBar'

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Rute standalone app tanpa header & footer official web
  const isStandaloneApp = pathname.startsWith('/finance')

  if (isStandaloneApp) {
    return <main className="min-h-screen w-full flex flex-col">{children}</main>
  }

  return (
    <>
      <Header />
      {children}
      <CartDrawer />
      <FloatingCartBar />
      <Footer />
    </>
  )
}
