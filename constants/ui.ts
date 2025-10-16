/**
 * UI 관련 상수
 * 매직 넘버/문자열 제거 및 일관된 UI 스펙 유지
 */

export const UI_CONSTANTS = {
  /**
   * 이미지 크기
   */
  IMAGE_SIZE: {
    PROFILE_THUMBNAIL: 90,
    PROFILE_SMALL: 60,
    PROFILE_LARGE: 150,
  },

  /**
   * 아이콘 크기
   */
  ICON_SIZE: {
    SMALL: 16,
    MEDIUM: 20,
    LARGE: 24,
  },

  /**
   * 페이지당 아이템 수
   */
  ITEMS_PER_PAGE: {
    DEFAULT: 10,
    GOALS: 20,
    COMMUNITIES: 12,
  },
} as const
