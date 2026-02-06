import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { pickerOrdersApi } from '../../services/picker/orders';
import { dashboardApi } from '../../services/dashboard';
import { chatApi } from '../../services/chat';
import { imageUtils } from '../../utils';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';

interface OrderItem {
  id: string;
  item_name: string;
  product_images?: string[];
}

interface Order {
  id: string;
  orderer_id: string;
  orderer: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rating: number;
  };
  origin_city: string;
  destination_city: string;
  status: 'pending' | 'delivered' | 'cancelled' | 'accepted';
  items_count: number;
  reward_amount: number | string;
  items: OrderItem[];
  created_at: string;
}

const PickerMyOrders = () => {
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled' | 'accepted'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Map filter to API status format
        const statusMap: Record<string, string | undefined> = {
          'all': undefined,
          'pending': 'PENDING',
          'accepted': 'ACCEPTED',
          'delivered': 'DELIVERED',
          'cancelled': 'CANCELLED',
        };
        
        const status = statusMap[activeFilter];
        const response = await pickerOrdersApi.getPickerOrders(status, 1, 100);
        
        // The apiClient returns response.data directly
        // So response is { data: [...], pagination: {...} }
        const ordersData = (response as any)?.data || [];
        
        if (!Array.isArray(ordersData)) {
          console.error('Invalid response format:', response);
          setError('Invalid response format from server');
          return;
        }
        
        // Fetch picker's travel journeys to filter matching orders
        const dashboardRes = await dashboardApi.getPickerDashboard(1, 100);
        const dashboardData = (dashboardRes as any).data;
        const travelJourneys = dashboardData?.travel_journeys || [];
        
        // Create a set of matching routes (origin_city -> destination_city)
        const matchingRoutes = new Set(
          travelJourneys.map((journey: any) => 
            `${journey.departure_city}|${journey.arrival_city}`
          )
        );
        
        // Filter orders to only show those matching picker's travel journeys
        const filteredOrdersData = ordersData.filter((order: any) => {
          const orderRoute = `${order.origin_city}|${order.destination_city}`;
          return matchingRoutes.has(orderRoute);
        });
        
        // Transform API response to match Order interface
        const transformedOrders: Order[] = filteredOrdersData.map((order: any) => ({
          ...order,
          status: order.status.toLowerCase() as 'pending' | 'delivered' | 'cancelled' | 'accepted',
        }));
        
        setOrders(transformedOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeFilter]);

  // Filter orders based on active filter
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    return matchesFilter;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'accepted':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getActionButtonText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'View Order Details';
      case 'pending':
        return 'View Order Details';
      case 'cancelled':
        return 'Accept again';
      default:
        return 'View Order Details';
    }
  };

  const handleActionClick = (order: Order) => {
    navigate(`/picker/orders/${order.id}/view`);
  };

  const handleStartChat = async (order: Order) => {
    try {
      const result = await chatApi.getOrCreateChatRoom(order.id, order.orderer_id);
      
      if ((result as any)?.success && (result as any)?.chatRoomId) {
        navigate(`/picker/chat/${(result as any).chatRoomId}`);
      } else {
        console.error('Failed to get or create chat room:', (result as any)?.message || 'Unknown error');
        alert('Failed to start chat. Please try again.');
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <PickerDashboardSidebar activeTab="orders" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PickerDashboardHeader
          title="My Orders"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          {/* Filter Tabs */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accepted Orders</h2>
            <div className="flex gap-3 flex-wrap">
              {['all', 'pending', 'accepted', 'delivered', 'cancelled'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                    activeFilter === filter
                      ? 'bg-[#4D0013] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4D0013]"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Orders Grid */}
          {!loading && filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Orderer Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {order.orderer.avatar_url ? (
                        <img
                          src={imageUtils.getImageUrl(order.orderer.avatar_url)}
                          alt={order.orderer.full_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!order.orderer.avatar_url || (order.orderer as any).avatarError ? (
                        <span className="text-sm font-semibold text-gray-600">{order.orderer.full_name.charAt(0).toUpperCase()}</span>
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{order.orderer.full_name}</p>
                      <p className="text-sm text-gray-600">{order.orderer.rating} ⭐</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                      {getStatusBadgeText(order.status)}
                    </span>
                  </div>

                  {/* Route Info */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {order.origin_city} → {order.destination_city}
                    </p>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-6 pb-6 border-b border-gray-200 h-16 flex items-center">
                    {order.items && order.items.length > 0 ? (
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex gap-2">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                            >
                              <img
                                src={imageUtils.getImageUrl(item.product_images?.[0])}
                                alt={item.item_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                          ))}
                          {order.items_count > 3 && (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-gray-700">+{order.items_count - 3}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <p className="text-xs text-gray-600">
                            Total Items <span className="font-semibold text-gray-900">{order.items_count}</span>
                          </p>
                          <p className="text-xs text-gray-600">
                            Reward: <span className="font-semibold text-gray-900">${typeof order.reward_amount === 'string' ? parseFloat(order.reward_amount).toFixed(2) : order.reward_amount.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No items</p>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleActionClick(order)}
                    className="w-full bg-[#4D0013] text-white py-2 rounded-lg font-bold text-sm hover:bg-[#660019] transition-colors"
                  >
                    {getActionButtonText(order.status)}
                  </button>
                  
                  {/* Start Chat Button - Only for Accepted Orders */}
                  {order.status === 'accepted' && (
                    <button
                      onClick={() => handleStartChat(order)}
                      className="w-full mt-2 bg-[#4D0013] text-white py-2 rounded-lg font-bold text-sm hover:bg-[#660019] transition-colors"
                    >
                      Start Chat
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          )}
        </div>

        <MobileFooter activeTab="home" />
      </div>
    </div>
  );
};

export default PickerMyOrders;
