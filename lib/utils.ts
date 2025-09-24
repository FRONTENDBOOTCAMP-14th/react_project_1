/**
 * 여러 클래스 네임을 하나의 클래스 네임으로 합치는 함수
 * @param ...classes 합쳐질 클래스 네임 배열
 * @returns 합쳐진 클래스 네임
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
