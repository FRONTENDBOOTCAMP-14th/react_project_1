/**
 * 사용자 메시지 상수
 * 일관된 메시지 관리 및 다국어 지원 준비
 */

export const MESSAGES = {
  ERROR: {
    INVALID_COMMUNITY_ID: '유효한 커뮤니티 ID가 없습니다.',
    COMMUNITY_NOT_FOUND: '커뮤니티를 찾을 수 없습니다.',
    FAILED_TO_LOAD_GOALS: '목표를 불러오는데 실패했습니다.',
    FAILED_TO_LOAD_COMMUNITY: '커뮤니티 정보를 불러오는데 실패했습니다.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  },

  LOADING: {
    GOALS: '목표를 불러오는 중...',
    COMMUNITY: '커뮤니티 정보를 불러오는 중...',
  },

  EMPTY: {
    TEAM_GOALS: '그룹목표가 없습니다.',
    PERSONAL_GOALS: '개인목표가 없습니다.',
    NO_DESCRIPTION: '설명이 없습니다.',
  },

  ACTION: {
    ADD_ROUND: '라운드 추가',
    ADD_GOAL: '목표 추가',
    BACK_TO_LIST: '목록으로 돌아가기',
    RETRY: '다시 시도',
  },

  LABEL: {
    NOTIFICATION: '공지',
    ROUND_INFO: (roundNumber: number) => `${roundNumber}회차`,
    NO_ROUND_INFO: '회차 정보 없음',
    MEMBERS_COUNT: (count: number) => `멤버: ${count}명`,
  },
} as const
