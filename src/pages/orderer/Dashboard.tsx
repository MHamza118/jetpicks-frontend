import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../../api';
import { API_CONFIG } from '../../config/api';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import dashboardImage from '../../assets/dashboard.jpeg';

interface Traveler {
    id: string;
    name: string;
    rating: number;
    route: string;
    date: string;
    space: string;
    fee: string;
}

const OrdererDashboard = () => {
    const navigate = useNavigate();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState(false);
    const [travelers] = useState<Traveler[]>([
        {
            id: '1',
            name: 'Methew M.',
            rating: 4.8,
            route: 'From London - Madrid',
            date: '25 Nov',
            space: '10kg',
            fee: '$10/kg',
        },
        {
            id: '2',
            name: 'Mathew M.',
            rating: 4.8,
            route: 'From London - Madrid',
            date: '25 Nov',
            space: '10kg',
            fee: '$10/kg',
        },
        {
            id: '3',
            name: 'Mathew M.',
            rating: 4.8,
            route: 'From London - Madrid',
            date: '25 Nov',
            space: '10kg',
            fee: '$10/kg',
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
                    <div className="mb-8 rounded-3xl overflow-hidden h-40 md:h-56 relative flex items-end justify-center pb-6 md:pb-8">
                        <img src={dashboardImage} alt="Dashboard" className="w-full h-full object-cover absolute inset-0" />
                        <button className="relative bg-[#FFDF57] text-gray-900 px-6 py-2 rounded-full font-bold text-sm md:text-base hover:bg-yellow-500 transition-colors shadow-lg">
                            Create An Order
                        </button>
                    </div>

                    {/* Available Pickers Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900">Available jet pickers near you</h2>
                            <button className="bg-[#FFDF57] px-4 py-1.5 rounded-full text-xs font-bold text-gray-900">See all</button>
                        </div>

                        {/* Travelers Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {travelers.map(traveler => (
                                <div key={traveler.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                                            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt={traveler.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-base">{traveler.name}</h3>
                                            <div className="flex items-center text-sm">
                                                <span className="font-bold text-gray-900 mr-1">{traveler.rating}</span>
                                                <span className="text-orange-400">★</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#FFF8D6] rounded-xl p-3 mb-4 text-center">
                                        <p className="text-sm font-bold text-gray-900 mb-0.5">{traveler.route}</p>
                                        <p className="text-xs font-medium text-gray-600">{traveler.date}</p>
                                    </div>

                                    <div className="flex justify-between text-xs mb-4 font-semibold">
                                        <span className="text-gray-900">Available space: {traveler.space}</span>
                                        <span className="text-gray-900">Fee: {traveler.fee}</span>
                                    </div>

                                    <button
                                        onClick={() => navigate('/orderer/jetpicker-details', { state: { traveler } })}
                                        className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors shadow-sm"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <MobileFooter activeTab="home" />
            </div>
        </div>
    );
};

export default OrdererDashboard;
