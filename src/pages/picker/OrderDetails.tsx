import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { API_CONFIG } from '../../config/api';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { profileApi } from '../../api';

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
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

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
          const avatarPath = profile.avatar_url;
          const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
          const fullUrl = avatarPath.startsWith('http')
            ? avatarPath
            : `${baseUrl}${avatarPath}`;
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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
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
          <DashboardHeader
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
  const jetPicksFee = calculateJetPicksFee(itemsCost);
  const totalAmount = calculateTotal();

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="dashboard" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader
          title="Order Details"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          {/* Back Button */}
          <button
            onClick={() => navigate('/picker/dashboard')}
            className="mb-6 text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>

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

          <div className="max-w-4xl mx-auto">
            {/* Items Section */}
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start flex-shrink-0">
                      {/* Item Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.product_images && item.product_images.length > 0 ? (
                          <img
                            src={getImageUrl(item.product_images[0])}
                            alt={item.item_name}
                            className="w-full h-full object-cover"
                          />
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
                            className="text-[#FFDF57] text-sm underline mb-4"
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
                    <span className="text-gray-600">Reward</span>
                    <span className="text-gray-900 font-semibold">${typeof order.reward_amount === 'string' ? parseFloat(order.reward_amount).toFixed(2) : order.reward_amount.toFixed(2)}</span>
                  </div>
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
                <p className="text-gray-900 font-bold text-2xl mb-2">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600 text-sm">Based on arrival date</p>
              </div>
            </div>

            {/* Special Notes */}
            {order.special_notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <h3 className="text-gray-900 font-bold text-base mb-2">Special Instructions</h3>
                <p className="text-gray-700 text-sm">{order.special_notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                className="flex-1 bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors text-base"
              >
                Accept Delivery
              </button>
              <button
                className="flex-1 border-2 border-gray-300 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors text-base"
              >
                Send Counter Offer
              </button>
            </div>

            {/* Agreements */}
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded accent-red-900"
                  defaultChecked
                />
                <span className="text-gray-700 text-sm">I agree to terms and conditions</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded accent-red-900"
                  defaultChecked
                />
                <span className="text-gray-700 text-sm">I agree to the custom laws</span>
              </label>
            </div>
          </div>
        </div>

        <MobileFooter activeTab="home" />
      </div>
    </div>
  );
};

export default PickerOrderDetails;
