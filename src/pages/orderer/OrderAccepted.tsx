import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi, chatApi } from '../../services';
import { API_CONFIG } from '../../config/api';
import { imageUtils } from '../../utils';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { profileApi } from '../../services';
import orderAcceptedImage from '../../assets/orderaccepted.png';

interface OrderItem {
  id: string;
  item_name: string;
  weight: string;
  price: number;
  quantity: number;
  special_notes?: string;
  store_link?: string;
  product_images?: string[];
}

interface OrderDetails {
  id: string;
  orderer_id: string;
  assigned_picker_id: string;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  special_notes?: string;
  reward_amount: number | string;
  status: string;
  items_count: number;
  items_cost: number;
  chat_room_id?: string;
  items: OrderItem[];
  orderer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  picker: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rating?: number;
  };
  created_at: string;
}

const OrderAccepted = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, orderRes] = await Promise.all([
          profileApi.getProfile(),
          ordersApi.getOrderDetails(orderId!)
        ]);

        // Set orderer avatar
        const profile = profileRes.data;
        if (profile?.avatar_url) {
          const avatarPath = profile.avatar_url;
          const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
          const fullUrl = avatarPath.startsWith('http')
            ? avatarPath
            : `${baseUrl}${avatarPath}`;
          setAvatarUrl(fullUrl);
          setAvatarError(false);
        }

        // Set order data
        const orderData = (orderRes as { data: OrderDetails }).data || orderRes;
        setOrder(orderData);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  const handleAvatarError = () => {
    setAvatarError(true);
    setAvatarUrl(null);
  };

  // Handle Start Chat - get or create chat room before navigating
  const handleStartChat = async () => {
    if (!order) return;

    setStartingChat(true);
    try {
      // apiClient.post() already returns response.data, so result IS the actual response
      const result = await chatApi.getOrCreateChatRoom(order.id, order.assigned_picker_id);
      
      if ((result as any)?.success && (result as any)?.chatRoomId) {
        // Navigate to chat with the guaranteed chatRoomId
        navigate(`/orderer/chat/${(result as any).chatRoomId}`);
      } else {
        console.error('Failed to get or create chat room:', (result as any)?.message || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error starting chat:', error);
    } finally {
      setStartingChat(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    return imageUtils.getImageUrl(imagePath, API_CONFIG.BASE_URL);
  };

  const calculateTotalCost = () => {
    return order?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  const calculateJetPicksFee = (total: number) => {
    return (total * 0.015).toFixed(2);
  };

  const calculateTotal = () => {
    const itemsCost = calculateTotalCost();
    const fee = parseFloat(calculateJetPicksFee(itemsCost));
    const reward = typeof order?.reward_amount === 'string' 
      ? parseFloat(order.reward_amount) 
      : (order?.reward_amount || 0);
    const total = itemsCost + fee + reward;
    return total.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white flex-col md:flex-row">
        <DashboardSidebar activeTab="dashboard" />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <DashboardHeader
            title="Order Accepted"
            avatarUrl={avatarUrl}
            avatarError={avatarError}
            onAvatarError={handleAvatarError}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFDF57]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen bg-white flex-col md:flex-row">
        <DashboardSidebar activeTab="dashboard" />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <DashboardHeader
            title="Order Accepted"
            avatarUrl={avatarUrl}
            avatarError={avatarError}
            onAvatarError={handleAvatarError}
          />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-lg">Order not found</p>
          </div>
        </div>
      </div>
    );
  }

  const itemsCost = calculateTotalCost();
  const jetPicksFee = calculateJetPicksFee(itemsCost);
  const totalAmount = calculateTotal();

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="dashboard" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader
          title="Order Accepted"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <img src={orderAcceptedImage} alt="Order Accepted" className="w-16 h-16" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Your Order Accepted</h1>
          </div>

          <div className="max-w-sm mx-auto">
            {/* Picker Information */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {order.picker?.avatar_url ? (
                    <img
                      src={getImageUrl(order.picker.avatar_url)}
                      alt={order.picker.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-bold text-lg">{order.picker?.full_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{order.picker?.full_name}</h2>
                  {order.picker?.rating && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900 text-sm">{order.picker.rating}</span>
                      <span className="text-orange-400 text-sm">★</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Route Information */}
              <div className="bg-[#FFF8D6] rounded-lg p-2 text-center">
                <p className="text-xs font-bold text-gray-900">
                  From {order.origin_city} - {order.destination_city}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })} - {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3 mb-6">
              <h3 className="text-gray-900 font-bold text-base mb-3">Fee Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Item Cost</span>
                  <span className="text-gray-900 font-semibold text-sm">${itemsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Reward</span>
                  <span className="text-gray-900 font-semibold text-sm">${typeof order.reward_amount === 'string' ? parseFloat(order.reward_amount).toFixed(2) : order.reward_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">JetPicks fee</span>
                  <span className="text-gray-900 font-semibold text-sm">(1.5%) ${jetPicksFee}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="text-gray-900 font-bold text-sm">Total</span>
                  <span className="text-gray-900 font-bold text-base">${totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleStartChat}
                disabled={startingChat}
                className="border-2 border-gray-300 text-gray-900 px-12 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {startingChat ? 'Starting Chat...' : 'Start Chat'}
              </button>
            </div>
          </div>
        </div>

        <MobileFooter activeTab="home" />
      </div>
    </div>
  );
};

export default OrderAccepted;
