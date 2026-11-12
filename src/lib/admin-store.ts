import fs from 'fs/promises'
import path from 'path'
import { CATALOG_PRODUCTS, ProductItem } from './catalog-data'

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
  action: 'ORDER_VERIFIED' | 'ORDER_REJECTED' | 'ORDER_PENDING' | 'MENU_CREATED' | 'MENU_UPDATED' | 'MENU_DELETED' | 'ORDER_RECEIVED' | 'ADMIN_LOGIN'
  title: string
  description: string
  adminUser: string
  metadata?: Record<string, unknown>
}

const DATA_DIR = path.join(process.cwd(), 'data')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const LOGS_FILE = path.join(DATA_DIR, 'activity_logs.json')

// Sample Initial Orders
const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ord-init-01',
    referenceCode: 'ORD-2611-B892',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
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
    statusNotes: 'Pembayaran DP 50% telah diterima via BCA.',
  },
  {
    id: 'ord-init-02',
    referenceCode: 'ORD-2611-Y415',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
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
  {
    id: 'ord-init-03',
    referenceCode: 'ORD-2611-M108',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    customerName: 'Bpk. Agus Santoso',
    businessName: 'Depot Soto Babat Solo',
    businessType: 'Rumah Makan',
    phone: '085711223344',
    hubArea: 'Luar Area Layanan',
    city: 'Surakarta',
    marketingName: 'Direct Web',
    notes: 'Pengiriman via kargo reguler bus malam.',
    items: [
      {
        productName: 'Iso Sapi Frozen',
        variantName: 'Kemasan Ritel (Pouch Vacuum)',
        quantity: 5,
        unitPrice: 43500,
        subtotal: 217500,
      },
    ],
    totalAmount: 217500,
    status: 'REJECTED',
    rejectedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    statusNotes: 'Luar jangkauan cold chain tanpa sewa styrofoam box berpendingin.',
  },
]

// Initial Activity Logs
const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-init-01',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    action: 'ORDER_VERIFIED',
    title: 'Order Diverifikasi',
    description: 'Order ORD-2611-B892 (Bpk. Hendra Gunawan - Rp 865.000) diverifikasi oleh Admin Pusat.',
    adminUser: 'Admin Pusat',
  },
  {
    id: 'log-init-02',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    action: 'ORDER_REJECTED',
    title: 'Order Ditolak',
    description: 'Order ORD-2611-M108 (Bpk. Agus Santoso) ditolak: di luar jangkauan cold chain aktif.',
    adminUser: 'Admin Pusat',
  },
  {
    id: 'log-init-03',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    action: 'MENU_UPDATED',
    title: 'Katalog Diperbarui',
    description: 'Penyesuaian spesifikasi porsi dan kemasan vacuum seal 5 produk utama.',
    adminUser: 'Admin Pusat',
  },
]

async function ensureDataDirectory() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

// ==================== ORDERS STORE ====================
export async function getAdminOrders(): Promise<AdminOrder[]> {
  await ensureDataDirectory()
  try {
    const raw = await fs.readFile(ORDERS_FILE, 'utf-8')
    const list: AdminOrder[] = JSON.parse(raw)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch {
    await fs.writeFile(ORDERS_FILE, JSON.stringify(INITIAL_ORDERS, null, 2), 'utf-8')
    return INITIAL_ORDERS
  }
}

export async function addAdminOrder(order: Omit<AdminOrder, 'id' | 'createdAt' | 'status'> & Partial<Pick<AdminOrder, 'status'>>): Promise<AdminOrder> {
  const orders = await getAdminOrders()
  const newOrder: AdminOrder = {
    ...order,
    id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: order.status || 'PENDING',
  }
  orders.unshift(newOrder)
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8')

  // Automatically record activity log
  await recordActivityLog({
    action: 'ORDER_RECEIVED',
    title: 'Order Baru Masuk',
    description: `Pesanan ${newOrder.referenceCode} dari ${newOrder.customerName} (${newOrder.city}) senilai Rp ${newOrder.totalAmount.toLocaleString('id-ID')}`,
    adminUser: 'Sistem Web',
    metadata: { referenceCode: newOrder.referenceCode, totalAmount: newOrder.totalAmount },
  })

  return newOrder
}

export async function updateAdminOrderStatus(
  referenceCodeOrId: string,
  newStatus: OrderStatus,
  adminUser = 'Admin',
  statusNotes?: string
): Promise<AdminOrder | null> {
  const orders = await getAdminOrders()
  const order = orders.find((o) => o.id === referenceCodeOrId || o.referenceCode === referenceCodeOrId)
  if (!order) return null

  order.status = newStatus
  order.statusNotes = statusNotes || order.statusNotes

  if (newStatus === 'VERIFIED') {
    order.verifiedAt = new Date().toISOString()
  } else if (newStatus === 'REJECTED') {
    order.rejectedAt = new Date().toISOString()
  }

  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8')

  // Log action
  const actionType = newStatus === 'VERIFIED' ? 'ORDER_VERIFIED' : newStatus === 'REJECTED' ? 'ORDER_REJECTED' : 'ORDER_PENDING'
  const actionLabel = newStatus === 'VERIFIED' ? 'Diverifikasi / Diterima' : newStatus === 'REJECTED' ? 'Ditolak' : 'Dikembalikan ke Pending'
  
  await recordActivityLog({
    action: actionType,
    title: `Order ${actionLabel}`,
    description: `Pesanan ${order.referenceCode} (${order.customerName}) diubah statusnya menjadi ${newStatus}${statusNotes ? `: "${statusNotes}"` : ''}`,
    adminUser,
    metadata: { referenceCode: order.referenceCode, status: newStatus },
  })

  return order
}

// ==================== PRODUCTS / MENU STORE ====================
export async function getAdminProducts(): Promise<AdminProduct[]> {
  await ensureDataDirectory()
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, 'utf-8')
    const list: AdminProduct[] = JSON.parse(raw)
    return list
  } catch {
    // Initialize from CATALOG_PRODUCTS
    const initial: AdminProduct[] = CATALOG_PRODUCTS.map((p) => ({
      ...p,
      badge: p.id === 'babat-sapi' ? 'Terlaris' : p.id === 'iga-sapi' ? 'Premium Cut' : 'Vacuum Sealed',
      isAvailable: true,
      updatedAt: new Date().toISOString(),
    }))
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(initial, null, 2), 'utf-8')
    return initial
  }
}

export async function saveAdminProduct(productData: Partial<AdminProduct> & { name: string }): Promise<AdminProduct> {
  const products = await getAdminProducts()
  
  if (productData.id) {
    // Edit existing product
    const index = products.findIndex((p) => p.id === productData.id)
    if (index !== -1) {
      const updated: AdminProduct = {
        ...products[index],
        ...productData,
        updatedAt: new Date().toISOString(),
      }
      products[index] = updated
      await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8')

      await recordActivityLog({
        action: 'MENU_UPDATED',
        title: 'Menu Diperbarui',
        description: `Menu "${updated.name}" berhasil diperbarui oleh admin.`,
        adminUser: 'Admin',
        metadata: { id: updated.id, name: updated.name },
      })
      return updated
    }
  }

  // Create new product
  const slug = (productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now().toString(36)
  const newProduct: AdminProduct = {
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
    variants: productData.variants && productData.variants.length > 0 ? productData.variants : [
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

  products.push(newProduct)
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8')

  await recordActivityLog({
    action: 'MENU_CREATED',
    title: 'Menu Baru Ditambahkan',
    description: `Menu baru "${newProduct.name}" berhasil didaftarkan ke katalog sistem.`,
    adminUser: 'Admin',
    metadata: { id: newProduct.id, name: newProduct.name },
  })

  return newProduct
}

export async function deleteAdminProduct(productId: string): Promise<boolean> {
  const products = await getAdminProducts()
  const target = products.find((p) => p.id === productId)
  if (!target) return false

  const filtered = products.filter((p) => p.id !== productId)
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8')

  await recordActivityLog({
    action: 'MENU_DELETED',
    title: 'Menu Dihapus',
    description: `Menu "${target.name}" telah dihapus dari katalog oleh admin.`,
    adminUser: 'Admin',
    metadata: { id: target.id, name: target.name },
  })

  return true
}

// ==================== ACTIVITY LOGS (MAX 30 DAYS RETENTION) ====================
export async function getActivityLogs(): Promise<ActivityLog[]> {
  await ensureDataDirectory()
  try {
    const raw = await fs.readFile(LOGS_FILE, 'utf-8')
    const list: ActivityLog[] = JSON.parse(raw)
    
    // Auto-prune logs older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const validLogs = list.filter((l) => new Date(l.timestamp).getTime() >= thirtyDaysAgo)

    if (validLogs.length !== list.length) {
      await fs.writeFile(LOGS_FILE, JSON.stringify(validLogs, null, 2), 'utf-8')
    }

    return validLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch {
    await fs.writeFile(LOGS_FILE, JSON.stringify(INITIAL_LOGS, null, 2), 'utf-8')
    return INITIAL_LOGS
  }
}

export async function recordActivityLog(logData: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
  const logs = await getActivityLogs()
  const newLog: ActivityLog = {
    ...logData,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  }

  logs.unshift(newLog)

  // Keep max 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const pruned = logs.filter((l) => new Date(l.timestamp).getTime() >= thirtyDaysAgo)

  await fs.writeFile(LOGS_FILE, JSON.stringify(pruned, null, 2), 'utf-8')
  return newLog
}

