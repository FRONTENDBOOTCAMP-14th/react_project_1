'use client'

/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생하는 에러를 잡아내는 HOC
 */

import { MESSAGES } from '@/constants'
import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  customMessage?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // 에러 정보를 상세히 로깅
    console.error('🔥 ErrorBoundary Details')
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Component Stack:', errorInfo.componentStack)

    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className={styles['error-boundary']}>
            <h2 className={styles['error-title']}>오류가 발생했습니다</h2>
            <p className={styles['error-message']}>
              {this.props.customMessage || MESSAGES.ERROR.UNEXPECTED_ERROR}
            </p>

            {this.props.showDetails && this.state.error && (
              <details className={styles['error-details']}>
                <summary>에러 상세 정보</summary>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}

            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className={styles['retry-button']}
            >
              {MESSAGES.ACTION.RETRY}
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

/**
 * 에러 바운더리 훅 (함수형 컴포넌트용)
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    // 여기에 에러 리포팅 로직 추가 가능
  }
}
