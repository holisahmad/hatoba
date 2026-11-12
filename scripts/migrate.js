const { Client } = require('pg')

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres@db.ufqxxhgavmqezwxvfsvw.supabase.co:5432/postgres'

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

const SQL = [
  `CREATE TABLE IF NOT EXISTS hatoba_products (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS hatoba_orders (
    id TEXT PRIMARY KEY,
    reference_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS hatoba_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    data JSONB NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON hatoba_orders (status)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON hatoba_orders (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON hatoba_logs (timestamp DESC)`,
]

async function run() {
  console.log('Connecting to Supabase PostgreSQL...')
  await client.connect()
  console.log('Connected!')
  for (const sql of SQL) {
    await client.query(sql)
    console.log('OK:', sql.split('\n')[0].trim().substring(0, 60))
  }
  const r = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'hatoba%' ORDER BY table_name"
  )
  console.log('Tables in DB:', r.rows.map(x => x.table_name).join(', '))
  await client.end()
  console.log('Migration complete!')
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1) })

