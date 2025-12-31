import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { profileApi, ordersApi } from '../../api';
import { API_CONFIG } from '../../config/api';
import { useOrder } from '../../context/OrderContext';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import placeOrderImage from '../../assets/placeorder.png';

const CreateOrderStep4 = () => {
  const navigate = useNavigate();
  const { orderData, resetOrderData } = useOrder();
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [lawsAgreed, setLawsAgreed] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await profileApi.getProfile();
        const profile = response.data;
        if (profile?.avatar_url) {
          const avatarPath = profile.avatar_url;
          const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
          const fullUrl = avatarPath.startsWith('http')
            ? avatarPath
            : `${baseUrl}${avatarPath}`;
          setAvatarUrl(fullUrl);
          setAvatarError(false);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (orderData.orderId) {
      const fetchOrderDetails = async () => {
        try {
          const res = await ordersApi.getOrderDetails(orderData.orderId!);
          setOrderDetails((res as any).data);
        } catch (error) {
          console.error('Failed to fetch order details:', error);
        }
      };
      fetchOrderDetails();
    }
  }, [orderData.orderId]);

  useEffect(() => {
    if (orderPlaced) {
      const timer = setTimeout(() => {
        navigate('/orderer/dashboard');
      }, 3000);    //success popup time 3-seconds.
      return () => clearTimeout(timer);
    }
  }, [orderPlaced, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePlaceOrder = async () => {
    if (termsAgreed && lawsAgreed) {
      setLoading(true);
      try {
        // Order is already saved in all steps, just show success
        setOrderPlaced(true);
        resetOrderData();
      } catch (error) {
        console.error('Failed to complete order:', error);
        alert('Failed to complete order. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelOrder = () => {
    navigate('/orderer/dashboard');
  };

  const handleAvatarError = () => {
    setAvatarError(true);
    setAvatarUrl(null);
  };

  if (orderPlaced) {
    return (
      <div className="flex h-screen bg-white flex-col md:flex-row">
        <DashboardSidebar activeTab="dashboard" />

        <div className="flex-1 flex flex-col h-dvh md:h-screen overflow-hidden relative">
          <div className="hidden md:block">
            <DashboardHeader
              title="Dashboard"
              avatarUrl={avatarUrl}
              avatarError={avatarError}
              onAvatarError={handleAvatarError}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
            <div className="max-w-2xl mx-auto md:bg-white md:rounded-2xl md:p-8 md:shadow-[0_2px_15px_rgba(0,0,0,0.05)] md:border md:border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Summary Card */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Route</span>
                  <span className="text-gray-900 font-semibold">From {orderDetails?.origin_city} to {orderDetails?.destination_city}</span>
                </div>
                
                {/* Items List */}
                {orderDetails?.items && orderDetails.items.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-600 font-medium mb-3">Items</p>
                    <div className="space-y-3">
                      {orderDetails.items.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-lg p-3">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-900 font-semibold">{item.item_name}</span>
                            <span className="text-gray-600 text-sm">Qty: {item.quantity}</span>
                          </div>
                          {item.store_link && (
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600 text-sm">Store:</span>
                              <a href={item.store_link} target="_blank" rel="noopener noreferrer" className="text-[#FFDF57] text-sm underline">
                                {item.store_link}
                              </a>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Weight:</span>
                            <span className="text-gray-900 text-sm">{item.weight}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Price:</span>
                            <span className="text-gray-900 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-gray-600 font-medium">Reward</span>
                  <span className="text-gray-900 font-semibold">${orderDetails?.reward_amount}</span>
                </div>
              </div>

              {/* Product Images */}
              {orderDetails?.items && orderDetails.items.length > 0 && (
                <div className="mb-8">
                  <p className="text-gray-600 font-medium mb-4">Product Images</p>
                  <div className="flex gap-3 flex-wrap">
                    {orderDetails.items.map((item: any, itemIdx: number) =>
                      item.product_images && item.product_images.length > 0 ? (
                        item.product_images.map((imagePath: string, imgIdx: number) => {
                          const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
                          const fullUrl = imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`;
                          return (
                            <div key={`${itemIdx}-${imgIdx}`} className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                              <img src={fullUrl} alt={`Product ${itemIdx + 1}-${imgIdx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          );
                        })
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Popup Overlay */}
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-[#FFDF57] rounded-3xl p-8 max-w-sm w-full flex flex-col items-center justify-center min-h-96">
              <img src={placeOrderImage} alt="Success" className="w-48 h-48 mb-6 transform -rotate-30" />
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Order successfully posted</h2>
              <button
                onClick={handleCancelOrder}
                className="w-full bg-white text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="dashboard" />

      <div className="flex-1 flex flex-col h-dvh md:h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="bg-white px-4 py-3 md:hidden flex items-center gap-3 border-b border-gray-200">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-[#FFDF57] flex items-center justify-center hover:bg-yellow-500 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} className="text-gray-900" />
          </button>
          <div className="flex gap-1.5 flex-1 justify-center">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${step === 4 ? 'bg-[#FFDF57]' : step < 4 ? 'bg-gray-400' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
          <div className="w-10 flex-shrink-0" />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <DashboardHeader title="Dashboard" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          <div className="max-w-2xl mx-auto md:bg-white md:rounded-2xl md:p-8 md:shadow-[0_2px_15px_rgba(0,0,0,0.05)] md:border md:border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* Summary Card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
              {!orderDetails ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading order details...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Route</span>
                    <span className="text-gray-900 font-semibold">From {orderDetails?.origin_city} to {orderDetails?.destination_city}</span>
                  </div>
                  
                  {/* Items List */}
                  {orderDetails?.items && orderDetails.items.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-600 font-medium mb-3">Items</p>
                      <div className="space-y-3">
                        {orderDetails.items.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white rounded-lg p-3">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-900 font-semibold">{item.item_name}</span>
                              <span className="text-gray-600 text-sm">Qty: {item.quantity}</span>
                            </div>
                            {item.store_link && (
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-600 text-sm">Store:</span>
                                <a href={item.store_link} target="_blank" rel="noopener noreferrer" className="text-[#FFDF57] text-sm underline">
                                  {item.store_link}
                                </a>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600 text-sm">Weight:</span>
                              <span className="text-gray-900 text-sm">{item.weight}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 text-sm">Price:</span>
                              <span className="text-gray-900 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="text-gray-600 font-medium">Reward</span>
                    <span className="text-gray-900 font-semibold">${orderDetails?.reward_amount}</span>
                  </div>
                </>
              )}
            </div>

            {/* Product Images */}
            {orderDetails?.items && orderDetails.items.length > 0 && (
              <div className="mb-8">
                <p className="text-gray-600 font-medium mb-4">Product Images</p>
                <div className="flex gap-3 flex-wrap">
                  {orderDetails.items.map((item: any, itemIdx: number) =>
                    item.product_images && item.product_images.length > 0 ? (
                      item.product_images.map((imagePath: string, imgIdx: number) => {
                        const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
                        const fullUrl = imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`;
                        return (
                          <div key={`${itemIdx}-${imgIdx}`} className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                            <img src={fullUrl} alt={`Product ${itemIdx + 1}-${imgIdx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        );
                      })
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-3 mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-gray-900"
                />
                <span className="text-gray-700 text-sm">I agree to terms and conditions</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lawsAgreed}
                  onChange={(e) => setLawsAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-gray-900"
                />
                <span className="text-gray-700 text-sm">I agree to the custom laws</span>
              </label>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={!termsAgreed || !lawsAgreed || loading}
              className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderStep4;
