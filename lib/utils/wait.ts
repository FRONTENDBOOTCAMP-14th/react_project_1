/**
 * 특정 시간만큼 대기하는 함수
 * @param seconds 기다릴 시간 (초단위, 기본값 1초)
 * @returns 특정 시간만큼 대기하는 Promise
 */
export default function wait(seconds: number = 1): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}
