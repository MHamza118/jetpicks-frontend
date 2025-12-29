import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { profileApi } from '../../api';
import { API_CONFIG } from '../../config/api';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import placeOrderImage from '../../assets/placeorder.png';

const CreateOrderStep4 = () => {
  const navigate = useNavigate();
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [lawsAgreed, setLawsAgreed] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

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

  const handlePlaceOrder = () => {
    if (termsAgreed && lawsAgreed) {
      setOrderPlaced(true);
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
                  <span className="text-gray-900 font-semibold">From London to Madrid</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Item list</span>
                  <span className="text-gray-900 font-semibold">Watch</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Store</span>
                  <span className="text-gray-900 font-semibold">Amazone</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Weight</span>
                  <span className="text-gray-900 font-semibold">1/4kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Reward</span>
                  <span className="text-gray-900 font-semibold">$10</span>
                </div>
              </div>

              {/* Product Image */}
              <div className="flex justify-center mb-8">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Product" className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>
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
                className={`w-2 h-2 rounded-full ${
                  step === 4 ? 'bg-[#FFDF57]' : step < 4 ? 'bg-gray-400' : 'bg-gray-200'
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
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Route</span>
                <span className="text-gray-900 font-semibold">From London to Madrid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Item list</span>
                <span className="text-gray-900 font-semibold">Watch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Store</span>
                <span className="text-gray-900 font-semibold">Amazone</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Weight</span>
                <span className="text-gray-900 font-semibold">1/4kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Reward</span>
                <span className="text-gray-900 font-semibold">$10</span>
              </div>
            </div>

            {/* Product Image */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Product" className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>

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
              disabled={!termsAgreed || !lawsAgreed}
              className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderStep4;
