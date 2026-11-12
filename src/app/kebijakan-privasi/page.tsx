import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata = {
  title: 'Kebijakan Privasi — HATOBA Group',
  description: 'Kebijakan privasi dan perlindungan data pribadi pelanggan dan mitra HATOBA Group.',
}

export default function KebijakanPrivasiPage() {
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
            <Shield className="w-8 h-8 text-[#8C6B24]" />
            <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#111613]">Kebijakan Privasi</h1>
          </div>
          <p className="text-xs text-[#718078] font-mono">
            Terakhir Diperbarui: 12 November 2026 • Kepatuhan UU Perlindungan Data Pribadi (UU PDP)
          </p>

          <div className="prose prose-sm text-[#48564F] space-y-4 leading-relaxed">
            <h3 className="text-lg font-bold text-[#111613]">1. Pendahuluan</h3>
            <p>
              HATOBA Group menghormati privasi pengunjung situs dan mitra bisnis kami. Dokumen
              Kebijakan Privasi ini menerangkan bagaimana kami mengumpulkan, menggunakan, dan melindungi
              informasi kontak yang Anda berikan melalui formulir pemesanan dan inquiry kemitraan di situs web ini.
            </p>

            <h3 className="text-lg font-bold text-[#111613]">2. Data yang Dikumpulkan</h3>
            <p>
              Kami hanya mengumpulkan data yang relevan untuk operasional bisnis dan konfirmasi pesanan:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nama pemesan atau perwakilan perusahaan (PIC).</li>
              <li>Nomor telepon / WhatsApp aktif.</li>
              <li>Nama entitas bisnis / restoran / hotel (jika ada).</li>
              <li>Kota dan area domisili tujuan pengiriman.</li>
              <li>Data atribusi pemasaran (sumber UTM, rujukan kampanye) untuk evaluasi performa kanal.</li>
            </ul>

            <h3 className="text-lg font-bold text-[#111613]">3. Pemanfaatan Data</h3>
            <p>
              Data yang Anda kirimkan semata-mata dimanfaatkan untuk:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Menghubungkan Anda dengan admin penjualan melalui WhatsApp resmi HATOBA.</li>
              <li>Memvalidasi cakupan area pengiriman rantai dingin (hub Bali dan Yogyakarta).</li>
              <li>Mencatat riwayat inquiry pemesanan agar pelayanan B2B dapat berlangsung konsisten.</li>
            </ul>

            <h3 className="text-lg font-bold text-[#111613]">4. Perlindungan & Kerahasiaan</h3>
            <p>
              Kami tidak pernah menjual, menyewakan, atau mendistribusikan data pribadi Anda kepada pihak
              ketiga manapun tanpa persetujuan Anda, kecuali diwajibkan oleh ketentuan hukum dan perundang-undangan yang berlaku.
            </p>

            <h3 className="text-lg font-bold text-[#111613]">5. Kontak Petugas Privasi</h3>
            <p>
              Jika Anda memiliki pertanyaan mengenai data pribadi Anda, Anda dapat menghubungi kami via
              email: <code> emailnyahatoba@gmail.com</code> atau WhatsApp: <code>+62 821-7368-358</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

