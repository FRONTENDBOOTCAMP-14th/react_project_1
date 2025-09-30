import { createClient } from '@supabase/supabase-js'

// Server-side client (do NOT expose service role in client bundles)
// If you need admin operations, use SUPABASE_SERVICE_ROLE_KEY only in server code
// like Route Handlers or Server Actions. Keep it off the client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseServer = createClient(
  supabaseUrl ?? '',
  serviceRoleKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
)
