'use client'

/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생하는 에러를 잡아내는 HOC
 */

import { MESSAGES } from '@/constants'
import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
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
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-boundary">
            <h2>오류가 발생했습니다</h2>
            <p>{MESSAGES.ERROR.NETWORK_ERROR}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="retry-button"
            >
              다시 시도
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
