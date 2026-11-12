# USER FLOWS & CUSTOMER JOURNEYS — HATOBA GROUP

## Flow 1: Fixed-Price Pack B2B Order (HATOBA Frozen Food)
1. **Discovery:** Customer arrives via search, UTM ad, or marketing referral code (`?ref=MKT01`).
2. **Catalog Browsing:** Customer visits `/frozen-food` or `/frozen-food/produk/[slug]`.
3. **Pack & Variant Selection:** Customer toggles between Retail pack (e.g. 240g Babat) or Wholesale pack (e.g. 10 pack bundle), reviews certified net weight and price in Rupiah.
4. **Cart Addition:** Customer clicks *Tambah ke Keranjang*. The slide-out cart drawer updates with instant subtotal calculation.
5. **Coverage & Order Form:** Customer reviews cart, inputs business name, contact name, WhatsApp number, and selects service hub (**Bali** or **Yogyakarta**).
6. **Lead & Order Persistence:** Client sends order payload to `/api/order`. Server generates order reference `HTB-ORD-XXXX` and attribution record.
7. **WhatsApp Handoff:** System redirects to official WhatsApp (+62 821-7368-358) with formatted order specification.

---

## Flow 2: Raw Material Consultation (`RAW_INQUIRY`)
1. **Catalog Browsing:** Customer navigates to `/frozen-food/bahan-mentah` seeking bulk raw offal or custom cuts.
2. **Inquiry Initiation:** Customer clicks **Chat Admin untuk Penawaran** (no fake prices displayed).
3. **Specification Capture:** Customer enters volume requirements (e.g. 100 kg), cut type, delivery frequency, and city.
4. **Lead Persistence:** System posts to `/api/lead` with channel `RAW_INQUIRY`, generating `HTB-INQ-XXXX`.
5. **WhatsApp Consultation:** Customer connects with sales team on WhatsApp with formal pre-filled quotation inquiry.

---

## Flow 3: Multi-Channel Executive / Investor / Partner Lead Capture
1. **Corporate Portal Browsing:** Visitor explores HATOBA Group homepage, roadmap (2027), and business pillars.
2. **Smart Form Selection:** Visitor selects category from dropdown:
   - *Pemesanan B2B / HORECA & Reseller*
   - *Kemitraan Restoran & Properti*
   - *Kerja Sama Pemasok / Peternakan*
   - *Hubungan Korporat & Investasi*
3. **Inquiry Generation:** System logs lead and routes the visitor directly to corporate executive WhatsApp with tracking code.

