/**
 * 중앙화된 로깅 유틸리티
 * 에러, 정보, 경고 등을 일관된 형식으로 로깅
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry

    let logString = `[${timestamp}] ${level}: ${message}`

    if (context) {
      logString += `\nContext: ${JSON.stringify(context, null, 2)}`
    }

    if (error) {
      logString += `\nError: ${error.message}`
      if (error.stack) {
        logString += `\nStack: ${error.stack}`
      }
    }

    return logString
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    }

    const formattedLog = this.formatLogEntry(entry)

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog)
        break
      case LogLevel.WARN:
        console.warn(formattedLog)
        break
      case LogLevel.INFO:
        console.error(formattedLog)
        break
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.error(formattedLog)
        }
        break
    }
  }

  error(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  // API 에러 전용 로깅
  apiError(
    endpoint: string,
    method: string,
    error: Error | string,
    context?: Record<string, unknown>
  ) {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    this.error(`API Error: ${method} ${endpoint}`, { endpoint, method, ...context }, errorObj)
  }

  // Server Action 에러 전용 로깅
  actionError(actionName: string, error: Error | string, context?: Record<string, unknown>) {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    this.error(`Server Action Error: ${actionName}`, { actionName, ...context }, errorObj)
  }

  // 컴포넌트 에러 전용 로깅
  componentError(componentName: string, error: Error, errorInfo?: unknown) {
    this.error(`Component Error: ${componentName}`, { componentName, errorInfo }, error)
  }
}

export const logger = new Logger()
