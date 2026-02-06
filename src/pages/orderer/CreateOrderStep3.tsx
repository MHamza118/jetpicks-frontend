import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ordersApi } from '../../services';
import { useOrder } from '../../context/OrderContext';
import { useUser } from '../../context/UserContext';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';

const CreateOrderStep3 = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { orderData, updateOrderData } = useOrder();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [reward, setReward] = useState(orderData.reward || '');
  const [loading, setLoading] = useState(false);

  // Fetch order details from backend using URL param
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        navigate('/orderer/create-order');
        return;
      }

      try {
        const res = await ordersApi.getOrderDetails(orderId);
        const order = (res as any).data;
        
        // Update context with order data
        updateOrderData({
          orderId: order.id,
          originCountry: order.origin_country,
          originCity: order.origin_city,
          destinationCountry: order.destination_country,
          destinationCity: order.destination_city,
          specialNotes: order.special_notes || '',
          reward: order.reward_amount?.toString() || '',
        });
        
        if (order.reward_amount) {
          setReward(order.reward_amount.toString());
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        navigate('/orderer/create-order');
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleNext = async () => {
    if (!reward.trim()) {
      alert('Please enter a reward amount');
      return;
    }

    setLoading(true);
    try {
      // Save reward to backend
      await ordersApi.setReward(orderId!, {
        reward_amount: parseFloat(reward),
      });

      updateOrderData({ reward });
      navigate(`/orderer/create-order/${orderId}/step4`);
    } catch (error) {
      console.error('Failed to set reward:', error);
      alert('Failed to set reward. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

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
                className={`w-2 h-2 rounded-full ${
                  step === 3 ? 'bg-[#FFDF57]' : step < 3 ? 'bg-gray-400' : 'bg-gray-200'
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
        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24 bg-white flex flex-col">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter delivery Reward</h2>
            <p className="text-gray-600 text-sm mb-6">This is the amount you are willing to pay your Jetpicker to bring you the goods. They have one chance to submit a counteroffer</p>

            <input
              type="number"
              placeholder="Enter Reward Amount"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FFDF57]"
            />
          </div>

          <button
            onClick={handleNext}
            disabled={!reward.trim() || loading}
            className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
          >
            {loading ? 'Loading...' : 'Next'}
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 overflow-y-auto p-8 pb-0 bg-white items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Enter delivery Reward</h2>
            <p className="text-gray-600 text-sm mb-6 text-center">This is the amount you are willing to pay your Jetpicker to bring you the goods. They have one chance to submit a counteroffer</p>

            <div className="mb-6">
              <input
                type="number"
                placeholder="Enter Reward Amount"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FFDF57]"
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!reward.trim() || loading}
              className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderStep3;
