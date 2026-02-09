import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  newOrderNotification: NewOrderNotification | null;
  newOrdersHistory: NewOrderNotification[];
  showNewOrderModal: boolean;
  setShowNewOrderModal: (show: boolean) => void;
  handleNewOrderClick: (orderId: string, notificationId: string) => void;

  acceptedOrderNotification: AcceptedOrderNotification | null;
  acceptedOrdersHistory: AcceptedOrderNotification[];
  showAcceptedOrderModal: boolean;
  setShowAcceptedOrderModal: (show: boolean) => void;
  handleAcceptedOrderClick: (orderId: string) => void;

  counterOfferNotification: CounterOfferNotification | null;
  counterOffersHistory: CounterOfferNotification[];
  showCounterOfferModal: boolean;
  setShowCounterOfferModal: (show: boolean) => void;
  handleCounterOfferClick: (orderId: string, offerId: string) => void;
}

const GlobalNotificationContext = createContext<GlobalNotificationContextType | undefined>(undefined);

export const GlobalNotificationProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRole = location.pathname.startsWith('/picker') ? 'PICKER' : 'ORDERER';

  const [newOrderNotification, setNewOrderNotification] = useState<NewOrderNotification | null>(null);
  const [newOrdersHistory, setNewOrdersHistory] = useState<NewOrderNotification[]>([]);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  const [acceptedOrderNotification, setAcceptedOrderNotification] = useState<AcceptedOrderNotification | null>(null);
  const [acceptedOrdersHistory, setAcceptedOrdersHistory] = useState<AcceptedOrderNotification[]>([]);
  const [showAcceptedOrderModal, setShowAcceptedOrderModal] = useState(false);

  const [counterOfferNotification, setCounterOfferNotification] = useState<CounterOfferNotification | null>(null);
  const [counterOffersHistory, setCounterOffersHistory] = useState<CounterOfferNotification[]>([]);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shownNewOrdersRef = useRef<Set<string>>(new Set());
  const shownAcceptedOrdersRef = useRef<Set<string>>(new Set());
  const shownCounterOffersRef = useRef<Set<string>>(new Set());
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        if (currentRole === 'PICKER') {
          const newOrderNotifs = await fetchNewOrderNotifications(1, 100);
          setNewOrdersHistory(newOrderNotifs);

          for (const notif of newOrderNotifs) {
            if (!shownNewOrdersRef.current.has(notif.id)) {
              shownNewOrdersRef.current.add(notif.id);
              setNewOrderNotification(notif);
              setShowNewOrderModal(true);

              if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
              autoCloseTimerRef.current = setTimeout(() => {
                setShowNewOrderModal(false);
              }, 5000);
            }
          }
        }

        if (currentRole === 'ORDERER') {
          const response = await notificationsApi.getNotifications(1, 100);
          const notificationsData = (response as any).data || [];

          const acceptedOrderHistory: AcceptedOrderNotification[] = [];
          const counterOfferHistory: CounterOfferNotification[] = [];

          for (const notif of notificationsData) {
            if (notif.type === 'ORDER_ACCEPTED') {
              acceptedOrderHistory.push({
                id: notif.id,
                pickerName: notif.data?.picker_name || notif.message || 'Unknown',
                orderId: notif.entity_id,
                isRead: notif.is_read,
                timestamp: new Date(notif.created_at).getTime(),
              });

              if (!shownAcceptedOrdersRef.current.has(notif.entity_id)) {
                shownAcceptedOrdersRef.current.add(notif.entity_id);
                setAcceptedOrderNotification({
                  id: notif.id,
                  pickerName: notif.data?.picker_name || notif.message || 'Unknown',
                  orderId: notif.entity_id,
                  isRead: false,
                  timestamp: new Date(notif.created_at).getTime(),
                });
                setShowAcceptedOrderModal(true);

                if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
                autoCloseTimerRef.current = setTimeout(() => {
                  setShowAcceptedOrderModal(false);
                }, 5000);
              }
            } else if (notif.type === 'COUNTER_OFFER_RECEIVED') {
              counterOfferHistory.push({
                id: notif.id,
                pickerName: notif.data?.picker_name || notif.message || 'Unknown',
                orderId: notif.data?.order_id,
                offerId: notif.entity_id,
                isRead: notif.is_read,
                timestamp: new Date(notif.created_at).getTime(),
              });

              if (!shownCounterOffersRef.current.has(notif.entity_id)) {
                shownCounterOffersRef.current.add(notif.entity_id);
                setCounterOfferNotification({
                  id: notif.id,
                  pickerName: notif.data?.picker_name || notif.message || 'Unknown',
                  orderId: notif.data?.order_id,
                  offerId: notif.entity_id,
                  isRead: false,
                  timestamp: new Date(notif.created_at).getTime(),
                });
                setShowCounterOfferModal(true);

                if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
                autoCloseTimerRef.current = setTimeout(() => {
                  setShowCounterOfferModal(false);
                }, 5000);
              }
            }
          }

          setAcceptedOrdersHistory(acceptedOrderHistory);
          setCounterOffersHistory(counterOfferHistory);
        }
      } catch (error) {
        // Silently fail - don't log errors during polling
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, [currentRole]);

  const handleNewOrderClick = useCallback(async (orderId: string, notificationId: string) => {
    setNewOrdersHistory(prev =>
      prev.map(n => {
        if (n.id === notificationId && !n.isRead) {
          markNotificationAsRead(notificationId).catch(() => {
            // Silently fail
          });
        }
        return n.id === notificationId ? { ...n, isRead: true } : n;
      })
    );
    setShowNewOrderModal(false);
    
    try {
      const response = await (await import('../services/orders')).ordersApi.getOrderDetails(orderId);
      const orderData = (response as any).data || response;
      const orderStatus = orderData.status?.toUpperCase();
      
      if (orderStatus === 'ACCEPTED' || orderStatus === 'DELIVERED') {
        navigate(`/picker/orders/${orderId}/view`);
      } else {
        navigate(`/picker/orders/${orderId}`);
      }
    } catch (error) {
      navigate(`/picker/orders/${orderId}`);
    }
  }, [navigate]);

  const handleAcceptedOrderClick = useCallback((orderId: string) => {
    setAcceptedOrdersHistory(prev =>
      prev.map(n => {
        if (n.orderId === orderId && !n.isRead) {
          notificationsApi.markAsRead(n.id).catch(() => {
            // Silently fail
          });
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
          notificationsApi.markAsRead(n.id).catch(() => {
            // Silently fail
          });
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
