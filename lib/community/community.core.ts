import { err, ok, type Result } from '@/lib/errors/result'
import type { UpdateCommunityInput } from '@/lib/types/community'

export interface CanJoinCommunityInput {
  userId: string | null | undefined
  isExistingMember: boolean
}

export interface JoinCommunityData {
  userId: string
  role: 'member'
}

export interface CanDeleteCommunityInput {
  isAdmin: boolean
  isDeleted: boolean
}

export interface PrepareImageUploadInput {
  fileName: string
  fileSize: number
}

export interface ImageUploadContext {
  timestamp: number
  randomSuffix: string
}

export interface PreparedImageUpload {
  fileName: string
  filePath: string
}

const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

/**
 * 커뮤니티 가입 가능 여부 판별 및 기본 가입 데이터 반환
 */
export function canJoinCommunity(input: CanJoinCommunityInput): Result<JoinCommunityData, Error> {
  if (!input.userId) {
    return err(new Error('인증이 필요합니다'))
  }

  if (input.isExistingMember) {
    return err(new Error('이미 가입된 커뮤니티입니다'))
  }

  return ok({
    userId: input.userId,
    role: 'member',
  })
}

/**
 * 커뮤니티 수정 입력값 검증 및 정제
 */
export function prepareCommunityUpdate(
  input: UpdateCommunityInput
): Result<Partial<UpdateCommunityInput>, Error> {
  const sanitized: Partial<UpdateCommunityInput> = {}

  if (input.name !== undefined) {
    const trimmed = input.name.trim()
    if (trimmed.length === 0) {
      return err(new Error('커뮤니티 이름은 비어있을 수 없습니다'))
    }
    sanitized.name = trimmed
  }

  if (input.description !== undefined) {
    sanitized.description = input.description ? input.description.trim() : input.description
  }

  if (input.region !== undefined) {
    sanitized.region = input.region
  }

  if (input.subRegion !== undefined) {
    sanitized.subRegion = input.subRegion
  }

  if (input.tagname !== undefined) {
    sanitized.tagname = input.tagname
  }

  if (input.imageUrl !== undefined) {
    sanitized.imageUrl = input.imageUrl
  }

  if (Object.keys(sanitized).length === 0) {
    return err(new Error('수정할 내용이 없습니다'))
  }

  return ok(sanitized)
}

/**
 * 커뮤니티 삭제 자격 및 상태 검증
 */
export function canDeleteCommunity(input: CanDeleteCommunityInput): Result<true, Error> {
  if (!input.isAdmin) {
    return err(new Error('커뮤니티를 삭제할 권한이 없습니다'))
  }

  if (input.isDeleted) {
    return err(new Error('이미 삭제된 커뮤니티입니다'))
  }

  return ok(true)
}

/**
 * 이미지 메타데이터 검증 및 저장 경로 생성
 */
export function prepareImageUpload(
  input: PrepareImageUploadInput,
  context: ImageUploadContext
): Result<PreparedImageUpload, Error> {
  if (input.fileSize > MAX_IMAGE_SIZE_BYTES) {
    return err(new Error('이미지 파일 크기는 5MB를 초과할 수 없습니다'))
  }

  const parts = input.fileName.split('.')
  const ext = parts.length > 1 ? (parts.pop() || '').toLowerCase() : ''

  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return err(new Error('지원하지 않는 이미지 형식입니다'))
  }

  const generatedFileName = `${context.timestamp}-${context.randomSuffix}.${ext}`
  const filePath = `community-images/${generatedFileName}`

  return ok({
    fileName: generatedFileName,
    filePath,
  })
}

export interface ValidatedCommunityCreationData {
  name: string
  description: string | null
  isPublic: boolean
  region: string | null
  subRegion: string | null
  tagname: string[]
  imageUrl: string | null
}

export interface CreateCommunityDataInput {
  name?: string
  description?: string | null
  is_public?: boolean
  isPublic?: boolean
  region?: string | null
  subRegion?: string | null
  tagname?: string | string[]
  imageUrl?: string | null
}

/**
 * 커뮤니티 생성 입력값 검증 및 정제
 */
export function validateCommunityCreation(
  input: CreateCommunityDataInput
): Result<ValidatedCommunityCreationData, Error> {
  const name = (input?.name ?? '').trim()
  if (!name || name.length === 0) {
    return err(new Error('커뮤니티 이름은 비어있을 수 없습니다'))
  }
  if (name.length > 100) {
    return err(new Error('커뮤니티 이름은 100자 이하여야 합니다'))
  }

  const description = (input?.description ?? '').trim() || null
  const isPublic =
    input.is_public !== undefined ? Boolean(input.is_public) : Boolean(input.isPublic ?? true)
  const region = (input?.region ?? '').trim() || null
  const subRegion = (input?.subRegion ?? '').trim() || null
  const imageUrl = (input?.imageUrl ?? '').trim() || null

  let tagname: string[] = []
  if (Array.isArray(input.tagname)) {
    tagname = input.tagname.map(t => t.trim()).filter(Boolean)
  } else if (typeof input.tagname === 'string') {
    tagname = input.tagname ? [input.tagname.trim()] : []
  }

  return ok({
    name,
    description,
    isPublic,
    region,
    subRegion,
    tagname,
    imageUrl,
  })
}
