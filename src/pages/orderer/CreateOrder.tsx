import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { profileApi, ordersApi } from '../../api';
import { API_CONFIG } from '../../config/api';
import { useOrder } from '../../context/OrderContext';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';

const CreateOrder = () => {
    const navigate = useNavigate();
    const { orderData, updateOrderData } = useOrder();
    const [currentStep, setCurrentStep] = useState(1);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        originCountry: orderData.originCountry || '',
        originCity: orderData.originCity || '',
        destinationCountry: orderData.destinationCountry || '',
        destinationCity: orderData.destinationCity || '',
        useLocation: false,
        specialNotes: orderData.specialNotes || '',
    });

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

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNext = async () => {
        if (currentStep < 3) {
            if (currentStep === 1) {
                setLoading(true);
                try {
                    // Save order to backend immediately
                    const orderPayload: any = {
                        origin_country: formData.originCountry,
                        origin_city: formData.originCity,
                        destination_country: formData.destinationCountry,
                        destination_city: formData.destinationCity,
                    };
                    
                    if (formData.specialNotes.trim()) {
                        orderPayload.special_notes = formData.specialNotes;
                    }
                    
                    const res = await ordersApi.createOrder(orderPayload);

                    const orderId = (res as any).data.id;
                    updateOrderData({
                        originCountry: formData.originCountry,
                        originCity: formData.originCity,
                        destinationCountry: formData.destinationCountry,
                        destinationCity: formData.destinationCity,
                        specialNotes: formData.specialNotes,
                        orderId,
                    });
                    navigate('/orderer/create-order-step2');
                } catch (error) {
                    console.error('Failed to create order:', error);
                    alert('Failed to create order. Please try again.');
                } finally {
                    setLoading(false);
                }
            } else {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate(-1);
        }
    };

    const handleAvatarError = () => {
        setAvatarError(true);
        setAvatarUrl(null);
    };

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

    return (
        <div className="flex h-dvh bg-white flex-col md:flex-row">
            <DashboardSidebar activeTab="dashboard" />

            <div className="flex-1 flex flex-col h-dvh md:h-screen overflow-hidden relative">
                {/* Mobile Header with Back Button */}
                <div className="bg-white px-4 py-3 md:hidden flex items-center gap-3 border-b border-gray-200">
                    <button
                        onClick={handleBack}
                        className="w-10 h-10 rounded-full bg-[#FFDF57] flex items-center justify-center hover:bg-yellow-500 transition-colors flex-shrink-0"
                    >
                        <ArrowLeft size={20} className="text-gray-900" />
                    </button>
                    {/* Step Indicator - Mobile */}
                    <div className="flex gap-1.5 flex-1 justify-center">
                        {[1, 2, 3].map(step => (
                            <div
                                key={step}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    step === currentStep
                                        ? 'bg-[#FFDF57]'
                                        : step < currentStep
                                        ? 'bg-gray-400'
                                        : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                    <div className="w-10 flex-shrink-0" />
                </div>

                {/* Desktop Header */}
                <div className="hidden md:block">
                    <DashboardHeader 
                        title="Dashboard" 
                        avatarUrl={avatarUrl}
                        avatarError={avatarError}
                        onAvatarError={handleAvatarError}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-12 pb-24 md:pb-0 bg-white">
                    {/* Desktop Step Indicator */}
                    <div className="hidden md:flex justify-center gap-2 mb-8">
                        {[1, 2, 3].map(step => (
                            <div
                                key={step}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                    step === currentStep
                                        ? 'bg-[#FFDF57]'
                                        : step < currentStep
                                        ? 'bg-gray-400'
                                        : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Form Container */}
                    <div className="max-w-2xl mx-auto md:bg-white md:rounded-2xl md:p-8 md:shadow-[0_2px_15px_rgba(0,0,0,0.05)] md:border md:border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Route</h2>
                        <p className="text-gray-600 mb-6 md:mb-8">Add delivery route you want to order products</p>

                        {/* Step 1: Delivery Route */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                {/* Origin Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin size={20} className="text-gray-900 flex-shrink-0" />
                                        <label className="text-gray-900 font-semibold text-sm md:text-base">Choose country and city you want to order</label>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-gray-600 mb-2">Country</label>
                                            <select
                                                value={formData.originCountry}
                                                onChange={(e) => handleInputChange('originCountry', e.target.value)}
                                                className="w-full px-3 md:px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm md:text-base"
                                            >
                                                <option value="">Select country</option>
                                                {countries.map(country => (
                                                    <option key={country} value={country}>{country}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-gray-600 mb-2">City</label>
                                            <select
                                                value={formData.originCity}
                                                onChange={(e) => handleInputChange('originCity', e.target.value)}
                                                className="w-full px-3 md:px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm md:text-base"
                                            >
                                                <option value="">Select city</option>
                                                {cityMap[formData.originCountry]?.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Destination Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin size={20} className="text-gray-900 flex-shrink-0" />
                                        <label className="text-gray-900 font-semibold text-sm md:text-base">Choose receiving country and city</label>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-gray-600 mb-2">Country</label>
                                            <select
                                                value={formData.destinationCountry}
                                                onChange={(e) => handleInputChange('destinationCountry', e.target.value)}
                                                className="w-full px-3 md:px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm md:text-base"
                                            >
                                                <option value="">Select country</option>
                                                {countries.map(country => (
                                                    <option key={country} value={country}>{country}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-gray-600 mb-2">City</label>
                                            <select
                                                value={formData.destinationCity}
                                                onChange={(e) => handleInputChange('destinationCity', e.target.value)}
                                                className="w-full px-3 md:px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm md:text-base"
                                            >
                                                <option value="">Select city</option>
                                                {cityMap[formData.destinationCountry]?.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Use Location */}
                                <div className="flex items-center gap-3 py-2">
                                    <input
                                        type="radio"
                                        id="useLocation"
                                        checked={formData.useLocation}
                                        onChange={(e) => handleInputChange('useLocation', e.target.checked)}
                                        className="w-5 h-5 text-green-500 cursor-pointer flex-shrink-0"
                                    />
                                    <label htmlFor="useLocation" className="text-gray-900 font-medium cursor-pointer text-sm md:text-base">Use my location</label>
                                </div>

                                {/* Special Notes */}
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-600 mb-2">Special notes <span className="text-gray-400">(optional)</span></label>
                                    <textarea
                                        value={formData.specialNotes}
                                        onChange={(e) => handleInputChange('specialNotes', e.target.value)}
                                        placeholder="Write here"
                                        className="w-full px-3 md:px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] resize-none text-sm md:text-base"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2 & 3 Placeholder */}
                        {currentStep === 2 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">Step 2: Order Details</p>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">Step 3: Review & Confirm</p>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 md:mt-8">
                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="w-full px-6 py-3 md:py-3 bg-[#FFDF57] text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-base md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : (currentStep === 3 ? 'Submit' : 'Next')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrder;
