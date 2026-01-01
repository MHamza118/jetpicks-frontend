import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../api/orders';

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
  const [notification, setNotification] = useState<AcceptedOrderNotification | null>(null);
  const [acceptedOrdersHistory, setAcceptedOrdersHistory] = useState<AcceptedOrderNotification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Fetch accepted orders history on mount
    const fetchHistory = async () => {
      try {
        const response = await ordersApi.getOrders('ACCEPTED', 1, 100);
        const acceptedOrders = (response as { data: Array<{ id: string }> }).data || [];
        
        const history: AcceptedOrderNotification[] = [];
        for (const order of acceptedOrders) {
          const orderDetails = await ordersApi.getOrderDetails(order.id);
          const orderData = (orderDetails as { data: { picker: { full_name: string } } }).data;
          
          history.push({
            id: `${order.id}-${Date.now()}`,
            pickerName: orderData.picker.full_name,
            orderId: order.id,
            isRead: true,
            timestamp: Date.now(),
          });
          shownNotificationsRef.current.add(order.id);
        }
        setAcceptedOrdersHistory(history);
      } catch (error) {
        console.error('Error fetching accepted orders history:', error);
      }
    };

    fetchHistory();

    // Start polling for new accepted orders
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await ordersApi.getOrders('ACCEPTED', 1, 1);
        const acceptedOrders = (response as { data: Array<{ id: string }> }).data || [];
        
        if (acceptedOrders.length > 0) {
          const latestOrder = acceptedOrders[0];
          
          // Only show modal if we haven't shown this order before
          if (!shownNotificationsRef.current.has(latestOrder.id)) {
            shownNotificationsRef.current.add(latestOrder.id);
            
            // Fetch full order details to get picker name
            const orderDetails = await ordersApi.getOrderDetails(latestOrder.id);
            const orderData = (orderDetails as { data: { picker: { full_name: string } } }).data;
            
            const newNotification: AcceptedOrderNotification = {
              id: `${latestOrder.id}-${Date.now()}`,
              pickerName: orderData.picker.full_name,
              orderId: latestOrder.id,
              isRead: false,
              timestamp: Date.now(),
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
        console.error('Error polling for accepted orders:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [navigate]);

  const handleNotificationClick = (orderId: string) => {
    setAcceptedOrdersHistory(prev =>
      prev.map(n => n.orderId === orderId ? { ...n, isRead: true } : n)
    );
    setShowNotificationModal(false);
    navigate(`/orderer/order-accepted/${orderId}`);
  };

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
  const [counterOfferNotification, setCounterOfferNotification] = useState<CounterOfferNotification | null>(null);
  const [counterOffersHistory, setCounterOffersHistory] = useState<CounterOfferNotification[]>([]);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Fetch all orders to check for pending counter offers
    const fetchCounterOfferHistory = async () => {
      try {
        const response = await ordersApi.getOrders(undefined, 1, 100);
        const orders = (response as { data: Array<{ id: string }> }).data || [];
        
        const history: CounterOfferNotification[] = [];
        let hasNewCounterOffer = false;
        let firstNewOffer: CounterOfferNotification | null = null;
        
        for (const order of orders) {
          try {
            const offersRes = await ordersApi.getOfferHistory(order.id, 1, 100);
            const offersData = (offersRes as any).data || offersRes;
            const offers = offersData.data || offersData;
            
            if (offers && Array.isArray(offers)) {
              for (const offer of offers) {
                if (offer.status === 'PENDING' && offer.offer_type === 'COUNTER') {
                  const isNew = !shownOffersRef.current.has(offer.id);
                  
                  const notification: CounterOfferNotification = {
                    id: `${offer.id}-${Date.now()}`,
                    pickerName: offer.offered_by?.full_name || 'Unknown',
                    orderId: order.id,
                    offerId: offer.id,
                    isRead: !isNew,
                    timestamp: Date.now(),
                  };
                  
                  history.push(notification);
                  shownOffersRef.current.add(offer.id);
                  
                  if (isNew) {
                    hasNewCounterOffer = true;
                    if (!firstNewOffer) {
                      firstNewOffer = notification;
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching offers for order ${order.id}:`, error);
          }
        }
        
        setCounterOffersHistory(history);
        
        // Show modal if there's a new counter offer
        if (hasNewCounterOffer && firstNewOffer) {
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
        console.error('Error fetching counter offers history:', error);
      }
    };

    fetchCounterOfferHistory();

    // Start polling for new counter offers
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await ordersApi.getOrders(undefined, 1, 100);
        const orders = (response as { data: Array<{ id: string }> }).data || [];
        
        for (const order of orders) {
          try {
            const offersRes = await ordersApi.getOfferHistory(order.id, 1, 100);
            const offersData = (offersRes as any).data || offersRes;
            const offers = offersData.data || offersData;
            
            if (offers && Array.isArray(offers)) {
              for (const offer of offers) {
                if (offer.status === 'PENDING' && offer.offer_type === 'COUNTER' && !shownOffersRef.current.has(offer.id)) {
                  shownOffersRef.current.add(offer.id);
                  
                  const newNotification: CounterOfferNotification = {
                    id: `${offer.id}-${Date.now()}`,
                    pickerName: offer.offered_by?.full_name || 'Unknown',
                    orderId: order.id,
                    offerId: offer.id,
                    isRead: false,
                    timestamp: Date.now(),
                  };
                  
                  setCounterOfferNotification(newNotification);
                  setShowCounterOfferModal(true);
                  
                  // Add to history
                  setCounterOffersHistory(prev => [newNotification, ...prev]);
                  
                  // Auto-close after 5 seconds
                  if (autoCloseTimerRef.current) {
                    clearTimeout(autoCloseTimerRef.current);
                  }
                  autoCloseTimerRef.current = setTimeout(() => {
                    setShowCounterOfferModal(false);
                  }, 5000);
                }
              }
            }
          } catch (error) {
            console.error(`Error polling offers for order ${order.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Error polling for counter offers:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [navigate]);

  const handleCounterOfferClick = (orderId: string, offerId: string) => {
    setCounterOffersHistory(prev =>
      prev.map(n => n.offerId === offerId ? { ...n, isRead: true } : n)
    );
    setShowCounterOfferModal(false);
    navigate(`/orderer/counter-offer-received/${orderId}/${offerId}`);
  };

  return {
    counterOfferNotification,
    counterOffersHistory,
    showCounterOfferModal,
    setShowCounterOfferModal,
    handleCounterOfferClick,
  };
};
