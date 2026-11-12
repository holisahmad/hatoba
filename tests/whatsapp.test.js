const test = require('node:test')
const assert = require('node:assert')

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function generateReferenceCode(prefix) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `HTB-${prefix}-${dateStr}-${randomSuffix}`
}

function formatFixedOrderWhatsApp(order) {
  const itemList = order.items
    .map(
      (item) =>
        `• ${item.productName} (${item.variantName}) — ${item.quantity} pcs x ${formatRupiah(item.unitPrice)} = ${formatRupiah(item.subtotal)}`
    )
    .join('\n')

  const text = `Halo HATOBA Frozen Food, saya ingin melakukan pemesanan B2B.

Nomor Pesanan: *${order.referenceCode}*
Nama Pemesan: ${order.customerName}
Nama Usaha: ${order.businessName || '-'} (${order.businessType})
Hub Layanan: ${order.hubArea} (Kota: ${order.city})

Rincian Pesanan:
${itemList}

Total Estimasi Produk: *${formatRupiah(order.totalAmount)}*
${order.notes ? `Catatan Pengiriman: ${order.notes}\n` : ''}
Mohon konfirmasi ketersediaan stok, jadwal pengiriman rantai dingin, dan kelengkapan faktur. Terima kasih.`

  return `https://wa.me/628217368358?text=${encodeURIComponent(text)}`
}

test('generateReferenceCode formats correctly', () => {
  const code = generateReferenceCode('ORD')
  assert.match(code, /^HTB-ORD-\d{8}-\d{4}$/)
})

test('formatFixedOrderWhatsApp generates valid click-to-chat URL with proper encoding', () => {
  const sampleOrder = {
    referenceCode: 'HTB-ORD-20261112-9999',
    customerName: 'Hendra Saputra',
    businessName: 'Warung Babat Jogja',
    businessType: 'Restoran',
    phone: '081234567890',
    hubArea: 'Yogyakarta',
    city: 'Sleman',
    items: [
      {
        productName: 'Babat Sapi Frozen',
        variantName: 'Paket Partai (10 Pack)',
        quantity: 10,
        unitPrice: 65000,
        subtotal: 650000,
      },
    ],
    totalAmount: 650000,
  }

  const url = formatFixedOrderWhatsApp(sampleOrder)
  assert.ok(url.startsWith('https://wa.me/628217368358?text='))
  assert.ok(url.includes(encodeURIComponent('HTB-ORD-20261112-9999')))
  assert.ok(url.includes(encodeURIComponent('Warung Babat Jogja')))
  assert.ok(url.includes(encodeURIComponent('Babat Sapi Frozen')))
})

