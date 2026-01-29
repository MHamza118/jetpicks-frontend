import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Luggage, Calendar, ChevronDown } from 'lucide-react';
import Button from '../../components/ui/Button';
import { travelApi, profileApi, locationsApi } from '../../services';
import type { Country } from '../../services/locations';
import { imageUtils } from '../../utils';
import FlagIcon from '../../components/FlagIcon';
import DashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import type { TravelJourneyPayload } from '../../@types/index';

const TravelAvailabilitySetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isFromDashboard = location.pathname === '/picker/create-journey';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState(false);
    const [countries, setCountries] = useState<{ [key: string]: Country }>({});
    const [countryList, setCountryList] = useState<string[]>([]);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

    const [formData, setFormData] = useState({
        departure_country: '',
        departure_city: '',
        departure_date: '',
        arrival_country: '',
        arrival_city: '',
        arrival_date: '',
        luggage_weight_capacity: '5',
    });

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countriesData = await locationsApi.getCountries();
                setCountries(countriesData);
                const codes = Object.keys(countriesData);
                setCountryList(codes);
                // Set default values
                if (codes.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        departure_country: codes[0],
                        departure_city: countriesData[codes[0]].cities[0],
                        arrival_country: codes[1] || codes[0],
                        arrival_city: countriesData[codes[1] || codes[0]].cities[0],
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch countries:', error);
            }
        };

        fetchCountries();
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await profileApi.getProfile();
                const profile = response.data;
                if (profile?.avatar_url) {
                    const fullUrl = imageUtils.getImageUrl(profile.avatar_url);
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

    const getCountryName = (code: string) => {
        return countries[code]?.name || code;
    };

    const getCitiesForCountry = (countryCode: string) => {
        return countries[countryCode]?.cities || [];
    };

    const filterCountries = (search: string) => {
        if (!search) return countryList;
        return countryList.filter(code => 
            getCountryName(code).toLowerCase().includes(search.toLowerCase()) ||
            code.toLowerCase().includes(search.toLowerCase())
        );
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
        <div className={isFromDashboard ? "flex h-screen bg-white flex-col md:flex-row" : "min-h-screen w-full flex items-center justify-center bg-white overflow-hidden py-6"}>
            {isFromDashboard && <DashboardSidebar activeTab="dashboard" />}

            <div className={isFromDashboard ? "flex-1 flex flex-col h-full overflow-hidden relative" : "w-full max-w-[600px] mx-auto"}>
                {isFromDashboard && (
                    <PickerDashboardHeader
                        title="Create Journey"
                        showBackButton={true}
                        avatarUrl={avatarUrl}
                        avatarError={avatarError}
                        onAvatarError={handleAvatarError}
                    />
                )}

                <div className={isFromDashboard ? "flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white" : "border border-gray-200 bg-white rounded-[32px] p-8 shadow-lg"}>
                    <div className={isFromDashboard ? "max-w-2xl mx-auto" : ""}>
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
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                setOpenDropdown(openDropdown === 'departure_country' ? null : 'departure_country');
                                                setSearchText(prev => ({ ...prev, departure_country: '' }));
                                            }}
                                            className="w-full bg-transparent border-b-2 border-yellow-400 text-gray-700 font-semibold text-sm focus:outline-none focus:border-yellow-500 pb-1 flex items-center justify-between hover:opacity-80"
                                        >
                                            <span className="flex items-center gap-2">
                                                {formData.departure_country && (
                                                    <>
                                                        <FlagIcon countryCode={formData.departure_country} className="w-4 h-4" />
                                                        {getCountryName(formData.departure_country)}
                                                    </>
                                                )}
                                                {!formData.departure_country && <span className="text-gray-500">Select country</span>}
                                            </span>
                                            <ChevronDown size={14} className={`transition-transform ${openDropdown === 'departure_country' ? 'rotate-180' : ''}`} />
                                        </button>
                                        {openDropdown === 'departure_country' && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                                <input
                                                    type="text"
                                                    placeholder="Search countries..."
                                                    value={searchText.departure_country || ''}
                                                    onChange={(e) => setSearchText(prev => ({ ...prev, departure_country: e.target.value }))}
                                                    className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none text-sm"
                                                    autoFocus
                                                />
                                                <div className="max-h-48 overflow-y-auto">
                                                    {filterCountries(searchText.departure_country || '').map(code => (
                                                        <button
                                                            key={code}
                                                            onClick={() => {
                                                                handleInputChange({ target: { name: 'departure_country', value: code } } as any);
                                                                setOpenDropdown(null);
                                                                setSearchText(prev => ({ ...prev, departure_country: '' }));
                                                            }}
                                                            className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-yellow-50 transition-colors"
                                                        >
                                                            <FlagIcon countryCode={code} className="w-4 h-4" />
                                                            {getCountryName(code)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-gray-700 font-bold text-xs mb-0.5 block">City</label>
                                    <select
                                        name="departure_city"
                                        value={formData.departure_city}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent text-gray-700 font-semibold text-sm focus:outline-none pb-1"
                                    >
                                        {getCitiesForCountry(formData.departure_country).map(city => (
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
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                setOpenDropdown(openDropdown === 'arrival_country' ? null : 'arrival_country');
                                                setSearchText(prev => ({ ...prev, arrival_country: '' }));
                                            }}
                                            className="w-full bg-transparent border-b-2 border-yellow-400 text-gray-700 font-semibold text-sm focus:outline-none focus:border-yellow-500 pb-1 flex items-center justify-between hover:opacity-80"
                                        >
                                            <span className="flex items-center gap-2">
                                                {formData.arrival_country && (
                                                    <>
                                                        <FlagIcon countryCode={formData.arrival_country} className="w-4 h-4" />
                                                        {getCountryName(formData.arrival_country)}
                                                    </>
                                                )}
                                                {!formData.arrival_country && <span className="text-gray-500">Select country</span>}
                                            </span>
                                            <ChevronDown size={14} className={`transition-transform ${openDropdown === 'arrival_country' ? 'rotate-180' : ''}`} />
                                        </button>
                                        {openDropdown === 'arrival_country' && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                                <input
                                                    type="text"
                                                    placeholder="Search countries..."
                                                    value={searchText.arrival_country || ''}
                                                    onChange={(e) => setSearchText(prev => ({ ...prev, arrival_country: e.target.value }))}
                                                    className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none text-sm"
                                                    autoFocus
                                                />
                                                <div className="max-h-48 overflow-y-auto">
                                                    {filterCountries(searchText.arrival_country || '').map(code => (
                                                        <button
                                                            key={code}
                                                            onClick={() => {
                                                                handleInputChange({ target: { name: 'arrival_country', value: code } } as any);
                                                                setOpenDropdown(null);
                                                                setSearchText(prev => ({ ...prev, arrival_country: '' }));
                                                            }}
                                                            className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-yellow-50 transition-colors"
                                                        >
                                                            <FlagIcon countryCode={code} className="w-4 h-4" />
                                                            {getCountryName(code)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-gray-700 font-bold text-xs mb-0.5 block">City</label>
                                    <select
                                        name="arrival_city"
                                        value={formData.arrival_city}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent text-gray-700 font-semibold text-sm focus:outline-none pb-1"
                                    >
                                        {getCitiesForCountry(formData.arrival_country).map(city => (
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

                {isFromDashboard && <MobileFooter activeTab="home" />}
            </div>
        </div>
    );
};

export default TravelAvailabilitySetup;
