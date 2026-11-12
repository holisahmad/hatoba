import { CATALOG_PRODUCTS, FOOTPRINT_LOCATIONS } from './catalog-data'

export const SITE_URL = 'https://hatobagroup.com'

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Corporation',
    name: 'HATOBA Group',
    alternateName: 'Kelompok Usaha HATOBA',
    url: SITE_URL,
    logo: `${SITE_URL}/images/branding/logo-hatoba-gold.png`,
    description:
      'Induk kelompok usaha dengan ekosistem bisnis terintegrasi di bidang rantai pasok pangan (frozen food), jaringan kuliner, agribisnis peternakan terpadu, dan manajemen diversifikasi aset.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+62-821-7368-358',
      contactType: 'customer service',
      areaServed: 'ID',
      availableLanguage: ['Indonesian', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Denpasar',
      addressRegion: 'Bali',
      addressCountry: 'ID',
    },
  }
}

export function getLocalBusinessSchemas() {
  // Only for active locations (Bali & Yogyakarta)
  return FOOTPRINT_LOCATIONS.filter((loc) => loc.status === 'ACTIVE').map((loc) => ({
    '@context': 'https://schema.org',
    '@type': 'WholesaleStore',
    name: `HATOBA Frozen Food — ${loc.name}`,
    description: loc.description,
    telephone: loc.phone || '+62-821-7368-358',
    address: {
      '@type': 'PostalAddress',
      addressLocality: loc.id === 'bali' ? 'Denpasar' : 'Sleman / Yogyakarta',
      addressCountry: 'ID',
    },
    priceRange: '$$',
  }))
}

export function getProductSchemas() {
  return CATALOG_PRODUCTS.map((prod) => {
    const mainVariant = prod.variants[0]
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: prod.name,
      description: prod.shortDescription,
      image: `${SITE_URL}${prod.image}`,
      brand: {
        '@type': 'Brand',
        name: 'HATOBA Frozen Food',
      },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/frozen-food#${prod.slug}`,
        priceCurrency: 'IDR',
        price: mainVariant.price,
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
      },
    }
  })
}

