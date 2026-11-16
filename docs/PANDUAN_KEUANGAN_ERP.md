# PANDUAN MANAJEMEN KEUANGAN, ARUS KAS, DAN OPERASIONAL MINI ERP HATOBA GROUP
**Standar Akuntansi Keuangan Entitas Mikro, Kecil, dan Menengah (SAK EMKM) & Praktik Distribusi Cold Chain Indonesia**

---

## DAFTAR ISI
1. [Latar Belakang & Diagnosa Masalah HATOBA](#1-latar-belakang--diagnosa-masalah-hatoba)
2. [Panduan Strategis Perpajakan Usaha HATOBA](#2-panduan-strategis-perpajakan-usaha-hatoba)
3. [Formula Pembagian Margin Kotor (Gross Profit Allocation)](#3-formula-pembagian-margin-kotor-gross-profit-allocation)
4. [SOP 4 Buku Pokok & Disiplin Cut-Off Mingguan](#4-sop-4-buku-pokok--disiplin-cut-off-mingguan)
5. [Spesifikasi Teknis Sub-Sistem Mini ERP (`/finance`)](#5-spesifikasi-teknis-sub-sistem-mini-erp-finance)
6. [Bagan Akun Standar (Chart of Accounts) & Jurnal Otomatis](#6-bagan-akun-standar-chart-of-accounts--jurnal-otomatis)
7. [Petunjuk Pengoperasian Menu ERP bagi Staf Keuangan](#7-petunjuk-pengoperasian-menu-erp-bagi-staf-keuangan)

---

## 1. Latar Belakang & Diagnosa Masalah HATOBA

### Diagnosa Manajerial: *Overtrading & Cash-Constrained Growth*
Permasalahan utama yang dialami HATOBA Group:
> *"Omset penjualan di atas kertas tercatat besar, tetapi kas di rekening kosong karena piutang konsumen tempo tinggi, sementara modal awal perputaran terbatas."*

### Akar Penyebab:
1. **Bias Akrual (Accrual Basis Bias):** Faktur yang diterbitkan langsung dianggap sebagai omset/pendapatan, padahal uang kas riil belum masuk ke rekening bank.
2. **Kesenjangan Tempo (Cash Conversion Cycle Gap):** 
   - Konsumen B2B (restoran/katering) membayar secara tempo (3–14 hari).
   - Supplier hulu (RPH / peternak sapi), utilitas PLN listrik freezer, dan armada pengiriman menuntut pembayaran tunai segera.
3. **Ketiadaan Cut-Off Terjadwal:** Order baru tetap dikirimkan ke konsumen yang masih menunggak tagihan lama, sehingga piutang macet menumpuk dan modal kerja habis terkunci di meja pelanggan.

---

## 2. Panduan Strategis Perpajakan Usaha HATOBA

Berdasarkan regulasi perpajakan Republik Indonesia (UU HPP No. 7/2021, PP 55 Tahun 2022, dan PMK 197/PMK.03/2013):

### A. Rekomendasi Status PKP: TETAP NON-PKP
* **Batasan Wajib PKP (Rp 4,8 Miliar per tahun):**
  Usaha dengan peredaran bruto (omset) di bawah Rp 4,8 Miliar setahun **TIDAK WAJIB** mendaftar sebagai Pengusaha Kena Pajak (PKP).
* **Risiko Fatal Jika Menjadi PKP Lebih Dini:**
  Jika terdaftar PKP, HATOBA wajib menerbitkan Faktur Pajak PPN 11%–12% dan menyetorkan uang PPN tersebut ke kas negara setiap akhir bulan berikutnya, terlepas apakah konsumen tempo sudah membayar tagihannya atau belum. Bagi usaha cold chain bermodal awal ramping, ini akan memicu krisis likuiditas kas.

### B. Skema PPh Final UMKM 0,5% (PP 55 Tahun 2022)
* Karena rekening penampungan saat ini menggunakan rekening personal (**Bank Mandiri 1370016639326 a.n Doni Kristiawan**), pencatatan pajak berada di bawah Wajib Pajak Orang Pribadi:
  * **Omzet Kumulatif s.d Rp 500 Juta Pertama per Tahun: 0% (BEBAS PAJAK).**
  * **Omzet Kumulatif di atas Rp 500 Juta: Dikenakan PPh Final 0,5% dari omzet riil.**
* **Contoh Simulasi:**
  Jika omzet tahun berjalan Rp 800 Juta:
  - Rp 500 Juta pertama = Rp 0 pajak.
  - Rp 300 Juta sisanya = 0,5% × Rp 300.000.000 = **Rp 1.500.000 per tahun** (sangat ringan dan aman bagi kas).

### C. Kapan Waktu yang Tepat Mendirikan & Mendaftarkan Badan (PT/CV)?
Tunggu hingga:
1. Rekening giro bank resmi atas nama perusahaan (PT/CV) telah terbit dan siap digunakan.
2. Omset stabil menembus Rp 1,5 Miliar – Rp 2 Miliar/tahun.
3. Saat mendaftar NPWP Badan, gunakan fasilitas PPh Final PP 55/2022 (berlaku 3–4 tahun) dan **tetap ajukan status Non-PKP**.

---

## 3. Formula Pembagian Margin Kotor (Gross Profit Allocation)

> **Kaidah Emas:** Margin Kotor bukanlah uang laba bebas di dompet pemilik!  
> $\text{Margin Kotor} = \text{Total Penjualan} - \text{HPP (Pembelian Daging Beku + Ongkir Kargo Masuk)}$

Untuk mengamankan nafas kas HATOBA di tengah sistem tempo konsumen, alokasikan Margin Kotor menggunakan metode **Bucket Cashflow Cold Chain**:

```
                              [ TOTAL MARGIN KOTOR ]
                                        │
         ┌──────────────────┬───────────┴───────────┬──────────────────┐
         ▼                  ▼                       ▼                  ▼
    [ 60% - 65% ]        [ 15% ]                 [ 10% ]            [ 10% ]
  Kas Putar Modal   Cadangan Darurat         Cadangan Risiko     Laba Ditahan /
    Operasional        Cold Chain            Piutang Macet        Prive Pemilik
  (Standby Mandiri) (Service Freezer)       (Buffer HORECA)     (Bila Kas Cair)
```

1. **60% - 65% Kas Putar Modal Operasional (Standby di Rekening Bank):**
   Uang talangan untuk belanja daging beku tunai ke RPH sebelum piutang konsumen tempo cair, serta membayar listrik freezer PLN, bensin armada, dan operasional harian.
2. **15% Cadangan Darurat Cold Chain:**
   Tabungan khusus untuk pemeliharaan kompresor freezer suhu -18°C, isi freon berkala, pembelian cooler box tambahan, atau perbaikan armada pendingin mendadak.
3. **10% Cadangan Risiko Piutang Macet (Bad Debt Buffer):**
   Peredam kas jika ada mitra restoran yang telat bayar >30 hari atau tutup mendadak agar roda belanja HATOBA tidak berhenti.
4. **10% Laba Bersih Ditahan / Prive Pemilik:**
   Boleh ditarik pemilik atau ditahan memperbesar modal **HANYA JIKA** piutang pesanan minggu tersebut sudah benar-benar masuk ke mutasi rekening bank.

---

## 4. SOP 4 Buku Pokok & Disiplin Cut-Off Mingguan

### 4 Buku Pokok Usaha Cold Chain:
1. **Buku Kas & Bank Riil (*Cash Basis Tracker*):**
   Hanya mencatat uang yang benar-benar masuk atau keluar rekening Bank Mandiri dan kasir hari ini.
2. **Buku Pembantu Piutang Usaha & Aging (*AR Aging Card*):**
   Mencatat per pelanggan: tanggal kirim, nomor faktur, tanggal jatuh tempo (default 3 hari), dan status (Lancar vs Terlambat).
3. **Buku Hutang Supplier (*Accounts Payable*):**
   Jadwal jatuh tempo pembayaran ke supplier daging/RPH/kargo.
4. **Buku Persediaan Stok & HPP (*Inventory Card Freezer*):**
   Pencatatan sisa berat fisik (kg) daging & jeroan di freezer dikalikan estimasi harga beli rata-rata.

### Jadwal & SOP Cut-Off Mingguan (Setiap Hari Jumat Sore):
1. **Pukul 15:00:** Finance mengunci (*cut-off*) seluruh faktur yang diterbitkan pada minggu berjalan.
2. **Pukul 15:30:** Rekonsiliasi mutasi rekening Bank Mandiri dengan daftar faktur lunas vs tempo.
3. **Pukul 16:00:** Lakukan pengecekan Buku Piutang Aging:
   * **Aturan Kunci:** Mitra kuliner dengan tagihan jatuh tempo >3 hari **DIBLOKIR SEMENTARA** dari pengiriman pesanan baru hingga tagihan lama diselesaikan (Cegah penumpukan piutang macet).
4. **Pukul 16:30:** Lakukan Stock Opname fisik freezer (timbang sisa pack/kg) dan masukkan ke menu *Stock Opname Freezer* di Mini ERP untuk memperbarui nilai persediaan di Neraca & HPP.
5. **Pukul 17:00:** Tentukan alokasi belanja stok daging minggu berikutnya berdasarkan **kas riil yang ada di Bank Mandiri**, bukan berdasarkan piutang di atas kertas.

---

## 5. Spesifikasi Teknis Sub-Sistem Mini ERP (`/finance`)

Sub-sistem Mini ERP dibangun terisolasi dari modul penjualan reguler untuk menjaga kerahasiaan keuangan internal perusahaan.

* **URL Akses:** `/finance`
* **API Endpoints:**
  - `GET /api/finance/auth`, `POST /api/finance/auth`, `DELETE /api/finance/auth`
  - `GET /api/finance/transactions`, `POST /api/finance/transactions`, `DELETE /api/finance/transactions`
  - `POST /api/finance/inventory` (Stock Opname Freezer)
  - `POST /api/finance/config` (Pengaturan Modal Awal & Saldo)
* **Keamanan Sesi:** Cookie `hatoba_finance_session` (terpisah dari `hatoba_admin_session`).
* **Kredensial Default:** `hatoba.finance2026` (dapat dikonfigurasi melalui environment variable `FINANCE_PASSWORD`).

---

## 6. Bagan Akun Standar (Chart of Accounts) & Jurnal Otomatis

Mini ERP HATOBA mengadopsi standar akuntansi SAK EMKM Indonesia yang disederhanakan:

| Kode Akun | Nama Akun | Kategori | Saldo Normal |
| :--- | :--- | :--- | :---: |
| **101** | Kas di Tangan (Kasir / Operasional) | Aset Lancar | Debit |
| **102** | Bank Mandiri (1370016639326 a.n Doni Kristiawan) | Aset Lancar | Debit |
| **103** | Piutang Usaha Konsumen (Tempo HATOBA) | Aset Lancar | Debit |
| **104** | Persediaan Daging & Jeroan Beku Cold Chain | Aset Lancar | Debit |
| **120** | Aset Peralatan Cold Chain (Freezer & Cooler Box) | Aset Tetap | Debit |
| **201** | Hutang Usaha / Supplier Daging & RPH | Kewajiban | Kredit |
| **202** | Hutang Biaya & Operasional Standby | Kewajiban | Kredit |
| **301** | Modal Awal Disetor Pemilik | Ekuitas | Kredit |
| **302** | Prive / Penarikan Dana Pemilik | Ekuitas | Debit |
| **303** | Laba Ditahan / Akumulasi Saldo Kas | Ekuitas | Kredit |
| **401** | Pendapatan Penjualan Daging & Jeroan Sapi | Pendapatan | Kredit |
| **402** | Pendapatan Lain-lain & Non-Operasional | Pendapatan | Kredit |
| **501** | HPP - Pembelian Daging & Jeroan Sapi | HPP | Debit |
| **502** | HPP - Biaya Kargo & Ekspedisi Pendingin Masuk | HPP | Debit |
| **601** | Beban Listrik Cold Storage & Freezer | Beban Operasional | Debit |
| **602** | Beban BBM & Pengiriman Armada Frozen | Beban Operasional | Debit |
| **603** | Beban Gaji & Upah Staf | Beban Operasional | Debit |
| **604** | Beban Kemasan Vacuum Pack & Ice Pack | Beban Operasional | Debit |
| **605** | Beban Pemeliharaan & Service Freezer | Beban Operasional | Debit |
| **606** | Beban Promosi & Operasional Marketing | Beban Operasional | Debit |
| **607** | Beban Administrasi Bank & Lainnya | Beban Operasional | Debit |

### Contoh Posting Jurnal Otomatis (Double Entry Engine):
1. **Penerimaan Pelunasan Piutang Konsumen (Rp 3.825.000):**
   - `[102] Debit: Bank Mandiri` = Rp 3.825.000
   - `[103] Kredit: Piutang Usaha Konsumen` = Rp 3.825.000
2. **Pembelian Stok Daging dari RPH (Rp 15.400.000):**
   - `[104] Debit: Persediaan Daging Beku` = Rp 15.400.000
   - `[102] Kredit: Bank Mandiri` = Rp 15.400.000
3. **Pembayaran Listrik Cold Storage (Rp 1.450.000):**
   - `[601] Debit: Beban Listrik Cold Storage` = Rp 1.450.000
   - `[102] Kredit: Bank Mandiri` = Rp 1.450.000

---

## 7. Petunjuk Pengoperasian Menu ERP bagi Staf Keuangan

Staf keuangan tidak perlu menghafal debit-kredit akuntansi. Cukup ikuti panduan berikut:

### A. Mencatat Kas Masuk / Keluar:
1. Klik tombol **"+ Catat Kas Masuk / Keluar"** di header atas.
2. Pilih tab **"Uang Masuk (Penerimaan)"** atau **"Uang Keluar (Pengeluaran)"**.
3. Pilih kategori yang sesuai (misal: *Penerimaan Pelunasan Piutang Konsumen* atau *Beli Daging Beku*).
4. Pilih rekening (**Bank Mandiri** atau **Kas di Tangan**).
5. Masukkan nominal rupiah dan nama pihak terkait (misal: *Warung Bu Kris*, *RPH Sapi*, *PLN*).
6. Klik **"Simpan & Posting Jurnal"**. Sistem otomatis membuat jurnal akuntansi dan mengupdate Laporan Arus Kas serta Neraca.

### B. Menagih & Mencairkan Piutang Konsumen:
1. Masuk ke tab **"Buku Piutang Tempo"**.
2. Perhatikan tagihan yang memiliki label merah **"Terlambat X hari"**.
3. Segera hubungi konsumen via WhatsApp untuk penagihan.
4. Ketika bukti transfer diterima di Bank Mandiri, klik tombol hijau **"Cairkan Kas"** pada baris pesanan tersebut. Form pencatatan kas masuk akan otomatis terisi dan siap disimpan.

### C. Melakukan Stock Opname Freezer (Perhitungan HPP):
1. Setiap cut-off mingguan, klik tombol **"Stok Freezer"** di header.
2. Masukkan total berat fisik daging beku yang ada di freezer (misal: 185 kg).
3. Nilai estimasi rupiah akan terhitung otomatis (atau dapat diubah manual sesuai harga beli rata-rata).
4. Klik **"Perbarui Neraca & HPP"**. Angka ini otomatis memperbarui nilai persediaan di Neraca dan mengoreksi HPP riil pada Laporan Laba Kotor.
