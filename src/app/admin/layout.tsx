import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portal Admin & Kasir POS — HATOBA Group',
  description: 'Portal internal manajemen pesanan dan kasir POS HATOBA Group.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
