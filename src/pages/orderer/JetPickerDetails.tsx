import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { profileApi } from '../../api';
import { API_CONFIG } from '../../config/api';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';

const JetPickerDetails = () => {
    const location = useLocation();
    const traveler = location.state?.traveler;

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState(false);

    const details = {
        ...traveler,
        flyingDate: '15 Jan 2025',
        completedDeliveries: 100
    };

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
                        : `${baseUrl}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
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
                    title="Details"
                    showBackButton={true}
                    avatarUrl={avatarUrl}
                    avatarError={avatarError}
                    onAvatarError={handleAvatarError}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-white pb-24 md:pb-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">JetPicker Details</h2>

                    <div className="max-w-xl mx-auto md:mx-0">
                        <div className="bg-white rounded-lg p-6 shadow-[0_2px_15px_rgba(0,0,0,0.05)] border border-gray-100 mb-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt={details?.name || "Traveler"} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{details?.name || "Methew M."}</h3>
                                    <div className="flex items-center text-sm">
                                        <span className="font-bold text-gray-900 mr-1">{details?.rating || 4.8}</span>
                                        <span className="text-orange-400">★</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#FFF8D6] py-2 px-4 rounded-md mb-4 text-center">
                                <p className="text-sm font-bold text-gray-900">{details?.route || "From London - Madrid"}</p>
                                <p className="text-xs font-medium text-gray-700">{details?.date || "25 Nov"}</p>
                            </div>

                            <div className="space-y-3 text-sm font-medium text-gray-900">
                                <p>Available space: {details?.space || "10kg"}</p>
                                <p>Fee: {details?.fee || "$10/kg"}</p>
                                <p>flying date: {details?.flyingDate}</p>
                                <p>Completed deliveries: {details?.completedDeliveries}</p>
                            </div>
                        </div>

                        <button className="w-full bg-[#FFDF57] text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors shadow-sm">
                            Select JetPicker
                        </button>
                    </div>
                </div>

                <MobileFooter activeTab="home" />
            </div>
        </div>
    );
};

export default JetPickerDetails;
