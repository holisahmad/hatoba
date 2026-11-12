export interface ProductVariant {
  id: string
  name: string
  packType: 'retail' | 'partai'
  weight: string
  portion: string
  minQty: number
  price: number // in IDR (integer)
  isAvailable: boolean
}

export interface ProductItem {
  id: string
  slug: string
  name: string
  category: string
  salesMode: 'FIXED_PACK' | 'RAW_INQUIRY'
  shortDescription: string
  description: string
  storageInfo: string
  handlingInfo: string
  featured: boolean
  image: string
  packagingImage: string
  variants: ProductVariant[]
}

export interface BusinessUnit {
  id: string
  code: string
  name: string
  badge: string
  statusType: 'active' | 'in_development' | 'expansion' | 'internal'
  tagline: string
  description: string
  highlights: string[]
  metrics: { label: string; value: string }[]
  ctaText: string
  ctaHref: string
}

export interface FootprintLocation {
  id: string
  name: string
  role: string
  status: 'ACTIVE' | 'PLANNED_2027'
  badge: string
  address: string
  description: string
  coverage: string[]
  coordinates: { x: number; y: number } // Percentage on Indonesian Map
  phone?: string
}

export interface RoadmapPhase {
  phase: string
  year: string
  title: string
  subtitle: string
  description: string
  deliverables: string[]
  status: 'active' | 'next' | 'future'
}

// Verified Business Units
export const BUSINESS_UNITS: BusinessUnit[] = [
  {
    id: 'frozen-food',
    code: 'FROZEN_FOOD',
    name: 'HATOBA Frozen Food',
    badge: 'Aktif & Beroperasi',
    statusType: 'active',
    tagline: 'Penyedia Bahan Baku Daging & Jeroan Sapi Berkualitas Tinggi',
    description:
      'Pemasok utama jeroan dan daging sapi olahan higienis (Babat, Iso, Paru, Iga, dan Mix) yang dibekukan pada suhu -18°C dalam kemasan vacuum-pack untuk standar ketat Hotel, Restoran, Katering, dan Kafe (HORECA).',
    highlights: [
      'Standar Higienis Rantai Dingin (-18°C)',
      'Kemasan Vacuum Pack Bersertifikasi Halal',
      'Pasokan Konsisten untuk Skala Retail & Partai B2B',
      'Distribusi Cepat di Wilayah Bali & Yogyakarta',
    ],
    metrics: [
      { label: 'Suhu Penyimpanan', value: '-18°C' },
      { label: 'Hub Aktif', value: 'Bali & DIY' },
      { label: 'Sektor Utama', value: 'HORECA' },
    ],
    ctaText: 'Katalog B2B & Pemesanan',
    ctaHref: '/frozen-food',
  },
  {
    id: 'culinary',
    code: 'CULINARY',
    name: 'HATOBA Culinary & Resto',
    badge: 'Pengembangan Tahap Lanjut',
    statusType: 'in_development',
    tagline: 'Jaringan Restoran Autentik Nusantara Berbasis Pasokan Mandiri',
    description:
      'Inisiatif hilir grup yang mengintegrasikan kelezatan kuliner Nusantara dengan keunggulan rantai pasok bahan baku internal, menghadirkan konsistensi rasa, mutu daging premium, dan efisiensi HPP yang kompetitif.',
    highlights: [
      'Konsep Kuliner Autentik Nusantara',
      'Integrasi 100% Pasokan Rantai Pasok Internal',
      'Standar Operasional Dapur Terpadu (SOP)',
      'Optimalisasi Margin Melalui Integrasi Vertikal',
    ],
    metrics: [
      { label: 'Integrasi Pasokan', value: 'Hulu ke Hilir' },
      { label: 'Format Bisnis', value: 'Restoran Retail' },
      { label: 'Tahap', value: 'Finalisasi Konsep' },
    ],
    ctaText: 'Kemitraan Restoran & Properti',
    ctaHref: '#kontak-form',
  },
  {
    id: 'agro',
    code: 'AGRO_LIVESTOCK',
    name: 'HATOBA Agro & Livestock',
    badge: 'Tahap Ekspansi Hulu',
    statusType: 'expansion',
    tagline: 'Ketahanan Pasokan & Kualitas Genetik Peternakan Terpadu',
    description:
      'Pengembangan peternakan sapi terintegrasi guna menjamin stabilitas pasokan hulu, seleksi pakan berkualitas tinggi, serta ketertelusuran genetik demi ketahanan pangan dan kesinambungan rantai dingin grup.',
    highlights: [
      'Program Pemuliaan & Penggemukan Sapi Terpadu',
      'Jaminan Ketertelusuran Pakan dan Kesehatan Ternak',
      'Mitigasi Fluktuasi Harga Pasar Daging Nasional',
      'Model Kemitraan Peternak Lokal Berkelanjutan',
    ],
    metrics: [
      { label: 'Fokus Hulu', value: 'Peternakan Terpadu' },
      { label: 'Ketertelusuran', value: 'Farm to Fork' },
      { label: 'Dampak', value: 'Ekonomi Lokal' },
    ],
    ctaText: 'Kerja Sama Pemasok Ternak',
    ctaHref: '#kontak-form',
  },
]

// Corporate Footprint
export const FOOTPRINT_LOCATIONS: FootprintLocation[] = [
  {
    id: 'bali',
    name: 'Bali — Kantor Pusat & Hub Produksi',
    role: 'Headquarters & Primary Production Hub',
    status: 'ACTIVE',
    badge: 'Beroperasi Aktif',
    address: 'Denpasar / Badung, Bali, Indonesia',
    description:
      'Pusat kendali operasional, manajemen mutu, fasilitas pengolahan higienis, dan pengemasan vacuum-pack bersuhu -18°C.',
    coverage: ['Denpasar', 'Badung', 'Gianyar', 'Sanur', 'Kuta', 'Seminyak'],
    coordinates: { x: 55, y: 78 }, // on SVG map canvas
    phone: '+62 821-7368-358',
  },
  {
    id: 'yogyakarta',
    name: 'Yogyakarta — Hub Distribusi Regional',
    role: 'Regional Distribution Hub (Jawa & DIY)',
    status: 'ACTIVE',
    badge: 'Beroperasi Aktif',
    address: 'Sleman / Kota Yogyakarta, D.I. Yogyakarta',
    description:
      'Pusat logistik rantai dingin strategis melayani rantai pasok HORECA, restoran lokal, dan mitra katering di wilayah Jawa Bagian Tengah.',
    coverage: ['Kota Yogyakarta', 'Sleman', 'Bantul', 'Klaten sekitarnya'],
    coordinates: { x: 42, y: 72 },
    phone: '+62 821-7368-358',
  },
  {
    id: 'bandung',
    name: 'Bandung — Rencana Ekspansi 2027',
    role: 'West Java Strategic Expansion Hub',
    status: 'PLANNED_2027',
    badge: 'Target Ekspansi 2027',
    address: 'Bandung Raya & Koridor Jawa Barat',
    description:
      'Infrastruktur distribusi baru yang disiapkan pada roadmap 2027 guna memperluas penetrasi ke pasar kuliner Jawa Barat dan penyangga Jabodetabek.',
    coverage: ['Bandung Raya (Tahap Persiapan 2027)'],
    coordinates: { x: 33, y: 68 },
  },
]

// Strategic Roadmap 2024 - 2027+
export const STRATEGIC_ROADMAP: RoadmapPhase[] = [
  {
    phase: 'Fase 1',
    year: '2024 - 2025',
    title: 'Fondasi & Dominasi B2B Rantai Dingin',
    subtitle: 'Penguatan Infrastruktur Produksi & Hub Distribusi',
    description:
      'Memperkokoh kapabilitas produksi vacuum pack di Bali dan efisiensi rantai distribusi di Yogyakarta untuk memenuhi kebutuhan segmen HORECA dengan standar mutu tanpa kompromi.',
    deliverables: [
      'Standardisasi fasilitas rantai dingin (-18°C)',
      'Ekspansi jaringan langganan hotel & resto Bali-DIY',
      'Peluncuran kemasan vacuum pack ritel & partai',
    ],
    status: 'active',
  },
  {
    phase: 'Fase 2',
    year: '2025 - 2026',
    title: 'Integrasi Hilir — Restoran HATOBA',
    subtitle: 'Ekspansi Hospitality & Ritel Kuliner Nusantara',
    description:
      'Membuka etalase kuliner perdana HATOBA Culinary, menyajikan hidangan autentik khas Nusantara berbahan baku langsung dari rantai pasok grup.',
    deliverables: [
      'Grand launching flagship outlet HATOBA Resto',
      'Penerapan SOP dapur higienis & efisiensi HPP terpadu',
      'Validasi model kemitraan kuliner dan properti',
    ],
    status: 'next',
  },
  {
    phase: 'Fase 3',
    year: '2027',
    title: 'Ekspansi Teritori — Hub Bandung',
    subtitle: 'Pusat Distribusi Baru Jawa Barat & Jabodetabek',
    description:
      'Akselerasi ekspansi geografis dengan peresmian fasilitas distribusi modern di Bandung guna melayani densitas bisnis kuliner Jawa Barat.',
    deliverables: [
      'Pembukaan Hub Logistik Rantai Dingin Bandung',
      'Penetrasi kemitraan supplier restoran Jawa Barat',
      'Penguatan integrasi armada armada pendingin regional',
    ],
    status: 'future',
  },
  {
    phase: 'Fase 4',
    year: '2027+',
    title: 'Konsolidasi Hulu & Rantai Nilai Mandiri',
    subtitle: 'Peternakan Terintegrasi & Ketahanan Pasokan Pangan',
    description:
      'Penyelesaian siklus integrasi hulu-hilir melalui unit Agro & Peternakan mandiri guna menjamin kemandirian pasokan dan ketahanan ekosistem pangan grup.',
    deliverables: [
      'Integrasi penuh fasilitas peternakan sapi binaan',
      'Ketertelusuran kualitas daging hulu-ke-hilir (Farm-to-Fork)',
      'Fondasi holding grup yang tangguh, mandiri, dan berkelanjutan',
    ],
    status: 'future',
  },
]

// Group Synergies
export const GROUP_SYNERGIES = [
  {
    title: 'Kontrol Kualitas Hulu ke Hilir',
    subtitle: 'Integritas Bahan Baku & Efisiensi Biaya (HPP)',
    description:
      'Sinergi erat antara pengadaan peternakan, pemrosesan beku bersuhu -18°C, dan pemanfaatan langsung di unit kuliner memangkas biaya perantara serta menjaga keaslian kualitas daging tanpa degradasi.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Infrastruktur Rantai Dingin Teruji',
    subtitle: 'Higienitas & Keamanan Pangan Tanpa Kompromi',
    description:
      'Dari fasilitas produksi hingga meja dapur mitra HORECA, rantai dingin terlindungi secara presisi. Kemasan kedap udara (vacuum pack) mengunci kesegaran tekstur, aroma, dan nutrisi alami produk.',
    icon: 'Snowflake',
  },
  {
    title: 'Kemitraan Terpercaya & Kontinuitas Pasokan',
    subtitle: 'Ekosistem Terintegrasi untuk Ketahanan Bisnis Mitra',
    description:
      'Didukung fondasi holding grup yang solid dan terintegrasi dari hulu ke hilir, kami menjamin kestabilan suplai berkala, kepastian spesifikasi potongan, serta kontinuitas bisnis jangka panjang yang saling menguntungkan.',
    icon: 'TrendingUp',
  },
]

// Verified Product Catalog
export const CATALOG_PRODUCTS: ProductItem[] = [
  {
    id: 'babat-sapi',
    slug: 'babat-sapi-frozen',
    name: 'Babat Sapi Frozen',
    category: 'Jeroan Sapi Higienis',
    salesMode: 'FIXED_PACK',
    shortDescription:
      'Babat sapi pilihan dengan tekstur kenyal sempurna, bersih higienis, siap olah untuk soto, gulai, oseng, dan babat gongso.',
    description:
      'Babat Sapi HATOBA diproses melalui pencucian berstandar ketat tanpa bahan kimia berbahaya, diolah higienis, dan langsung dibekukan pada suhu -18°C dengan kemasan vacuum seal. Pilihan utama dapur restoran dan katering.',
    storageInfo: 'Simpan beku pada suhu minimal -18°C. Jangan dibekukan kembali setelah dicairkan (thawing).',
    handlingInfo: 'Rendam kemasan dalam air dingin untuk thawing bertahap sebelum diolah.',
    featured: true,
    image: '/images/products/foto-babat.jpeg',
    packagingImage: '/images/products/kemasan-babat.png',
    variants: [
      {
        id: 'babat-retail',
        name: 'Kemasan Ritel (Pouch Vacuum)',
        packType: 'retail',
        weight: '240 gr',
        portion: 'Porsi 3 orang',
        minQty: 1,
        price: 45000,
        isAvailable: true,
      },
      {
        id: 'babat-partai',
        name: 'Paket Partai / HORECA (Min. 10 Pack)',
        packType: 'partai',
        weight: 'Kemasan Partai Khusus',
        portion: 'Porsi 5 orang per pack',
        minQty: 10,
        price: 65000,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'iso-sapi',
    slug: 'iso-sapi-frozen',
    name: 'Iso Sapi Frozen',
    category: 'Jeroan Sapi Higienis',
    salesMode: 'FIXED_PACK',
    shortDescription:
      'Usus sapi (iso) premium bersih, gurih, dan empuk. Cocok untuk hidangan gulai iso, baceman, goreng gurih, atau sup.',
    description:
      'Iso Sapi HATOBA dibersihkan mendalam dengan standar food-grade profesional sehingga bebas aroma tak sedap. Dikemas rapat kedap udara menjaga kesegaran gurih alami dan kelembutan tekstur khas.',
    storageInfo: 'Simpan dalam freezer bersuhu -18°C.',
    handlingInfo: 'Keluarkan 30 menit sebelum pengolahan atau rebus sebentar dengan rempah aromatik.',
    featured: true,
    image: '/images/products/foto-iso.jpeg',
    packagingImage: '/images/products/kemasan-iso.png',
    variants: [
      {
        id: 'iso-retail',
        name: 'Kemasan Ritel (Pouch Vacuum)',
        packType: 'retail',
        weight: '240 gr',
        portion: 'Porsi 3 orang',
        minQty: 1,
        price: 43500,
        isAvailable: true,
      },
      {
        id: 'iso-partai',
        name: 'Paket Partai / HORECA (Min. 10 Pack)',
        packType: 'partai',
        weight: 'Kemasan Partai Khusus',
        portion: 'Porsi 5 orang per pack',
        minQty: 10,
        price: 65000,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'paru-sapi',
    slug: 'paru-sapi-frozen',
    name: 'Paru Sapi Frozen',
    category: 'Jeroan Sapi Higienis',
    salesMode: 'FIXED_PACK',
    shortDescription:
      'Paru sapi segar dengan tekstur pori padat dan lembut. Favorit untuk paru goreng serundeng, rica-rica, balado, maupun rendang.',
    description:
      'Paru Sapi HATOBA dipilih dari sapi sehat berkualitas tinggi. Tekstur porinya padat dan tidak susut berlebih saat dimasak. Menghasilkan paru goreng yang renyah di luar dan juicy lembut di dalam.',
    storageInfo: 'Freezer bersuhu -18°C.',
    handlingInfo: 'Iris tipis sesuai selera saat setengah beku untuk kemudahan potongan rapi.',
    featured: true,
    image: '/images/products/foto-paru.jpeg',
    packagingImage: '/images/products/kemasan-paru.png',
    variants: [
      {
        id: 'paru-retail',
        name: 'Kemasan Ritel (Pouch Vacuum)',
        packType: 'retail',
        weight: '300 gr',
        portion: 'Porsi 3 orang',
        minQty: 1,
        price: 49500,
        isAvailable: true,
      },
      {
        id: 'paru-partai',
        name: 'Paket Partai / HORECA (Min. 10 Pack)',
        packType: 'partai',
        weight: 'Kemasan Partai Khusus',
        portion: 'Porsi 5 orang per pack',
        minQty: 10,
        price: 70000,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'iga-sapi',
    slug: 'iga-sapi-frozen',
    name: 'Iga Sapi Frozen',
    category: 'Daging & Tulang Pilihan',
    salesMode: 'FIXED_PACK',
    shortDescription:
      'Potongan iga sapi berdaging tebal dan berlemak gurih pas. Sangat ideal untuk sup konro, iga bakar madu, asem-asem, dan pindang iga.',
    description:
      'Iga Sapi HATOBA memiliki perbandingan daging dan tulang yang optimal. Daging menempel kokoh pada tulang dengan marbling lemak alami yang lumer saat dipresto atau direbus perlahan.',
    storageInfo: 'Simpan beku pada suhu minimal -18°C.',
    handlingInfo: 'Rebus perlahan dengan api kecil atau gunakan pressure cooker untuk keempukan maksimal.',
    featured: true,
    image: '/images/products/foto-iga.jpeg',
    packagingImage: '/images/products/kemasan-iga.png',
    variants: [
      {
        id: 'iga-retail',
        name: 'Kemasan Ritel (Pouch Vacuum)',
        packType: 'retail',
        weight: '300 gr',
        portion: 'Porsi 2-3 orang',
        minQty: 1,
        price: 82500,
        isAvailable: true,
      },
      {
        id: 'iga-partai',
        name: 'Paket Partai / HORECA (Min. 10 Pack)',
        packType: 'partai',
        weight: 'Kemasan Partai Khusus',
        portion: 'Porsi 5 orang per pack',
        minQty: 10,
        price: 120000,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'mix-4-lauk',
    slug: 'mix-4-lauk-frozen',
    name: 'Mix 4 Lauk Frozen',
    category: 'Kombinasi Aneka Jeroan & Daging',
    salesMode: 'FIXED_PACK',
    shortDescription:
      'Kombinasi komplit babat, iso, paru, dan daging iga dalam satu kemasan praktis. Solusi hemat variasi menu untuk usaha kuliner.',
    description:
      'Dirancang khusus bagi pemilik warung makan, katering, dan keluarga yang menginginkan sajian aneka olahan daging dan jeroan dalam porsi seimbang tanpa harus membeli tiap varian secara terpisah.',
    storageInfo: 'Simpan beku pada suhu -18°C.',
    handlingInfo: 'Keluarkan dan pisahkan sesuai rencana masakan atau olah bersamaan menjadi hidangan campur spesial.',
    featured: true,
    image: '/images/products/foto-mix.jpg',
    packagingImage: '/images/products/kemasan-mix.png',
    variants: [
      {
        id: 'mix-retail',
        name: 'Kemasan Ritel Spesial',
        packType: 'retail',
        weight: 'Sesuai pesanan',
        portion: 'Porsi 3-4 orang',
        minQty: 1,
        price: 72500,
        isAvailable: true,
      },
    ],
  },
]

// Raw materials for Chat Admin consultation
export const RAW_PRODUCTS = [
  {
    id: 'raw-babat',
    name: 'Babat Sapi Mentah / Karkas Kustom',
    category: 'Bahan Baku Mentah Skala Industri',
    description: 'Pasokan babat sapi mentah segar beku tanpa bumbu dalam volume karung/karton untuk pengolah makanan skala besar.',
    salesMode: 'RAW_INQUIRY',
    unit: 'Kilogram (Kg)',
  },
  {
    id: 'raw-iso',
    name: 'Iso Sapi Mentah Grade A',
    category: 'Bahan Baku Mentah Skala Industri',
    description: 'Usus sapi mentah pilihan bersertifikat higienis untuk kebutuhan pabrik pengolahan sosis, bakso, atau katering.',
    salesMode: 'RAW_INQUIRY',
    unit: 'Kilogram (Kg)',
  },
  {
    id: 'raw-paru',
    name: 'Paru Sapi Utuh / Blok Mentah',
    category: 'Bahan Baku Mentah Skala Industri',
    description: 'Paru sapi blok beku dengan ketebalan prima untuk pasokan restoran padang, rumah makan, dan produsen keripik paru.',
    salesMode: 'RAW_INQUIRY',
    unit: 'Kilogram (Kg)',
  },
  {
    id: 'raw-iga',
    name: 'Iga Sapi Cut Utuh / Short Ribs B2B',
    category: 'Bahan Baku Mentah Skala Industri',
    description: 'Potongan iga sapi custom cut (panjang/ketebalan disesuaikan) untuk menu signature hotel bintang dan restoran steak/barbeque.',
    salesMode: 'RAW_INQUIRY',
    unit: 'Kilogram (Kg)',
  },
]

export const CORPORATE_CONTACT = {
  phone: '+62 821-7368-358',
  phoneClean: '628217368358',
  email: 'corporate@hatobagroup.com',
  workingHours: 'Senin - Sabtu: 08.00 - 17.00 WITA / WIB',
  catalogs: {
    landscape: '/docs/Katalog_Produk_HATOBA_landscape.pdf',
    portrait: '/docs/Katalog_Produk_HATOBA_Potret_Emas.pdf',
  },
}

