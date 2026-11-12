const { Client } = require('pg')

const client = new Client({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@db.ufqxxhgavmqezwxvfsvw.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

// Exact 5 Products from Katalog Edisi 2026 (13-page PDF)
const CATALOG_2026 = [
  {
    id: 'babat-sapi',
    slug: 'babat-sapi-frozen',
    name: 'Babat Sapi',
    category: 'Jeroan Sapi Higienis',
    salesMode: 'FIXED_PACK',
    shortDescription: 'Bersih, empuk, tanpa bau. Babat sapi pilihan yang sudah dibersihkan dan diproses khusus untuk menghilangkan bau. Tekstur empuk, langsung siap diolah.',
    description: 'Babat sapi pilihan yang sudah dibersihkan dan diproses khusus untuk menghilangkan bau. Tekstur empuk, langsung siap diolah. Cocok untuk hidangan goreng, bakar, maupun babat gongso.',
    storageInfo: 'Simpan beku pada suhu −18°C dalam kemasan vacuum pack.',
    handlingInfo: 'Tinggal goreng / bakar. Ide penyajian: Goreng, bakar, gongso.',
    featured: true,
    image: '/images/products/foto-babat.jpeg',
    packagingImage: '/images/products/kemasan-babat.png',
    badge: 'Terlaris',
    isAvailable: true,
    variants: [
      {
        id: 'babat-retail',
        name: 'Kemasan Ecer (1 pack · 3 porsi)',
        packType: 'retail',
        weight: '240 gr',
        portion: '1 pack · 3 porsi',
        minQty: 1,
        price: 45000,
        isAvailable: true,
      },
      {
        id: 'babat-partai',
        name: 'Kemasan Partai (1 pack · 5 porsi)',
        packType: 'partai',
        weight: 'Min. 10 pack',
        portion: '1 pack · 5 porsi',
        minQty: 10,
        price: 65000,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'iso-sapi',
    slug: 'iso-sapi-frozen',
    name: 'Iso Sapi',
    category: 'Jeroan Sapi Higienis',
    salesMode: 'FIXED_PACK',
    shortDescription: 'Kenyal, bersih, tanpa bau. Usus sapi pilihan dengan tekstur kenyal yang khas. Bersih, tanpa bau, dan cocok digoreng maupun dibakar.',
    description: 'Usus sapi pilihan dengan tekstur kenyal yang khas. Bersih, tanpa bau, dan sangat cocok digoreng, dibakar, atau dimasak bumbu pedas manis.',
    storageInfo: 'Simpan beku pada suhu −18°C dalam kemasan vacuum pack.',
    handlingInfo: 'Tinggal goreng / bakar. Ide penyajian: Goreng, bakar, bumbu pedas manis.',
    featured: true,
    image: '/images/products/foto-iso.jpeg',
    packagingImage: '/images/products/kemasan-iso.png',
    badge: 'Vacuum Sealed',
    isAvailable: true,
    variants: [
      {
        id: 'iso-retail',
        name: 'Kemasan Ecer (1 pack · 3 porsi)',
        packType: 'retail',
        weight: '240 gr',
        portion: '1 pack · 3 porsi',
        minQty: 1,
        price: 43500,
        isAvailable: true,
      },
      {
        id: 'iso-partai',
        name: 'Kemasan Partai (1 pack · 5 porsi)',
        packType: 'partai',
        weight: 'Min. 10 pack',
        portion: '1 pack · 5 porsi',
        minQty: 10,
        price: 65000,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'paru-sapi',
    slug: 'paru-sapi-frozen',
    name: 'Paru Sapi',
    category: 'Jeroan Sapi Higienis',
    salesMode: 'FIXED_PACK',
    shortDescription: 'Empuk, tidak alot, gurih. Paru sapi yang bersih dan empuk, tidak alot, dengan rasa gurih yang konsisten. Praktis untuk dapur harian.',
    description: 'Paru sapi yang bersih dan empuk, tidak alot, dengan rasa gurih yang konsisten. Sangat praktis untuk kebutuhan dapur harian, restoran, dan katering.',
    storageInfo: 'Simpan beku pada suhu −18°C dalam kemasan vacuum pack.',
    handlingInfo: 'Tinggal goreng / bakar. Ide penyajian: Goreng, empal, sambal paru.',
    featured: true,
    image: '/images/products/foto-paru.jpeg',
    packagingImage: '/images/products/kemasan-paru.png',
    badge: 'Vacuum Sealed',
    isAvailable: true,
    variants: [
      {
        id: 'paru-retail',
        name: 'Kemasan Ecer (1 pack · 3 porsi)',
        packType: 'retail',
        weight: '300 gr',
        portion: '1 pack · 3 porsi',
        minQty: 1,
        price: 49500,
        isAvailable: true,
      },
      {
        id: 'paru-partai',
        name: 'Kemasan Partai (1 pack · 5 porsi)',
        packType: 'partai',
        weight: 'Min. 10 pack',
        portion: '1 pack · 5 porsi',
        minQty: 10,
        price: 70000,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'iga-sapi',
    slug: 'iga-sapi-frozen',
    name: 'Iga Sapi',
    category: 'Daging & Tulang Pilihan',
    salesMode: 'FIXED_PACK',
    shortDescription: 'Daging tebal, rasa mantap. Iga sapi berdaging tebal dengan rasa yang mantap. Siap diolah untuk menu berkuah maupun bakar.',
    description: 'Iga sapi berdaging tebal dengan rasa mantap dan marbling gurih alami. Siap diolah langsung untuk menu sop iga gurih, iga bakar istimewa, atau iga goreng rempah.',
    storageInfo: 'Simpan beku pada suhu −18°C dalam kemasan vacuum pack.',
    handlingInfo: 'Tinggal goreng / bakar. Ide penyajian: Sop iga, iga bakar, iga goreng.',
    featured: true,
    image: '/images/products/foto-iga.jpeg',
    packagingImage: '/images/products/kemasan-iga.png',
    badge: 'Premium Cut',
    isAvailable: true,
    variants: [
      {
        id: 'iga-retail',
        name: 'Kemasan Ecer (1 pack · 3 porsi)',
        packType: 'retail',
        weight: '500 gr',
        portion: '1 pack · 3 porsi',
        minQty: 1,
        price: 82500,
        isAvailable: true,
      },
      {
        id: 'iga-partai',
        name: 'Kemasan Partai (1 pack · 5 porsi)',
        packType: 'partai',
        weight: 'Min. 10 pack',
        portion: '1 pack · 5 porsi',
        minQty: 10,
        price: 120000,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'mix-4-lauk',
    slug: 'mix-4-lauk-frozen',
    name: 'Mix 4 Lauk (Iga · Paru · Babat · Iso)',
    category: 'Kombinasi Aneka Jeroan & Daging',
    salesMode: 'FIXED_PACK',
    shortDescription: 'Empat lauk dalam satu pack. Paket praktis berisi empat jeroan pilihan Hatoba: iga, paru, babat, dan iso. Cocok untuk menu campur dan porsi bersama.',
    description: 'Paket komplit dan praktis berisi empat jeroan & daging pilihan Hatoba: iga sapi, paru sapi, babat sapi, dan iso sapi dalam satu kemasan higienis. Sangat cocok untuk menu campur dan sajian porsi bersama.',
    storageInfo: 'Simpan beku pada suhu −18°C dalam kemasan vacuum pack.',
    handlingInfo: 'Tinggal goreng / bakar. Berat bersih: Sesuai order.',
    featured: true,
    image: '/images/products/foto-mix.jpg',
    packagingImage: '/images/products/kemasan-mix.png',
    badge: 'Paket Komplit',
    isAvailable: true,
    variants: [
      {
        id: 'mix-retail',
        name: 'Kemasan Ecer (1 pack · 3 porsi)',
        packType: 'retail',
        weight: 'Sesuai order',
        portion: '1 pack · 3 porsi',
        minQty: 1,
        price: 72500,
        isAvailable: true,
      },
    ],
  },
]

async function run() {
  await client.connect()
  console.log('Connected to Supabase PostgreSQL!')

  // 1. Delete old kikil if present
  await client.query("DELETE FROM hatoba_products WHERE id = 'kikil-sapi'")
  console.log('Removed obsolete products (kikil-sapi)')

  // 2. Upsert 5 official catalog products
  for (const prod of CATALOG_2026) {
    const updatedAt = new Date().toISOString()
    const productWithMeta = { ...prod, updatedAt }
    await client.query(
      `INSERT INTO hatoba_products (id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      [prod.id, JSON.stringify(productWithMeta)]
    )
    console.log(`Upserted: ${prod.name} (${prod.id})`)
  }

  // 3. Verify
  const rows = await client.query('SELECT id, data->>\'name\' as name, updated_at FROM hatoba_products ORDER BY id')
  console.log('\n--- Verified Products in Supabase ---')
  rows.rows.forEach(r => console.log(`• ${r.id}: ${r.name}`))

  await client.end()
  console.log('\nSupabase Database catalog update complete!')
}

run().catch(err => {
  console.error('Update failed:', err)
  process.exit(1)
})
