import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { profileApi } from '../../api';
import { API_CONFIG } from '../../config/api';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';

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

const JetPickerDetails = () => {
    const location = useLocation();
    const picker = location.state?.picker as Picker | undefined;

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
                            {picker ? (
                                <>
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                            {picker.picker.avatar_url ? (
                                                <img 
                                                    src={picker.picker.avatar_url.startsWith('http') 
                                                        ? picker.picker.avatar_url 
                                                        : `${API_CONFIG.BASE_URL.replace('/api', '')}${picker.picker.avatar_url}`}
                                                    alt={picker.picker.full_name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                                                    {picker.picker.full_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{picker.picker.full_name}</h3>
                                            <div className="flex items-center text-sm">
                                                <span className="font-bold text-gray-900 mr-1">{picker.picker.rating}</span>
                                                <span className="text-orange-400">★</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#FFF8D6] py-2 px-4 rounded-md mb-4 text-center">
                                        <p className="text-sm font-bold text-gray-900">
                                            {picker.departure_city}, {picker.departure_country} → {picker.arrival_city}, {picker.arrival_country}
                                        </p>
                                        <p className="text-xs font-medium text-gray-700">
                                            {new Date(picker.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>

                                    <div className="space-y-3 text-sm font-medium text-gray-900">
                                        <p>Luggage Capacity: {picker.luggage_weight_capacity}kg</p>
                                        <p>Arrival Date: {new Date(picker.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p>Completed Deliveries: {picker.picker.completed_deliveries}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No picker information available</p>
                                </div>
                            )}
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
