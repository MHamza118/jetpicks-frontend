import { apiClient } from './apiClient';

interface Notification {
  id: string;
  type: string;
  entity_id: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  notification_shown_at?: string;
  created_at: string;
}

interface NotificationsResponse {
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  };
}

export const notificationsApi = {
  getNotifications: (page = 1, limit = 20): Promise<NotificationsResponse> =>
    apiClient.get(`/notifications?page=${page}&limit=${limit}`),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`, {}),

  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
};
