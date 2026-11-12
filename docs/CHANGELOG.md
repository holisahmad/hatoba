# CHANGELOG — HATOBA GROUP

## [1.0.0] — 12 November 2026

### Initial Release: Corporate Website & Frozen Food Commerce Platform
- **Phase 0 & 1: Foundation, Reference Audit & Documentation**
  - Inspected workspace assets and local reference project `salon-ria-main`.
  - Created complete architectural and governance docs in `docs/` (`REFERENCE_AUDIT.md`, `OPEN_QUESTIONS.md`, `IMPLEMENTATION_PLAN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `ERD.md`, `DESIGN_SYSTEM.md`, `USER_FLOWS.md`, `SEO_PLAN.md`, `SECURITY.md`, `TEST_PLAN.md`).
- **Phase 2: Corporate Brand Portal**
  - Sticky header with Monogram Gold logo, multi-section links, and dual CTAs ("Katalog B2B" & "Hubungi Korporat").
  - Immersive Hero Section: "Membangun Ekosistem Bisnis Terintegrasi & Berkelanjutan".
  - 2-Column Corporate Footprint with interactive SVG Indonesia Map highlighting Bali (HQ), Yogyakarta (Hub), and dashed expansion to Bandung (2027).
  - Bento Grid (4 Cards) with interactive modals for all business units.
  - Horizontal Strategic Roadmap (2024–2027+) with phase milestones.
  - 3-column Group Synergy Advantages.
  - Multi-channel Smart Inquiry Form with departmental routing and tracking reference generation.
- **Phase 3: Frozen Food B2B Commerce**
  - Dedicated `/frozen-food` catalog page with Warm Alabaster White background.
  - 5 authentic products with real packaging photos (`kemasan-*.png`) and cooked food toggle (`foto-*.jpeg`).
  - Retail vs Wholesale pack switcher with accurate IDR prices.
  - Slide-out Cart Drawer with dynamic subtotal and service-hub confirmation.
  - Raw Materials (`RAW_INQUIRY`) consultation workflow.
- **Phase 4: API, Attribution & Compliance**
  - Server-side `/api/order` and `/api/lead` routes ensuring lead persistence prior to WhatsApp redirection.
  - UTM & referral code capture engine.
  - Dynamic `sitemap.ts` and `robots.ts`.
  - JSON-LD structured data for Organization, LocalBusiness, and Products.
  - Comprehensive unit test suite with 100% pass rate.

