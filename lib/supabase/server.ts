import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Server-side client (do NOT expose service role in client bundles)
// If you need admin operations, use SUPABASE_SERVICE_ROLE_KEY only in server code
// like Route Handlers or Server Actions. Keep it off the client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error(
    '[supabase/server] Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please add it to your .env.local file.'
  )
}

const supabaseKey = supabaseAnonKey

if (!supabaseKey) {
  throw new Error(
    '[supabase/server] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Please add at least one to your .env.local file.'
  )
}

// Debug log (remove after confirming it works)
console.log('[supabase/server] Initializing with:', {
  url: supabaseUrl,
  keyLength: supabaseKey.length,
  keyPrefix: supabaseKey.substring(0, 20) + '...',
})

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
