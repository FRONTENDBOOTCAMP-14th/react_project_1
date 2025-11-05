'use client'

import { useTimeSync, useTimezone } from '@/lib/utils'
import { Clock, Globe } from 'lucide-react'

interface TimezoneDisplayProps {
  className?: string
  showIcon?: boolean
  variant?: 'compact' | 'detailed'
}

/**
 * 타임존 정보 표시 컴포넌트
 */
export function TimezoneDisplay({
  className = '',
  showIcon = true,
  variant = 'compact',
}: TimezoneDisplayProps) {
  const { timezoneInfo } = useTimezone()

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 text-sm text-gray-600 ${className}`}>
        {showIcon && <Clock className="h-3 w-3" />}
        <span>{timezoneInfo.offsetString}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {showIcon && <Globe className="h-4 w-4 text-gray-500" />}
      <div>
        <div className="font-medium text-gray-900">{timezoneInfo.name}</div>
        <div className="text-gray-600">
          {timezoneInfo.offsetString}
          {timezoneInfo.isDST && <span className="ml-1 text-xs text-orange-600">(서머타임)</span>}
        </div>
      </div>
    </div>
  )
}

interface TimezoneWarningProps {
  serverTimezone?: string
  className?: string
}

/**
 * 타임존 불일치 경고 컴포넌트
 */
export function TimezoneWarning({ serverTimezone = 'UTC', className = '' }: TimezoneWarningProps) {
  const { timezoneInfo } = useTimezone()

  // 서버가 UTC이고 사용자가 UTC가 아닌 경우 경고
  const isDifferentTimezone = serverTimezone === 'UTC' && timezoneInfo.timezone !== 'UTC'

  if (!isDifferentTimezone) {
    return null
  }

  return (
    <div
      className={`flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}
    >
      <div className="flex-shrink-0">
        <Globe className="h-4 w-4 text-blue-600 mt-0.5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-blue-900">시간대 정보</h4>
        <p className="text-sm text-blue-700 mt-1">
          현재 {timezoneInfo.name}({timezoneInfo.offsetString})을 사용하고 있습니다. 서버는 UTC
          시간을 기준으로 동작합니다.
        </p>
      </div>
    </div>
  )
}

interface SyncStatusProps {
  className?: string
}

/**
 * 시간 동기화 상태 표시 컴포넌트
 */
export function SyncStatus({ className = '' }: SyncStatusProps) {
  const { syncStatus, loading } = useTimeSync()

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" />
        <span>시간 동기화 중...</span>
      </div>
    )
  }

  if (!syncStatus?.isSynced) {
    return (
      <div className={`flex items-center gap-2 text-sm text-orange-600 ${className}`}>
        <div className="h-2 w-2 bg-orange-400 rounded-full" />
        <span>시간 동기화 필요</span>
      </div>
    )
  }

  const offsetSeconds = Math.round(syncStatus.offset / 1000)
  const offsetText =
    offsetSeconds === 0
      ? '동기화됨'
      : offsetSeconds > 0
        ? `+${offsetSeconds}초`
        : `${offsetSeconds}초`

  return (
    <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
      <div className="h-2 w-2 bg-green-400 rounded-full" />
      <span>{offsetText}</span>
    </div>
  )
}
