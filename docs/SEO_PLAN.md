# SEO STRATEGY & GOOGLE SEARCH IMPLEMENTATION PLAN

## 1. Technical SEO Foundation
- **Server-Side Rendering (SSR):** Next.js App Router ensures 100% of body copy, headings, and schema markup are immediately readable by Googlebot without relying on client-side JS evaluation.
- **Dynamic XML Sitemap (`/sitemap.xml`):** Generates valid absolute URLs for `/`, `/tentang`, `/ekosistem-bisnis`, `/frozen-food`, `/lokasi/bali`, `/lokasi/yogyakarta`, and individual product pages. Excludes `/admin` and utility endpoints.
- **Strict Robots Directives (`/robots.txt`):** Allows public crawlers full access to static assets and product routes, blocks `/api/*` and internal paths.
- **Canonical URLs:** Every page declares an absolute canonical link (`https://hatobagroup.com/...`) preventing duplicate content penalties.
- **Meta Hierarchy:** Unique `<title>`, `<meta name="description">`, OpenGraph, and Twitter cards for all primary routes.

---

## 2. Structured Data (JSON-LD Schema.org)

1. **Organization Schema:**
   - Name: `HATOBA Group`
   - Legal Type: `Corporation` / `Organization`
   - Official URL: `https://hatobagroup.com`
   - Logo: `https://hatobagroup.com/images/branding/logo-hatoba-gold.png`
   - ContactPoint: `+62 821-7368-358` (Customer Service & B2B Inquiries)

2. **LocalBusiness Schema (Confirmed Locations Only):**
   - Bali Hub: Denpasar/Badung, Bali, Indonesia.
   - Yogyakarta Hub: Sleman/Yogyakarta, Indonesia.
   - Note: Bandung branch remains unindexed for LocalBusiness until 2027 operational launch.

3. **Product & Offer Schema (Fixed Pack Products Only):**
   - Schema for Babat, Iso, Paru, Iga, Mix 4 Lauk.
   - Accurate integer price in IDR (`priceCurrency: "IDR"`), availability (`InStock`), authentic packaging imagery.
   - Strictly NO fake rating or review markup.

---

## 3. High-Value Keyword Targeting (B2B & Local Intent)

| Keyword | Target Route | Search Intent |
| :--- | :--- | :--- |
| `HATOBA Group` / `HATOBA Holding` | `/` | Brand Discovery & Corporate Verification |
| `Supplier Jeroan Sapi Frozen Bali` | `/lokasi/bali`, `/frozen-food` | Local Commercial B2B Purchasing |
| `Distributor Iga Sapi Yogyakarta` | `/lokasi/yogyakarta`, `/frozen-food` | Local HORECA Supply |
| `Supplier Babat Sapi Restoran` | `/frozen-food/produk/babat-sapi` | Product Purchasing / Wholesale |
| `Supplier Bahan Baku Restoran HORECA` | `/kemitraan`, `/frozen-food` | Commercial Partnership |
| `Bahan Baku Jeroan Sapi Mentah` | `/frozen-food/bahan-mentah` | Bulk Raw Material Sourcing |

