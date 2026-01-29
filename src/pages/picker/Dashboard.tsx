import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../services';
import type { PickerDashboardData } from '../../services/dashboard';
import { useDashboardCache } from '../../context/DashboardCacheContext';
import { useUser } from '../../context/UserContext';
import { imageUtils } from '../../utils';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import dashboardHero from '../../assets/dashboard.jpeg';

const PickerDashboard = () => {
    const navigate = useNavigate();
    const { avatarUrl, avatarError, handleAvatarError } = useUser();
    const [dashboardData, setDashboardData] = useState<PickerDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const { pickerCachedData, setPickerCachedData, isPickerCacheValid } = useDashboardCache();
    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fetchInProgressRef = useRef(false);
    const visibilityHandlerRef = useRef<(() => void) | null>(null);

    const fetchData = async (skipCache = false) => {
        // Prevent duplicate fetches
        if (fetchInProgressRef.current) return;
        
        try {
            // Check if cache is valid and we're not skipping it
            if (!skipCache && isPickerCacheValid() && pickerCachedData) {
                setDashboardData(pickerCachedData.orders);
                setLoading(false);
                return;
            }

            fetchInProgressRef.current = true;
            const dashboardRes = await dashboardApi.getPickerDashboard();

            // The API client returns response.data directly
            // The backend now wraps it in { data: dashboard }
            const data = (dashboardRes as any).data || dashboardRes;

            // Cache the data
            setPickerCachedData({
                orders: data,
                timestamp: Date.now(),
            });

            setDashboardData(data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
            fetchInProgressRef.current = false;
        }
    };

    useEffect(() => {
        // Fetch on mount with cache check
        fetchData(false);

        // Set up visibility change handler
        visibilityHandlerRef.current = () => {
            if (document.visibilityState === 'visible') {
                // Fetch fresh data when page becomes visible
                fetchData(true);
            }
        };
        
        document.addEventListener('visibilitychange', visibilityHandlerRef.current);
        
        return () => {
            if (visibilityHandlerRef.current) {
                document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
            }
        };
    }, [isPickerCacheValid, pickerCachedData, setPickerCachedData]);

    // Polling for real-time sync every 30 seconds
    useEffect(() => {
        pollingIntervalRef.current = setInterval(() => {
            fetchData(true); // Skip cache for polling
        }, 30 * 1000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    return (
        <div className="flex h-screen bg-white flex-col md:flex-row">
            <PickerDashboardSidebar activeTab="dashboard" />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <PickerDashboardHeader
                    title="Dashboard"
                    avatarUrl={avatarUrl}
                    avatarError={avatarError}
                    onAvatarError={handleAvatarError}
                    avatarLoading={loading}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
                    {dashboardData?.travel_journeys && dashboardData.travel_journeys.length > 0 && (
                        <div className="text-center mb-6">
                            <p className="text-gray-900 font-semibold text-lg">
                                From {dashboardData.travel_journeys[0].departure_city} - {dashboardData.travel_journeys[0].arrival_city} {' '}
                                <span className="text-gray-500">{new Date(dashboardData.travel_journeys[0].arrival_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}</span>
                            </p>
                        </div>
                    )}

                    {/* Hero Section */}
                    <div className="mb-8 rounded-3xl overflow-hidden h-40 md:h-56 relative flex items-end justify-center pb-6 md:pb-8">
                        <img src={dashboardHero} alt="Dashboard" className="w-full h-full object-cover absolute inset-0" />
                        <button
                            onClick={() => navigate('/picker/create-journey')}
                            className="relative bg-[#4D0013] text-white px-6 py-2 rounded-full font-bold text-sm md:text-base hover:bg-[#660019] transition-colors shadow-lg"
                        >
                            Create New Journey
                        </button>
                    </div>

                    {/* Orders Grid */}
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFDF57]"></div>
                        </div>
                    ) : dashboardData?.available_orders?.data && dashboardData.available_orders.data.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                            {dashboardData.available_orders.data.map((order) => (
                                <div key={order.id} className="bg-pink-50/30 border border-pink-100 rounded-2xl p-4 flex flex-col w-full">
                                    {/* Header with Avatar and Name */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {order.orderer.avatar_url ? (
                                                <img
                                                    src={imageUtils.getImageUrl(order.orderer.avatar_url)}
                                                    alt={order.orderer.full_name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                />
                                            ) : (
                                                <span className="text-gray-600 font-bold text-lg">{order.orderer.full_name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-xs md:text-base truncate">{order.orderer.full_name}</h3>
                                            <div className="flex items-center gap-1">
                                                <span className="font-semibold text-gray-900 text-xs">{order.orderer.rating}</span>
                                                <span className="text-orange-400 text-xs">★</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items and Reward Section */}
                                    <div className="bg-white rounded-xl p-3 mb-4 flex-1 flex items-center justify-between">
                                        {/* Item Images */}
                                        <div className="flex gap-2">
                                            {order.items_images && order.items_images.length > 0 && order.items_images.slice(0, 3).map((img, idx) => (
                                                <div key={idx} className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={imageUtils.getImageUrl(img)} alt="Item" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {order.items_count > 3 && (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-600 font-semibold flex-shrink-0">
                                                    +{order.items_count - 3}
                                                </div>
                                            )}
                                        </div>

                                        {/* Total Items and Reward */}
                                        <div className="text-right">
                                            <p className="text-xs text-gray-600 font-medium">Total items {order.items_count}</p>
                                            <p className="font-bold text-red-900 text-sm">Reward: ${order.reward_amount}</p>
                                        </div>
                                    </div>

                                    {/* Footer Button */}
                                    <button
                                        onClick={() => navigate(`/picker/orders/${order.id}`)}
                                        className="w-full bg-[#4D0013] text-white py-2 md:py-3 rounded-lg font-bold hover:bg-[#660019] transition-colors text-xs md:text-base"
                                    >
                                        View Order Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No orders available for your routes yet.</p>
                            <p className="text-gray-400 text-sm mt-2">Create a journey to see matching orders from orderers.</p>
                        </div>
                    )}
                </div>

                <MobileFooter activeTab="home" />
            </div>
        </div>
    );
};

export default PickerDashboard;
