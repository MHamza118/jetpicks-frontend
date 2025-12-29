import { useState, useEffect } from 'react';
import { MapPin, Calendar, Luggage } from 'lucide-react';
import { profileApi } from '../../api';
import { API_CONFIG } from '../../config/api';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';

interface Order {
    id: string;
    ordererName: string;
    rating: number;
    route: string;
    date: string;
    luggage: string;
    reward: string;
}

const PickerDashboard = () => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState(false);
    const [orders] = useState<Order[]>([
        {
            id: '1',
            ordererName: 'Sarah J.',
            rating: 4.9,
            route: 'Madrid - New York',
            date: '28 Nov',
            luggage: '5kg',
            reward: '$50',
        },
        {
            id: '2',
            ordererName: 'John D.',
            rating: 4.7,
            route: 'Barcelona - London',
            date: '30 Nov',
            luggage: '8kg',
            reward: '$75',
        },
        {
            id: '3',
            ordererName: 'Emma L.',
            rating: 4.8,
            route: 'Valencia - Paris',
            date: '02 Dec',
            luggage: '6kg',
            reward: '$60',
        },
    ]);

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

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') fetchUserProfile();
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
                    {/* Hero Section */}
                    <div className="bg-blue-100 rounded-3xl p-8 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Orders</h2>
                                <p className="text-gray-700">Browse and accept orders that match your travel plans</p>
                            </div>
                            <div className="text-5xl">📦</div>
                        </div>
                    </div>

                    {/* Orders Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-gray-600 text-sm font-semibold">O</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{order.ordererName}</h3>
                                        <p className="text-sm text-yellow-500 font-semibold">{order.rating} ⭐</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <MapPin size={16} className="text-gray-600" />
                                        <span>{order.route}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Calendar size={16} className="text-gray-600" />
                                        <span>{order.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Luggage size={16} className="text-gray-600" />
                                        <span>{order.luggage}</span>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-gray-600">Reward</p>
                                    <p className="text-lg font-bold text-gray-900">{order.reward}</p>
                                </div>

                                <button className="w-full bg-[#FFDF57] text-gray-900 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <MobileFooter activeTab="home" />
            </div>
        </div>
    );
};

export default PickerDashboard;
