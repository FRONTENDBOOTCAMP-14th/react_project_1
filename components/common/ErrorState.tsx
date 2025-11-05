'use client'

import { StrokeButton } from '@/components/ui'

/**
 * 에러 상태 컴포넌트에 전달되는 속성
 */
export interface ErrorStateProps {
  /**
   * 에러 메시지
   */
  message: string
  /**
   * 재시도 핸들러 (선택)
   */
  onRetry?: () => void | Promise<void>
  /**
   * 재시도 버튼 텍스트
   */
  retryText?: string
  /**
   * 범용 액션 핸들러 (선택)
   * onRetry 대신 사용 가능
   */
  onAction?: () => void | Promise<void>
  /**
   * 범용 액션 버튼 텍스트
   * retryText 대신 사용 가능
   */
  actionLabel?: string
  /**
   * 추가 CSS 클래스명
   */
  className?: string
}

/**
 * 에러 상태 컴포넌트
 * 에러가 발생했음을 사용자에게 알리고, 선택적으로 재시도 기능을 제공합니다.
 * @param props - ErrorStateProps
 * @example
 * <ErrorState
 *   message="데이터를 불러오는데 실패했습니다."
 *   onRetry={handleRetry}
 * />
 */
export default function ErrorState({
  message,
  onRetry,
  retryText = '다시 시도',
  onAction,
  actionLabel,
  className,
}: ErrorStateProps) {
  const actionHandler = onAction || onRetry
  const buttonLabel = actionLabel || retryText

  return (
    <section role="alert" aria-live="assertive" className={className}>
      <p className="error">{message}</p>
      {actionHandler && (
        <StrokeButton type="button" onClick={actionHandler} aria-label={buttonLabel}>
          {buttonLabel}
        </StrokeButton>
      )}
    </section>
  )
}
