import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';
import { imageUtils } from '../../utils';
import { ordererOrdersApi } from '../../services/orderer/orders';
import { apiClient } from '../../services/apiClient';

interface OrderItem {
  id: string;
  name: string;
  store: string;
  weight: string;
  reward: number;
  image_url?: string;
  product_images?: string[];
}

interface Picker {
  id: string;
  name: string;
  rating: number;
  avatar_url?: string;
}

interface OrderDetailsData {
  id: string;
  origin_city: string;
  destination_city: string;
  items: OrderItem[];
  picker: Picker;
  status: 'pending' | 'delivered' | 'cancelled';
  delivery_status?: 'completed' | 'issue' | null;
  remaining_time?: string;
}

const OrdererOrderDetailsView = () => {
  const { orderId } = useParams();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [order, setOrder] = useState<OrderDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [issueWithDelivery, setIssueWithDelivery] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTip, setSelectedTip] = useState('5');
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordererOrdersApi.getOrderDetails(orderId!);
        const data = (response as any).data || response;
        
        setOrder({
          id: data.id,
          origin_city: data.origin_city,
          destination_city: data.destination_city,
          items: data.items.map((item: any) => ({
            id: item.id,
            name: item.item_name,
            store: 'Amazone',
            weight: item.weight,
            reward: data.reward_amount,
            image_url: item.product_images?.[0],
            product_images: item.product_images || [],
          })),
          picker: data.picker ? {
            id: data.picker.id,
            name: data.picker.full_name,
            rating: data.picker.rating || 0,
            avatar_url: data.picker.avatar_url,
          } : {
            id: '',
            name: 'Unknown',
            rating: 0,
            avatar_url: undefined,
          },
          status: data.status.toLowerCase(),
          delivery_status: null,
          remaining_time: '47h:12m',
        });
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleSubmitReview = async () => {
    if (!rating) {
      alert('Please select a rating');
      return;
    }

    if (!order) return;

    try {
      setSubmitting(true);
      setError(null);

      // Submit review
      await ordererOrdersApi.submitReview(
        order.id,
        rating,
        comment,
        order.picker.id
      );

      // Submit tip if selected
      if (selectedTip !== '0') {
        let tipAmount = 0;
        if (selectedTip === 'custom') {
          tipAmount = parseFloat(customTipAmount) || 0;
        } else {
          tipAmount = parseFloat(selectedTip);
        }

        if (tipAmount > 0) {
          await apiClient.post('/tips', {
            order_id: order.id,
            amount: tipAmount,
          });
        }
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        // Reset form
        setRating(0);
        setComment('');
        setSelectedTip('5');
        setCustomTipAmount('');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFDF57]"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700">Review and tip submitted successfully!</p>
            </div>
          )}

          {!loading && order && (
            <>
          {/* Route Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {order.origin_city} - {order.destination_city}
            </h1>
          </div>

          <div className="max-w-xl mx-auto space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Route</p>
                <p className="font-semibold text-gray-900">From {order.origin_city} to {order.destination_city}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Item list</p>
                <p className="font-semibold text-gray-900">Watch</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Store</p>
                <p className="font-semibold text-gray-900">Amazone</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Weight</p>
                <p className="font-semibold text-gray-900">1/4kg</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Reward</p>
                <p className="font-semibold text-gray-900">$10</p>
              </div>
            </div>
          </div>

          {/* Product Image and Picker Info Section */}
          {order.picker.id ? (
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Product Image Carousel */}
              <div className="relative w-56 h-56 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {order.items[0]?.product_images && order.items[0].product_images.length > 0 ? (
                  <>
                    <img
                      src={imageUtils.getImageUrl(order.items[0].product_images[currentImageIndex])}
                      alt="Product"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Forward Arrow Only */}
                    {order.items[0].product_images.length > 1 && (
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === order.items[0].product_images!.length - 1 ? 0 : prev + 1))}
                        className="absolute bottom-3 right-3 bg-[#FFDF57] hover:bg-yellow-500 text-gray-900 p-2 rounded-full transition-all shadow-lg"
                      >
                        <ChevronRight size={24} />
                      </button>
                    )}
                  </>
                ) : null}
                {!order.items[0]?.product_images || order.items[0].product_images.length === 0 || (order.items[0] as any).imageError ? (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">No image</span>
                  </div>
                ) : null}
              </div>

              {/* Picker Info Section */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {order.picker.avatar_url ? (
                    <img
                      src={imageUtils.getImageUrl(order.picker.avatar_url)}
                      alt={order.picker.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!order.picker.avatar_url || (order.picker as any).avatarError ? (
                    <span className="text-lg font-semibold text-gray-600">{order.picker.name.charAt(0).toUpperCase()}</span>
                  ) : null}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">JetPicker</h3>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{order.picker.name}</p>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">{order.picker.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Product Image Carousel */}
              <div className="relative w-56 h-56 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {order.items[0]?.product_images && order.items[0].product_images.length > 0 ? (
                  <>
                    <img
                      src={imageUtils.getImageUrl(order.items[0].product_images[currentImageIndex])}
                      alt="Product"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Forward Arrow Only */}
                    {order.items[0].product_images.length > 1 && (
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === order.items[0].product_images!.length - 1 ? 0 : prev + 1))}
                        className="absolute bottom-3 right-3 bg-[#FFDF57] hover:bg-yellow-500 text-gray-900 p-2 rounded-full transition-all shadow-lg"
                      >
                        <ChevronRight size={24} />
                      </button>
                    )}
                  </>
                ) : null}
                {!order.items[0]?.product_images || order.items[0].product_images.length === 0 || (order.items[0] as any).imageError ? (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">No image</span>
                  </div>
                ) : null}
              </div>

              {/* Waiting for Picker Message */}
              <div className="flex items-center justify-center">
                <p className="text-gray-600 font-semibold text-center">Waiting for a picker to accept your order...</p>
              </div>
            </div>
          )}

          {/* Delivery Status Section - Only show when picker is assigned */}
          {order.picker.id && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4 text-base">ORDER MARKED AS DELIVERED BY JETPICKER</h3>

              {/* Status Indicators */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={async () => {
                    try {
                      if (!deliveryCompleted && orderId) {
                        await ordererOrdersApi.confirmDelivery(orderId);
                      }
                      setDeliveryCompleted(!deliveryCompleted);
                    } catch (err) {
                      console.error('Failed to confirm delivery:', err);
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    deliveryCompleted
                      ? 'border-green-500 bg-white'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {deliveryCompleted && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                  </div>
                  <p className="font-semibold text-gray-900 text-base">Delivery Completed</p>
                </button>
                <button
                  onClick={() => setIssueWithDelivery(!issueWithDelivery)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    issueWithDelivery
                      ? 'border-red-500 bg-white'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {issueWithDelivery && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
                  </div>
                  <p className="font-semibold text-gray-900 text-base">Issue with delivery</p>
                </button>
              </div>

              {/* Remaining Time */}
              {order.remaining_time && (
                <div className="rounded-lg p-3 mb-6 text-center w-full" style={{ backgroundColor: '#FFF3BD' }}>
                  <p className="font-semibold text-gray-900 text-sm">Remaining Time: {order.remaining_time}</p>
                </div>
              )}

              {/* Confirmation Message */}
              <p className="text-center text-gray-900 text-base">
                You have 48 hours to confirm. Otherwise money will be transferred automatically
              </p>
            </div>
          )}

          {/* Rate and Tip Section - Only show when picker is assigned */}
          {order.picker.id && (
            <div className="rounded-2xl p-8 mb-6" style={{ backgroundColor: '#FFFACD' }}>
              <h3 className="text-center font-bold text-gray-900 mb-6 text-lg">Rate your experience with {order.picker.name}</h3>

            {/* Star Rating */}
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Comment Box */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment"
              className="w-full bg-white rounded-lg p-4 mb-6 text-gray-900 placeholder-gray-500 focus:outline-none resize-none h-24 border border-gray-200"
            />

            {/* Tip Option */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <p className="font-semibold text-gray-900 mb-4">Tip Option</p>
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedTip('5')}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedTip === '5'
                      ? 'border-green-500 bg-white'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selectedTip === '5' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                  </div>
                  <span className="font-semibold text-gray-900">$5</span>
                </button>
                <button
                  onClick={() => setSelectedTip('10')}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedTip === '10'
                      ? 'border-green-500 bg-white'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selectedTip === '10' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                  </div>
                  <span className="font-semibold text-gray-900">$10</span>
                </button>
                <button
                  onClick={() => setSelectedTip('custom')}
                  className="flex items-center gap-3 cursor-pointer flex-1 whitespace-nowrap"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedTip === 'custom'
                      ? 'border-green-500 bg-white'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selectedTip === 'custom' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">Custom amount</span>
                </button>
              </div>

              {/* Custom Tip Input */}
              {selectedTip === 'custom' && (
                <div className="mt-4">
                  <input
                    type="number"
                    value={customTipAmount}
                    onChange={(e) => setCustomTipAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FFDF57]"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitReview}
              disabled={submitting || !rating}
              className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            </div>
          )}
          </div>
            </>
          )}
        </div>

        <MobileFooter activeTab="home" />
      </div>
    </div>
  );
};

export default OrdererOrderDetailsView;
