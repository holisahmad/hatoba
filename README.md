# HATOBA GROUP — Corporate Website & Frozen Food B2B Platform

> **Ekosistem Bisnis Terintegrasi & Berkelanjutan:** Pangan Terpadu (Cold Chain), Jaringan Kuliner Nusantara, Agribisnis Hulu, dan Tata Kelola Diversifikasi Aset.

---

## 1. Overview Proyek

Situs resmi **HATOBA Group** dirancang untuk memposisikan entitas sebagai kelompok usaha terpadu (*holding & business ecosystem*) yang menggabungkan wibawa institusional korporat (*institutional trust*) dengan mesin konversi perdagangan pangan beku B2B (*HATOBA Frozen Food*).

Platform ini dibangun mengikuti spesifikasi ketat dalam `asset/HATOBA_GROUP_MASTER_SPEC.md` dan masukan arsitektur pengguna:
- **Hero Section Dinamis & Sinematik:** Latar gelap prestisius obsidian & emerald dengan aksen emas metalik.
- **Profil Korporat & Jejak Operasional:** Tata letak 2 kolom dengan **Peta Interaktif Indonesia (SVG)** yang menghubungkan **Bali (Headquarters & Production Hub)**, **Yogyakarta (Regional Distribution Hub)**, dan roadmap **Bandung (Target Ekspansi 2027)**.
- **Ekosistem & Pilar Bisnis (Bento Grid):** 4 kartu interaktif (HATOBA Frozen Food, HATOBA Culinary & Resto, HATOBA Agro & Livestock, HATOBA Capital & Trading).
- **Peta Jalan Pertumbuhan (Strategic Roadmap 2024–2027+):** Garis waktu horizontal beraksen emas.
- **Keunggulan Sinergi Grup:** 3 kolom minimalis (Kontrol Kualitas Hulu ke Hilir, Jaringan Rantai Dingin -18°C, Stabilitas Finansial & Tata Kelola).
- **Katalog Komersial Frozen Food B2B:** Latar putih *warm alabaster* (`#F9F8F4`) dengan foto produk dan kemasan autentik, selector varian ritel vs partai, dan laci keranjang (*Cart Drawer*).
- **Portal Kemitraan & Kontak Eksekutif (Smart Inquiry Form):** Dropdown pintar dengan pencatatan server-side sebelum pengalihan ke WhatsApp resmi.

---

## 2. Prinsip Bisnis Utama (Non-Negotiable Business Rules)

1. **Cakupan Wilayah Terverifikasi:** Layanan distribusi reguler aktif saat ini berpusat di **Bali** dan **Yogyakarta**. Bandung merupakan target ekspansi 2027 dan tidak diklaim sebagai cabang aktif. Tidak ada klaim palsu "pengiriman ke seluruh Indonesia".
2. **Pemisahan Mode Penjualan:**
   - *Fixed-Pack:* Babat Sapi, Iso Sapi, Paru Sapi, Iga Sapi, Mix 4 Lauk (Tambah ke keranjang, review, checkout, lalu WhatsApp).
   - *Raw Inquiry:* Karkas mentah / pesanan industri (Chat Admin untuk penawaran; tanpa harga fiktif).
3. **Pencatatan Lead Server-Side Sebelum WhatsApp:** Setiap transaksi/inquiry tersimpan di server dengan kode referensi unik (`HTB-ORD-XXXX`, `HTB-INQ-XXXX`, `HTB-CORP-XXXX`) dan atribusi pemasaran lengkap (UTM & referral code).
4. **Kepatuhan Regulasi Finansial:** *HATOBA Capital & Trading* secara tegas ditampilkan sebagai unit perbendaharaan internal grup; tidak ada penawaran investasi atau janji imbal hasil tetap kepada publik (mematuhi regulasi OJK & Bappebti).

---

## 3. Tech Stack

- **Framework:** Next.js 15+ (App Router, Server Components & Client Components)
- **Bahasa:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS (Custom color tokens: Obsidian `#0F1110`, Deep Emerald `#0D281E`, Gold `#C59B47`, Crimson `#B8292F`, Alabaster `#F9F8F4`)
- **Ikon:** Lucide React
- **Testing:** Node.js native test runner (`node --test`)
- **SEO & Structured Data:** JSON-LD Schema.org (`Corporation`, `LocalBusiness`, `Product`)

---

## 4. Panduan Menjalankan Proyek

### Prasyarat
- Node.js v18+ (Diverifikasi pada Node v25.9.0)
- npm v10+

### Instalasi Dependensi
```bash
npm install
```

### Menjalankan Unit Test
```bash
npm test
```

### Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka browser pada: `http://localhost:3000`

### Build untuk Produksi
```bash
npm run build
npm start
```

---

## 5. Struktur Dokumentasi Proyek

Dokumentasi arsitektur dan kepatuhan lengkap tersedia di folder `docs/`:
- `docs/REFERENCE_AUDIT.md`: Audit referensi Salon Ria (apa yang diadopsi secara konseptual dan apa yang dilarang disalin).
- `docs/OPEN_QUESTIONS.md`: Checklist verifikasi data bisnis.
- `docs/IMPLEMENTATION_PLAN.md`: Rencana eksekusi bertahap.
- `docs/ARCHITECTURE.md`: Arsitektur modular monolith Next.js.
- `docs/DATABASE.md` & `docs/ERD.md`: Desain basis data dan diagram relasi entitas.
- `docs/DESIGN_SYSTEM.md`: Sistem desain dan token warna HATOBA.
- `docs/USER_FLOWS.md`: Alur fixed-pack, raw inquiry, dan kontak eksekutif.
- `docs/SEO_PLAN.md`: Strategi Google Search, keyword mapping, dan JSON-LD schema.
- `docs/SECURITY.md`: Kepatuhan UU PDP, keamanan server, dan validasi input.
- `docs/TEST_PLAN.md`: Rencana pengujian kualitas.
- `docs/CHANGELOG.md`: Catatan rilis dan perubahan.

