import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// GET /api/communities -> list active communities
export async function GET() {
  try {
    const { data: items, error } = await supabaseServer
      .from('communities')
      .select('club_id, name, description, is_public, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/communities] Supabase error:', error)
      return NextResponse.json(
        { ok: false, error: error.message ?? 'Failed to fetch communities' },
        { status: 500 }
      )
    }

    // Transform snake_case to camelCase for consistent API response
    const transformedItems = items?.map(item => ({
      clubId: item.club_id,
      name: item.name,
      description: item.description,
      isPublic: item.is_public,
      createdAt: item.created_at,
    }))

    return NextResponse.json({ ok: true, data: transformedItems ?? [] })
  } catch (err) {
    console.error('[GET /api/communities] Unexpected error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// DELETE /api/communities?id=<clubId> -> soft-delete (set deletedAt)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 })
    }

    // Check if community exists and is not already deleted
    const { data: existing, error: fetchError } = await supabaseServer
      .from('communities')
      .select('club_id, name, deleted_at')
      .eq('club_id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existing) {
      console.error('[DELETE /api/communities] Community not found:', fetchError)
      return NextResponse.json({ ok: false, error: 'community not found' }, { status: 404 })
    }

    // Perform soft delete
    const { data: updated, error: updateError } = await supabaseServer
      .from('communities')
      .update({ deleted_at: new Date().toISOString() })
      .eq('club_id', id)
      .select('club_id, name, deleted_at')
      .single()

    if (updateError) {
      console.error('[DELETE /api/communities] Update error:', updateError)
      return NextResponse.json(
        { ok: false, error: updateError.message ?? 'Failed to delete community' },
        { status: 500 }
      )
    }

    // Transform response to camelCase
    const transformedData = {
      clubId: updated.club_id,
      name: updated.name,
      deletedAt: updated.deleted_at,
    }

    return NextResponse.json({ ok: true, data: transformedData })
  } catch (err) {
    console.error('[DELETE /api/communities] Unexpected error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// POST /api/communities -> create community
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = (body?.name ?? '').trim()
    const description = (body?.description ?? '').trim() || null
    const isPublic = Boolean(body?.is_public ?? body?.isPublic ?? true)

    if (!name) {
      return NextResponse.json({ ok: false, error: 'name is required' }, { status: 400 })
    }

    // Insert new community
    const { data: created, error } = await supabaseServer
      .from('communities')
      .insert({
        name,
        description,
        is_public: isPublic,
      })
      .select('club_id, name, description, is_public, created_at')
      .single()

    if (error) {
      console.error('[POST /api/communities] Insert error:', error)

      // Handle unique constraint violation (duplicate name)
      const message =
        error.code === '23505'
          ? 'Community name already exists'
          : (error.message ?? 'Failed to create community')

      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }

    // Transform response to camelCase
    const transformedData = {
      clubId: created.club_id,
      name: created.name,
      description: created.description,
      isPublic: created.is_public,
      createdAt: created.created_at,
    }

    return NextResponse.json({ ok: true, data: transformedData }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/communities] Unexpected error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
