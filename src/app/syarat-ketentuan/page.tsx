import React from 'react'
import Link from 'next/link'
import { ArrowLeft, FileCheck } from 'lucide-react'

export const metadata = {
  title: 'Syarat & Ketentuan — HATOBA Group',
  description: 'Syarat dan ketentuan operasional perdagangan B2B dan kemitraan HATOBA Group.',
}

export default function SyaratKetentuanPage() {
  return (
    <div className="bg-[#FBF9F5] text-[#111613] min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[#8C6B24] hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Utama</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DFD5] shadow-lg shadow-stone-200/50 space-y-6">
          <div className="flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-[#8C6B24]" />
            <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#111613]">Syarat & Ketentuan</h1>
          </div>
          <p className="text-xs text-[#718078] font-mono">
            Ketentuan Operasional Komersial & Transaksi B2B HATOBA Group
          </p>

          <div className="prose prose-sm text-[#48564F] space-y-4 leading-relaxed">
            <h3 className="text-lg font-bold text-[#111613]">1. Ketentuan Umum Pemesanan B2B</h3>
            <p>
              Produk HATOBA Frozen Food yang tertera pada katalog ini adalah penawaran awal untuk
              pelaku bisnis kuliner (HORECA). Konfirmasi final ketersediaan stok, penjadwalan kirim,
              dan biaya pengiriman resmi disahkan melalui komunikasi terverifikasi WhatsApp bisnis kami.
            </p>

            <h3 className="text-lg font-bold text-[#111613]">2. Standar Penanganan Rantai Dingin (-18°C)</h3>
            <p>
              Seluruh produk kami dibekukan pada suhu minimal -18°C dengan kemasan vacuum seal. Mitra pembeli
              wajib menyediakan fasilitas penyimpanan beku (freezer) saat barang diterima untuk mencegah
              degradasi mutu daging beku (thawing tanpa kontrol).
            </p>

            <h3 className="text-lg font-bold text-[#111613]">3. Area Layanan & Distribusi</h3>
            <p>
              Layanan reguler saat ini beroperasi di wilayah <strong>Bali</strong> dan{' '}
              <strong>Yogyakarta</strong>. Permintaan pengiriman di luar wilayah hub operasional tersebut
              menggunakan mekanisme kargo beku pihak ketiga dengan ketentuan minimum order tersendiri.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

