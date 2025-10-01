import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Public client for browser usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[supabase/client] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Please add them to your .env.local file.'
  )
}

export const supabaseBrowser = createClient<Database>(supabaseUrl, supabaseAnonKey)
