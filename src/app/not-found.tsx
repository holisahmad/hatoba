import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center text-[#111613] px-4">
      <div className="text-center space-y-6 max-w-md bg-white p-10 rounded-3xl border border-[#E8DFD5] shadow-xl shadow-stone-200/50">
        <div className="font-cinzel text-8xl font-bold text-[#8C6B24] opacity-90">404</div>
        <h1 className="font-cinzel text-2xl font-bold tracking-widest uppercase text-[#111613]">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-[#5C6E65] font-jakarta leading-relaxed text-sm">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C59B47] text-white font-jakarta font-semibold text-sm rounded-full hover:bg-[#8C6B24] transition-colors shadow-md"
          >
            ← Kembali ke Beranda
          </Link>
          <Link
            href="/frozen-food"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#C59B47] text-[#8C6B24] font-jakarta font-semibold text-sm rounded-full hover:bg-[#FAF8F5] transition-colors"
          >
            Lihat Katalog B2B
          </Link>
        </div>
        <p className="text-[#718078] text-xs font-jakarta pt-4">
          HATOBA Group · Bali & Yogyakarta
        </p>
      </div>
    </div>
  )
}

