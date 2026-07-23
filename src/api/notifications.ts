// 알림 관리 API. attendance-project-context.md §9 "FCM 알림 API" 기준.
// NotificationResponse는 엔티티 필드(§8)와 거의 1:1로 대응돼서 별도 매핑 없이 그대로 씀
import axiosClient from './axiosClient'
import type { ApiResponse } from '../types/common'
import type { NotificationItem, NotificationRequest, NotificationStatus } from '../types/notification'

// ADMIN은 status로 필터링 가능 (STUDENT는 서버가 요청 status를 무시하고 본인 대상 SENT만 반환, §9)
export const listNotifications = async (status?: NotificationStatus): Promise<NotificationItem[]> => {
  const { data } = await axiosClient.get<ApiResponse<NotificationItem[]>>('/notifications', {
    params: status ? { status } : undefined,
  })
  return data.data
}

export const createNotification = async (req: NotificationRequest): Promise<NotificationItem> => {
  const { data } = await axiosClient.post<ApiResponse<NotificationItem>>('/notifications', req)
  return data.data
}

// SCHEDULED 상태만 취소 가능 (그 외엔 서버가 400/NT002로 거절, §9)
export const cancelNotification = async (id: number): Promise<void> => {
  await axiosClient.delete(`/notifications/${id}`)
}
