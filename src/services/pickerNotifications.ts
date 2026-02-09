import { notificationsApi } from './notifications';

export interface NewOrderNotification {
  id: string;
  orderId: string;
  ordererName: string;
  originCity: string;
  destinationCity: string;
  rewardAmount: number;
  isRead: boolean;
  isShown: boolean;
  timestamp: number;
}

/**
 * Fetch new order notifications for picker - fetches all pages to get all NEW_ORDER_AVAILABLE notifications
 */
export const fetchNewOrderNotifications = async (page = 1, limit = 100): Promise<NewOrderNotification[]> => {
  try {
    const allNotifications: NewOrderNotification[] = [];
    let currentPage = 1;
    let hasMore = true;

    // Fetch all pages to get all NEW_ORDER_AVAILABLE notifications
    while (hasMore) {
      const response = await notificationsApi.getNotifications(currentPage, limit);
      const paginationData = (response as any).pagination || {};
      const notificationsData = (response as any).data || [];

      if (!notificationsData || notificationsData.length === 0) {
        break;
      }

      // Filter and map NEW_ORDER_AVAILABLE notifications
      const filtered = notificationsData
        .filter((notif: any) => notif.type === 'NEW_ORDER_AVAILABLE')
        .map((notif: any) => {
          return {
            id: notif.id,
            orderId: notif.entity_id,
            ordererName: notif.data?.orderer_name || 'Unknown',
            originCity: notif.data?.origin_city || '',
            destinationCity: notif.data?.destination_city || '',
            rewardAmount: parseFloat(notif.data?.reward_amount) || 0,
            isRead: notif.is_read,
            isShown: notif.notification_shown_at !== null,
            timestamp: new Date(notif.created_at).getTime(),
          };
        });

      allNotifications.push(...filtered);

      // Check if there are more pages
      hasMore = paginationData.has_more === true;
      currentPage++;
    }

    return allNotifications;
  } catch (error) {
    return [];
  }
};

/**
 * Mark notification as shown
 */
export const markNotificationAsShown = async (notificationId: string): Promise<void> => {
  try {
    // This would need a backend endpoint to mark as shown
    // For now, we'll just track it locally
  } catch (error) {
    // Silently fail
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await notificationsApi.markAsRead(notificationId);
  } catch (error) {
    // Silently fail
  }
};
