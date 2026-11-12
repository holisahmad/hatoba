import { MetadataRoute } from 'next'
import { CATALOG_PRODUCTS, FOOTPRINT_LOCATIONS } from '@/lib/catalog-data'
import { SITE_URL } from '@/lib/seo-metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()

  // Base corporate routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/frozen-food`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Product routes
  CATALOG_PRODUCTS.forEach((prod) => {
    routes.push({
      url: `${SITE_URL}/frozen-food#${prod.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  return routes
}

