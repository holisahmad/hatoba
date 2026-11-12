# IMPLEMENTATION PLAN — HATOBA GROUP

## Target Architecture & Stack
- **Framework:** Next.js 15+ (App Router), React 18/19, TypeScript
- **Styling:** Tailwind CSS with custom HATOBA design tokens (Obsidian `#0F1110`, Deep Emerald `#0D281E`, Metallic Gold `#C59B47`, Crimson `#B8292F`, Warm Alabaster `#F9F8F4`)
- **Icons:** Lucide React icons
- **State & Commerce:** Lightweight client-side cart store with server-side validation and WhatsApp handoff
- **Data Engine:** In-memory / persistent lead repository with attribution capture and order logging

## Execution Phases

### Phase 1: Foundation & Corporate Experience
1. Set up Next.js 15, TypeScript, Tailwind CSS configuration with HATOBA brand tokens.
2. Transfer and optimize authentic product photos, packaging PNGs, and official logos into `public/images/`.
3. Build the core components:
   - Sticky Header with dual CTA ("Katalog B2B" gold border & "Hubungi Korporat" crimson/gold).
   - Hero Section: "Membangun Ekosistem Bisnis Terintegrasi & Berkelanjutan" with dual CTAs ("Jelajahi Unit Bisnis" & "Unduh Company Profile (PDF)").
   - Corporate Footprint Section: 2-column layout with interactive Indonesia SVG map highlighting Bali (HQ/Production Hub), Yogyakarta (Distribution Hub), and Bandung (2027 Expansion).
   - Bento Grid: 4 interactive cards for HATOBA Frozen Food, HATOBA Culinary & Resto, HATOBA Agro & Livestock, and HATOBA Capital & Trading.
   - Horizontal Strategic Roadmap: 2024 to 2027+ golden timeline.
   - Group Synergy Advantages: 3 minimal columns (Hulu-ke-Hilir Quality Control, Cold Chain Distribution, Financial Stability & Governance).
   - Smart Multi-Channel Lead Inquiry Form: Dropdown routing to B2B, Restaurant Partner, Livestock Supplier, Corporate & WhatsApp generation.
   - Corporate Footer: Complete contact info, Bali & Yogyakarta hubs, business hours, and B2B PDF catalog download.

### Phase 2: Frozen Food B2B Commerce Catalog & Sub-Pages
1. Dedicated `/frozen-food` route:
   - Warm Alabaster White aesthetic for food commerce.
   - Authenticated product showcase (Babat Sapi, Iso Sapi, Paru Sapi, Iga Sapi, Mix 4 Lauk).
   - Variant switcher (Retail Pack vs Partai/Wholesale with minimum orders).
   - Service area indicator (Bali & Yogyakarta only, with custom inquiry for other cities).
2. Slide-out Cart Drawer (`CartDrawer.tsx`):
   - Dynamic item increment/decrement, live subtotal in IDR format.
   - Checkout modal capturing Name, WhatsApp, Business Type, Delivery City.
   - API submission to `/api/order` and instant redirection to WhatsApp.
3. Raw Material Inquiry Page (`/frozen-food/bahan-mentah`):
   - B2B custom cuts and bulk raw orders without fake prices.

### Phase 3: Dedicated Sub-Pages & SEO
1. `/tentang` (Corporate story, governance, leadership, and sustainability).
2. `/ekosistem-bisnis` (Detailed vertical integration breakdown).
3. `/kemitraan` (HORECA supply, distributor, reseller, and property partnerships).
4. `/lokasi/bali` & `/lokasi/yogyakarta` (Local B2B SEO landing pages).
5. Dynamic XML Sitemap (`src/app/sitemap.ts`) and `src/app/robots.ts`.
6. Structured JSON-LD metadata for Organization, LocalBusiness, and Product.

### Phase 4: Quality Assurance, Verification & Handover
1. Build verification (`npm run build`).
2. Typecheck and lint validation.
3. Automated unit tests for order calculation, WhatsApp URL generation, and service area rules.

