import { handleSoftDeleteOperation } from '../middleware'

describe('handleSoftDeleteOperation', () => {
  it('소프트 삭제 대상 모델에 대해 delete 호출 시 런타임 에러를 던져 물리 삭제를 방지해야 한다', async () => {
    const mockQuery = jest.fn()

    await expect(
      handleSoftDeleteOperation({
        model: 'Community',
        operation: 'delete',
        args: { where: { clubId: 'club-1' } },
        query: mockQuery,
      })
    ).rejects.toThrow(
      "Direct delete is disabled for soft-delete model 'Community'. Use update with deletedAt instead."
    )

    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('소프트 삭제 대상 모델에 대해 deleteMany 호출 시 런타임 에러를 던져 물리 삭제를 방지해야 한다', async () => {
    const mockQuery = jest.fn()

    await expect(
      handleSoftDeleteOperation({
        model: 'User',
        operation: 'deleteMany',
        args: { where: {} },
        query: mockQuery,
      })
    ).rejects.toThrow(
      "Direct deleteMany is disabled for soft-delete model 'User'. Use update with deletedAt instead."
    )

    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('소프트 삭제 대상이 아닌 모델에 대한 delete는 원래 쿼리를 호출해야 한다', async () => {
    const mockQuery = jest.fn().mockResolvedValue({ count: 1 })

    const result = await handleSoftDeleteOperation({
      model: 'AuditLog',
      operation: 'delete',
      args: { where: { id: '1' } },
      query: mockQuery,
    })

    expect(mockQuery).toHaveBeenCalledWith({ where: { id: '1' } })
    expect(result).toEqual({ count: 1 })
  })
})
