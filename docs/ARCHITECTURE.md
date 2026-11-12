# SYSTEM ARCHITECTURE — HATOBA GROUP

## 1. Architectural Overview

HATOBA Group uses a **Modular Monolith** architecture built on **Next.js 15 (App Router)** with **TypeScript**, **Tailwind CSS**, and modern lightweight database/storage layers. This design gives fast, SEO-optimized Server-Side Rendering (SSR) for brand and product indexing, paired with dynamic interactive Client Components for carts, filters, modals, and geographic maps.

```
                          ┌────────────────────────────┐
                          │     Client Devices         │
                          │ (Desktop, Tablet, Mobile)  │
                          └─────────────┬──────────────┘
                                        │ HTTPS
                                        ▼
                          ┌────────────────────────────┐
                          │   Next.js 15 App Router    │
                          │   - Edge & Node Runtime    │
                          │   - SEO & SSR Pages        │
                          └──────┬──────────────┬──────┘
                                 │              │
                   ┌─────────────┴──┐        ┌──┴───────────────┐
                   ▼                ▼        ▼                  ▼
          ┌────────────────┐┌──────────────┐┌────────────┐┌───────────┐
          │  Corporate     ││ Frozen Food  ││ Marketing  ││ Admin &   │
          │  Group Module  ││ Commerce &   ││ & UTM      ││ Audit Log │
          │  (Brand, Map,  ││ Catalog      ││ Attribut'n ││ Engine    │
          │  Roadmap)      ││ (Cart, Form) ││ Engine     ││           │
          └────────────────┘└───────┬──────┘└─────┬──────┘└─────┬─────┘
                                    │             │             │
                                    ▼             ▼             ▼
                                ┌─────────────────────────────────────┐
                                │     Internal Data & API Layer       │
                                │   - Lead Repository                 │
                                │   - Product & Pricing Catalog       │
                                │   - Attribution Tracker             │
                                │   - Branch & Service Area Rules     │
                                └─────────────────┬───────────────────┘
                                                  │
                                      ┌───────────┴───────────┐
                                      ▼                       ▼
                              ┌───────────────┐       ┌───────────────┐
                              │  PostgreSQL/  │       │  WhatsApp API │
                              │  SQLite/MySQL │       │  Gateway /    │
                              │  Persistence  │       │  Click-to-Chat│
                              └───────────────┘       └───────────────┘
```

---

## 2. Directory Structure

```
hatoba/
├── asset/                          # Original assets (PDFs, images, specifications)
├── docs/                           # Architecture, audit, and operational documentation
├── public/                         # Public static assets
│   ├── images/
│   │   ├── products/               # Authentic packaging & food imagery
│   │   ├── branding/               # Logos (Gold, White, Monograms)
│   │   └── heroes/                 # High-resolution corporate & food visuals
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout with fonts & metadata
│   │   ├── page.tsx                # Corporate Holding Group Homepage
│   │   ├── tentang/page.tsx        # Detailed Corporate History & Values
│   │   ├── ekosistem-bisnis/       # Multi-sector business pillars
│   │   ├── lokasi/                 # Bali HQ & Yogyakarta Distribution Hub
│   │   ├── kemitraan/page.tsx      # B2B & Strategic Partnership Portal
│   │   ├── kontak/page.tsx         # Smart Lead Capture & Inquiries
│   │   ├── frozen-food/            # HATOBA Frozen Food dedicated catalog
│   │   │   ├── page.tsx            # B2B Catalog with Cart Drawer
│   │   │   ├── produk/[slug]/      # Detailed Product Pages
│   │   │   └── bahan-mentah/       # Raw meat/offal B2B inquiry page
│   │   ├── api/
│   │   │   ├── lead/route.ts       # Captures leads & generates reference ID
│   │   │   ├── order/route.ts      # Server-validated fixed-pack orders
│   │   │   └── catalog/route.ts    # JSON catalog feed
│   │   ├── sitemap.ts              # Dynamic XML sitemap
│   │   └── robots.ts               # Programmatic crawl directives
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Dual-persona sticky navigation
│   │   │   ├── Footer.tsx          # Corporate footer with hub locations
│   │   │   └── WhatsAppFloat.tsx   # Controlled floating CTA with attribution
│   │   ├── corporate/
│   │   │   ├── HeroCorporate.tsx   # Prestigious holding group hero
│   │   │   ├── FootprintMap.tsx    # Interactive Indonesia footprint (Bali/Jogja/Bandung)
│   │   │   ├── BentoEcosystem.tsx  # Interactive 4-card bento grid
│   │   │   ├── StrategicRoadmap.tsx# Horizontal gold roadmap (2024-2027)
│   │   │   ├── SynergyPillars.tsx  # 3-column group synergy advantages
│   │   │   └── SmartInquiryForm.tsx# Multi-channel lead capture form
│   │   └── commerce/
│   │   │   ├── ProductCard.tsx     # Fixed-pack vs Raw inquiry card
│   │   │   ├── CartDrawer.tsx      # Slide-out B2B cart drawer
│   │   │   ├── VariantSelector.tsx # Retail vs Wholesale pack switcher
│   │   │   └── CoverageModal.tsx   # Service area verification modal
│   ├── lib/
│   │   ├── catalog-data.ts         # Verified product specifications & pricing
│   │   ├── attribution.ts          # UTM & referral tracker engine
│   │   ├── whatsapp.ts             # Server-side WhatsApp URL & message formatter
│   │   ├── seo-metadata.ts         # Centralized SEO & JSON-LD generators
│   │   └── lead-service.ts         # Server-side lead and order validation
│   └── styles/
│       └── globals.css             # Tailwind directives & CSS custom variables
```

---

## 3. Key Technical Decisions

1. **Next.js App Router with Server Components (RSC):**
   - High performance, minimal client bundle, instant first contentful paint (FCP) and optimal Googlebot crawling.
2. **Dual-Persona Theme System:**
   - Obsidian/Deep Emerald/Gold for the corporate holding portal.
   - Warm Alabaster/White/Crimson for the high-conversion food catalog.
3. **Safe WhatsApp Handoff Pipeline:**
   - Client sends form payload to `/api/lead` or `/api/order`.
   - Server validates payload, normalizes phone numbers, records attribution + IP + timestamp, generates tracking code `HTB-YYYYMMDD-XXXX`.
   - Server returns the formatted `wa.me` URL. Client opens WhatsApp in a new tab with zero lost leads.

