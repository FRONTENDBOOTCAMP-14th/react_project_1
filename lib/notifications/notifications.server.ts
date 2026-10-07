import prisma from '@/lib/prisma'
import {
  activeNotificationWhere,
  notificationDetailSelect,
  notificationSelect,
} from '@/lib/queries'
import type { Prisma } from '@prisma/client'
import type {
  ValidatedNotificationCreationData,
  ValidatedNotificationUpdateData,
} from './notifications.core'

export interface NotificationFilterOptions {
  isPinned?: boolean
}

/**
 * 공지사항 필터링 where 절 생성
 */
export function buildNotificationWhereClause(
  clubId: string,
  filters: NotificationFilterOptions = {}
): Prisma.NotificationWhereInput {
  const whereClause: Prisma.NotificationWhereInput = {
    ...activeNotificationWhere,
    clubId,
  }

  if (filters.isPinned !== undefined) {
    whereClause.isPinned = filters.isPinned
  }

  return whereClause
}

/**
 * 활성 공지사항 단건 조회
 */
export async function findNotificationById(notificationId: string, includeRelations = false) {
  return prisma.notification.findFirst({
    where: {
      notificationId,
      deletedAt: null,
    },
    select: includeRelations ? notificationDetailSelect : notificationSelect,
  })
}

/**
 * 공지사항 생성
 */
export async function createNotification(data: ValidatedNotificationCreationData) {
  return prisma.notification.create({
    data: {
      clubId: data.clubId,
      authorId: data.authorId,
      title: data.title,
      content: data.content,
      isPinned: data.isPinned,
    },
    select: notificationSelect,
  })
}

/**
 * 공지사항 수정
 */
export async function updateNotification(
  notificationId: string,
  data: ValidatedNotificationUpdateData
) {
  return prisma.notification.update({
    where: {
      notificationId,
      deletedAt: null,
    },
    data,
    select: notificationSelect,
  })
}

/**
 * 공지사항 소프트 삭제
 */
export async function softDeleteNotification(notificationId: string) {
  return prisma.notification.update({
    where: {
      notificationId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}
