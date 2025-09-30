import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/communities -> list active communities
export async function GET() {
  try {
    const items = await prisma.community.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        clubId: true,
        name: true,
        description: true,
        isPublic: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ ok: true, data: items })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 })
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

    const updated = await prisma.community.update({
      where: { clubId: id },
      data: { deletedAt: new Date() },
      select: { clubId: true, name: true, deletedAt: true },
    })

    return NextResponse.json({ ok: true, data: updated })
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ ok: false, error: 'community not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 })
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

    const created = await prisma.community.create({
      data: { name, description, isPublic },
      select: { clubId: true, name: true, description: true, isPublic: true, createdAt: true },
    })

    return NextResponse.json({ ok: true, data: created }, { status: 201 })
  } catch (err: any) {
    // Unique violation handling
    const message =
      err?.code === 'P2002' ? 'Community name already exists' : (err?.message ?? 'Unknown error')
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
