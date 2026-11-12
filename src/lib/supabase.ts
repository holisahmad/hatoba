import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ufqxxhgavmqezwxvfsvw.supabase.co'

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_5ae-Wudeul58S8WBu1Y_lw_DIOu1qkC'

export const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || SUPABASE_PUBLISHABLE_KEY

export const HATOBA_BUCKET = 'hatoba'

// Client for public operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Admin client for backend operations (reads SUPABASE_SECRET_KEY from environment)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
