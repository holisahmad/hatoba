import fs from 'fs/promises'
import path from 'path'

export interface OrderItemRecord {
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderRecord {
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
  items: OrderItemRecord[]
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
  attribution?: Record<string, unknown>
}

export interface LeadRecord {
  id: string
  referenceCode: string
  createdAt: string
  type: 'CORPORATE_INQUIRY' | 'RAW_INQUIRY'
  category?: string
  fullName: string
  institutionName?: string
  marketingName?: string
  phone: string
  city: string
  email?: string
  message?: string
  cutTypes?: string[]
  estimatedVolume?: string
  deliveryFrequency?: string
  targetBusinessName?: string
  status: 'NEW' | 'CONTACTED' | 'QUOTATION_SENT' | 'DEAL' | 'CLOSED'
  attribution?: Record<string, unknown>
}

interface DatabaseSchema {
  orders: OrderRecord[]
  leads: LeadRecord[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

// Initial seed data for immediate demonstration
const INITIAL_DB: DatabaseSchema = {
  orders: [
    {
      id: 'ord-seed-01',
      referenceCode: 'ORD-2611-B892',
      createdAt: '2026-11-12T09:15:00.000Z',
      customerName: 'Bpk. Hendra Gunawan',
      businessName: 'Warung Bu Kris Express Denpasar',
      businessType: 'Restoran / Rumah Makan',
      phone: '6281234567890',
      hubArea: 'Bali',
      city: 'Denpasar',
      marketingName: 'Rian Wijaya',
      notes: 'Mohon kirim pagi hari sebelum jam 10 WITA.',
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
      status: 'CONFIRMED',
    },
    {
      id: 'ord-seed-02',
      referenceCode: 'ORD-2611-Y415',
      createdAt: '2026-11-12T11:30:00.000Z',
      customerName: 'Ibu Ratna Dewi',
      businessName: 'Katering Sedap Malioboro',
      businessType: 'Katering Acara',
      phone: '6281987654321',
      hubArea: 'Yogyakarta',
      city: 'Sleman',
      marketingName: 'Siti Rahma',
      notes: 'Kemasan vacuum pastikan beku keras -18C.',
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
      status: 'PROCESSING',
    },
  ],
  leads: [
    {
      id: 'lead-seed-01',
      referenceCode: 'CORP-2611-K381',
      createdAt: '2026-11-12T08:45:00.000Z',
      type: 'CORPORATE_INQUIRY',
      category: 'Pemesanan B2B / HORECA & Reseller',
      fullName: 'Ahmad Faisal',
      institutionName: 'PT Nusantara Boga Jaya',
      marketingName: 'Rian Wijaya',
      phone: '6285712345678',
      city: 'Denpasar',
      email: 'faisal@nusantaraboga.id',
      message: 'Kami ingin menjajaki kontrak pasokan jeroan dan daging sapi rutin 500kg per bulan untuk 3 cabang resto.',
      status: 'QUOTATION_SENT',
    },
    {
      id: 'lead-seed-02',
      referenceCode: 'INQ-2611-R109',
      createdAt: '2026-11-12T10:10:00.000Z',
      type: 'RAW_INQUIRY',
      fullName: 'Bambang Sudiro',
      institutionName: 'Depot Soto Babat Yogya',
      marketingName: 'Budi Santoso',
      phone: '6281399887766',
      city: 'Kota Yogyakarta',
      cutTypes: ['Babat Putih Segar', 'Iso Bersih'],
      estimatedVolume: '100 - 250 Kg',
      deliveryFrequency: 'Mingguan (Weekly)',
      message: 'Perlu pasokan babat dan iso potong siap rebus untuk cabang baru.',
      status: 'NEW',
    },
  ],
}

async function ensureDb(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    try {
      await fs.access(DB_FILE)
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8')
    }
  } catch (err) {
    console.error('Failed to initialize database folder:', err)
  }
}

async function readDb(): Promise<DatabaseSchema> {
  await ensureDb()
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8')
    return JSON.parse(data) as DatabaseSchema
  } catch {
    return INITIAL_DB
  }
}

async function writeDb(data: DatabaseSchema): Promise<void> {
  await ensureDb()
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function getOrders(): Promise<OrderRecord[]> {
  const db = await readDb()
  return db.orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function saveOrder(order: Omit<OrderRecord, 'id' | 'createdAt' | 'status'> & Partial<Pick<OrderRecord, 'status'>>): Promise<OrderRecord> {
  const db = await readDb()
  const newOrder: OrderRecord = {
    ...order,
    id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: order.status || 'PENDING',
  }

  db.orders.unshift(newOrder)
  await writeDb(db)
  return newOrder
}

export async function updateOrderStatus(id: string, status: OrderRecord['status']): Promise<boolean> {
  const db = await readDb()
  const item = db.orders.find((o) => o.id === id || o.referenceCode === id)
  if (!item) return false
  item.status = status
  await writeDb(db)
  return true
}

export async function getLeads(): Promise<LeadRecord[]> {
  const db = await readDb()
  return db.leads.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function saveLead(lead: Omit<LeadRecord, 'id' | 'createdAt' | 'status'> & Partial<Pick<LeadRecord, 'status'>>): Promise<LeadRecord> {
  const db = await readDb()
  const newLead: LeadRecord = {
    ...lead,
    id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: lead.status || 'NEW',
  }

  db.leads.unshift(newLead)
  await writeDb(db)
  return newLead
}

export async function updateLeadStatus(id: string, status: LeadRecord['status']): Promise<boolean> {
  const db = await readDb()
  const item = db.leads.find((l) => l.id === id || l.referenceCode === id)
  if (!item) return false
  item.status = status
  await writeDb(db)
  return true
}

