import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Luggage, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import { travelApi, profileApi } from '../../api';
import { API_CONFIG } from '../../config/api';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import type { TravelJourneyPayload } from '../../@types/index';

const TravelAvailabilitySetup = () => {
    const navigate = useNavigate();
    const [useLocationCheckbox, setUseLocationCheckbox] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState(false);

    const [formData, setFormData] = useState({
        departure_country: 'UK',
        departure_city: 'London',
        departure_date: '',
        arrival_country: 'United States',
        arrival_city: 'New York',
        arrival_date: '',
        luggage_weight_capacity: '5',
    });

    const countries = ['UK', 'Spain', 'United States', 'France', 'Germany', 'Italy', 'Canada', 'Australia'];
    
    const cityMap: { [key: string]: string[] } = {
        'UK': ['London'],
        'Spain': ['Madrid', 'Barcelona'],
        'United States': ['New York', 'Los Angeles'],
        'France': ['Paris'],
        'Germany': ['Berlin'],
        'Italy': ['Rome'],
        'Canada': ['Toronto'],
        'Australia': ['Sydney'],
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleContinue = async () => {
        if (!formData.departure_date || !formData.arrival_date) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload: TravelJourneyPayload = {
                departure_country: formData.departure_country,
                departure_city: formData.departure_city,
                departure_date: formData.departure_date,
                arrival_country: formData.arrival_country,
                arrival_city: formData.arrival_city,
                arrival_date: formData.arrival_date,
                luggage_weight_capacity: formData.luggage_weight_capacity,
            };

            console.log('Sending payload:', payload);
            const response = await travelApi.createJourney(payload);
            console.log('Response:', response);
            navigate('/picker/dashboard');
        } catch (err: any) {
            console.error('Error:', err);
            const errorMessage = err?.message || 'Failed to save travel details. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/picker/dashboard');
    };

    const handleAvatarError = () => {
        setAvatarError(true);
        setAvatarUrl(null);
    };

    return (
        <div className="flex h-screen bg-white flex-col md:flex-row">
            <DashboardSidebar activeTab="dashboard" />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader
                    title="Create Journey"
                    showBackButton={true}
                    avatarUrl={avatarUrl}
                    avatarError={avatarError}
                    onAvatarError={handleAvatarError}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-6">
                            <h1 className="text-[22px] font-bold text-gray-900 mb-1">Travel Availability Setup</h1>
                            <p className="text-gray-500 text-xs font-medium">Share your travel details to get relevant Jetorders</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs">
                                {error}
                            </div>
                        )}

                        {/* Departure Section */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin size={20} className="text-gray-900" />
                                <label className="text-gray-900 font-bold text-sm">Departure country and city</label>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-gray-700 font-bold text-xs mb-0.5 block">Country</label>
                                    <select
                                        name="departure_country"
                                        value={formData.departure_country}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent border-b-2 border-yellow-400 text-gray-700 font-semibold text-sm focus:outline-none focus:border-yellow-500 pb-1"
                                    >
                                        {countries.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-gray-700 font-bold text-xs mb-0.5 block">City</label>
                                    <select
                                        name="departure_city"
                                        value={formData.departure_city}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent text-gray-700 font-semibold text-sm focus:outline-none pb-1"
                                    >
                                        {cityMap[formData.departure_country]?.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Arrival Section */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin size={20} className="text-gray-900" />
                                <label className="text-gray-900 font-bold text-sm">Arrival country and city</label>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-gray-700 font-bold text-xs mb-0.5 block">Country</label>
                                    <select
                                        name="arrival_country"
                                        value={formData.arrival_country}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent border-b-2 border-yellow-400 text-gray-700 font-semibold text-sm focus:outline-none focus:border-yellow-500 pb-1"
                                    >
                                        {countries.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-gray-700 font-bold text-xs mb-0.5 block">City</label>
                                    <select
                                        name="arrival_city"
                                        value={formData.arrival_city}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent text-gray-700 font-semibold text-sm focus:outline-none pb-1"
                                    >
                                        {cityMap[formData.arrival_country]?.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Departure Date */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar size={20} className="text-gray-900" />
                                <label className="text-gray-900 font-bold text-sm">Departure Date</label>
                            </div>

                            <div className="flex-1">
                                <p className="text-gray-700 font-semibold text-xs mb-0.5">Select date</p>
                                <input
                                    type="date"
                                    name="departure_date"
                                    value={formData.departure_date}
                                    onChange={handleInputChange}
                                    className="w-full bg-transparent border-b-2 border-yellow-400 text-gray-700 font-semibold text-sm focus:outline-none focus:border-yellow-500 pb-1"
                                />
                            </div>
                        </div>

                        {/* Arrival Date */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar size={20} className="text-gray-900" />
                                <label className="text-gray-900 font-bold text-sm">Arrival Date</label>
                            </div>

                            <div className="flex-1">
                                <p className="text-gray-700 font-semibold text-xs mb-0.5">Select date</p>
                                <input
                                    type="date"
                                    name="arrival_date"
                                    value={formData.arrival_date}
                                    onChange={handleInputChange}
                                    className="w-full bg-transparent border-b-2 border-yellow-400 text-gray-700 font-semibold text-sm focus:outline-none focus:border-yellow-500 pb-1"
                                />
                            </div>
                        </div>

                        {/* Luggage */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Luggage size={20} className="text-gray-900" />
                                <label className="text-gray-900 font-bold text-sm">Luggage</label>
                            </div>

                            <select
                                name="luggage_weight_capacity"
                                value={formData.luggage_weight_capacity}
                                onChange={handleInputChange}
                                className="w-full bg-transparent border-b-2 border-yellow-400 text-gray-700 font-semibold text-sm focus:outline-none focus:border-yellow-500 pb-1"
                            >
                                <option value="5">5 kg</option>
                                <option value="10">10 kg</option>
                                <option value="15">15 kg</option>
                                <option value="20">20 kg</option>
                                <option value="25">25 kg</option>
                                <option value="30">30 kg</option>
                            </select>
                        </div>

                        {/* Use Location */}
                        <div className="mb-6 flex items-center gap-3">
                            <button
                                onClick={() => setUseLocationCheckbox(!useLocationCheckbox)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                    useLocationCheckbox ? 'bg-green-500 border-green-500' : 'border-green-500'
                                }`}
                            >
                                {useLocationCheckbox && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                            <span className="text-gray-900 font-semibold text-sm">Use my location</span>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3 mt-8">
                            <Button 
                                onClick={handleContinue} 
                                className="w-full py-3 text-sm tracking-wide rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Continue'}
                            </Button>
                            <button
                                onClick={handleSkip}
                                className="w-full py-3 text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                Skip for Now
                            </button>
                        </div>
                    </div>
                </div>

                <MobileFooter activeTab="home" />
            </div>
        </div>
    );
};

export default TravelAvailabilitySetup;
