/**
 * 사용자 메시지 상수
 * 일관된 메시지 관리 및 다국어 지원 준비
 */

export const MESSAGES = {
  ERROR: {
    // 인증 및 권한 관련
    AUTH_REQUIRED: '인증이 필요합니다',
    ADMIN_REQUIRED: '관리자 권한이 필요합니다',

    // 커뮤니티 관련
    INVALID_COMMUNITY_ID: '유효한 커뮤니티 ID가 없습니다.',
    COMMUNITY_NOT_FOUND: '커뮤니티를 찾을 수 없습니다.',
    COMMUNITY_NAME_REQUIRED: '커뮤니티 이름은 필수입니다.',
    COMMUNITY_NAME_EXISTS: '이미 존재하는 커뮤니티 이름입니다.',
    FAILED_TO_LOAD_COMMUNITY: '커뮤니티 정보를 불러오는데 실패했습니다.',
    FAILED_TO_FETCH_COMMUNITIES: '커뮤니티 목록을 불러오는데 실패했습니다.',
    FAILED_TO_CREATE_COMMUNITY: '커뮤니티 생성에 실패했습니다.',
    FAILED_TO_UPDATE_COMMUNITY: '커뮤니티 수정에 실패했습니다.',
    FAILED_TO_DELETE_COMMUNITY: '커뮤니티 삭제에 실패했습니다.',
    COMMUNITY_CREATE_FAILED: '커뮤니티 생성에 실패했습니다',
    COMMUNITY_UPDATE_FAILED: '커뮤니티 수정에 실패했습니다',
    COMMUNITY_DELETE_FAILED: '커뮤니티 삭제에 실패했습니다',
    COMMUNITY_JOIN_FAILED: '커뮤니티 가입에 실패했습니다',
    COMMUNITY_LEAVE_FAILED: '커뮤니티 탈퇴에 실패했습니다',

    // 목표 관련
    FAILED_TO_LOAD_GOALS: '목표를 불러오는데 실패했습니다.',
    FAILED_TO_CREATE_GOAL: '목표 생성에 실패했습니다.',
    FAILED_TO_UPDATE_GOAL: '목표 수정에 실패했습니다.',
    FAILED_TO_DELETE_GOAL: '목표 삭제에 실패했습니다.',
    GOAL_CREATE_FAILED: '목표 생성에 실패했습니다',
    GOAL_UPDATE_FAILED: '목표 수정에 실패했습니다',
    GOAL_DELETE_FAILED: '목표 삭제에 실패했습니다',
    GOAL_NOT_FOUND: '목표를 찾을 수 없습니다',
    CREATING_GOAL_ERROR: '목표 생성 중 오류가 발생했습니다.',
    UPDATING_GOAL_ERROR: '목표 수정 중 오류가 발생했습니다.',
    DELETING_GOAL_ERROR: '목표 삭제 중 오류가 발생했습니다.',

    // 라운드 관련
    FAILED_TO_LOAD_ROUNDS: '라운드 정보를 불러오는데 실패했습니다.',
    FAILED_TO_CREATE_ROUND: '라운드 생성에 실패했습니다.',
    FAILED_TO_UPDATE_ROUND: '라운드 수정에 실패했습니다.',
    FAILED_TO_DELETE_ROUND: '라운드 삭제에 실패했습니다.',
    ROUND_CREATE_FAILED: '라운드 생성에 실패했습니다',
    ROUND_UPDATE_FAILED: '라운드 수정에 실패했습니다',
    ROUND_DELETE_FAILED: '라운드 삭제에 실패했습니다',
    ROUND_NOT_FOUND: '라운드를 찾을 수 없습니다',
    CREATING_ROUND_ERROR: '라운드 생성 중 오류가 발생했습니다.',
    UPDATING_ROUND_ERROR: '라운드 수정 중 오류가 발생했습니다.',
    DELETING_ROUND_ERROR: '라운드 삭제 중 오류가 발생했습니다.',

    // 출석 관련
    FAILED_TO_FETCH_ATTENDANCE: '출석 정보를 불러오는데 실패했습니다.',
    FAILED_TO_CREATE_ATTENDANCE: '출석 생성에 실패했습니다.',
    FAILED_TO_UPDATE_ATTENDANCE: '출석 수정에 실패했습니다.',
    FAILED_TO_DELETE_ATTENDANCE: '출석 삭제에 실패했습니다.',
    ATTENDANCE_FAILED: '출석 처리에 실패했습니다',
    ALREADY_ATTENDED: '이미 출석 처리되었습니다',
    ATTENDANCE_TIME_INVALID: '출석 가능 시간이 아닙니다',
    ATTENDANCE_NOT_FOUND: '출석 정보를 찾을 수 없습니다.',
    ATTENDANCE_ALREADY_EXISTS: '이미 해당 라운드에 출석 정보가 있습니다.',
    CREATING_ATTENDANCE_ERROR: '출석 생성 중 오류가 발생했습니다.',
    UPDATING_ATTENDANCE_ERROR: '출석 수정 중 오류가 발생했습니다.',
    DELETING_ATTENDANCE_ERROR: '출석 삭제 중 오류가 발생했습니다.',

    // 멤버 관련
    MEMBER_NOT_FOUND: '멤버를 찾을 수 없습니다.',
    MEMBER_ALREADY_EXISTS: '이미 커뮤니티 멤버입니다.',
    FAILED_TO_LOAD_MEMBERS: '멤버 목록을 불러오는데 실패했습니다.',
    FAILED_TO_CREATE_MEMBER: '멤버 추가에 실패했습니다.',
    FAILED_TO_UPDATE_MEMBER: '멤버 정보 수정에 실패했습니다.',
    FAILED_TO_DELETE_MEMBER: '멤버 삭제에 실패했습니다.',
    MEMBER_UPDATE_FAILED: '멤버 정보 수정에 실패했습니다',
    MEMBER_REMOVE_FAILED: '멤버 제거에 실패했습니다',

    // 프로필 관련
    PROFILE_UPDATE_FAILED: '프로필 수정에 실패했습니다',
    PROFILE_IMAGE_UPLOAD_FAILED: '프로필 이미지 업로드에 실패했습니다',

    // 공지사항 관련
    FAILED_TO_LOAD_NOTIFICATIONS: '공지사항을 불러오는데 실패했습니다.',
    FAILED_TO_CREATE_NOTIFICATION: '공지사항 생성에 실패했습니다.',
    FAILED_TO_UPDATE_NOTIFICATION: '공지사항 수정에 실패했습니다.',
    FAILED_TO_DELETE_NOTIFICATION: '공지사항 삭제에 실패했습니다.',
    CREATING_NOTIFICATION_ERROR: '공지사항 생성 중 오류가 발생했습니다.',
    UPDATING_NOTIFICATION_ERROR: '공지사항 수정 중 오류가 발생했습니다.',
    DELETING_NOTIFICATION_ERROR: '공지사항 삭제 중 오류가 발생했습니다.',

    // 리액션 관련
    FAILED_TO_LOAD_REACTIONS: '리액션을 불러오는데 실패했습니다.',
    FAILED_TO_CREATE_REACTION: '리액션 생성에 실패했습니다.',
    FAILED_TO_UPDATE_REACTION: '리액션 수정에 실패했습니다.',
    FAILED_TO_DELETE_REACTION: '리액션 삭제에 실패했습니다.',
    CREATING_REACTION_ERROR: '리액션 생성 중 오류가 발생했습니다.',
    UPDATING_REACTION_ERROR: '리액션 수정 중 오류가 발생했습니다.',
    DELETING_REACTION_ERROR: '리액션 삭제 중 오류가 발생했습니다.',
    REACTION_NOT_FOUND: '리액션을 찾을 수 없습니다.',

    // 기타
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
    INVALID_ROLE: '유효하지 않은 역할입니다.',
    FAILED_TO_LOAD_REGIONS: '지역 정보를 불러오는데 실패했습니다.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  },

  LOADING: {
    GOALS: '목표를 불러오는 중...',
    COMMUNITY: '커뮤니티 정보를 불러오는 중...',
    ATTENDANCE: '출석 정보를 불러오는 중...',
  },

  EMPTY: {
    TEAM_GOALS: '그룹목표가 없습니다.',
    PERSONAL_GOALS: '개인목표가 없습니다.',
    NO_DESCRIPTION: '설명이 없습니다.',
    NO_ATTENDANCE: '출석 정보가 없습니다.',
  },

  ACTION: {
    ADD_ROUND: '회차 추가',
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
