import { apiClient } from './client';

export const notificationsApi = {
  getNotifications: (page = 1, limit = 20) =>
    apiClient.get(`/notifications?page=${page}&limit=${limit}`),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`, {}),

  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
};
