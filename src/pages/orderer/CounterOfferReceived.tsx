import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi, profileApi } from '../../services';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';

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

interface OfferData {
  id: string;
  offer_amount: number | string;
}

const CounterOfferReceived = () => {
  const { orderId } = useParams<{ orderId: string; offerId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickerAvatarError, setPickerAvatarError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, orderRes, offersRes] = await Promise.all([
          profileApi.getProfile(),
          ordersApi.getOrderDetails(orderId!),
          ordersApi.getOfferHistory(orderId!, 1, 100)
        ]);

        // Set orderer avatar
        const profile = profileRes.data;
        if (profile?.avatar_url) {
          const avatarPath = profile.avatar_url;
          const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.jetpicks.com/api').replace('/api', '');
          const fullUrl = avatarPath.startsWith('http')
            ? avatarPath
            : `${baseUrl}${avatarPath}`;
          setAvatarUrl(fullUrl);
          setAvatarError(false);
        }

        // Set order data
        const orderData = (orderRes as { data: OrderDetails }).data || orderRes;
        setOrder(orderData);

        // Get the latest offer
        const offersResponse = offersRes as { data: Array<{ id: string; offer_type: string; status: string; offer_amount: number | string }> } | Array<{ id: string; offer_type: string; status: string; offer_amount: number | string }>;
        const offers = Array.isArray(offersResponse) ? offersResponse : offersResponse.data;
        if (offers && Array.isArray(offers)) {
          // Find the COUNTER offer (not INITIAL)
          const counterOffer = offers.find((o: { offer_type: string; status: string }) => o.offer_type === 'COUNTER' && o.status === 'PENDING');
          if (counterOffer) {
            setOffer({
              id: counterOffer.id,
              offer_amount: counterOffer.offer_amount,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.jetpicks.com/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const calculateTotalCost = () => {
    return order?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  const calculateJetPicksFee = (total: number) => {
    return (total * 0.015).toFixed(2);
  };

  const calculateTotal = () => {
    if (!offer) return '0.00';
    const itemsCost = calculateTotalCost();
    const fee = parseFloat(calculateJetPicksFee(itemsCost));
    const counterOfferAmt = typeof offer.offer_amount === 'string' 
      ? parseFloat(offer.offer_amount) 
      : offer.offer_amount;
    const total = itemsCost + fee + counterOfferAmt;
    return total.toFixed(2);
  };

  const handleAcceptOffer = async () => {
    if (!offer?.id) return;
    
    setIsProcessing(true);
    try {
      await ordersApi.acceptOffer(offer.id);
      // Navigate back to previous page
      navigate(-1);
    } catch (error) {
      console.error('Failed to accept offer:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineOffer = async () => {
    if (!offer?.id) return;
    
    setIsProcessing(true);
    try {
      await ordersApi.rejectOffer(offer.id);
      // Navigate back to previous page
      navigate(-1);
    } catch (error) {
      console.error('Failed to decline offer:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white flex-col md:flex-row">
        <DashboardSidebar activeTab="dashboard" />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <DashboardHeader
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

  if (!order || !offer) {
    return (
      <div className="flex h-screen bg-white flex-col md:flex-row">
        <DashboardSidebar activeTab="dashboard" />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <DashboardHeader
            title="Counter Offer"
            avatarUrl={avatarUrl}
            avatarError={avatarError}
            onAvatarError={handleAvatarError}
          />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-lg">Offer not found</p>
          </div>
        </div>
      </div>
    );
  }

  const itemsCost = calculateTotalCost();
  const jetPicksFee = calculateJetPicksFee(itemsCost);
  const totalAmount = calculateTotal();
  const counterOfferAmount = offer ? (typeof offer.offer_amount === 'string' 
    ? parseFloat(offer.offer_amount).toFixed(2) 
    : offer.offer_amount.toFixed(2)) : '0.00';
  const originalRewardAmount = typeof order.reward_amount === 'string' 
    ? parseFloat(order.reward_amount).toFixed(2) 
    : order.reward_amount.toFixed(2);

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="dashboard" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader
          title="Counter Offer"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Counter Offer Received</h1>
          </div>

          <div className="max-w-sm mx-auto">
            {/* Picker Information */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {order.picker?.avatar_url && !pickerAvatarError ? (
                    <img
                      src={getImageUrl(order.picker.avatar_url)}
                      alt={order.picker.full_name}
                      className="w-full h-full object-cover"
                      onError={() => setPickerAvatarError(true)}
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

            {/* Counter Offer Amount */}
            <div className="mt-3 text-center border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-600 mb-1">Picker's counter offer:</p>
              <p className="text-lg font-bold text-gray-900">${counterOfferAmount}</p>
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
                  <span className="text-gray-600 text-sm">Original Reward</span>
                  <span className="text-gray-900 font-semibold text-sm">${originalRewardAmount}</span>
                </div>
                <div className="flex justify-between items-center bg-yellow-50 p-2 rounded">
                  <span className="text-gray-600 text-sm font-semibold">Counter Offer</span>
                  <span className="text-gray-900 font-bold text-sm">${counterOfferAmount}</span>
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
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleAcceptOffer}
                disabled={isProcessing}
                className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors text-base disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Accept Offer'}
              </button>
              <button
                onClick={handleDeclineOffer}
                disabled={isProcessing}
                className="w-full border-2 border-gray-300 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors text-base disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Decline'}
              </button>
            </div>
          </div>
        </div>

        <MobileFooter activeTab="home" />
      </div>
    </div>
  );
};

export default CounterOfferReceived;
