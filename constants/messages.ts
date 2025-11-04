/**
 * 사용자 메시지 상수
 * 일관된 메시지 관리 및 다국어 지원 준비
 */

export const MESSAGES = {
  // 성공 메시지
  SUCCESS: {
    // 커뮤니티 관련
    COMMUNITY_CREATE: '커뮤니티가 성공적으로 생성되었습니다!',
    COMMUNITY_LEAVE: '커뮤니티를 탈퇴했습니다',

    // 이미지 관련
    IMAGE_UPLOAD: '이미지가 업로드되었습니다.',

    // 프로필 관련
    PROFILE_UPDATE: '프로필이 수정되었습니다',

    // 공지사항 관련
    NOTIFICATION_CREATE: '공지사항이 작성되었습니다',
    NOTIFICATION_DELETE: '공지사항이 삭제되었습니다',
    NOTIFICATION_PIN: '상단에 고정되었습니다',
    NOTIFICATION_UNPIN: '고정 해제되었습니다',

    // 리액션 관련
    REACTION_CREATE: '리액션을 성공적으로 생성했습니다',
    REACTION_DELETE: 'reaction이 삭제되었습니다',

    // 회원가입 관련
    EMAIL_AVAILABLE: '사용 가능한 이메일입니다.',
    NICKNAME_AVAILABLE: '사용 가능한 닉네임입니다.',
  },

  // 에러 메시지
  ERROR: {
    // 인증 및 권한 관련
    AUTH_REQUIRED: '인증이 필요합니다',
    ADMIN_REQUIRED: '팀장 권한이 필요합니다',
    LOGIN_REQUIRED: '로그인이 필요합니다',

    // 커뮤니티 관련
    INVALID_COMMUNITY_ID: '유효한 커뮤니티 ID가 없습니다.',
    COMMUNITY_NOT_FOUND: '커뮤니티를 찾을 수 없습니다.',
    COMMUNITY_NAME_REQUIRED: '커뮤니티 이름은 필수입니다.',
    COMMUNITY_NAME_EXISTS: '이미 존재하는 커뮤니티 이름입니다.',
    FAILED_TO_LOAD_COMMUNITY: '커뮤니티 정보를 불러오는데 실패했습니다.',
    FAILED_TO_FETCH_COMMUNITIES: '커뮤니티 목록을 불러오는데 실패했습니다.',
    COMMUNITY_LOAD_FAILED: '커뮤니티를 불러올 수 없습니다',
    COMMUNITY_TEMPORARY_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
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
    CREATING_COMMUNITY_ERROR: '커뮤니티 생성 중 오류가 발생했습니다',
    UPDATING_COMMUNITY_ERROR: '커뮤니티 수정 중 오류가 발생했습니다',
    DELETING_COMMUNITY_ERROR: '커뮤니티 삭제 중 오류가 발생했습니다',
    COMMUNITY_LOAD_ERROR: '커뮤니티 정보를 불러오는 중 오류가 발생했습니다',
    PROFILE_UPDATE_ERROR: '프로필 수정에 실패했습니다',
    DELETE_ACCOUNT_FAILED: '회원탈퇴에 실패했습니다',
    NAME_EMPTY_ERROR: '이름을 입력해주세요',
    COMMUNITY_CREATE_ERROR: '커뮤니티 생성 중 오류가 발생했습니다',

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

    UNSUPPORTED_FILE_TYPE: '지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP, GIF만 가능)',
    FILE_SIZE_TOO_LARGE: '파일 크기가 너무 큽니다. (최대 5MB)',
    THUMBNAIL_DELETE_CLICK: '썸네일 클릭 - 삭제',
    IMAGE_UPLOAD_FAILED: '이미지 업로드에 실패했습니다.',

    // 공지사항 관련
    NOTIFICATION_CREATE_FAILED: '공지사항 작성에 실패했습니다',
    NOTIFICATION_DELETE_FAILED: '삭제에 실패했습니다',
    NOTIFICATION_PIN_FAILED: '고정 설정에 실패했습니다',
    NOTIFICATION_PROCESS_FAILED: '처리에 실패했습니다',
    CONFIRM_DELETE: '정말 삭제하시겠습니까?',
    CONFIRM_PIN_REPLACE:
      '이미 고정된 공지사항이 있습니다. 기존 고정을 해제하고 새로 고정하시겠습니까?',

    // 리액션 관련
    REACTION_CREATE_FAILED: '리액션 생성 중 오류가 발생했습니다',
    REACTION_DELETE_FAILED: 'reaction 삭제에 실패했습니다',
    LIKE_BUTTON_CLICKED: '좋아요 버튼을 눌렀습니다.',

    // 대시보드 관련
    DASHBOARD_LOAD_FAILED: '대시보드를 불러오는 중 오류가 발생했습니다.',
    COMMUNITY_LEAVE_ERROR: '커뮤니티 탈퇴 중 오류가 발생했습니다',
    USER_CANCELLED: '사용자가 취소했습니다',

    // 기타
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
    INVALID_ROLE: '유효하지 않은 역할입니다.',
    FAILED_TO_LOAD_REGIONS: '지역 정보를 불러오는데 실패했습니다.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  },

  LOADING: {
    STUDY_LIST: '스터디 목록을 불러오는 중...',
    COMMUNITY_LIST: '커뮤니티 목록을 불러오는 중...',
    COMMUNITY_DETAIL: '커뮤니티 정보를 불러오는 중...',
    COMMUNITY_MEMBERS: '커뮤니티 멤버를 불러오는 중...',
    NOTIFICATIONS: '공지사항을 불러오는 중...',
    ROUNDS: '라운드 목록을 불러오는 중...',
    PROFILE: '프로필을 불러오는 중...',
    SEARCH: '검색 중...',
    DEFAULT: '로딩 중...',
    GOALS: '목표를 불러오는 중...',
    COMMUNITY: '커뮤니티 정보를 불러오는 중...',
    COMMUNITIES: '커뮤니티 목록을 불러오는 중...',
    ATTENDANCE: '출석 정보를 불러오는 중...',
    DASHBOARD: '대시보드를 불러오는 중...',
    CREATING: '생성 중...',
    UPLOADING: '업로드 중...',
    REACTION_CREATING: '리액션을 생성 중입니다',
    REACTION_DELETING: 'reaction을 삭제 중입니다',
  },

  EMPTY: {
    TEAM_GOALS: '그룹목표가 없습니다.',
    PERSONAL_GOALS: '개인목표가 없습니다.',
    NO_DESCRIPTION: '설명이 없습니다.',
    NO_ATTENDANCE: '출석 정보가 없습니다.',
    NO_ITEMS: '표시할 항목이 없습니다.',
    NO_COMMUNITIES: '가입한 커뮤니티가 없습니다.',
    NO_REGISTERED_COMMUNITIES: '등록된 커뮤니티가 없습니다',
    NO_NOTIFICATIONS: '작성된 공지사항이 없습니다',
  },

  ACTION: {
    ADD_ROUND: '회차 추가',
    ADD_GOAL: '목표 추가',
    BACK_TO_LIST: '목록으로 돌아가기',
    RETRY: '다시 시도',
    LEAVE_COMMUNITY: '커뮤니티 탈퇴',
    CONFIRM_LEAVE: (communityName: string) =>
      `정말로 "${communityName}" 커뮤니티를 탈퇴하시겠습니까?\n탈퇴된 커뮤니티는 복구할 수 없습니다.`,
    CREATE: '생성',
    WRITE: '쓰기',
    SAVE: '저장',
    CANCEL: '취소',
    DELETE: '삭제',
    PIN: '상단 고정',
    UNPIN: '고정 해제',
    SEND: '보내기',
  },

  LABEL: {
    NOTIFICATION: '공지',
    ROUND_INFO: (roundNumber: number) => `${roundNumber}회차`,
    NO_ROUND_INFO: '회차 정보 없음',
    MEMBERS_COUNT: (count: number) => `멤버: ${count}명`,
    COMMUNITY_INTRO: '커뮤니티 소개',
    ALL_COMMUNITIES: '전체 커뮤니티',
    COMMUNITY_DESCRIPTION: '참여 가능한 모든 커뮤니티를 확인하세요',
    LOADING: '로딩 중...',
    COMMUNITY_IMAGE_ALT: (communityName: string) => `${communityName} 커뮤니티 이미지`,
    NEW_COMMUNITY_CREATE: '새 커뮤니티 생성',
    STUDY_NAME: '모임명',
    STUDY_REGION: '스터디지역',
    STUDY_DESCRIPTION: '스터디설명',
    STUDY_TAG: '관련태그',
    STUDY_REPRESENTATIVE_IMAGE: '스터디 대표이미지 업로드',
    STUDY_REPRESENTATIVE_IMAGE_ALT: '스터디 대표 이미지',
    CREATE_BUTTON: '생성버튼',
    REGION: '지역',
    DESCRIPTION: '설명',
    TAG: '태그',
    REGION_PLACEHOLDER: '광역시/도',
    SUB_REGION_PLACEHOLDER: '시/구/군',
    STUDY_NAME_PLACEHOLDER: '스터디명을 입력하세요',
    STUDY_DESCRIPTION_PLACEHOLDER: '스터디에 대한 설명을 입력하세요',
    TAG_PLACEHOLDER: ',(쉼표)로 태그를 구분해주세요',

    // 공지사항 관련
    NOTIFICATION_TITLE: '제목',
    NOTIFICATION_CONTENT: '내용',
    NOTIFICATION_PIN_TOP: '상단 고정',
    WRITE_NOTIFICATION: '공지사항 작성',
    NOTIFICATION_TITLE_PLACEHOLDER: '공지사항 제목을 입력하세요',
    NOTIFICATION_CONTENT_PLACEHOLDER: '공지사항 내용을 입력하세요',
    PINNED: '고정됨',
    NOTIFICATION_TITLE_LABEL: '공지사항 제목',
    NOTIFICATION_CONTENT_LABEL: '공지사항 내용',

    // 멤버 프로필 관련
    PROFILE_IMAGE_ALT: (nickname: string) => `${nickname} 프로필 이미지`,
    STUDY_JOIN_DATE: '스터디 가입일',
    ROLE: '역할',
    ATTENDANCE: '출석',
    ATTENDANCE_COUNT: (count: number) => `${count}회`,
    ROLE_ADMIN: '관리자',
    ROLE_MEMBER: '멤버',
    COMMENT: '댓글',
    REACTION_PLACEHOLDER: '응원과 칭찬의 메세지를 남겨주세요',

    // 커뮤니티 관련
    COMMUNITY_PROFILE: '커뮤니티 프로필',
    COMMUNITY_NOTIFICATIONS: '커뮤니티 공지사항',
    STUDY_ROUNDS: '스터디 회차',
    NO_REGISTERED_NOTIFICATIONS: '등록된 공지가 없습니다',
    COMMUNITY_LOAD_ERROR: '커뮤니티 정보를 불러오는 중 오류가 발생했습니다',
    COMMUNITY_NOTIFICATION_LINK: '커뮤니티 공지로 이동',
    COMMUNITY_NAME: '커뮤니티 이름',
    COMMUNITY_TAGS: '태그',
    COMMUNITY_REGION: '지역',
    COMMUNITY_SUBREGION: '하위 지역',
    COMMUNITY_NAME_PLACEHOLDER: '커뮤니티 이름을 입력하세요',
    COMMUNITY_DESCRIPTION_PLACEHOLDER: '커뮤니티 설명을 입력하세요',
    COMMUNITY_TAGS_PLACEHOLDER: ',로 구분하여 입력 (예: 알고리즘, 독서, CS)',
    COMMUNITY_REGION_PLACEHOLDER: '지역을 선택하세요',
    COMMUNITY_SUBREGION_PLACEHOLDER: '하위 지역을 선택하세요',
    COMMUNITY_NAME_ARIA: '커뮤니티 이름을 입력하세요',
    COMMUNITY_DESCRIPTION_ARIA: '커뮤니티에 대한 상세 설명을 입력하세요',
    COMMUNITY_TAGS_ARIA: '커뮤니티 특성을 나타내는 태그를 쉼표로 구분하여 입력하세요',
    COMMUNITY_REGION_ARIA: '커뮤니티가 활동할 주요 지역을 선택하세요',
    COMMUNITY_SUBREGION_ARIA: '커뮤니티가 활동할 구체적인 하위 지역을 선택하세요',

    // 라운드 관련
    ROUND_CARD: '회차 카드',
    ROUND_EDIT: '회차 편집',
    ROUND_NUMBER: '회차 번호',
    ROUND_START_DATE: '시작일',
    ROUND_END_DATE: '종료일',
    ROUND_LOCATION: '장소',
    ROUND_NUMBER_PLACEHOLDER: '회차 번호',
    ROUND_START_DATE_PLACEHOLDER: '시작일',
    ROUND_END_DATE_PLACEHOLDER: '종료일',
    ROUND_LOCATION_PLACEHOLDER: '장소',
    ROUND_NUMBER_ARIA: '회차 번호를 입력하세요 (1 이상의 숫자)',
    ROUND_START_DATE_ARIA: '회차 시작 일시를 선택하세요',
    ROUND_END_DATE_ARIA: '회차 종료 일시를 선택하세요',
    ROUND_LOCATION_ARIA: '스터디가 진행될 장소를 입력하세요',
    ROUND_LOCATION_INPUT_PLACEHOLDER: '스터디 장소를 입력하세요',
    ROUNDS_LOADING: '회차 목록을 불러오는 중...',

    // 목표 관련
    GOALS_SECTION: '목표 섹션',
    TEAM_GOALS: '그룹목표',
    PERSONAL_GOALS: '개인목표',
    GOAL_ADD: '목표 추가',
    GOAL_INPUT: '목표 입력',
    NEW_GOAL_PLACEHOLDER: '새 목표를 입력하세요',
    GOAL_PLACEHOLDER: '목표를 입력하세요',
    NEW_GOAL_ARIA: '새로운 목표를 입력하세요',
    EDIT_GOAL_ARIA: '목표를 수정하여 입력하세요',
    GOAL_COMPLETE_ARIA: (title: string) => `${title} 완료 표시`,

    // 멤버 관련
    SEARCH_PLACEHOLDER: '검색어를 입력해주세요',
    MEMBERS_LOAD_FAILED: '멤버 목록을 불러오는데 실패했습니다.',
    NO_SEARCH_RESULTS: '검색 결과가 없습니다.',
    NO_MEMBERS: '멤버가 없습니다.',
    ROLE_OWNER: '소유자',

    // 로그인/회원가입 관련
    BRAND_NAME: '토끼노트',
    BRAND_LOGO_ALT: '토끼노트 로고',
    KAKAO_LOGIN: '카카오톡으로 시작하기',
    KAKAO_LOGIN_ARIA: '카카오톡으로 시작하기',
    KAKAO_SYMBOL_ALT: '카카오 심볼',
    EMAIL_PLACEHOLDER: 'email@example.com',
    NICKNAME_PLACEHOLDER: '닉네임을 입력하세요',
    NAME_PLACEHOLDER: '이름',
    EMAIL_DUPLICATE_CHECK: '이메일 중복 확인',
    NICKNAME_DUPLICATE_CHECK: '닉네임 중복 확인',
    NAME_INPUT_ARIA: '이름 입력',
    EMAIL_ERROR: '이메일을 확인해주세요.',
    NICKNAME_ERROR: '닉네임을 확인해주세요.',
    NAME_ERROR: '이름을 입력해주세요.',
    FORM_ERROR: '폼을 제출할 수 없습니다. 다시 시도해주세요.',
    SUBMIT_NOTE: '가입을 완료하려면 모든 필드를 올바르게 입력해주세요.',
    CHECKING: '확인중…',
    DUPLICATE_CHECK: '중복확인',
    SIGNING_UP: '가입 중...',
    SIGN_UP: '가입하기',
    SUBMIT_HELP: '모든 필드를 입력하고 중복 확인을 완료해주세요.',

    // 프로필 관련
    PROFILE_EDIT: '프로필 편집',
    PROFILE: '프로필',
    EMAIL: '이메일',
    NAME: '이름',
    NICKNAME: '닉네임',
    NAME_REQUIRED: '이름 *',
    NAME_EMPTY_ERROR: '이름을 입력해주세요',
    PROFILE_UPDATE_SUCCESS: '프로필이 수정되었습니다',
    PROFILE_UPDATE_ERROR: '프로필 수정에 실패했습니다',
    SAVING: '저장 중...',
    SAVE: '저장',

    // 회원탈퇴 관련
    DELETE_ACCOUNT_CONFIRM: '정말로 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    DELETING_ACCOUNT: '처리 중…',
    DELETE_ACCOUNT: '회원탈퇴',
    DELETE_ACCOUNT_FAILED: '회원탈퇴에 실패했습니다',
  },

  // 검색 관련
  SEARCH: {
    SEARCH_PLACEHOLDER: '검색어를 입력하세요',
    SEARCH_INPUT_ARIA: '검색어 입력',
    SEARCH_BUTTON_ARIA: '검색 버튼',
    REGION_PLACEHOLDER: '지역을 선택하세요 (선택사항)',
    SUBREGION_PLACEHOLDER: '세부 지역을 선택하세요 (선택사항)',
    SEARCH_RESULTS_ARIA: '검색 결과',
    PAGINATION_ARIA: '페이지네이션',
    PREVIOUS_PAGE_ARIA: '이전 페이지',
    NEXT_PAGE_ARIA: '다음 페이지',
    SEARCH_ERROR: '검색 중 오류가 발생했습니다',
    SEARCH_HEADING: '지역 검색',
  },

  // 캘린더 관련
  CALENDAR: {
    DAY_NAMES: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  },

  // 대시보드 관련
  DASHBOARD: {
    DEFAULT_USERNAME: '사용자',
    STUDY_LIST_TITLE: (username: string) => `${username}님의 스터디 목록`,
    EMPTY_COMMUNITIES: '구독한 커뮤니티가 없습니다.',
    LEAVE_COMMUNITY: '탈퇴',
    ERROR_TITLE: '오류가 발생했습니다',
    RETRY_MESSAGE: '다시 시도해주세요.',
  },
} as const
