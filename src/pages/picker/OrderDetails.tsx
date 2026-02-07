import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/orders';
import { imageUtils } from '../../utils';
import DashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';
import { useDashboardCache } from '../../context/DashboardCacheContext';
import { ChevronRight } from 'lucide-react';

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
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  special_notes?: string;
  reward_amount: number | string;
  accepted_counter_offer_amount?: number | string;
  waiting_days?: number;
  status: string;
  items_count: number;
  items_cost: number;
  items: OrderItem[];
  orderer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  created_at: string;
}

const PickerOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const { clearPickerCache } = useDashboardCache();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToCustomLaws, setAgreedToCustomLaws] = useState(false);
  const [hasCounterOffer, setHasCounterOffer] = useState(false);
  const [currentImageIndices, setCurrentImageIndices] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await ordersApi.getOrderDetails(orderId!);
        const orderData = (orderRes as any).data || orderRes;
        setOrder(orderData);

        // Check if counter offer exists for THIS specific order
        const offersRes = await ordersApi.getOfferHistory(orderId!, 1, 100);
        const offersData = (offersRes as any).data || offersRes;
        const offers = offersData.data || offersData;
        
        // Check if any counter offer exists for THIS order (PENDING or ACCEPTED)
        const counterOfferExists = offers.some((offer: any) => offer.offer_type === 'COUNTER' && (offer.status === 'PENDING' || offer.status === 'ACCEPTED'));
        setHasCounterOffer(counterOfferExists);
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

  const handleAcceptDelivery = async () => {
    try {
      await ordersApi.acceptDelivery(orderId!);
      // Clear picker cache to force fresh dashboard data
      clearPickerCache();
      // Navigate to dashboard to show real-time update
      navigate('/picker/dashboard');
    } catch (error) {
      console.error('Failed to accept delivery:', error);
      alert('Failed to accept delivery. Please try again.');
    }
  };

  const getImageUrl = (imagePath: string) => {
    return imageUtils.getImageUrl(imagePath);
  };

  const calculateTotalCost = () => {
    return order?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  const calculateJetPicksFee = (itemsCost: number, initialReward: number, counterOffer: number) => {
    const subtotal = itemsCost + initialReward + counterOffer;
    return (subtotal * 0.015).toFixed(2);
  };

  const calculateTotal = () => {
    const itemsCost = calculateTotalCost();
    const initialReward = typeof order?.reward_amount === 'string'
      ? parseFloat(order.reward_amount)
      : (order?.reward_amount || 0);
    const counterOffer = typeof order?.accepted_counter_offer_amount === 'string'
      ? parseFloat(order.accepted_counter_offer_amount)
      : (order?.accepted_counter_offer_amount || 0);
    const fee = parseFloat(calculateJetPicksFee(itemsCost, initialReward, counterOffer));
    const total = itemsCost + initialReward + counterOffer + fee;
    return total.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white flex-col md:flex-row">
        <DashboardSidebar activeTab="dashboard" />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <PickerDashboardHeader
            title="Order Details"
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
          <PickerDashboardHeader
            title="Order Details"
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
  const initialReward = typeof order.reward_amount === 'string'
    ? parseFloat(order.reward_amount)
    : order.reward_amount;
  const counterOffer = typeof order.accepted_counter_offer_amount === 'string'
    ? parseFloat(order.accepted_counter_offer_amount)
    : (order.accepted_counter_offer_amount || 0);
  const jetPicksFee = calculateJetPicksFee(itemsCost, initialReward, counterOffer);
  const totalAmount = calculateTotal();

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="dashboard" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PickerDashboardHeader
          title="Order Details"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          {/* Route Header */}
          <div className="text-center mb-8">
            <p className="text-gray-900 font-semibold text-lg md:text-xl">
              From {order.origin_city}, {order.origin_country} to {order.destination_city}, {order.destination_country}{' '}
              <span className="text-gray-500 text-sm md:text-base">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Items Section */}
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start flex-shrink-0">
                      {/* Item Image Carousel */}
                      <div className="relative w-40 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.product_images && item.product_images.length > 0 ? (
                          <>
                            <img
                              src={getImageUrl(item.product_images[currentImageIndices[item.id] || 0])}
                              alt={item.item_name}
                              className="w-full h-full object-cover"
                            />
                            {/* Forward Arrow Only */}
                            {item.product_images.length > 1 && (
                              <button
                                onClick={() => {
                                  const currentIndex = currentImageIndices[item.id] || 0;
                                  const newIndex = currentIndex === item.product_images!.length - 1 ? 0 : currentIndex + 1;
                                  setCurrentImageIndices(prev => ({ ...prev, [item.id]: newIndex }));
                                }}
                                className="absolute bottom-2 right-2 bg-[#4D0013] hover:bg-[#660019] text-white p-2 rounded-full transition-all shadow-lg z-10"
                              >
                                <ChevronRight size={20} />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">No image</span>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex flex-col justify-center">
                        {/* Item Name */}
                        <h4 className="text-gray-900 text-sm">
                          {item.item_name}
                        </h4>

                        {/* Store Link */}
                        {item.store_link && (
                          <a
                            href={item.store_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4D0013] text-sm underline mb-4 font-semibold"
                          >
                            Store link
                          </a>
                        )}

                        {/* Price */}
                        <p className="text-gray-900 text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-gray-900 font-bold text-lg mb-4">Fee Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Item Cost</span>
                    <span className="text-gray-900 font-semibold">${itemsCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Initial Reward</span>
                    <span className="text-gray-900 font-semibold">${initialReward.toFixed(2)}</span>
                  </div>
                  {counterOffer > 0 && (
                    <div className="flex justify-between items-center bg-yellow-50 p-2 rounded">
                      <span className="text-gray-600 font-semibold">Counter Offer</span>
                      <span className="text-gray-900 font-bold">${counterOffer.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">JetPicks fee</span>
                    <span className="text-gray-900 font-semibold">(1.5%) ${jetPicksFee}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="text-gray-900 font-bold">Total</span>
                    <span className="text-gray-900 font-bold text-lg">${totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-gray-900 font-bold text-lg mb-4">Estimated delivery date</h3>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-900 font-bold text-2xl">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-600 text-sm">Based on arrival date</p>
                </div>
                {order.waiting_days && (
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <p className="text-gray-600 font-medium">Waiting Days</p>
                    <p className="text-gray-900 font-semibold">{order.waiting_days} days</p>
                  </div>
                )}
              </div>
            </div>

            {/* Special Notes */}
            {order.special_notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <h3 className="text-gray-900 font-bold text-base mb-2">Special Instructions</h3>
                <p className="text-gray-700 text-sm">{order.special_notes}</p>
              </div>
            )}

            {/* Agreements */}
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 rounded accent-red-900"
                />
                <span className="text-gray-700 text-sm">I agree to terms and conditions</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToCustomLaws}
                  onChange={(e) => setAgreedToCustomLaws(e.target.checked)}
                  className="w-5 h-5 rounded accent-red-900"
                />
                <span className="text-gray-700 text-sm">I agree to the custom laws</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleAcceptDelivery}
                disabled={!agreedToTerms || !agreedToCustomLaws}
                className={`flex-1 py-3 rounded-lg font-bold text-base transition-colors ${
                  agreedToTerms && agreedToCustomLaws
                    ? 'bg-[#4D0013] text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Accept Delivery
              </button>
              <button
                onClick={() => navigate(`/picker/orders/${orderId}/counter-offer`)}
                disabled={!agreedToTerms || !agreedToCustomLaws || hasCounterOffer}
                title={hasCounterOffer ? 'You have already sent a counter offer for this order' : ''}
                className={`flex-1 py-3 rounded-lg font-bold text-base transition-colors ${
                  agreedToTerms && agreedToCustomLaws && !hasCounterOffer
                    ? 'border-2 border-gray-300 text-gray-900 hover:bg-gray-50 cursor-pointer'
                    : 'border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {hasCounterOffer ? 'Counter Offer Sent' : 'Send Counter Offer'}
              </button>
            </div>
          </div>
        </div>

        <MobileFooter activeTab="home" />
      </div>
    </div>
  );
};

export default PickerOrderDetails;
