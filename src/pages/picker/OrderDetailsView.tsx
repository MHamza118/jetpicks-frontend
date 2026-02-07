import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { pickerOrdersApi } from '../../services/picker/orders';
import { imageUtils } from '../../utils';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { Upload, CheckCircle, Circle, ChevronRight } from 'lucide-react';

interface OrderItem {
  id: string;
  item_name: string;
  weight?: string;
  price?: number;
  quantity?: number;
  special_notes?: string;
  store_link?: string;
  product_images?: string[];
}

interface OrderDetailsViewData {
  id: string;
  orderer_id: string;
  origin_city: string;
  destination_city: string;
  status: string;
  items_count: number;
  reward_amount: number | string;
  items: OrderItem[];
  orderer: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rating: number;
  };
  created_at: string;
}

const PickerOrderDetailsView = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [order, setOrder] = useState<OrderDetailsViewData | null>(null);
  const [uploadedProof, setUploadedProof] = useState<File | null>(null);
  const [isDelivered, setIsDelivered] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPaymentNotice, setShowPaymentNotice] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentImageIndex(0);
        const response = await pickerOrdersApi.getOrderDetails(orderId!);
        const data = (response as any).data || response;
        
        setOrder({
          id: data.id,
          orderer_id: data.orderer_id,
          origin_city: data.origin_city,
          destination_city: data.destination_city,
          status: data.status.toLowerCase(),
          items_count: data.items_count,
          reward_amount: data.reward_amount,
          items: data.items,
          orderer: data.orderer,
          created_at: data.created_at,
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

  // Auto-hide payment notice after 30 seconds
  useEffect(() => {
    if (showPaymentNotice && order?.status === 'accepted') {
      const timer = setTimeout(() => {
        setShowPaymentNotice(false);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [showPaymentNotice, order?.status]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedProof(file);
    }
  };

  const handleToggleMarkAsDelivered = async () => {
    if (!showUploadSection) {
      setShowUploadSection(true);
    } else if (uploadedProof && orderId) {
      try {
        setLoading(false);
        await pickerOrdersApi.markDelivered(orderId, uploadedProof);
        setIsDelivered(true);
        setShowUploadSection(false);
      } catch (err) {
        console.error('Failed to mark delivery:', err);
        setError('Failed to mark delivery. Please try again.');
      }
    }
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <PickerDashboardSidebar activeTab="orders" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PickerDashboardHeader
          title="My orders"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 bg-white">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4D0013]"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && order && (
            <>
              {/* Route Header with Status */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#4D0013]">
                  {order.origin_city} - {order.destination_city}
                </h1>
                {/* Status Badge and Cancelled Message */}
                <div className="mt-3 flex items-center gap-4">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    order.status.toUpperCase() === 'CANCELLED'
                      ? 'bg-red-100 text-red-700'
                      : order.status.toUpperCase() === 'ACCEPTED'
                      ? 'bg-blue-100 text-blue-700'
                      : order.status.toUpperCase() === 'DELIVERED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  {order.status.toUpperCase() === 'CANCELLED' && (
                    <p className="text-red-700 text-xs">This order has been cancelled and cannot be proceeded further.</p>
                  )}
                </div>
              </div>

              {/* Payment Notice Popup - Only for Accepted Orders */}
              {order.status.toUpperCase() === 'ACCEPTED' && showPaymentNotice && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 relative">
                  <button
                    onClick={() => setShowPaymentNotice(false)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-lg font-bold"
                  >
                    ✕
                  </button>
                  <div className="pr-6">
                    <h3 className="text-base font-semibold text-red-900 mb-1">Payment Pending</h3>
                    <p className="text-red-800 text-xs mb-1">
                      Please hold off on purchasing the items at this time. Once the orderer completes the payment, we'll send you a notification to proceed with buying the products.
                    </p>
                    <p className="text-red-700 text-xs font-medium">
                      Auto-closes in 30 seconds.
                    </p>
                  </div>
                </div>
              )}

              <div className="max-w-xl mx-auto space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Route</p>
                      <p className="font-semibold text-gray-900">
                        From {order.origin_city} to {order.destination_city}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Item list</p>
                      <p className="font-semibold text-gray-900">{order.items[0]?.item_name || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Store</p>
                      <p className="font-semibold text-gray-900">
                        {order.items[0]?.store_link ? 'Amazone' : 'N/A'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Weight</p>
                      <p className="font-semibold text-gray-900">{order.items[0]?.weight || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Reward</p>
                      <p className="font-semibold text-gray-900">
                        ${typeof order.reward_amount === 'string' ? parseFloat(order.reward_amount).toFixed(2) : order.reward_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Image and Orderer Info */}
                <div className="flex items-center justify-center gap-6">
                  {/* Product Image Carousel */}
                  <div className="relative w-56 h-56 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                    {order.items?.[0]?.product_images && Array.isArray(order.items[0].product_images) && order.items[0].product_images.length > 0 ? (
                      <>
                        <img
                          key={`${order.id}-${currentImageIndex}`}
                          src={imageUtils.getImageUrl(order.items[0].product_images[currentImageIndex])}
                          alt={order.items[0]?.item_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
                          }}
                        />
                        {/* Forward Arrow Only */}
                        {order.items[0].product_images.length > 1 && (
                          <button
                            onClick={() => {
                              const newIndex = currentImageIndex === order.items[0].product_images!.length - 1 ? 0 : currentImageIndex + 1;
                              setCurrentImageIndex(newIndex);
                            }}
                            className="absolute bottom-3 right-3 bg-[#4D0013] hover:bg-[#660019] text-white p-2 rounded-full transition-all shadow-lg z-10"
                          >
                            <ChevronRight size={24} />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Orderer Info - Centered vertically with carousel */}
                  <div className="flex items-center justify-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-6">JetOrderer</h3>
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                            <span className="text-lg font-semibold text-gray-600">{order.orderer.full_name.charAt(0).toUpperCase()}</span>
                          ) : null}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{order.orderer.full_name}</p>
                          <p className="text-sm text-gray-600">{order.orderer.rating} ⭐</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Status */}
                {!isDelivered && order.status.toUpperCase() !== 'CANCELLED' && (
                  <div>
                    <button
                      onClick={handleToggleMarkAsDelivered}
                      className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        {showUploadSection ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <Circle size={20} className="text-gray-400" />
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">Mark as delivered</p>
                    </button>

                    {/* Upload Area - Shows when toggled */}
                    {showUploadSection && (
                      <>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                          <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600 text-sm mb-2">Upload proof of delivery/ Receipt</p>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <span className="text-[#4D0013] font-semibold text-sm hover:underline">
                              Click to upload
                            </span>
                          </label>
                          {uploadedProof && (
                            <p className="text-green-600 text-sm mt-2">✓ {uploadedProof.name}</p>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-center">
                          <button
                            onClick={handleToggleMarkAsDelivered}
                            disabled={!uploadedProof}
                            className={`px-8 py-2 rounded-lg font-bold text-sm transition-colors ${
                              uploadedProof
                                ? 'bg-[#4D0013] text-white hover:bg-[#660019]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Confirm Delivery
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Delivered Confirmation */}
                {isDelivered && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                    <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
                    <p className="font-semibold text-green-900 text-lg">Order Delivered Successfully</p>
                    <p className="text-green-700 text-sm mt-2">Thank you for completing this delivery</p>
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

export default PickerOrderDetailsView;
