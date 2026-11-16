import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo-metadata'

export const metadata: Metadata = {
  title: 'Supplier Jeroan & Daging Sapi Frozen — HATOBA Frozen Food',
  description:
    'Distributor & supplier bahan baku jeroan sapi (babat, iso, paru) dan iga sapi beku higienis standar cold chain −18°C. Melayani pasokan HORECA dan kuliner di Hub Bali & Yogyakarta.',
  keywords: [
    'Supplier Jeroan Sapi Frozen',
    'Supplier Jeroan Sapi Frozen Bali',
    'Distributor Iga Sapi Yogyakarta',
    'Supplier Babat Sapi Restoran',
    'Supplier Bahan Baku Restoran HORECA',
    'Bahan Baku Jeroan Sapi Mentah',
    'Daging Sapi Beku Vacuum Pack',
    'Iso Usus Sapi Pre-Boiled',
    'Paru Sapi Vacuum Pack',
    'HATOBA Frozen Food',
  ],
  alternates: {
    canonical: `${SITE_URL}/frozen-food`,
  },
  openGraph: {
    title: 'HATOBA Frozen Food — Supplier Jeroan & Daging Sapi Higienis',
    description:
      'Penyedia bahan baku jeroan dan daging sapi higienis untuk restoran, katering, dan hotel di Hub Bali & Yogyakarta. Standar rantai dingin −18°C.',
    url: `${SITE_URL}/frozen-food`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/images/branding/logo-hatoba-gold.png`,
        width: 1200,
        height: 630,
        alt: 'HATOBA Frozen Food Produk',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HATOBA Frozen Food — Supplier Jeroan & Daging Sapi Higienis',
    description:
      'Bahan baku beku berkualitas untuk industri HORECA di Bali & Yogyakarta.',
    images: [`${SITE_URL}/images/branding/logo-hatoba-gold.png`],
  },
}

export default function FrozenFoodLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
