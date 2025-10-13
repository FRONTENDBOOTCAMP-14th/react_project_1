import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(authOptions as any)
  const userId = (session as any)?.userId as string | undefined
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    await prisma.user.update({ where: { userId }, data: { deletedAt: new Date() } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'delete_failed', detail: e?.message },
      { status: 500 }
    )
  }
}
