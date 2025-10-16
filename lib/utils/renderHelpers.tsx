import type { ReactNode } from 'react'

/**
 * 조건부 렌더링을 위한 고차 함수
 * @param condition - 렌더링 조건
 * @param component - 조건이 true일 때 렌더링할 컴포넌트
 * @param fallback - 조건이 false일 때 렌더링할 컴포넌트 (선택적)
 * @returns ReactNode
 * @example
 * renderWhen(isLoggedIn, <Dashboard />, <Login />)
 */
export const renderWhen = (
  condition: boolean,
  component: ReactNode,
  fallback: ReactNode = null
): ReactNode => (condition ? component : fallback)

/**
 * 로딩 상태에 따른 조건부 렌더링
 * @param loading - 로딩 상태
 * @param loadingComponent - 로딩 중 렌더링할 컴포넌트
 * @param content - 로딩 완료 후 렌더링할 컴포넌트
 * @returns ReactNode
 * @example
 * renderWithLoading(isLoading, <Spinner />, <Content />)
 */
export const renderWithLoading = (
  loading: boolean,
  loadingComponent: ReactNode,
  content: ReactNode
): ReactNode => renderWhen(loading, loadingComponent, content)

/**
 * 에러 상태에 따른 조건부 렌더링
 * @param error - 에러 메시지 또는 에러 존재 여부
 * @param errorComponent - 에러 발생 시 렌더링할 컴포넌트
 * @param content - 정상 상태에서 렌더링할 컴포넌트
 * @returns ReactNode
 * @example
 * renderWithError(error, <ErrorMessage error={error} />, <Content />)
 */
export const renderWithError = (
  error: string | null | boolean,
  errorComponent: ReactNode,
  content: ReactNode
): ReactNode => renderWhen(!!error, errorComponent, content)

/**
 * 빈 리스트 처리를 위한 조건부 렌더링
 * @param isEmpty - 리스트가 비어있는지 여부
 * @param emptyComponent - 빈 리스트일 때 렌더링할 컴포넌트
 * @param content - 리스트가 있을 때 렌더링할 컴포넌트
 * @returns ReactNode
 * @example
 * renderWithEmpty(items.length === 0, <EmptyState />, <ItemList items={items} />)
 */
export const renderWithEmpty = (
  isEmpty: boolean,
  emptyComponent: ReactNode,
  content: ReactNode
): ReactNode => renderWhen(isEmpty, emptyComponent, content)

/**
 * 데이터 존재 여부에 따른 조건부 렌더링
 * @param data - 데이터 객체
 * @param component - 데이터가 있을 때 렌더링할 컴포넌트
 * @param fallback - 데이터가 없을 때 렌더링할 컴포넌트
 * @returns ReactNode
 * @example
 * renderWithData(user, <UserProfile user={user} />, <NotFound />)
 */
export const renderWithData = <T,>(
  data: T | null | undefined,
  component: ReactNode,
  fallback: ReactNode = null
): ReactNode => renderWhen(!!data, component, fallback)

/**
 * 권한에 따른 조건부 렌더링
 * @param hasPermission - 권한 존재 여부
 * @param component - 권한이 있을 때 렌더링할 컴포넌트
 * @param fallback - 권한이 없을 때 렌더링할 컴포넌트
 * @returns ReactNode
 * @example
 * renderWithPermission(isAdmin, <AdminPanel />, <AccessDenied />)
 */
export const renderWithPermission = (
  hasPermission: boolean,
  component: ReactNode,
  fallback: ReactNode = null
): ReactNode => renderWhen(hasPermission, component, fallback)
