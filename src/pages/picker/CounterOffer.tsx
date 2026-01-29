import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/orders';
import { apiClient } from '../../services/apiClient';
import { imageUtils } from '../../utils';
import DashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { profileApi } from '../../services';

interface OrderDetails {
  id: string;
  orderer_id: string;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  special_notes?: string;
  reward_amount: number | string;
  status: string;
  items_count: number;
  items_cost: number;
  items: any[];
  orderer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  created_at: string;
}

const PickerCounterOffer = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [counterOfferAmount, setCounterOfferAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, orderRes] = await Promise.all([
          profileApi.getProfile(),
          ordersApi.getOrderDetails(orderId!)
        ]);

        // Set picker avatar
        const profile = profileRes.data;
        if (profile?.avatar_url) {
          const fullUrl = imageUtils.getImageUrl(profile.avatar_url);
          setAvatarUrl(fullUrl);
          setAvatarError(false);
        }

        // Set order data
        const orderData = (orderRes as any).data || orderRes;
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

  const handleSendCounterOffer = async () => {
    if (!counterOfferAmount || parseFloat(counterOfferAmount) <= 0) {
      alert('Please enter a valid counter offer amount');
      return;
    }

    setSubmitting(true);
    try {
      // Get the latest offer for this order to use as parent_offer_id
      const offersRes = await ordersApi.getOfferHistory(orderId!, 1, 1);
      const offersData = (offersRes as any).data || offersRes;
      const offers = offersData.data || offersData;
      const parentOfferId = offers && offers.length > 0 ? offers[0].id : null;

      // Send counter offer using apiClient
      await apiClient.post('/offers', {
        order_id: orderId,
        offer_amount: parseFloat(counterOfferAmount),
        parent_offer_id: parentOfferId,
      });

      alert('Counter offer sent successfully!');
      navigate(`/picker/orders/${orderId}`);
    } catch (error) {
      console.error('Failed to send counter offer:', error);
      alert('Failed to send counter offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white flex-col md:flex-row">
        <DashboardSidebar activeTab="dashboard" />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <PickerDashboardHeader
            title="Counter Offer"
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
            title="Counter Offer"
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

  const rewardAmount = typeof order.reward_amount === 'string'
    ? parseFloat(order.reward_amount)
    : order.reward_amount;

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="dashboard" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PickerDashboardHeader
          title="Counter Offer"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          {/* Route Header */}
          <div className="text-center mb-8">
            <p className="text-gray-900 font-semibold text-lg md:text-xl">
              From {order.origin_city} - {order.destination_city}{' '}
              <span className="text-gray-500 text-sm md:text-base">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            {/* Counter Offer Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-8">
              <div className="text-center mb-8">
                <p className="text-[#4D0013] font-semibold text-lg mb-2">
                  {order.orderer.full_name} is offering ${rewardAmount.toFixed(2)} as reward
                </p>
                <p className="text-[#4D0013] font-semibold text-lg">
                  set your own counter offer
                </p>
              </div>

              {/* Counter Offer Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold text-sm mb-2">
                  My counter offer
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    value={counterOfferAmount}
                    onChange={(e) => setCounterOfferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border-b-2 border-gray-300 focus:border-[#4D0013] outline-none text-gray-900 font-semibold text-lg"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Info Text */}
              <p className="text-gray-600 text-sm text-center mb-6">
                Enter an amount you'd like to negotiate for this delivery
              </p>
            </div>

            {/* Action Button - Centered and Medium */}
            <div className="flex justify-center">
              <button
                onClick={handleSendCounterOffer}
                disabled={submitting}
                className="px-20 py-3 bg-[#4D0013] text-white rounded-lg font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        <MobileFooter activeTab="home" />
      </div>
    </div>
  );
};

export default PickerCounterOffer;
