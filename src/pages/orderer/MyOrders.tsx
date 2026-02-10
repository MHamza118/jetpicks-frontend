import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';
import { ordererOrdersApi } from '../../services/orderer/orders';
import type { OrdererOrderDetails } from '../../services/orderer/orders';
import { chatApi } from '../../services/chat';
import { getSymbolForCurrency } from '../../services/currencies';

interface Order {
  id: string;
  picker_id?: string;
  origin_city: string;
  destination_city: string;
  status: 'pending' | 'delivered' | 'cancelled' | 'draft' | 'accepted';
  items_count: number;
  items_cost: number;
  reward_amount: number;
  accepted_counter_offer_amount?: number;
  currency?: string;
  created_at: string;
}

const OrdererMyOrders = () => {
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled' | 'accepted'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<OrdererOrderDetails | null>(null);
  const [cancelModalLoading, setCancelModalLoading] = useState(false);

  // Helper function to calculate total cost with fees
  const calculateTotalCost = (itemsCost: number, rewardAmount: number, counterOfferAmount?: number) => {
    const baseAmount = itemsCost + rewardAmount;
    const jetPickerFee = baseAmount * 0.065;
    const paymentProcessingFee = baseAmount * 0.04;
    
    // If counter offer is accepted, use that instead of reward amount
    if (counterOfferAmount !== undefined && counterOfferAmount > 0) {
      const counterOfferTotal = itemsCost + counterOfferAmount;
      const counterOfferJetPickerFee = counterOfferTotal * 0.065;
      const counterOfferPaymentFee = counterOfferTotal * 0.04;
      return counterOfferTotal + counterOfferJetPickerFee + counterOfferPaymentFee;
    }
    
    return baseAmount + jetPickerFee + paymentProcessingFee;
  };

  // Helper function to format price with currency
  const formatPrice = (price: number, currency?: string) => {
    const symbol = getSymbolForCurrency(currency || 'USD');
    return `${symbol}${price.toFixed(2)}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const status = activeFilter === 'all' ? undefined : activeFilter.toUpperCase();
        const response = await ordererOrdersApi.getOrders(status);
        const data = (response as any).data || response;
        
        const formattedOrders = data
          .filter((order: any) => order.status.toUpperCase() !== 'DRAFT') // Filter out DRAFT orders
          .map((order: any) => ({
            id: order.id,
            picker_id: order.picker_id,
            origin_city: order.origin_city,
            destination_city: order.destination_city,
            status: order.status.toLowerCase() as 'pending' | 'delivered' | 'cancelled' | 'draft' | 'accepted',
            items_count: order.items_count,
            items_cost: order.items_cost,
            reward_amount: order.reward_amount,
            accepted_counter_offer_amount: order.accepted_counter_offer_amount,
            currency: order.currency,
            created_at: order.created_at,
          }));
        
        setOrders(formattedOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders');
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

  const handleStartChat = async (order: Order) => {
    try {
      if (!order.picker_id) {
        alert('Picker information not available');
        return;
      }
      const result = await chatApi.getOrCreateChatRoom(order.id, order.picker_id);
      
      if ((result as any)?.success && (result as any)?.chatRoomId) {
        navigate(`/orderer/chat/${(result as any).chatRoomId}`);
      } else {
        console.error('Failed to get or create chat room:', (result as any)?.message || 'Unknown error');
        alert('Failed to start chat. Please try again.');
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancelModalLoading(true);
      const response = await ordererOrdersApi.getOrderDetails(orderId);
      const orderDetails = (response as any).data || response;
      setSelectedOrderForCancel(orderDetails);
      setShowCancelModal(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      alert('Failed to load order details. Please try again.');
    } finally {
      setCancelModalLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderForCancel) return;

    try {
      setCancelModalLoading(true);
      await ordererOrdersApi.cancelOrder(selectedOrderForCancel.id);
      
      // Fetch all orders (not filtered by current activeFilter) to get the updated status
      const response = await ordererOrdersApi.getOrders(undefined);
      const data = (response as any).data || response;
      
      const formattedOrders = data
        .filter((order: any) => order.status.toUpperCase() !== 'DRAFT')
        .map((order: any) => ({
          id: order.id,
          picker_id: order.picker_id,
          origin_city: order.origin_city,
          destination_city: order.destination_city,
          status: order.status.toLowerCase() as 'pending' | 'delivered' | 'cancelled' | 'draft' | 'accepted',
          items_count: order.items_count,
          items_cost: order.items_cost,
          reward_amount: order.reward_amount,
          accepted_counter_offer_amount: order.accepted_counter_offer_amount,
          created_at: order.created_at,
        }));
      
      setOrders(formattedOrders);
      setShowCancelModal(false);
      setSelectedOrderForCancel(null);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancelModalLoading(false);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderForCancel(null);
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="orders" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader
          title="My Orders"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          {/* Order History Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order History</h2>
            <div className="flex gap-3 flex-wrap">
              {['all', 'pending', 'accepted', 'delivered', 'cancelled'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                    activeFilter === filter
                      ? 'bg-[#FFDF57] text-gray-900'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFDF57]"></div>
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
                  {/* Route, Date and Status Badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {order.origin_city} - {order.destination_city}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                      {getStatusBadgeText(order.status)}
                    </span>
                  </div>

                  {/* Items and Cost */}
                  <div className="mb-6 pb-6 border-b border-gray-200 flex items-center justify-between gap-4">
                    <div className="border-2 border-[#FFDF57] rounded-lg px-4 py-2">
                      <p className="text-sm font-semibold text-gray-900">{order.items_count} Items</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Total Cost: <span className="font-semibold text-gray-900">
                        {formatPrice(
                          calculateTotalCost(
                            order.items_cost ? parseFloat(order.items_cost.toString()) : 0,
                            order.reward_amount ? parseFloat(order.reward_amount.toString()) : 0,
                            order.accepted_counter_offer_amount ? parseFloat(order.accepted_counter_offer_amount.toString()) : undefined
                          ),
                          order.currency
                        )}
                      </span>
                    </p>
                  </div>

                  {/* View Order Details Button */}
                  <button
                    onClick={() => navigate(`/orderer/orders/${order.id}`)}
                    className="w-full bg-[#FFDF57] text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors"
                  >
                    View Order Details
                  </button>

                  {/* Start Chat Button - Only for Accepted Orders */}
                  {order.status === 'accepted' && (
                    <button
                      onClick={() => handleStartChat(order)}
                      className="w-full mt-2 bg-[#FFDF57] text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors"
                    >
                      Start Chat
                    </button>
                  )}

                  {/* Cancel Order Button - Only for Pending Orders */}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="w-full mt-2 bg-[#FFDF57] text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors"
                    >
                      Cancel Order
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

        {/* Cancel Order Modal */}
        {showCancelModal && selectedOrderForCancel && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={handleCloseCancelModal}
          >
            <div 
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Question Mark Icon */}
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-xl font-bold text-gray-900">Traveler reward</h3>
                <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                  <span className="text-gray-400 font-bold text-sm">?</span>
                </div>
              </div>

              {/* Order Summary Section */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Item Cost:</span>
                  <span className="font-semibold text-gray-900">{formatPrice(selectedOrderForCancel.items_cost ? parseFloat(selectedOrderForCancel.items_cost.toString()) : 0, selectedOrderForCancel.currency)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reward:</span>
                  <span className="font-semibold text-gray-900">{formatPrice(selectedOrderForCancel.reward_amount ? parseFloat(selectedOrderForCancel.reward_amount.toString()) : 0, selectedOrderForCancel.currency)}</span>
                </div>

                {selectedOrderForCancel.accepted_counter_offer_amount && parseFloat(selectedOrderForCancel.accepted_counter_offer_amount.toString()) > 0 && (
                  <div className="flex justify-between items-center bg-yellow-100 p-2 rounded">
                    <span className="text-gray-600 font-semibold">Counter Offer Amount:</span>
                    <span className="font-bold text-gray-900">{formatPrice(parseFloat(selectedOrderForCancel.accepted_counter_offer_amount.toString()), selectedOrderForCancel.currency)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">JetPicker Fee (6.5%):</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice((((selectedOrderForCancel.items_cost ? parseFloat(selectedOrderForCancel.items_cost.toString()) : 0) + (selectedOrderForCancel.reward_amount ? parseFloat(selectedOrderForCancel.reward_amount.toString()) : 0)) * 0.065), selectedOrderForCancel.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Processing (4%):</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice((((selectedOrderForCancel.items_cost ? parseFloat(selectedOrderForCancel.items_cost.toString()) : 0) + (selectedOrderForCancel.reward_amount ? parseFloat(selectedOrderForCancel.reward_amount.toString()) : 0)) * 0.04), selectedOrderForCancel.currency)}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Total:</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatPrice(
                      calculateTotalCost(
                        selectedOrderForCancel.items_cost ? parseFloat(selectedOrderForCancel.items_cost.toString()) : 0,
                        selectedOrderForCancel.reward_amount ? parseFloat(selectedOrderForCancel.reward_amount.toString()) : 0,
                        selectedOrderForCancel.accepted_counter_offer_amount ? parseFloat(selectedOrderForCancel.accepted_counter_offer_amount.toString()) : undefined
                      ),
                      selectedOrderForCancel.currency
                    )}
                  </span>
                </div>
              </div>

              {/* Confirmation Message */}
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to cancel this order?
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseCancelModal}
                  disabled={cancelModalLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={cancelModalLoading}
                  className="flex-1 px-4 py-2 bg-[#FFDF57] rounded-lg font-semibold text-gray-900 hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  {cancelModalLoading ? 'Cancelling Order...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        <MobileFooter activeTab="home" />
      </div>
    </div>
  );
};

export default OrdererMyOrders;
