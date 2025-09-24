import { createClient } from '@supabase/supabase-js'

// Public client for browser usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Soft warn at runtime; during dev this helps spot missing env
  // Avoid throwing to not crash static pages
  console.warn('[supabase/client] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabaseBrowser = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
