# REFERENCE AUDIT — SALON RIA TO HATOBA GROUP

**Audit Date:** 12 November 2026  
**Auditor:** Lead Architect & Senior Engineer (Antigravity AI)  
**Reference Inspected:** Local copy of `D:\project-code\www\salon-ria-main\salon-ria-main` (GitHub repository: `https://github.com/holisahmad/salon-ria`)

---

## 1. Verified Files Inspected in Reference Project

The following files from `D:\project-code\www\salon-ria-main\salon-ria-main` were inspected in detail:
- `package.json`: Next.js 15.0.0, React 18.3.1, TypeScript 5.6.2, Tailwind CSS 3.4.3, Resend 6.32.1.
- `tailwind.config.ts`: Custom fonts (`Playfair Display` + `Lato`), custom brand gold colors (`#d4a574`), subtle CSS keyframes for `fadeInUp` and `shimmer`.
- `src/app/layout.tsx`: Next.js Metadata API, OpenGraph tags, canonical tags, Google Fonts preconnect, semantic HTML5 structure.
- `src/app/robots.ts` & `src/app/sitemap.ts`: Dynamic Next.js metadata generators for search engine crawlers.
- `src/components/Navigation.tsx`: Sticky navigation responding to scroll position with transparent-to-frosted-glass backdrop transition, mobile slide-down menu, and accessible trigger button.
- `src/components/Hero.tsx`: Immersive hero section with editorial typography, subtle badge tags, dual action buttons, and layered background overlay.
- `src/components/About.tsx`, `Services.tsx`, `Contact.tsx`, `Footer.tsx`: Modular section design with clean grid layouts and responsive spacing.
- `src/app/api/contact/route.ts`: API route handling form submission with basic input parsing.

---

## 2. Reusable Engineering & Quality Concepts

1. **Next.js App Router Architecture:**
   - Use App Router with TypeScript strict mode for robust typing and fast server-side rendering (SSR/SSG).
   - Leverage `src/app/layout.tsx` for shared structural shell and metadata inheritance.
2. **Metadata & Crawlability Patterns:**
   - Full OpenGraph and Twitter card metadata.
   - Clean canonical URL generation and programmatic `robots.ts` / `sitemap.ts`.
3. **Smooth Scroll & Micro-interactions:**
   - Sticky navbar with scroll listener switching backdrop blur and visual contrast.
   - Elegant typography pairing (high-trust Serif for institutional titles + clean Sans-serif for corporate clarity).
4. **Accessible Lead Capture:**
   - Clear input labels, structured fields, direct WhatsApp integration with pre-filled encoded text.

---

## 3. Strict Non-Reuse Constraints (What MUST NOT be copied)

1. **No Salon/Personal Care Identity:**
   - Under no circumstances will any salon styling, copy, imagery, testimonials, or services be reused.
   - HATOBA is a holding group & food ecosystem: corporate obsidian black, deep emerald, metallic gold, and warm alabaster.
2. **No Fake Reviews or Testimonials:**
   - The reference project contained decorative customer testimonials; HATOBA strictly forbids unverified testimonials.
3. **No Unauthenticated Direct WhatsApp Links Without Lead Capture:**
   - While the reference links straight to WhatsApp, HATOBA Master Spec requires **server-side lead recording and attribution logging** *before* triggering the WhatsApp redirect.
4. **No Hard-coded WhatsApp Numbers Across Components:**
   - All WhatsApp routing, branch assignments, and service configurations must use centralized config/database settings.

