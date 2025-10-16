'use client'

import { useRef } from 'react'
import { IconButton } from '@/components/ui'
import { cn } from '@/lib/utils'
import DefaultImg from '@/app/community/new/_components/assets/default-study01.png'

/**
 * 이미지 업로드 컴포넌트
 *
 * - 사용자가 이미지를 선택하는 컴포넌트 입니다.
 * - 클릭 시 파일 선택 다이얼로그가 열리며, 선택한 이미지를 표시합니다.
 *
 * @param props
 * @returns 선택한 이미지 업로드 컴포넌트
 *
 * @example
 *
 */

// 사용자가 "이미지를 선택하세요" 영역 클릭/IconButton/키보드 엔터,스페이스
// handleClick() 함수 실행
// fileInputRef.current?.click() 호출
// 숨겨진 <input type="file"> 이 클릭됨
// 브라우저의 파일 선택 창이 열림

export default function ImageUploader() {
  const InputImageRef = useRef<HTMLEInputElement | null>(null)

  return (
    <input
      type="file"
      ref={InputImageRef}
      className={cn()}
      accept=".jpg,.jpeg,.png,.webp"
      /* style={{display: 'none'}} */
    />
  )
}
