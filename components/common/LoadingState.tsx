/**
 * 로딩 상태 컴포넌트에 전달되는 속성
 */
interface LoadingStateProps {
  /**
   * 로딩 메시지
   */
  message?: string
  /**
   * 추가 CSS 클래스명
   */
  className?: string
}

/**
 * 로딩 상태 컴포넌트
 * 데이터를 불러오는 중임을 사용자에게 알립니다.
 * @param props - LoadingStateProps
 * @example
 * <LoadingState message="데이터를 불러오는 중..." />
 */
export default function LoadingState({ message = '로딩 중...', className }: LoadingStateProps) {
  return (
    <section aria-busy="true" aria-live="polite" className={className}>
      <p>{message}</p>
    </section>
  )
}
