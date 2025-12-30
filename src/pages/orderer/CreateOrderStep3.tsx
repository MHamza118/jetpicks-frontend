import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { profileApi, ordersApi } from '../../api';
import { API_CONFIG } from '../../config/api';
import { useOrder } from '../../context/OrderContext';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';

const CreateOrderStep3 = () => {
  const navigate = useNavigate();
  const { orderData, updateOrderData } = useOrder();
  const [reward, setReward] = useState(orderData.reward || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleNext = async () => {
    if (!reward.trim()) {
      alert('Please enter a reward amount');
      return;
    }

    if (!orderData.orderId) {
      alert('Order ID not found. Please start from step 1.');
      return;
    }

    setLoading(true);
    try {
      // Save reward to backend
      await ordersApi.setReward(orderData.orderId, {
        reward_amount: parseFloat(reward),
      });

      updateOrderData({ reward });
      navigate('/orderer/create-order-step4');
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

  const handleAvatarError = () => {
    setAvatarError(true);
    setAvatarUrl(null);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter delivery Reward</h2>

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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Enter delivery Reward</h2>

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
