import { useEffect, useState, useCallback } from 'react'
import type { CreateMemberRequest, UpdateMemberRequest } from '@/lib/types/member'
import { API_ENDPOINTS, MESSAGES } from '@/constants'

/**
 * 멤버 타입 (memberDetailSelect 기반)
 */
interface Member {
  id: string
  clubId: string
  userId: string
  role: string
  joinedAt: string
  community?: {
    clubId: string
    name: string
    description: string | null
  }
  user?: {
    userId: string
    username: string
    email: string
    nickname: string | null
  }
}

interface UseMembersOptions {
  clubId?: string
  userId?: string
  role?: string
  page?: number
  limit?: number
}

interface UseMembersResult {
  members: Member[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  refetch: () => Promise<void>
  getMemberById: (memberId: string) => Promise<{ success: boolean; data?: Member; error?: string }>
  createMember: (
    input: CreateMemberRequest
  ) => Promise<{ success: boolean; data?: Member; error?: string }>
  updateMember: (
    memberId: string,
    input: UpdateMemberRequest
  ) => Promise<{ success: boolean; data?: Member; error?: string }>
  deleteMember: (memberId: string) => Promise<{ success: boolean; error?: string }>
  updateRole: (
    memberId: string,
    newRole: 'admin' | 'member'
  ) => Promise<{ success: boolean; error?: string }>
}

/**
 * 커뮤니티 멤버 데이터를 관리하는 커스텀 훅
 *
 * @param options - 멤버 조회 옵션
 * @param options.clubId - 커뮤니티 ID로 필터링 (선택)
 * @param options.userId - 사용자 ID로 필터링 (선택)
 * @param options.role - 역할로 필터링 (선택)
 * @param options.page - 페이지 번호 (선택, 기본값: 1)
 * @param options.limit - 페이지당 개수 (선택, 기본값: 20)
 * @returns 멤버 목록, 로딩 상태, 에러, CRUD 함수
 *
 * @example
 * ```tsx
 * const { members, createMember, updateRole } = useMembers({ clubId: 'club-uuid' })
 *
 * // 멤버 추가
 * await createMember({
 *   clubId: 'club-uuid',
 *   userId: 'user-uuid',
 *   role: 'member'
 * })
 *
 * // 역할 변경
 * await updateRole('member-id', 'admin')
 * ```
 */
export const useMembers = ({
  clubId,
  userId,
  role,
  page = 1,
  limit = 20,
}: UseMembersOptions): UseMembersResult => {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        API_ENDPOINTS.MEMBERS.WITH_PARAMS({
          clubId,
          userId,
          role,
          page,
          limit,
        })
      )
      const result = await response.json()

      if (result.success && result.data) {
        // API 응답 구조: { success: true, data: { data: [], count: number, pagination: {} } }
        const membersList = Array.isArray(result.data) ? result.data : result.data.data
        setMembers(membersList || [])

        // pagination은 result.data.pagination에 있음
        if (result.data.pagination) {
          setPagination(result.data.pagination)
        }
      } else {
        setMembers([])
        setPagination(null)
        setError(result.error || MESSAGES.ERROR.FAILED_TO_LOAD_MEMBERS)
      }
    } catch (err) {
      console.error('Failed to fetch members:', err)
      setError(MESSAGES.ERROR.FAILED_TO_LOAD_MEMBERS)
      setMembers([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [clubId, userId, role, page, limit])

  /**
   * 특정 멤버 상세 조회
   * @param memberId - 멤버 ID
   * @returns 조회 결과
   */
  const getMemberById = useCallback(async (memberId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.MEMBERS.BY_ID(memberId))
      const result = await response.json()

      if (result.success) {
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error || MESSAGES.ERROR.MEMBER_NOT_FOUND }
    } catch (err) {
      console.error('Failed to fetch member:', err)
      return { success: false, error: MESSAGES.ERROR.FAILED_TO_LOAD_MEMBERS }
    }
  }, [])

  /**
   * 새로운 멤버 추가
   * @param input - 멤버 생성 데이터
   * @returns 생성 결과
   */
  const createMember = useCallback(
    async (input: CreateMemberRequest) => {
      try {
        const { createMemberAction } = await import('@/app/actions/members')
        const result = await createMemberAction(input)

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchMembers()
          return { success: true, data: result.data as Member }
        }
        return {
          success: false,
          error: result.error || MESSAGES.ERROR.FAILED_TO_CREATE_MEMBER,
        }
      } catch (err) {
        console.error('Failed to create member:', err)
        return { success: false, error: MESSAGES.ERROR.FAILED_TO_CREATE_MEMBER }
      }
    },
    [fetchMembers]
  )

  /**
   * 멤버 정보 수정 (역할 변경)
   * @param memberId - 수정할 멤버 ID
   * @param input - 수정할 데이터
   * @returns 수정 결과
   */
  const updateMember = useCallback(
    async (memberId: string, input: UpdateMemberRequest) => {
      try {
        const { updateMemberAction } = await import('@/app/actions/members')
        const result = await updateMemberAction(memberId, input)

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchMembers()
          return { success: true, data: result.data as Member }
        }
        return {
          success: false,
          error: result.error || MESSAGES.ERROR.FAILED_TO_UPDATE_MEMBER,
        }
      } catch (err) {
        console.error('Failed to update member:', err)
        return { success: false, error: MESSAGES.ERROR.FAILED_TO_UPDATE_MEMBER }
      }
    },
    [fetchMembers]
  )

  /**
   * 멤버 삭제 (커뮤니티 탈퇴)
   * @param memberId - 삭제할 멤버 ID
   * @returns 삭제 결과
   */
  const deleteMember = useCallback(
    async (memberId: string) => {
      try {
        const { deleteMemberAction } = await import('@/app/actions/members')
        const result = await deleteMemberAction(memberId)

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchMembers()
          return { success: true }
        }
        return {
          success: false,
          error: result.error || MESSAGES.ERROR.FAILED_TO_DELETE_MEMBER,
        }
      } catch (err) {
        console.error('Failed to delete member:', err)
        return { success: false, error: MESSAGES.ERROR.FAILED_TO_DELETE_MEMBER }
      }
    },
    [fetchMembers]
  )

  /**
   * 멤버 역할 변경 (단축 함수)
   * @param memberId - 멤버 ID
   * @param newRole - 새로운 역할
   * @returns 수정 결과
   */
  const updateRole = useCallback(
    async (memberId: string, newRole: 'admin' | 'member') => {
      return updateMember(memberId, { role: newRole })
    },
    [updateMember]
  )

  useEffect(() => {
    if (clubId || userId) {
      fetchMembers()
    }
  }, [fetchMembers, clubId, userId])

  return {
    members,
    loading,
    error,
    pagination,
    refetch: fetchMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
    updateRole,
  }
}
