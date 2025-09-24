import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'

// Minimal auth helpers. Extend with your app's needs.
export async function getSession() {
  // Placeholder: if you plan to use Supabase Auth helpers, you can fetch user here.
  // With RLS, prefer retrieving per-request as needed in server components/route handlers.
  try {
    const sb = supabaseServer
    const { data: { user } } = await sb.auth.getUser()
    return { user }
  } catch (e) {
    return { user: null }
  }
}

export async function requireAuth() {
  const { user } = await getSession()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
