import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ordersApi } from '../../services';
import { imageUtils } from '../../utils';
import { useOrder } from '../../context/OrderContext';
import { useUser } from '../../context/UserContext';
import { getSymbolForCurrency } from '../../services/currencies';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import placeOrderImage from '../../assets/placeorder.png';

interface OrderItem {
  id?: string;
  item_name: string;
  quantity: number;
  store_link?: string;
  weight: string;
  price: number;
  currency?: string;
  product_images?: string[];
}

interface OrderDetailsType {
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  items: OrderItem[];
  reward_amount: number;
  waiting_days?: number;
  currency?: string;
  special_notes?: string;
}

const CreateOrderStep4 = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { resetOrderData } = useOrder();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [lawsAgreed, setLawsAgreed] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetailsType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedWaitingDays, setEditedWaitingDays] = useState<number | null>(null);
  const [editedRewardAmount, setEditedRewardAmount] = useState<number | null>(null);
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);

  // Get the primary currency from order (saved during step 2)
  const getPrimaryCurrency = (): string => {
    if (orderDetails?.currency) {
      return orderDetails.currency;
    }
    // Fallback to first item's currency if order currency is not set
    if (orderDetails?.items && orderDetails.items.length > 0) {
      return orderDetails.items[0].currency || 'USD';
    }
    return 'USD';
  };

  // Get currency symbol
  const getCurrencySymbol = (): string => {
    return getSymbolForCurrency(getPrimaryCurrency());
  };

  // Helper function to calculate items total
  const getItemsTotal = () => {
    const items = isEditMode ? editedItems : (orderDetails?.items || []);
    return items.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      return sum + (price * quantity);
    }, 0) || 0;
  };

  // Helper function to get reward amount as number
  const getRewardAmount = () => {
    const reward = orderDetails?.reward_amount;
    return typeof reward === 'string' ? parseFloat(reward) : (reward || 0);
  };

  // Helper function to calculate subtotal (items + reward)
  const getSubtotal = () => {
    return getItemsTotal() + getRewardAmount();
  };

  // Helper function to calculate JetPicker fee (6.5%)
  const getJetPickerFee = () => {
    return getSubtotal() * 0.065;
  };

  // Helper function to calculate payment processing fee (4%)
  const getPaymentProcessingFee = () => {
    return getSubtotal() * 0.04;
  };

  // Helper function to calculate total
  const getTotal = () => {
    return getSubtotal() + getJetPickerFee() + getPaymentProcessingFee();
  };

  // Fetch order details from backend using URL param
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        navigate('/orderer/create-order');
        return;
      }

      try {
        const res = await ordersApi.getOrderDetails(orderId) as { data: OrderDetailsType };
        setOrderDetails(res.data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        navigate('/orderer/create-order');
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

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

  const updateEditedItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...editedItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditedItems(updated);
  };

  const handleNumberInputWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const handleEdit = () => {
    if (isEditMode) {
      // Cancel edit mode
      setIsEditMode(false);
      setEditedWaitingDays(null);
      setEditedRewardAmount(null);
      setEditedItems([]);
    } else {
      // Enter edit mode
      setIsEditMode(true);
      setEditedWaitingDays(orderDetails?.waiting_days || null);
      setEditedRewardAmount(getRewardAmount());
      setEditedItems(orderDetails?.items || []);
    }
  };

  const handleSaveEdit = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      await ordersApi.updateOrder(orderId, {
        waiting_days: editedWaitingDays,
        reward_amount: editedRewardAmount,
        items: editedItems,
      });
      
      // Update local state
      if (orderDetails) {
        setOrderDetails({
          ...orderDetails,
          waiting_days: editedWaitingDays || orderDetails.waiting_days,
          reward_amount: editedRewardAmount || orderDetails.reward_amount,
          items: editedItems,
        });
      }
      
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (termsAgreed && lawsAgreed) {
      setLoading(true);
      try {
        // Finalize draft order by changing status to PENDING
        await ordersApi.finalizeOrder(orderId!);
        setOrderPlaced(true);
        resetOrderData();
      } catch (error) {
        console.error('Failed to finalize order:', error);
        alert('Failed to finalize order. Please try again.');
      } finally {
        setLoading(false);
      }
    }
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Summary</h2>
            </div>
          </div>

          {/* Popup Overlay */}
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-[#FFDF57] rounded-3xl p-8 max-w-sm w-full flex flex-col items-center justify-center min-h-96">
              <img src={placeOrderImage} alt="Success" className="w-48 h-48 mb-6 transform -rotate-30" />
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Order successfully posted</h2>
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
          <DashboardHeader 
            title="Dashboard" 
            avatarUrl={avatarUrl}
            avatarError={avatarError}
            onAvatarError={handleAvatarError}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          <div className="max-w-2xl mx-auto md:bg-white md:rounded-2xl md:p-8 md:shadow-[0_2px_15px_rgba(0,0,0,0.05)] md:border md:border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  title="Go back"
                >
                  <ArrowLeft size={24} className="text-gray-900" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
              </div>
              <button
                onClick={handleEdit}
                className={`px-3 py-2 rounded-lg transition-colors font-semibold text-sm ${
                  isEditMode
                    ? 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                    : 'bg-[#FFDF57] hover:bg-yellow-500 text-gray-900'
                }`}
              >
                {isEditMode ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-6 pl-11">Before placing your order, please review your complete order summary to ensure all details are correct.</p>

            {/* Summary Card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              {!orderDetails ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading order details...</p>
                </div>
              ) : (
                <>
                  {/* Route Section */}
                  <div className="mb-6">
                    <p className="text-gray-600 font-medium text-sm mb-3">Delivery Route</p>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-gray-900 font-semibold">{orderDetails?.origin_city}, {orderDetails?.origin_country}</p>
                      <div className="flex items-center justify-center my-3">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="px-3 text-gray-400 text-sm">to</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>
                      <p className="text-gray-900 font-semibold">{orderDetails?.destination_city}, {orderDetails?.destination_country}</p>
                    </div>
                  </div>
                  
                  {/* Items List */}
                  {orderDetails?.items && orderDetails.items.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-600 font-medium mb-3">Items</p>
                      <div className="space-y-3">
                        {(isEditMode ? editedItems : orderDetails.items).map((item: OrderItem, idx: number) => (
                          <div key={idx} className="bg-white rounded-lg p-3">
                            {isEditMode ? (
                              <>
                                <div className="mb-3">
                                  <label className="text-gray-600 text-sm font-medium block mb-1">Item Name</label>
                                  <input
                                    type="text"
                                    value={item.item_name}
                                    onChange={(e) => updateEditedItem(idx, 'item_name', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div>
                                    <label className="text-gray-600 text-sm font-medium block mb-1">Quantity</label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity || ''}
                                      onChange={(e) => updateEditedItem(idx, 'quantity', e.target.value ? parseInt(e.target.value) : '')}
                                      onWheel={handleNumberInputWheel}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-gray-600 text-sm font-medium block mb-1">Weight</label>
                                    <input
                                      type="text"
                                      value={item.weight}
                                      onChange={(e) => updateEditedItem(idx, 'weight', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="text-gray-600 text-sm font-medium block mb-1">Price</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.price || ''}
                                    onChange={(e) => updateEditedItem(idx, 'price', e.target.value ? parseFloat(e.target.value) : '')}
                                    onWheel={handleNumberInputWheel}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="text-gray-600 text-sm font-medium block mb-1">Store Link</label>
                                  <input
                                    type="text"
                                    value={item.store_link || ''}
                                    onChange={(e) => updateEditedItem(idx, 'store_link', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-900 font-semibold">{item.item_name}</span>
                                  <span className="text-gray-600 text-sm">Qty: {item.quantity}</span>
                                </div>
                                {item.store_link && (
                                  <div className="flex justify-between mb-2">
                                    <span className="text-gray-600 text-sm">Store:</span>
                                    <a href={item.store_link} target="_blank" rel="noopener noreferrer" className="text-[#4D0013] text-sm underline font-semibold">
                                      {item.store_link}
                                    </a>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-600 text-sm">Weight:</span>
                                  <span className="text-gray-900 text-sm">{item.weight}</span>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Waiting Days</span>
                      {isEditMode ? (
                        <input
                          type="number"
                          min="1"
                          value={editedWaitingDays || ''}
                          onChange={(e) => setEditedWaitingDays(e.target.value ? parseInt(e.target.value) : null)}
                          onWheel={handleNumberInputWheel}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-gray-900 font-semibold"
                        />
                      ) : (
                        <span className="text-gray-900 font-semibold">{orderDetails?.waiting_days} days</span>
                      )}
                    </div>
                    
                    {/* Items Amount */}
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Items Amount</span>
                      <span className="text-gray-900 font-semibold">
                        {getCurrencySymbol()}{getItemsTotal().toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Reward Amount */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Reward Amount</span>
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editedRewardAmount || ''}
                          onChange={(e) => setEditedRewardAmount(e.target.value ? parseFloat(e.target.value) : null)}
                          onWheel={handleNumberInputWheel}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-gray-900 font-semibold"
                        />
                      ) : (
                        <span className="text-gray-900 font-semibold">{getCurrencySymbol()}{getRewardAmount().toFixed(2)}</span>
                      )}
                    </div>
                    
                    {/* JetPicker Fee (6.5%) */}
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">JetPicker Fee (6.5%)</span>
                      <span className="text-gray-900 font-semibold">
                        {getCurrencySymbol()}{getJetPickerFee().toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Payment Processing (4%) */}
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Payment Processing (4%)</span>
                      <span className="text-gray-900 font-semibold">
                        {getCurrencySymbol()}{getPaymentProcessingFee().toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Total */}
                    <div className="border-t border-gray-200 pt-3 flex justify-between bg-yellow-50 -mx-3 px-3 py-3 rounded">
                      <span className="text-gray-900 font-bold">Total</span>
                      <span className="text-gray-900 font-bold text-lg">
                        {getCurrencySymbol()}{getTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Product Images */}
            {orderDetails?.items && orderDetails.items.length > 0 && (
              <div className="mb-8">
                <p className="text-gray-600 font-medium mb-4">Product Images</p>
                <div className="flex gap-3 flex-wrap">
                  {orderDetails.items.map((item: OrderItem, itemIdx: number) =>
                    item.product_images && item.product_images.length > 0 ? (
                      item.product_images.map((imagePath: string, imgIdx: number) => {
                        const fullUrl = imageUtils.getImageUrl(imagePath);
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

            {/* Checkboxes - Hidden in edit mode */}
            {!isEditMode && (
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
            )}

            {/* Place Order / Save Button */}
            {isEditMode ? (
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={!termsAgreed || !lawsAgreed || loading}
                className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderStep4;
