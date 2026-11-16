# CHANGELOG — HATOBA GROUP

## [1.2.0] — 16 November 2026

### Phase 2: Mini ERP & Financial Management Engine
- **Sub-Sistem Keuangan Mandiri (`/finance`)**:
  - Login terisolasi via cookie `hatoba_finance_session` dengan PIN Keuangan khusus (`hatoba.finance2026`).
  - Pintasan navigasi cepat dari panel admin toko (`/admin`) ke portal Mini ERP.
- **Laporan Keuangan SAK EMKM Lengkap**:
  - **Laporan Arus Kas (Cash Flow Statement)**: Pemisahan Arus Kas Operasional, Investasi (Freezer), dan Pendanaan (Modal/Prive).
  - **Neraca Sederhana (Balance Sheet)**: Keseimbangan otomatis Aset (Kas, Piutang, Persediaan Daging Beku, Freezer) vs Kewajiban & Ekuitas (Hutang Supplier, Modal Akhir).
  - **Laporan Perubahan Modal (Statement of Changes in Equity)**: Perhitungan modal awal, laba bersih berjalan, setoran modal, dan prive pemilik.
  - **Kalkulator HPP & Stock Opname Freezer**: Form timbang fisik kg freezer untuk memperbarui nilai persediaan dan menghitung HPP riil *(Persediaan Awal + Pembelian Daging − Persediaan Akhir)*.
  - **Buku Pembantu Piutang Konsumen (AR Aging)**: Terhubung langsung dengan database order penjualan tempo; deteksi jatuh tempo & tombol 1-klik pencairan kas.
  - **Mesin Jurnal Umum Otomatis (General Ledger Engine)**: Double-entry posting (Debit & Kredit) otomatis di balik layar untuk setiap transaksi kas tanpa membebani staf non-akuntan.
- **Dokumentasi Lengkap Keuangan & SOP**:
  - Diterbitkan file resmi `docs/PANDUAN_KEUANGAN_ERP.md` yang memuat:
    1. Diagnosa masalah perputaran kas HATOBA (*Overtrading & Cash Constrained Growth*).
    2. Panduan perpajakan UMKM (PP 55/2022 bebas pajak s.d 500jt, 0.5% PPh final, dan status Non-PKP di bawah Rp 4,8 M).
    3. Formula pembagian Margin Kotor (60-65% kas putar, 15% cadangan freezer, 10% cadangan macet, 10% laba ditahan).
    4. SOP 4 Buku Pokok dan jadwal Cut-Off mingguan (setiap Jumat sore).
    5. Chart of Accounts dan panduan operasional sistem bagi staf keuangan.

## [1.1.0] — 16 November 2026

### POS Cashier, Printing Engine & Operations Upgrade
- Sistem POS 4-Mode Pembayaran: Lunas Tunai/Transfer, DP, Campuran Tunai+Tempo, dan Full Tempo B2B.
- Fitur cetak nota thermal 58/80mm, invoice tagihan A4, dan surat jalan Delivery Order (DO) berstandar Cold Chain −18°C.
- Input internal tim marketing (web, pos, admin edit) tanpa ditampilkan di dokumen konsumen.
- Rekening penampungan personal Mandiri 1370016639326 a.n Doni Kristiawan.
- Pembakuan terminologi resmi "Cold Chain".

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

