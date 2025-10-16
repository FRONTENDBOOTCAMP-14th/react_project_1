import { StrokeButton } from '@/components/ui'

/**
 * 에러 상태 컴포넌트에 전달되는 속성
 */
interface ErrorStateProps {
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
  className,
}: ErrorStateProps) {
  return (
    <section role="alert" aria-live="assertive" className={className}>
      <p className="error">{message}</p>
      {onRetry && (
        <StrokeButton onClick={onRetry} type="button" aria-label={retryText}>
          {retryText}
        </StrokeButton>
      )}
    </section>
  )
}
