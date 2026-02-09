import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../services';
import { fetchNewOrderNotifications, markNotificationAsRead, type NewOrderNotification } from '../services/pickerNotifications';

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

interface GlobalNotificationContextType {
  // Picker new order notifications
  newOrderNotification: NewOrderNotification | null;
  newOrdersHistory: NewOrderNotification[];
  showNewOrderModal: boolean;
  setShowNewOrderModal: (show: boolean) => void;
  handleNewOrderClick: (orderId: string, notificationId: string) => void;

  // Orderer accepted order notifications
  acceptedOrderNotification: AcceptedOrderNotification | null;
  acceptedOrdersHistory: AcceptedOrderNotification[];
  showAcceptedOrderModal: boolean;
  setShowAcceptedOrderModal: (show: boolean) => void;
  handleAcceptedOrderClick: (orderId: string) => void;

  // Orderer counter offer notifications
  counterOfferNotification: CounterOfferNotification | null;
  counterOffersHistory: CounterOfferNotification[];
  showCounterOfferModal: boolean;
  setShowCounterOfferModal: (show: boolean) => void;
  handleCounterOfferClick: (orderId: string, offerId: string) => void;
}

const GlobalNotificationContext = createContext<GlobalNotificationContextType | undefined>(undefined);

export const GlobalNotificationProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  // Picker new order notifications state
  const [newOrderNotification, setNewOrderNotification] = useState<NewOrderNotification | null>(null);
  const [newOrdersHistory, setNewOrdersHistory] = useState<NewOrderNotification[]>([]);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // Orderer accepted order notifications state
  const [acceptedOrderNotification, setAcceptedOrderNotification] = useState<AcceptedOrderNotification | null>(null);
  const [acceptedOrdersHistory, setAcceptedOrdersHistory] = useState<AcceptedOrderNotification[]>([]);
  const [showAcceptedOrderModal, setShowAcceptedOrderModal] = useState(false);

  // Orderer counter offer notifications state
  const [counterOfferNotification, setCounterOfferNotification] = useState<CounterOfferNotification | null>(null);
  const [counterOffersHistory, setCounterOffersHistory] = useState<CounterOfferNotification[]>([]);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);

  // Refs for polling and tracking
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shownNewOrdersRef = useRef<Set<string>>(new Set());
  const shownAcceptedOrdersRef = useRef<Set<string>>(new Set());
  const shownCounterOffersRef = useRef<Set<string>>(new Set());
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize polling on mount (only once)
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token || isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Fetch initial notifications from database
    const fetchInitialNotifications = async () => {
      try {
        // Fetch picker new order notifications
        const newOrderNotifs = await fetchNewOrderNotifications(1, 100);
        const newOrderHistory: NewOrderNotification[] = [];
        for (const notif of newOrderNotifs) {
          shownNewOrdersRef.current.add(notif.id);
          newOrderHistory.push(notif);
        }
        setNewOrdersHistory(newOrderHistory);

        // Fetch orderer notifications (accepted orders and counter offers)
        const response = await notificationsApi.getNotifications(1, 100);
        const notificationsData = response.data || [];

        const acceptedOrderHistory: AcceptedOrderNotification[] = [];
        const counterOfferHistory: CounterOfferNotification[] = [];

        for (const notif of notificationsData) {
          if (notif.type === 'ORDER_ACCEPTED') {
            shownAcceptedOrdersRef.current.add(notif.entity_id);
            acceptedOrderHistory.push({
              id: notif.id,
              pickerName: notif.data?.picker_name || notif.message || 'Unknown',
              orderId: notif.entity_id,
              isRead: notif.is_read,
              timestamp: new Date(notif.created_at).getTime(),
            });
          } else if (notif.type === 'COUNTER_OFFER_RECEIVED') {
            shownCounterOffersRef.current.add(notif.entity_id);
            counterOfferHistory.push({
              id: notif.id,
              pickerName: notif.data?.picker_name || notif.message || 'Unknown',
              orderId: notif.data?.order_id,
              offerId: notif.entity_id,
              isRead: notif.is_read,
              timestamp: new Date(notif.created_at).getTime(),
            });
          }
        }

        setAcceptedOrdersHistory(acceptedOrderHistory);
        setCounterOffersHistory(counterOfferHistory);
      } catch (error) {
        console.error('[GlobalNotifications] Error fetching initial notifications:', error);
      }
    };

    fetchInitialNotifications();

    // Start global polling interval
    pollIntervalRef.current = setInterval(async () => {
      try {
        // Poll for new picker orders
        const newOrderNotifs = await fetchNewOrderNotifications(1, 10);
        for (const notif of newOrderNotifs) {
          if (!shownNewOrdersRef.current.has(notif.id)) {
            shownNewOrdersRef.current.add(notif.id);
            setNewOrderNotification(notif);
            setShowNewOrderModal(true);
            setNewOrdersHistory(prev => [notif, ...prev]);

            if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
            autoCloseTimerRef.current = setTimeout(() => {
              setShowNewOrderModal(false);
            }, 5000);
          }
        }

        // Poll for orderer notifications
        const response = await notificationsApi.getNotifications(1, 10);
        const notificationsData = (response as any).data || [];

        for (const notif of notificationsData) {
          if (notif.type === 'ORDER_ACCEPTED' && !shownAcceptedOrdersRef.current.has(notif.entity_id)) {
            shownAcceptedOrdersRef.current.add(notif.entity_id);

            const newNotif: AcceptedOrderNotification = {
              id: notif.id,
              pickerName: notif.data?.picker_name || notif.message || 'Unknown',
              orderId: notif.entity_id,
              isRead: false,
              timestamp: new Date(notif.created_at).getTime(),
            };

            setAcceptedOrderNotification(newNotif);
            setShowAcceptedOrderModal(true);
            setAcceptedOrdersHistory(prev => [newNotif, ...prev]);

            if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
            autoCloseTimerRef.current = setTimeout(() => {
              setShowAcceptedOrderModal(false);
            }, 5000);
          } else if (notif.type === 'COUNTER_OFFER_RECEIVED' && !shownCounterOffersRef.current.has(notif.entity_id)) {
            shownCounterOffersRef.current.add(notif.entity_id);

            const newNotif: CounterOfferNotification = {
              id: notif.id,
              pickerName: notif.data?.picker_name || notif.message || 'Unknown',
              orderId: notif.data?.order_id,
              offerId: notif.entity_id,
              isRead: false,
              timestamp: new Date(notif.created_at).getTime(),
            };

            setCounterOfferNotification(newNotif);
            setShowCounterOfferModal(true);
            setCounterOffersHistory(prev => [newNotif, ...prev]);

            if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
            autoCloseTimerRef.current = setTimeout(() => {
              setShowCounterOfferModal(false);
            }, 5000);
          }
        }
      } catch (error) {
        console.error('[GlobalNotifications] Error polling for notifications:', error);
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  const handleNewOrderClick = useCallback((orderId: string, notificationId: string) => {
    setNewOrdersHistory(prev =>
      prev.map(n => {
        if (n.id === notificationId && !n.isRead) {
          markNotificationAsRead(notificationId).catch(err =>
            console.error('Failed to mark notification as read:', err)
          );
        }
        return n.id === notificationId ? { ...n, isRead: true } : n;
      })
    );
    setShowNewOrderModal(false);
    navigate(`/picker/orders/${orderId}`);
  }, [navigate]);

  const handleAcceptedOrderClick = useCallback((orderId: string) => {
    setAcceptedOrdersHistory(prev =>
      prev.map(n => {
        if (n.orderId === orderId && !n.isRead) {
          notificationsApi.markAsRead(n.id).catch(err =>
            console.error('Failed to mark notification as read:', err)
          );
        }
        return n.orderId === orderId ? { ...n, isRead: true } : n;
      })
    );
    setShowAcceptedOrderModal(false);
    navigate(`/orderer/order-accepted/${orderId}`);
  }, [navigate]);

  const handleCounterOfferClick = useCallback((orderId: string, offerId: string) => {
    setCounterOffersHistory(prev =>
      prev.map(n => {
        if (n.offerId === offerId && !n.isRead) {
          notificationsApi.markAsRead(n.id).catch(err =>
            console.error('Failed to mark notification as read:', err)
          );
        }
        return n.offerId === offerId ? { ...n, isRead: true } : n;
      })
    );
    setShowCounterOfferModal(false);
    navigate(`/orderer/counter-offer-received/${orderId}/${offerId}`);
  }, [navigate]);

  return (
    <GlobalNotificationContext.Provider
      value={{
        newOrderNotification,
        newOrdersHistory,
        showNewOrderModal,
        setShowNewOrderModal,
        handleNewOrderClick,
        acceptedOrderNotification,
        acceptedOrdersHistory,
        showAcceptedOrderModal,
        setShowAcceptedOrderModal,
        handleAcceptedOrderClick,
        counterOfferNotification,
        counterOffersHistory,
        showCounterOfferModal,
        setShowCounterOfferModal,
        handleCounterOfferClick,
      }}
    >
      {children}
    </GlobalNotificationContext.Provider>
  );
};

export const useGlobalNotifications = () => {
  const context = useContext(GlobalNotificationContext);
  if (!context) {
    throw new Error('useGlobalNotifications must be used within GlobalNotificationProvider');
  }
  return context;
};
