# ROADMAP & SPESIFIKASI: SISTEM POS & MINI ERP HATOBA

> Dokumen ini disimpan sebagai acuan pengembangan tahap berikutnya setelah peluncuran resmi website HATOBA Group.

---

## 1. Visi & Tujuan Sistem
Membangun platform operasional terpadu berbasis **Web & Mobile First (Android, Tablet, Desktop)** yang menghubungkan pesanan online, operasional dapur beku/cold storage, hingga laporan keuangan korporat (Mini ERP).

---

## 2. Modul Utama POS & Mini ERP

### 2.1 Modul Pemesanan (Order Ingestion & POS Kasir)
- **Omnichannel Ingestion**:
  - Web Order (Otomatis masuk via REST API / Webhook dari formulir katalog dan keranjang HATOBA).
  - Kasir POS Manual (Input order instan untuk pelanggan walk-in, pesanan telepon, atau order direct WhatsApp).
- **Status Alur Pesanan**:
  `Order Masuk (New)` ➔ `Verifikasi & Pembayaran` ➔ `Proses Dapur/Packing Cold Storage` ➔ `Siap Kirim / Dispatched` ➔ `Selesai (Completed)`.
- **Cetak Dokumen**:
  - Struk kasir thermal (Bluetooth/USB printer 58mm & 80mm).
  - Surat Jalan & Delivery Order (DO).
  - Invoice resmi B2B (Faktur Pajak / Non-Pajak format PDF).

---

### 2.2 Modul Produksi & Perhitungan HPP (Cost of Goods Sold)
- **Komposisi Bahan Baku (BOM Sederhana)**:
  - Input harga beli bahan baku (karkas/jeroan per Kg).
  - Alokasi bahan pendukung (bumbu ungkep, plastik vacuum seal food grade, stiker kemasan, es pendingin).
- **Kalkulasi HPP per Pack**:
  $$\text{HPP per Pack} = \text{Biaya Bahan Baku} + \text{Biaya Bumbu} + \text{Kemasan \& Seal} + \text{Alokasi Penyusutan Dingin}$$
- **Margin & Profitabilitas**:
  - Menampilkan margin kotor (Gross Profit) dan persentase keuntungan secara *real-time* per varian produk sebelum harga jual ditetapkan.

---

### 2.3 Modul Pergudangan & Cold Storage (Inventory Control)
- **Batch Tracking & Expired Date**: Kontrol tanggal produksi dan masa simpan beku (-18°C).
- **Minimum Stock Alert**: Notifikasi otomatis saat stok pack ritel atau karkas mentah di bawah batas minimum.
- **Stock Opname**: Pencatatan selisih fisik vs sistem secara berkala.

---

### 2.4 Modul Pengeluaran Biaya Operasional (OPEX)
- Pencatatan pengeluaran harian:
  - Listrik cold storage & utilitas.
  - Biaya logistik, armada pendingin, dan BBM.
  - Gaji & upah tim produksi/packing.
  - Biaya promosi & komisi marketing per transaksi.
  - Pembelian perlengkapan operasional lainnya.

---

### 2.5 Modul Laporan Keuangan & Analisis Bisnis
- **Laporan Penjualan (Sales Report)**: Omset harian, mingguan, bulanan, produk terlaris, dan performa promotor/marketing.
- **Laporan Laba/Rugi (Profit & Loss Statement)**: Pendapatan kotor, total HPP, total biaya operasional, dan laba bersih.
- **Laporan Arus Kas (Cash Flow)**: Uang masuk (tunai, transfer, tempo) vs uang keluar operasional.

---

## 3. Rencana Arsitektur Teknologi
- **Frontend / Client**: React / Next.js PWA (Progressive Web App) + Capacitor / React Native untuk aplikasi Android mandiri.
- **Backend / Database**: Node.js REST API + PostgreSQL / Supabase dengan Realtime Subscriptions & Offline-sync capability.
- **Hardware Integrasi**: Thermal printer ESC/POS, barcode scanner, dan timbangan digital.

