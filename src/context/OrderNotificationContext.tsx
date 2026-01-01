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
