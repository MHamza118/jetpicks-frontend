import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../services';

export interface AcceptedOrderNotification {
  id: string;
  pickerName: string;
  orderId: string;
  isRead: boolean;
  timestamp: number;
}

export interface CounterOfferNotification {
  id: string;
  pickerName: string;
  orderId: string;
  offerId: string;
  isRead: boolean;
  timestamp: number;
}

export const useAcceptedOrderPolling = () => {
  const navigate = useNavigate();
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shownNotificationsRef = useRef<Set<string>>(new Set());
  const lastPolledRef = useRef<string | null>(null);
  const [notification, setNotification] = useState<AcceptedOrderNotification | null>(null);
  const [acceptedOrdersHistory, setAcceptedOrdersHistory] = useState<AcceptedOrderNotification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Fetch notifications from database on mount
    const fetchNotificationsFromDB = async () => {
      try {
        const response = await notificationsApi.getNotifications(1, 100);
        const notificationsData = response.data || [];
        
        const history: AcceptedOrderNotification[] = [];
        for (const notif of notificationsData) {
          if (notif.type === 'ORDER_ACCEPTED') {
            shownNotificationsRef.current.add(notif.entity_id);
            history.push({
              id: notif.id,
              pickerName: notif.data?.picker_name || notif.message || 'Unknown',
              orderId: notif.entity_id,
              isRead: notif.is_read,
              timestamp: new Date(notif.created_at).getTime(),
            });
          }
        }
        setAcceptedOrdersHistory(history);
      } catch (error) {
        console.error('Error fetching notifications from DB:', error);
      }
    };

    fetchNotificationsFromDB();

    //polling for new notifications
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await notificationsApi.getNotifications(1, 10);
        const notificationsData = (response as any).data || [];
        
        for (const notif of notificationsData) {
          if (notif.type === 'ORDER_ACCEPTED' && !shownNotificationsRef.current.has(notif.entity_id)) {
            shownNotificationsRef.current.add(notif.entity_id);
            lastPolledRef.current = notif.entity_id;
            
            const newNotification: AcceptedOrderNotification = {
              id: notif.id,
              pickerName: notif.data?.picker_name || notif.message || 'Unknown',
              orderId: notif.entity_id,
              isRead: false,
              timestamp: new Date(notif.created_at).getTime(),
            };
            
            setNotification(newNotification);
            setShowNotificationModal(true);
            
            // Add to history
            setAcceptedOrdersHistory(prev => [newNotification, ...prev]);
            
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
        console.error('Error polling for notifications:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  const handleNotificationClick = useCallback((orderId: string) => {
    setAcceptedOrdersHistory(prev =>
      prev.map(n => {
        if (n.orderId === orderId && !n.isRead) {
          // Mark as read in backend
          notificationsApi.markAsRead(n.id).catch(err => console.error('Failed to mark notification as read:', err));
        }
        return n.orderId === orderId ? { ...n, isRead: true } : n;
      })
    );
    setShowNotificationModal(false);
    navigate(`/orderer/order-accepted/${orderId}`);
  }, [navigate]);

  return {
    notification,
    acceptedOrdersHistory,
    showNotificationModal,
    setShowNotificationModal,
    handleNotificationClick,
  };
};

export const useCounterOfferPolling = () => {
  const navigate = useNavigate();
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shownOffersRef = useRef<Set<string>>(new Set());
  const lastPolledOffersRef = useRef<Set<string>>(new Set());
  const [counterOfferNotification, setCounterOfferNotification] = useState<CounterOfferNotification | null>(null);
  const [counterOffersHistory, setCounterOffersHistory] = useState<CounterOfferNotification[]>([]);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Fetch counter offer notifications from databaseon load/mount
    const fetchCounterOfferHistory = async () => {
      try {
        const response = await notificationsApi.getNotifications(1, 100);
        const notificationsData = response.data || [];
        
        const history: CounterOfferNotification[] = [];
        
        for (const notif of notificationsData) {
          if (notif.type === 'COUNTER_OFFER_RECEIVED') {
            shownOffersRef.current.add(notif.entity_id);
            lastPolledOffersRef.current.add(notif.entity_id);
            
            history.push({
              id: notif.id,
              pickerName: notif.data?.picker_name || notif.message || 'Unknown',
              orderId: notif.data?.order_id,
              offerId: notif.entity_id,
              isRead: notif.is_read,
              timestamp: new Date(notif.created_at).getTime(),
            });
          }
        }
        
        setCounterOffersHistory(history);
      } catch (error) {
        console.error('Error fetching counter offers history:', error);
      }
    };

    fetchCounterOfferHistory();

    // Start polling for new counter offers
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await notificationsApi.getNotifications(1, 10);
        const notificationsData = (response as any).data || [];
        
        let newOfferFound = false;
        let firstNewOffer: CounterOfferNotification | null = null;
        
        for (const notif of notificationsData) {
          if (notif.type === 'COUNTER_OFFER_RECEIVED' && !lastPolledOffersRef.current.has(notif.entity_id)) {
            lastPolledOffersRef.current.add(notif.entity_id);
            shownOffersRef.current.add(notif.entity_id);
            
            const newNotification: CounterOfferNotification = {
              id: notif.id,
              pickerName: notif.data?.picker_name || notif.message || 'Unknown',
              orderId: notif.data?.order_id,
              offerId: notif.entity_id,
              isRead: false,
              timestamp: new Date(notif.created_at).getTime(),
            };
            
            if (!newOfferFound) {
              firstNewOffer = newNotification;
              newOfferFound = true;
            }
            
            // Add to history
            setCounterOffersHistory(prev => [newNotification, ...prev]);
          }
        }
        
        // Show modal only if there's a new offer
        if (newOfferFound && firstNewOffer) {
          setCounterOfferNotification(firstNewOffer);
          setShowCounterOfferModal(true);
          
          // Auto-close after 5 seconds
          if (autoCloseTimerRef.current) {
            clearTimeout(autoCloseTimerRef.current);
          }
          autoCloseTimerRef.current = setTimeout(() => {
            setShowCounterOfferModal(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Error polling for counter offers:', error);
      }
    }, 3000); // Poll every 3 seconds for real-time feel

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  const handleCounterOfferClick = useCallback((orderId: string, offerId: string) => {
    setCounterOffersHistory(prev =>
      prev.map(n => {
        if (n.offerId === offerId && !n.isRead) {
          // Mark as read in backend
          notificationsApi.markAsRead(n.id).catch(err => console.error('Failed to mark notification as read:', err));
        }
        return n.offerId === offerId ? { ...n, isRead: true } : n;
      })
    );
    setShowCounterOfferModal(false);
    navigate(`/orderer/counter-offer-received/${orderId}/${offerId}`);
  }, [navigate]);

  return {
    counterOfferNotification,
    counterOffersHistory,
    showCounterOfferModal,
    setShowCounterOfferModal,
    handleCounterOfferClick,
  };
};
