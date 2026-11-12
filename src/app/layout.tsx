import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/commerce/CartDrawer'
import {
  getOrganizationSchema,
  getLocalBusinessSchemas,
  getProductSchemas,
  SITE_URL,
} from '@/lib/seo-metadata'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'HATOBA Group — Membangun Ekosistem Bisnis Terintegrasi & Berkelanjutan',
  description:
    'Induk kelompok usaha dengan ekosistem bisnis terpadu di sektor rantai pasok pangan (HATOBA Frozen Food), jaringan kuliner autentik Nusantara, agribisnis peternakan hulu, dan pengelolaan aset strategis. Hub operasional di Bali & Yogyakarta.',
  keywords: [
    'HATOBA Group',
    'HATOBA Frozen Food',
    'Supplier Jeroan Sapi Frozen Bali',
    'Distributor Iga Sapi Yogyakarta',
    'Supplier Babat Sapi Restoran',
    'Supplier Bahan Baku HORECA',
    'Daging Sapi Beku Vacuum Pack',
    'Jeroan Sapi Higienis',
  ],
  authors: [{ name: 'HATOBA Group Corporate Communications' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: 'HATOBA Group',
    title: 'HATOBA Group — Membangun Ekosistem Bisnis Terintegrasi & Berkelanjutan',
    description:
      'Holding grup bisnis terintegrasi dari hulu ke hilir: HATOBA Frozen Food, HATOBA Culinary & Resto, dan HATOBA Agro & Livestock.',
    images: [
      {
        url: `${SITE_URL}/images/branding/logo-hatoba-gold.png`,
        width: 1200,
        height: 630,
        alt: 'HATOBA Group Monogram Emas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HATOBA Group — Ekosistem Bisnis Terpadu',
    description:
      'Pemasok bahan baku pangan beku terpercaya dan holding ekosistem kuliner & agribisnis berkelanjutan.',
    images: [`${SITE_URL}/images/branding/logo-hatoba-gold.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const orgSchema = getOrganizationSchema()
  const localSchemas = getLocalBusinessSchemas()
  const productSchemas = getProductSchemas()

  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FBF9F5" />
        <link rel="icon" href="/images/branding/logo-hatoba-gold.png" type="image/png" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {localSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        {productSchemas.map((schema, i) => (
          <script
            key={`prod-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="bg-[#FBF9F5] text-[#111613] antialiased selection:bg-[#C59B47] selection:text-white" suppressHydrationWarning>
        <CartProvider>
          <Header />
          {children}
          <CartDrawer />
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}

