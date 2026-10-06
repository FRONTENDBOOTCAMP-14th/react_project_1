import {
  encodeCursor,
  decodeCursor,
  applyCursorPagination,
  processCursorResult,
} from '../cursorPagination'

describe('Cursor Pagination with Composite Key', () => {
  it('날짜와 UUID를 인코딩하고 정상 디코딩해야 함', () => {
    const createdAt = new Date('2026-10-06T12:00:00.000Z')
    const clubId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

    const cursor = encodeCursor(createdAt, clubId)
    expect(typeof cursor).toBe('string')

    const decoded = decodeCursor(cursor)
    expect(decoded).not.toBeNull()
    expect(decoded?.createdAt.toISOString()).toBe(createdAt.toISOString())
    expect(decoded?.clubId).toBe(clubId)
  })

  it('잘못된 형식의 커서는 null을 반환해야 함', () => {
    expect(decodeCursor('invalid-cursor')).toBeNull()
    expect(decodeCursor('')).toBeNull()
  })

  it('forward 방향 커서 적용 시 올바른 Prisma 복합 조건을 생성해야 함', () => {
    const createdAt = new Date('2026-10-06T12:00:00.000Z')
    const clubId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    const cursor = encodeCursor(createdAt, clubId)

    const query = applyCursorPagination(
      { where: { deletedAt: null } },
      { cursor, limit: 10, direction: 'forward' }
    )

    expect(query.take).toBe(11)
    expect(query.where).toEqual({
      deletedAt: null,
      OR: [
        { createdAt: { gt: createdAt } },
        {
          createdAt: { equals: createdAt },
          clubId: { gt: clubId },
        },
      ],
    })
  })

  it('backward 방향 커서 적용 시 올바른 Prisma 복합 조건을 생성해야 함', () => {
    const createdAt = new Date('2026-10-06T12:00:00.000Z')
    const clubId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    const cursor = encodeCursor(createdAt, clubId)

    const query = applyCursorPagination(
      { where: { deletedAt: null } },
      { cursor, limit: 10, direction: 'backward' }
    )

    expect(query.where).toEqual({
      deletedAt: null,
      OR: [
        { createdAt: { lt: createdAt } },
        {
          createdAt: { equals: createdAt },
          clubId: { lt: clubId },
        },
      ],
    })
    expect(query.orderBy).toEqual([{ createdAt: 'desc' }, { clubId: 'desc' }])
  })

  it('processCursorResult는 인코딩된 복합 커서를 반환해야 함', () => {
    const items = [
      { clubId: 'id-1', createdAt: new Date('2026-10-06T10:00:00.000Z') },
      { clubId: 'id-2', createdAt: new Date('2026-10-06T11:00:00.000Z') },
      { clubId: 'id-3', createdAt: new Date('2026-10-06T12:00:00.000Z') },
    ]

    const result = processCursorResult(items, 2, 'forward')
    expect(result.data).toHaveLength(2)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBeDefined()

    const decoded = decodeCursor(result.nextCursor)
    expect(decoded?.clubId).toBe('id-2')
    expect(decoded?.createdAt.toISOString()).toBe('2026-10-06T11:00:00.000Z')
  })
})
