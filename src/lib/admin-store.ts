import { CATALOG_PRODUCTS, ProductItem } from './catalog-data'
import { supabaseAdmin as supabase } from './supabase'

export interface OrderItem {
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type OrderStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface AdminOrder {
  id: string
  referenceCode: string
  createdAt: string
  customerName: string
  businessName?: string
  businessType?: string
  phone: string
  hubArea: string
  city: string
  marketingName?: string
  notes?: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  verifiedAt?: string
  rejectedAt?: string
  statusNotes?: string
  adjustmentNotes?: string
  originalItems?: OrderItem[]
  paymentMethod?: string
  paymentStatus?: 'LUNAS' | 'DP' | 'TEMPO' | 'BELUM_BAYAR'
  source?: 'WEB' | 'POS' | 'WHATSAPP' | 'TELEPON'
  paidAmount?: number
  changeAmount?: number
  dueDate?: string
}

export interface AdminProduct extends ProductItem {
  badge?: string
  discountPercent?: number
  originalPrice?: number
  isAvailable?: boolean
  updatedAt?: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  action:
    | 'ORDER_VERIFIED'
    | 'ORDER_REJECTED'
    | 'ORDER_PENDING'
    | 'MENU_CREATED'
    | 'MENU_UPDATED'
    | 'MENU_DELETED'
    | 'ORDER_RECEIVED'
    | 'ADMIN_LOGIN'
    | 'POS_TRANSACTION'
    | 'PAYMENT_RECEIVED'
    | 'SETTINGS_UPDATE'
  title: string
  description: string
  adminUser: string
  metadata?: Record<string, unknown>
}

// In-memory fallback caches
let cachedProducts: AdminProduct[] | null = null
let cachedOrders: AdminOrder[] | null = null
let cachedLogs: ActivityLog[] | null = null

// Initial Fallback Orders
const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ord-pos-sample',
    referenceCode: 'POS-2611-P108',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    customerName: 'Ibu H. Siti Aminah',
    businessName: 'Warung Nasi Campur Bali',
    businessType: 'Restoran / Rumah Makan',
    phone: '081398765432',
    hubArea: 'Bali',
    city: 'Denpasar',
    marketingName: 'Kasir POS',
    notes: 'Order Kasir Langsung',
    items: [
      {
        productName: 'Mix 4 Lauk (Iga · Paru · Babat · Iso)',
        variantName: 'Kemasan Ecer (1 pack · 3 porsi)',
        quantity: 2,
        unitPrice: 72500,
        subtotal: 145000,
      },
    ],
    totalAmount: 145000,
    paidAmount: 145000,
    changeAmount: 0,
    paymentMethod: 'Tunai',
    paymentStatus: 'LUNAS',
    source: 'POS',
    status: 'VERIFIED',
    verifiedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    statusNotes: 'Dibuat via Kasir POS (Tunai) — Lunas Rp 145.000',
  },
  {
    id: 'ord-init-01',
    referenceCode: 'ORD-2611-B892',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    customerName: 'Bpk. Hendra Gunawan',
    businessName: 'Warung Bu Kris Express Denpasar',
    businessType: 'Restoran / Rumah Makan',
    phone: '081234567890',
    hubArea: 'Bali',
    city: 'Denpasar',
    marketingName: 'Rian Wijaya',
    notes: 'Kirim sebelum jam 10 WITA, tolong pastikan es pendingin cukup.',
    items: [
      {
        productName: 'Babat Sapi Ungkep',
        variantName: 'Partai 10 Pack (2.4 Kg)',
        quantity: 2,
        unitPrice: 285000,
        subtotal: 570000,
      },
      {
        productName: 'Paru Sapi Rempah Gurih',
        variantName: 'Partai 10 Pack (2.4 Kg)',
        quantity: 1,
        unitPrice: 295000,
        subtotal: 295000,
      },
    ],
    totalAmount: 865000,
    status: 'VERIFIED',
    verifiedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    statusNotes: 'Pembayaran DP 50% telah diterima via Mandiri.',
  },
  {
    id: 'ord-init-02',
    referenceCode: 'ORD-2611-Y415',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: 'Ibu Ratna Dewi',
    businessName: 'Katering Sedap Malioboro',
    businessType: 'Katering Acara',
    phone: '081987654321',
    hubArea: 'Yogyakarta',
    city: 'Sleman',
    marketingName: 'Siti Rahma',
    notes: 'Kemasan vacuum pastikan beku keras -18°C.',
    items: [
      {
        productName: 'Iga Sapi Potong Premium',
        variantName: 'Partai 10 Pack (5.0 Kg)',
        quantity: 2,
        unitPrice: 650000,
        subtotal: 1300000,
      },
    ],
    totalAmount: 1300000,
    status: 'PENDING',
  },
]

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-init-01',
    action: 'POS_TRANSACTION',
    title: 'Transaksi Kasir POS',
    description: 'Transaksi Kasir POS-2611-P108 dari Ibu H. Siti Aminah senilai Rp 145.000 (Tunai)',
    adminUser: 'Kasir POS',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    metadata: { referenceCode: 'POS-2611-P108', totalAmount: 145000 },
  },
  {
    id: 'log-init-02',
    action: 'ORDER_RECEIVED',
    title: 'Order Baru Masuk',
    description: 'Pesanan ORD-2611-Y415 dari Ibu Ratna Dewi (Sleman) senilai Rp 1.300.000',
    adminUser: 'Sistem Web',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    metadata: { referenceCode: 'ORD-2611-Y415', totalAmount: 1300000 },
  },
]

// ==================== ORDERS STORE (SUPABASE + CACHE) ====================
export async function getAdminOrders(): Promise<AdminOrder[]> {
  try {
    const { data, error } = await supabase
      .from('hatoba_orders')
      .select('data')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[admin-store] Supabase getAdminOrders error, using cache:', error.message)
      return cachedOrders || INITIAL_ORDERS
    }

    if (data && data.length > 0) {
      const orders = data.map((row) => row.data as AdminOrder)
      cachedOrders = orders
      return orders
    }

    // If empty in DB, return initial orders
    return cachedOrders || INITIAL_ORDERS
  } catch (err) {
    console.warn('[admin-store] getAdminOrders fallback:', (err as Error).message)
    return cachedOrders || INITIAL_ORDERS
  }
}

export async function addAdminOrder(
  order: Omit<AdminOrder, 'id' | 'createdAt' | 'status'> & Partial<Pick<AdminOrder, 'status'>>
): Promise<AdminOrder> {
  const newOrder: AdminOrder = {
    ...order,
    id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: order.status || 'PENDING',
  }

  try {
    const { error } = await supabase.from('hatoba_orders').insert({
      id: newOrder.id,
      reference_code: newOrder.referenceCode,
      status: newOrder.status,
      data: newOrder,
      created_at: newOrder.createdAt,
    })

    if (error) {
      console.warn('[admin-store] Supabase insert order error:', error.message)
    }
  } catch (err) {
    console.warn('[admin-store] Supabase insert order exception:', (err as Error).message)
  }

  // Update in-memory cache
  if (!cachedOrders) {
    cachedOrders = [...INITIAL_ORDERS]
  }
  cachedOrders.unshift(newOrder)

  // Record activity log
  const isPos = newOrder.source === 'POS' || newOrder.referenceCode.includes('POS')
  await recordActivityLog({
    action: isPos ? 'POS_TRANSACTION' : 'ORDER_RECEIVED',
    title: isPos ? 'Transaksi Kasir POS' : 'Order Baru Masuk',
    description: isPos
      ? `Transaksi Kasir ${newOrder.referenceCode} (${newOrder.customerName} · ${newOrder.city}) senilai Rp ${newOrder.totalAmount.toLocaleString('id-ID')} via ${newOrder.paymentMethod || 'Tunai'}`
      : `Pesanan ${newOrder.referenceCode} dari ${newOrder.customerName} (${newOrder.city}) senilai Rp ${newOrder.totalAmount.toLocaleString('id-ID')}`,
    adminUser: isPos ? 'Kasir POS' : 'Sistem Web',
    metadata: { referenceCode: newOrder.referenceCode, totalAmount: newOrder.totalAmount },
  })

  return newOrder
}

export async function updateAdminOrderStatus(
  referenceCodeOrId: string,
  newStatus: OrderStatus,
  adminUser = 'Admin',
  statusNotes?: string,
  options?: {
    updatedItems?: OrderItem[]
    newTotalAmount?: number
    adjustmentNotes?: string
    paymentStatus?: 'LUNAS' | 'DP' | 'TEMPO' | 'BELUM_BAYAR'
    paymentMethod?: string
    paidAmount?: number
    changeAmount?: number
    dueDate?: string
    marketingName?: string
  }
): Promise<AdminOrder | null> {
  const orders = await getAdminOrders()
  const order = orders.find((o) => o.id === referenceCodeOrId || o.referenceCode === referenceCodeOrId)
  if (!order) return null

  order.status = newStatus
  order.statusNotes = statusNotes || order.statusNotes

  if (options?.dueDate) {
    order.dueDate = options.dueDate
  }

  if (options?.marketingName !== undefined) {
    order.marketingName = options.marketingName.trim() || undefined
  }

  // Handle stock adjustments if provided
  if (options?.updatedItems && options.updatedItems.length > 0) {
    if (!order.originalItems) {
      order.originalItems = [...order.items]
    }
    order.items = options.updatedItems
  }

  if (typeof options?.newTotalAmount === 'number') {
    order.totalAmount = options.newTotalAmount
  }

  if (options?.adjustmentNotes) {
    order.adjustmentNotes = options.adjustmentNotes
  }

  // Handle payment status updates if provided
  if (options?.paymentStatus) {
    order.paymentStatus = options.paymentStatus
  }
  if (options?.paymentMethod) {
    order.paymentMethod = options.paymentMethod
  }
  if (typeof options?.paidAmount === 'number') {
    order.paidAmount = options.paidAmount
  }
  if (typeof options?.changeAmount === 'number') {
    order.changeAmount = options.changeAmount
  }

  if (newStatus === 'VERIFIED') {
    order.verifiedAt = new Date().toISOString()
  } else if (newStatus === 'REJECTED') {
    order.rejectedAt = new Date().toISOString()
  }

  try {
    const { error } = await supabase
      .from('hatoba_orders')
      .update({
        status: newStatus,
        data: order,
      })
      .eq('id', order.id)

    if (error) {
      console.warn('[admin-store] Supabase update order status error:', error.message)
    }
  } catch (err) {
    console.warn('[admin-store] Supabase update order status exception:', (err as Error).message)
  }

  // Log action
  const isAdjusted = Boolean(options?.adjustmentNotes || options?.updatedItems)
  const actionType = newStatus === 'VERIFIED' ? 'ORDER_VERIFIED' : newStatus === 'REJECTED' ? 'ORDER_REJECTED' : 'ORDER_PENDING'
  const actionLabel = isAdjusted
    ? 'Diterima dengan Penyesuaian Stok (Tagihan Diterbitkan)'
    : newStatus === 'VERIFIED'
    ? 'Diverifikasi / Diterima'
    : newStatus === 'REJECTED'
    ? 'Ditolak'
    : 'Dikembalikan ke Pending'

  const descNote = options?.adjustmentNotes
    ? ` (Penyesuaian: "${options.adjustmentNotes}")`
    : statusNotes
    ? `: "${statusNotes}"`
    : ''

  await recordActivityLog({
    action: actionType,
    title: `Order ${actionLabel}`,
    description: `Pesanan ${order.referenceCode} (${order.customerName}) diubah statusnya menjadi ${newStatus}${descNote}`,
    adminUser,
    metadata: {
      referenceCode: order.referenceCode,
      status: newStatus,
      isAdjusted,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
    },
  })

  return order
}

export async function recordOrderPayment(
  referenceCodeOrId: string,
  options: {
    paymentMode: 'LUNAS_TRANSFER' | 'LUNAS_TUNAI' | 'DP' | 'CAMPURAN' | 'TEMPO'
    paymentMethod?: string
    paidAmount?: number
    dueDate?: string
    notes?: string
    adminUser?: string
  }
): Promise<AdminOrder | null> {
  const orders = await getAdminOrders()
  const order = orders.find((o) => o.id === referenceCodeOrId || o.referenceCode === referenceCodeOrId)
  if (!order) return null

  const adminUser = options.adminUser || 'Admin Keuangan'
  const notes = options.notes?.trim() || ''

  if (options.dueDate) {
    order.dueDate = options.dueDate
  }

  let title = 'Pembayaran Diterima'
  let description = ''

  if (options.paymentMode === 'LUNAS_TUNAI') {
    const rawPaid = typeof options.paidAmount === 'number' ? options.paidAmount : order.totalAmount
    order.paymentStatus = 'LUNAS'
    order.paymentMethod = 'Tunai / Cash'
    order.paidAmount = rawPaid
    order.changeAmount = Math.max(0, rawPaid - order.totalAmount)
    order.statusNotes = notes
      ? `${notes} (Lunas Tunai)`
      : order.changeAmount > 0
      ? `Lunas Tunai Rp ${rawPaid.toLocaleString('id-ID')} (Kembalian Rp ${order.changeAmount.toLocaleString('id-ID')})`
      : 'Lunas Tunai'
    description = `Pesanan ${order.referenceCode} (${order.customerName}) Lunas Tunai Rp ${order.totalAmount.toLocaleString('id-ID')}`
  } else if (options.paymentMode === 'LUNAS_TRANSFER') {
    const method = options.paymentMethod || 'Transfer Mandiri'
    order.paymentStatus = 'LUNAS'
    order.paymentMethod = method
    order.paidAmount = order.totalAmount
    order.changeAmount = 0
    order.statusNotes = notes ? `${notes} (Lunas ${method})` : `Lunas via ${method}`
    description = `Pesanan ${order.referenceCode} (${order.customerName}) Lunas via ${method} Rp ${order.totalAmount.toLocaleString('id-ID')}`
  } else if (options.paymentMode === 'DP') {
    const dpAmount = Math.max(0, typeof options.paidAmount === 'number' ? options.paidAmount : 0)
    const sisa = Math.max(0, order.totalAmount - dpAmount)
    order.paymentStatus = dpAmount >= order.totalAmount ? 'LUNAS' : 'DP'
    order.paymentMethod = options.paymentMethod ? `DP via ${options.paymentMethod}` : 'DP'
    order.paidAmount = dpAmount
    order.changeAmount = Math.max(0, dpAmount - order.totalAmount)
    order.statusNotes = notes
      ? `${notes} (DP Rp ${dpAmount.toLocaleString('id-ID')}, Sisa Rp ${sisa.toLocaleString('id-ID')})`
      : `DP Diterima Rp ${dpAmount.toLocaleString('id-ID')}, Sisa Tagihan Rp ${sisa.toLocaleString('id-ID')}`
    title = 'Pembayaran DP Masuk'
    description = `Pesanan ${order.referenceCode} DP Rp ${dpAmount.toLocaleString('id-ID')}, sisa Rp ${sisa.toLocaleString('id-ID')}`
  } else if (options.paymentMode === 'CAMPURAN') {
    const dpAmount = Math.max(0, typeof options.paidAmount === 'number' ? options.paidAmount : 0)
    const sisa = Math.max(0, order.totalAmount - dpAmount)
    order.paymentStatus = dpAmount >= order.totalAmount ? 'LUNAS' : 'DP'
    order.paymentMethod = `Bayar ${options.paymentMethod || 'Tunai/Transfer'} + Tempo B2B`
    order.paidAmount = dpAmount
    order.changeAmount = Math.max(0, dpAmount - order.totalAmount)
    order.statusNotes = notes
      ? `${notes} (Bayar di awal Rp ${dpAmount.toLocaleString('id-ID')}, Tempo Rp ${sisa.toLocaleString('id-ID')})`
      : `Bayar Sebagian Rp ${dpAmount.toLocaleString('id-ID')} + Sisa Masuk Tempo Rp ${sisa.toLocaleString('id-ID')}`
    title = 'Pembayaran Sebagian + Tempo'
    description = `Pesanan ${order.referenceCode} bayar di awal Rp ${dpAmount.toLocaleString('id-ID')}, sisa tempo Rp ${sisa.toLocaleString('id-ID')}`
  } else if (options.paymentMode === 'TEMPO') {
    order.paymentStatus = 'TEMPO'
    order.paymentMethod = 'Full Tempo B2B'
    order.paidAmount = 0
    order.changeAmount = 0
    order.statusNotes = notes
      ? `${notes} (Full Tempo B2B)`
      : `Full Tempo B2B — Tagihan Rp ${order.totalAmount.toLocaleString('id-ID')}${options.dueDate ? ` (Jatuh tempo: ${options.dueDate})` : ''}`
    title = 'Persetujuan Tempo B2B'
    description = `Pesanan ${order.referenceCode} disetujui Full Tempo B2B jatuh tempo ${order.dueDate || '-'}`
  }

  // Ensure order is verified
  if (order.status === 'PENDING') {
    order.status = 'VERIFIED'
    order.verifiedAt = new Date().toISOString()
  }

  try {
    const { error } = await supabase
      .from('hatoba_orders')
      .update({
        status: order.status,
        data: order,
      })
      .eq('id', order.id)

    if (error) {
      console.warn('[admin-store] Supabase recordOrderPayment error:', error.message)
    }
  } catch (err) {
    console.warn('[admin-store] Supabase recordOrderPayment exception:', (err as Error).message)
  }

  await recordActivityLog({
    action: 'PAYMENT_RECEIVED',
    title,
    description: `${description}${notes ? ` (Catatan: "${notes}")` : ''}`,
    adminUser,
    metadata: {
      referenceCode: order.referenceCode,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paidAmount: order.paidAmount,
      totalAmount: order.totalAmount,
      dueDate: order.dueDate,
    },
  })

  return order
}

export async function markOrderAsPaid(
  referenceCodeOrId: string,
  options?: {
    paymentMethod?: string
    paidAmount?: number
    dueDate?: string
    adminUser?: string
    notes?: string
  }
): Promise<AdminOrder | null> {
  return recordOrderPayment(referenceCodeOrId, {
    paymentMode: 'LUNAS_TRANSFER',
    paymentMethod: options?.paymentMethod,
    paidAmount: options?.paidAmount,
    dueDate: options?.dueDate,
    adminUser: options?.adminUser,
    notes: options?.notes,
  })
}

export async function updateOrderMarketing(
  referenceCodeOrId: string,
  marketingName: string | undefined,
  adminUser = 'Admin'
): Promise<AdminOrder | null> {
  const orders = await getAdminOrders()
  const order = orders.find((o) => o.id === referenceCodeOrId || o.referenceCode === referenceCodeOrId)
  if (!order) return null

  const prevMarketing = order.marketingName || 'Organik'
  order.marketingName = marketingName ? marketingName.trim() : undefined

  try {
    const { error } = await supabase
      .from('hatoba_orders')
      .update({
        data: order,
      })
      .eq('id', order.id)

    if (error) {
      console.warn('[admin-store] Supabase updateOrderMarketing error:', error.message)
    }
  } catch (err) {
    console.warn('[admin-store] Supabase updateOrderMarketing exception:', (err as Error).message)
  }

  await recordActivityLog({
    action: 'SETTINGS_UPDATE',
    title: 'Update Tim Marketing Pesanan',
    description: `Pesanan ${order.referenceCode} (${order.customerName}) staf promotor diubah dari "${prevMarketing}" menjadi "${order.marketingName || 'Organik / Tanpa Marketing'}"`,
    adminUser,
    metadata: {
      referenceCode: order.referenceCode,
      prevMarketing,
      newMarketing: order.marketingName || 'Organik',
    },
  })

  return order
}

// ==================== PRODUCTS / MENU STORE (SUPABASE + CACHE) ====================
export async function getAdminProducts(): Promise<AdminProduct[]> {
  try {
    const { data, error } = await supabase
      .from('hatoba_products')
      .select('data')
      .order('updated_at', { ascending: false })

    if (error) {
      console.warn('[admin-store] Supabase getAdminProducts error, using fallback:', error.message)
      return getFallbackProducts()
    }

    if (data && data.length > 0) {
      const products = data.map((row) => row.data as AdminProduct)
      cachedProducts = products
      return products
    }

    return getFallbackProducts()
  } catch (err) {
    console.warn('[admin-store] getAdminProducts fallback:', (err as Error).message)
    return getFallbackProducts()
  }
}

function getFallbackProducts(): AdminProduct[] {
  if (cachedProducts) return cachedProducts
  const initial: AdminProduct[] = CATALOG_PRODUCTS.map((p) => ({
    ...p,
    badge: p.id === 'babat-sapi' ? 'Terlaris' : p.id === 'iga-sapi' ? 'Premium Cut' : 'Vacuum Sealed',
    isAvailable: true,
    updatedAt: new Date().toISOString(),
  }))
  cachedProducts = initial
  return initial
}

export async function saveAdminProduct(productData: Partial<AdminProduct> & { name: string }): Promise<AdminProduct> {
  const products = await getAdminProducts()
  let finalProduct: AdminProduct
  let isEdit = false

  if (productData.id) {
    const index = products.findIndex((p) => p.id === productData.id)
    if (index !== -1) {
      isEdit = true
      finalProduct = {
        ...products[index],
        ...productData,
        updatedAt: new Date().toISOString(),
      }
      products[index] = finalProduct
    } else {
      finalProduct = buildNewProduct(productData)
      products.push(finalProduct)
    }
  } else {
    finalProduct = buildNewProduct(productData)
    products.push(finalProduct)
  }

  // Persist to Supabase
  try {
    const { error } = await supabase.from('hatoba_products').upsert({
      id: finalProduct.id,
      data: finalProduct,
      updated_at: finalProduct.updatedAt,
    })

    if (error) {
      console.warn('[admin-store] Supabase upsert product error:', error.message)
    }
  } catch (err) {
    console.warn('[admin-store] Supabase upsert product exception:', (err as Error).message)
  }

  cachedProducts = products

  await recordActivityLog({
    action: isEdit ? 'MENU_UPDATED' : 'MENU_CREATED',
    title: isEdit ? 'Menu Diperbarui' : 'Menu Baru Ditambahkan',
    description: `Menu "${finalProduct.name}" berhasil ${isEdit ? 'diperbarui' : 'didaftarkan'} oleh admin.`,
    adminUser: 'Admin',
    metadata: { id: finalProduct.id, name: finalProduct.name },
  })

  return finalProduct
}

function buildNewProduct(productData: Partial<AdminProduct> & { name: string }): AdminProduct {
  const slug =
    (productData.slug ||
      productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')) +
    '-' +
    Date.now().toString(36)

  return {
    id: productData.id || `menu-${Date.now()}`,
    slug,
    name: productData.name,
    category: productData.category || 'Jeroan Sapi Higienis',
    salesMode: 'FIXED_PACK',
    shortDescription: productData.shortDescription || productData.description?.slice(0, 100) || '',
    description: productData.description || '',
    storageInfo: productData.storageInfo || 'Simpan beku pada suhu -18°C.',
    handlingInfo: productData.handlingInfo || 'Thawing 30 menit sebelum diolah.',
    featured: productData.featured ?? true,
    image: productData.image || '/images/products/foto-babat.jpeg',
    packagingImage: productData.packagingImage || '/images/products/kemasan-babat.png',
    badge: productData.badge || 'Menu Baru',
    discountPercent: productData.discountPercent || 0,
    originalPrice: productData.originalPrice || 0,
    isAvailable: productData.isAvailable ?? true,
    variants:
      productData.variants && productData.variants.length > 0
        ? productData.variants
        : [
            {
              id: `var-${Date.now()}-1`,
              name: 'Kemasan Ritel Vacuum',
              packType: 'retail',
              weight: '250 gr',
              portion: 'Porsi 2-3 orang',
              minQty: 1,
              price: productData.variants?.[0]?.price || 45000,
              isAvailable: true,
            },
          ],
    updatedAt: new Date().toISOString(),
  }
}

export async function deleteAdminProduct(productId: string): Promise<boolean> {
  const products = await getAdminProducts()
  const target = products.find((p) => p.id === productId)
  if (!target) return false

  try {
    const { error } = await supabase.from('hatoba_products').delete().eq('id', productId)
    if (error) {
      console.warn('[admin-store] Supabase delete product error:', error.message)
    }
  } catch (err) {
    console.warn('[admin-store] Supabase delete product exception:', (err as Error).message)
  }

  const filtered = products.filter((p) => p.id !== productId)
  cachedProducts = filtered

  await recordActivityLog({
    action: 'MENU_DELETED',
    title: 'Menu Dihapus',
    description: `Menu "${target.name}" telah dihapus dari katalog oleh admin.`,
    adminUser: 'Admin',
    metadata: { id: target.id, name: target.name },
  })

  return true
}

// ==================== ACTIVITY LOGS STORE (SUPABASE + CACHE) ====================
export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('hatoba_logs')
      .select('data')
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) {
      console.warn('[admin-store] Supabase get logs error:', error.message)
      return cachedLogs || INITIAL_LOGS
    }

    if (data && data.length > 0) {
      const logs = data.map((r) => r.data as ActivityLog)
      cachedLogs = logs
      return logs
    }

    return cachedLogs || INITIAL_LOGS
  } catch (err) {
    console.warn('[admin-store] get logs exception:', (err as Error).message)
    return cachedLogs || INITIAL_LOGS
  }
}

export async function recordActivityLog(logData: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
  const newLog: ActivityLog = {
    ...logData,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  }

  try {
    const { error } = await supabase.from('hatoba_logs').insert({
      id: newLog.id,
      timestamp: newLog.timestamp,
      data: newLog,
    })

    if (error) {
      console.warn('[admin-store] Supabase insert log error:', error.message)
    }
  } catch (err) {
    console.warn('[admin-store] Supabase insert log exception:', (err as Error).message)
  }

  if (!cachedLogs) {
    cachedLogs = [...INITIAL_LOGS]
  }
  cachedLogs.unshift(newLog)

  return newLog
}
