import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNewOrderNotifications, markNotificationAsRead, type NewOrderNotification } from '../services/pickerNotifications';

export const usePickerNewOrderNotifications = () => {
  const navigate = useNavigate();
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shownNotificationsRef = useRef<Set<string>>(new Set());
  const [notification, setNotification] = useState<NewOrderNotification | null>(null);
  const [ordersHistory, setOrdersHistory] = useState<NewOrderNotification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token || isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Fetch notifications from database on mount (just to populate history, don't show modal)
    const fetchNotificationsFromDB = async () => {
      try {
        const notifications = await fetchNewOrderNotifications(100);
        
        const history: NewOrderNotification[] = [];
        for (const notif of notifications) {
          // Mark all initial notifications as already shown
          shownNotificationsRef.current.add(notif.id);
          history.push(notif);
        }
        setOrdersHistory(history);
      } catch (error) {
        console.error('[PickerNotifications] Error fetching notifications from DB:', error);
      }
    };

    fetchNotificationsFromDB();

    // Polling for new notifications
    pollIntervalRef.current = setInterval(async () => {
      try {
        const notifications = await fetchNewOrderNotifications(10);
        
        for (const notif of notifications) {
          // Only show modal for notifications that haven't been shown yet
          if (!shownNotificationsRef.current.has(notif.id)) {
            console.log('[PickerNotifications] NEW notification detected:', notif);
            shownNotificationsRef.current.add(notif.id);
            
            setNotification(notif);
            setShowNotificationModal(true);
            
            // Add to history
            setOrdersHistory(prev => [notif, ...prev]);
            
            // Auto-close after 5 seconds
            if (autoCloseTimerRef.current) {
              clearTimeout(autoCloseTimerRef.current);
            }
            autoCloseTimerRef.current = setTimeout(() => {
              setShowNotificationModal(false);
            }, 5000);
          }
        }
      } catch (error) {
        console.error('[PickerNotifications] Error polling for notifications:', error);
      }
    }, 3000); //3 seconds polling

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  const handleNotificationClick = useCallback((orderId: string, notificationId: string) => {
    setOrdersHistory(prev =>
      prev.map(n => {
        if (n.id === notificationId && !n.isRead) {
          // Mark as read in backend
          markNotificationAsRead(notificationId).catch(err => 
            console.error('Failed to mark notification as read:', err)
          );
        }
        return n.id === notificationId ? { ...n, isRead: true } : n;
      })
    );
    setShowNotificationModal(false);
    navigate(`/picker/orders/${orderId}`);
  }, [navigate]);

  return {
    notification,
    ordersHistory,
    showNotificationModal,
    setShowNotificationModal,
    handleNotificationClick,
  };
};
