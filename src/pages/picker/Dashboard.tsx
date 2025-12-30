import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, profileApi } from '../../api';
import type { PickerDashboardData } from '../../api/dashboard';
import { API_CONFIG } from '../../config/api';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import dashboardHero from '../../assets/dashboard.jpeg';
// Import or create a hero image. For now, we can use a placeholder or CSS art.
// If there is no exact match in assets, we'll design it with CSS.

const PickerDashboard = () => {
    const navigate = useNavigate();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState(false);
    const [dashboardData, setDashboardData] = useState<PickerDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, dashboardRes] = await Promise.all([
                    profileApi.getProfile(),
                    dashboardApi.getPickerDashboard()
                ]);

                // Profile Image Logic
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

                setDashboardData((dashboardRes as any).data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Visibility change to refresh profile if updated in another tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') fetchData();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const handleAvatarError = () => {
        setAvatarError(true);
        setAvatarUrl(null);
    };

    return (
        <div className="flex h-screen bg-white flex-col md:flex-row">
            <DashboardSidebar activeTab="dashboard" />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader
                    title="Dashboard"
                    avatarUrl={avatarUrl}
                    avatarError={avatarError}
                    onAvatarError={handleAvatarError}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
                    {/* Top Stats / Journey Context (Optional based on Screenshot) 
                        The screenshot showed "From London - Madrid 12 Dec". 
                        We can show active journey or just a welcome message. 
                    */}
                    {dashboardData?.travel_journeys && dashboardData.travel_journeys.length > 0 && (
                        <div className="text-center mb-6">
                            <p className="text-gray-900 font-semibold text-lg">
                                From {dashboardData.travel_journeys[0].departure_city} - {dashboardData.travel_journeys[0].arrival_city} {' '}
                                <span className="text-gray-500">{new Date(dashboardData.travel_journeys[0].departure_date).toLocaleDateString()}</span>
                            </p>
                        </div>
                    )}

                    {/* Hero Section */}
                    <div className="rounded-3xl mb-8 relative overflow-hidden min-h-[250px] flex flex-col items-center justify-end text-center group">
                        <img
                            src={dashboardHero}
                            alt="Dashboard Hero"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Button Overlay */}
                        <div className="relative z-10 mb-8">
                            <button
                                onClick={() => navigate('/picker/create-journey')}
                                className="bg-[#FFDF57] text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-yellow-500 transition-colors transform hover:-translate-y-1"
                            >
                                Create New Journey
                            </button>
                        </div>
                    </div>

                    {/* Orders Grid */}
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFDF57]"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dashboardData?.available_orders.data.map((order) => (
                                <div key={order.id} className="bg-pink-50/30 border border-pink-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={order.orderer.avatar_url || 'https://via.placeholder.com/40'}
                                            alt={order.orderer.full_name}
                                            className="w-12 h-12 rounded-full object-cover bg-gray-200"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40' }}
                                        />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{order.orderer.full_name}</h3>
                                            <div className="flex items-center gap-1">
                                                <span className="font-semibold text-gray-900">{order.orderer.rating}</span>
                                                <span className="text-orange-400">★</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="flex items-start justify-between mb-4 bg-white p-3 rounded-xl border border-gray-100">
                                        <div className="flex gap-2">
                                            {/* Item Images - Limit to 3 */}
                                            {order.items_images && order.items_images.slice(0, 3).map((img, idx) => (
                                                <div key={idx} className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={img.startsWith('http') ? img : `${API_CONFIG.BASE_URL.replace('/api', '')}${img}`} alt="Item" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {order.items_count > 3 && (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 font-medium">
                                                    +{order.items_count - 3} Items
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Total items {order.items_count}</p>
                                            <p className="font-bold text-red-900 mt-1">Reward: ${order.reward_amount}</p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <button
                                        onClick={() => navigate(`/picker/orders/${order.id}`)}
                                        className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                                    >
                                        View Order Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <MobileFooter activeTab="home" />
            </div>
        </div>
    );
};

export default PickerDashboard;
