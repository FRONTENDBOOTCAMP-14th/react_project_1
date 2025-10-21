import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import prisma from '@/lib/prisma'
import { getErrorMessage } from '@/lib/errors'

export async function POST() {
  const session = await getServerSession(authOptions)
  const userId = (session as any)?.userId as string | undefined
  if (!userId) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    await prisma.user.update({ where: { userId }, data: { deletedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: 'delete_failed', detail: getErrorMessage(e, 'Unknown error') },
      { status: 500 }
    )
  }
}
