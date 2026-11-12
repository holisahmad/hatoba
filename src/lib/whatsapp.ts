import { CORPORATE_CONTACT } from './catalog-data'

export function generateReferenceCode(prefix: 'ORD' | 'INQ' | 'CORP'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `HTB-${prefix}-${dateStr}-${randomSuffix}`
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export interface FixedOrderItem {
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface FixedOrderPayload {
  referenceCode: string
  customerName: string
  businessName?: string
  businessType: string
  phone: string
  hubArea: 'Bali' | 'Yogyakarta' | 'Luar Area Layanan'
  city: string
  notes?: string
  items: FixedOrderItem[]
  totalAmount: number
}

export function formatFixedOrderWhatsApp(order: FixedOrderPayload): string {
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

  return `https://wa.me/${CORPORATE_CONTACT.phoneClean}?text=${encodeURIComponent(text)}`
}

export interface RawInquiryPayload {
  referenceCode: string
  customerName: string
  businessName?: string
  businessType: string
  phone: string
  city: string
  productRequested: string
  specification?: string
  estimatedQuantity: string
  notes?: string
}

export function formatRawInquiryWhatsApp(inquiry: RawInquiryPayload): string {
  const text = `Halo Tim HATOBA Frozen Food, saya ingin meminta penawaran bahan baku / karkas mentah.

Nomor Inquiry: *${inquiry.referenceCode}*
Nama Pemohon: ${inquiry.customerName}
Usaha: ${inquiry.businessName || '-'} (${inquiry.businessType})
Lokasi / Kota: ${inquiry.city}

Produk Diminta: *${inquiry.productRequested}*
Spesifikasi / Cut: ${inquiry.specification || 'Standar Higienis B2B'}
Estimasi Kebutuhan: ${inquiry.estimatedQuantity}
${inquiry.notes ? `Catatan Tambahan: ${inquiry.notes}\n` : ''}
Mohon informasi penawaran harga terbaik, ketersediaan tonase, dan skema kerja sama pasokan rutin. Terima kasih.`

  return `https://wa.me/${CORPORATE_CONTACT.phoneClean}?text=${encodeURIComponent(text)}`
}

export interface CorporateInquiryPayload {
  referenceCode: string
  category: string
  fullName: string
  institutionName?: string
  marketingName?: string
  email?: string
  city: string
  message: string
}

export function formatCorporateInquiryWhatsApp(corp: CorporateInquiryPayload): string {
  const text = `Halo Manajemen HATOBA Group,

Nomor Registrasi: *${corp.referenceCode}*
Kategori Kemitraan: *${corp.category}*
Nama Mitra: ${corp.fullName}
Institusi / Perusahaan: ${corp.institutionName || '-'}
Kota / Domisili: ${corp.city}
${corp.marketingName ? `Nama Marketing / Ref: *${corp.marketingName}*\n` : ''}${corp.email ? `Email: ${corp.email}\n` : ''}
Pesan / Deskripsi Peluang:
"${corp.message}"

Mohon tanggapan dan arahan untuk pembahasan lebih lanjut. Terima kasih.`

  return `https://wa.me/${CORPORATE_CONTACT.phoneClean}?text=${encodeURIComponent(text)}`
}

