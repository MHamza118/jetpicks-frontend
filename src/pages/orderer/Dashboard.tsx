import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../services';
import { useAcceptedOrderPolling } from '../../context/OrderNotificationContext';
import { useDashboardCache } from '../../context/DashboardCacheContext';
import { useUser } from '../../context/UserContext';
import { imageUtils } from '../../utils';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import dashboardImage from '../../assets/dashboard.jpeg';

interface Picker {
    id: string;
    picker: {
        id: string;
        full_name: string;
        avatar_url: string;
        rating: number;
        completed_deliveries: number;
    };
    departure_country: string;
    departure_city: string;
    departure_date: string;
    arrival_country: string;
    arrival_city: string;
    arrival_date: string;
    luggage_weight_capacity: number;
}

const OrdererDashboard = () => {
    const navigate = useNavigate();
    const { avatarUrl, avatarError, handleAvatarError } = useUser();
    const [pickers, setPickers] = useState<Picker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { cachedData, setCachedData, isCacheValid } = useDashboardCache();
    const fetchInProgressRef = useRef(false);
    const visibilityHandlerRef = useRef<(() => void) | null>(null);

    // Start polling for accepted orders
    useAcceptedOrderPolling();

    useEffect(() => {
        const fetchDashboardData = async (skipCache = false) => {
            // Prevent duplicate fetches
            if (fetchInProgressRef.current) return;
            
            try {
                // Check if cache is valid (unless we're skipping cache)
                if (!skipCache && isCacheValid() && cachedData) {
                    setPickers(cachedData.pickers);
                    setLoading(false);
                    return;
                }
                
                fetchInProgressRef.current = true;
                setLoading(true);
                setError(null);                
                
                // Load dashboard from API
                const response = await dashboardApi.getOrdererDashboard(1, 20);             
                
                // Handle both wrapped and unwrapped responses
                const data = (response as any).data || response;
                const pickersData = data.available_pickers?.data || data.available_pickers || [];
                
                // Cache the data
                setCachedData({
                    pickers: pickersData,
                    timestamp: Date.now(),
                });
                setPickers(pickersData);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Failed to load available pickers');
                setPickers([]);
            } finally {
                setLoading(false);
                fetchInProgressRef.current = false;
            }
        };
        
        // Fetch on mount with cache check
        fetchDashboardData(false);

        // Set up visibility change handler
        visibilityHandlerRef.current = () => {
            if (document.visibilityState === 'visible') {
                // Fetch fresh data when page becomes visible
                fetchDashboardData(true);
            }
        };
        
        document.addEventListener('visibilitychange', visibilityHandlerRef.current);
        
        return () => {
            if (visibilityHandlerRef.current) {
                document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
            }
        };
    }, [isCacheValid, cachedData, setCachedData]);

    return (
        <div className="flex h-screen bg-white flex-col md:flex-row">
            <DashboardSidebar activeTab="dashboard" />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader
                    title="Dashboard"
                    avatarUrl={avatarUrl}
                    avatarError={avatarError}
                    onAvatarError={handleAvatarError}
                    avatarLoading={loading}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
                    {/* Hero Section */}
                    <div className="mb-8 rounded-3xl overflow-hidden h-40 md:h-56 relative flex items-end justify-center pb-6 md:pb-8">
                        <img src={dashboardImage} alt="Dashboard" className="w-full h-full object-cover absolute inset-0" />
                        <button 
                            onClick={() => navigate('/orderer/create-order')}
                            className="relative bg-[#FFDF57] text-gray-900 px-6 py-2 rounded-full font-bold text-sm md:text-base hover:bg-yellow-500 transition-colors shadow-lg"
                        >
                            Create An Order
                        </button>
                    </div>

                    {/* Available Pickers Section */}
                    <div className="mb-6">
                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="text-gray-600">Loading available pickers...</div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && pickers.length === 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-yellow-700">
                                No available pickers at the moment. Try creating an order to find matching pickers.
                            </div>
                        )}

                        {/* Pickers Grid */}
                        {!loading && pickers.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pickers.map(item => (
                                    <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                                                {item.picker.avatar_url ? (
                                                    <img 
                                                        src={imageUtils.getImageUrl(item.picker.avatar_url)}
                                                        alt={item.picker.full_name} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">
                                                        {item.picker.full_name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm">{item.picker.full_name}</h3>
                                                <div className="flex items-center text-xs">
                                                    <span className="font-bold text-gray-900 mr-0.5">{item.picker.rating}</span>
                                                    <span className="text-orange-400">★</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#FFF8D6] rounded-lg p-2 mb-3 text-center">
                                            <p className="text-xs font-bold text-gray-900 mb-0.5">
                                                From {item.departure_city} - {item.arrival_city}
                                            </p>
                                            <p className="text-xs font-medium text-gray-600">
                                                {new Date(item.departure_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>

                                        <div className="flex justify-between text-xs mb-3 font-semibold">
                                            <span className="text-gray-900">Available space: {item.luggage_weight_capacity}kg</span>
                                        </div>

                                        <button
                                            onClick={() => navigate('/orderer/jetpicker-details', { state: { picker: item } })}
                                            className="w-full bg-[#FFDF57] text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors shadow-sm"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <MobileFooter activeTab="home" />
            </div>
        </div>
    );
};

export default OrdererDashboard;
