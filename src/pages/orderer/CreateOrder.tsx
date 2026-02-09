import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ArrowLeft, ChevronDown } from 'lucide-react';
import { ordersApi } from '../../services';
import { locationsApi } from '../../services/locations';
import type { Country } from '../../services/locations';
import { useOrder } from '../../context/OrderContext';
import { useUser } from '../../context/UserContext';
import FlagIcon from '../../components/FlagIcon';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';

const CreateOrder = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderData, updateOrderData } = useOrder();
    const { avatarUrl, avatarError, handleAvatarError } = useUser();
    
    const selectedPicker = location.state?.selectedPicker;
    const pickerRoute = location.state?.pickerRoute;
    
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<{ [key: string]: string }>({});
    const [loadingCities, setLoadingCities] = useState<{ [key: string]: boolean }>({});
    const [citiesMap, setCitiesMap] = useState<{ [key: string]: string[] }>({});
    const [formData, setFormData] = useState({
        originCountry: pickerRoute?.departure_country || orderData.originCountry || '',
        originCity: pickerRoute?.departure_city || orderData.originCity || '',
        destinationCountry: pickerRoute?.arrival_country || orderData.destinationCountry || '',
        destinationCity: pickerRoute?.arrival_city || orderData.destinationCity || '',
        specialNotes: orderData.specialNotes || '',
    });
    const [countryCodeMap, setCountryCodeMap] = useState<{ [key: string]: string }>({});
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countriesData = await locationsApi.getCountries();
                setCountries(countriesData);
                // Build a map of country names to codes for easy lookup
                const codeMap: { [key: string]: string } = {};
                countriesData.forEach(country => {
                    codeMap[country.name] = country.code;
                });
                setCountryCodeMap(codeMap);
            } catch (error) {
                console.error('Failed to fetch countries:', error);
            }
        };

        fetchCountries();
    }, []);

    // Check for existing DRAFT order on mount
    useEffect(() => {
        const checkExistingDraft = async () => {
            if (!orderData.orderId && !pickerRoute) {
                try {
                    const res = await ordersApi.getActiveDraftOrder();
                    const orders = (res as any).data?.data || [];
                    if (orders.length > 0) {
                        const draftOrder = orders[0];
                        updateOrderData({
                            orderId: draftOrder.id,
                            originCountry: draftOrder.origin_country,
                            originCity: draftOrder.origin_city,
                            destinationCountry: draftOrder.destination_country,
                            destinationCity: draftOrder.destination_city,
                            specialNotes: draftOrder.special_notes || '',
                        });
                        setFormData({
                            originCountry: draftOrder.origin_country,
                            originCity: draftOrder.origin_city,
                            destinationCountry: draftOrder.destination_country,
                            destinationCity: draftOrder.destination_city,
                            specialNotes: draftOrder.special_notes || '',
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch draft order:', error);
                }
            }
        };

        checkExistingDraft();
    }, []);

    useEffect(() => {
        // Pre-fill form if coming from picker selection
        if (pickerRoute) {
            setFormData(prev => ({
                ...prev,
                originCountry: pickerRoute.departure_country,
                originCity: pickerRoute.departure_city,
                destinationCountry: pickerRoute.arrival_country,
                destinationCity: pickerRoute.arrival_city,
            }));
        }
    }, [pickerRoute]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNext = async () => {
        if (currentStep < 4) {
            if (currentStep === 1) {
                setLoading(true);
                try {
                    let orderId = orderData.orderId;

                    // Only create a new order if one doesn't exist
                    if (!orderId) {
                        const orderPayload: any = {
                            origin_country: formData.originCountry,
                            origin_city: formData.originCity,
                            destination_country: formData.destinationCountry,
                            destination_city: formData.destinationCity,
                        };
                        
                        if (formData.specialNotes.trim()) {
                            orderPayload.special_notes = formData.specialNotes;
                        }

                        // Add picker_id if this order was created from picker selection
                        if (selectedPicker?.picker?.id) {
                            orderPayload.picker_id = selectedPicker.picker.id;
                        } else {
                            // Only set status to DRAFT for common flow (no picker selected)
                            orderPayload.status = 'DRAFT';
                        }
                        
                        const res = await ordersApi.createOrder(orderPayload);
                        orderId = (res as any).data.id;
                    }

                    updateOrderData({
                        originCountry: formData.originCountry,
                        originCity: formData.originCity,
                        destinationCountry: formData.destinationCountry,
                        destinationCity: formData.destinationCity,
                        specialNotes: formData.specialNotes,
                        orderId,
                        selectedPickerId: selectedPicker?.picker?.id,
                    });
                    navigate(`/orderer/create-order/${orderId}/step2`);
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

    const getCitiesForCountry = async (countryName: string) => {
        if (citiesMap[countryName]) {
            return citiesMap[countryName];
        }

        setLoadingCities(prev => ({ ...prev, [countryName]: true }));
        try {
            const cities = await locationsApi.getCities(countryName);
            setCitiesMap(prev => ({ ...prev, [countryName]: cities }));
            return cities;
        } catch (error) {
            console.error('Failed to fetch cities:', error);
            return [];
        } finally {
            setLoadingCities(prev => ({ ...prev, [countryName]: false }));
        }
    };

    const filterCountries = (search: string) => {
        if (!search) return countries;
        return countries.filter(country =>
            country.name.toLowerCase().includes(search.toLowerCase()) ||
            country.code.toLowerCase().includes(search.toLowerCase())
        );
    };

    const filterCities = (cities: string[], search: string) => {
        if (!search) return cities;
        return cities.filter(city => city.toLowerCase().includes(search.toLowerCase()));
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
                        {[1, 2, 3, 4].map(step => (
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
                        {[1, 2, 3, 4].map(step => (
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
                            <div className="space-y-6" ref={dropdownRef}>
                                {/* Origin Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin size={20} className="text-gray-900 flex-shrink-0" />
                                        <label className="text-gray-900 font-semibold text-sm md:text-base">Choose country and city you want to order</label>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-gray-600 mb-2">Country</label>
                                            <div className="relative">
                                                <button
                                                    onClick={() => {
                                                        if (!selectedPicker) {
                                                            setOpenDropdown(openDropdown === 'originCountry' ? null : 'originCountry');
                                                            setSearchText(prev => ({ ...prev, originCountry: '' }));
                                                        }
                                                    }}
                                                    disabled={!!selectedPicker}
                                                    className={`w-full px-3 md:px-4 py-2.5 md:py-2 border rounded-lg text-sm md:text-base flex items-center justify-between ${
                                                        selectedPicker 
                                                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                                                            : 'border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFDF57]'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {formData.originCountry && (
                                                            <>
                                                                <FlagIcon countryCode={countryCodeMap[formData.originCountry] || ''} className="w-5 h-5" />
                                                                {formData.originCountry}
                                                            </>
                                                        )}
                                                        {!formData.originCountry && <span className="text-gray-500">Select country</span>}
                                                    </span>
                                                    <ChevronDown size={16} className={`transition-transform ${openDropdown === 'originCountry' ? 'rotate-180' : ''}`} />
                                                </button>
                                                {openDropdown === 'originCountry' && !selectedPicker && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                                        <input
                                                            type="text"
                                                            placeholder="Search countries..."
                                                            value={searchText.originCountry || ''}
                                                            onChange={(e) => setSearchText(prev => ({ ...prev, originCountry: e.target.value }))}
                                                            className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none text-sm"
                                                            autoFocus
                                                        />
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {filterCountries(searchText.originCountry || '').map(country => (
                                                                <button
                                                                    key={country.code}
                                                                    onClick={() => {
                                                                        handleInputChange('originCountry', country.name);
                                                                        setOpenDropdown(null);
                                                                        setSearchText(prev => ({ ...prev, originCountry: '' }));
                                                                        getCitiesForCountry(country.name);
                                                                    }}
                                                                    className="w-full px-3 md:px-4 py-2.5 text-left flex items-center gap-2 hover:bg-yellow-50 transition-colors"
                                                                >
                                                                    <FlagIcon countryCode={country.code} className="w-5 h-5" />
                                                                    {country.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-gray-600 mb-2">City</label>
                                            {loadingCities[formData.originCountry] ? (
                                                <div className="text-gray-500 text-sm py-2">Loading cities...</div>
                                            ) : (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => {
                                                            if (!selectedPicker) {
                                                                setOpenDropdown(openDropdown === 'originCity' ? null : 'originCity');
                                                                setSearchText(prev => ({ ...prev, originCity: '' }));
                                                            }
                                                        }}
                                                        disabled={!!selectedPicker}
                                                        className={`w-full px-3 md:px-4 py-2.5 md:py-2 border rounded-lg text-sm md:text-base flex items-center justify-between ${
                                                            selectedPicker 
                                                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                                                                : 'border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFDF57]'
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            {formData.originCity && <span>{formData.originCity}</span>}
                                                            {!formData.originCity && <span className="text-gray-500">Select city</span>}
                                                        </span>
                                                        <ChevronDown size={16} className={`transition-transform ${openDropdown === 'originCity' ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {openDropdown === 'originCity' && !selectedPicker && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                                            <input
                                                                type="text"
                                                                placeholder="Search cities..."
                                                                value={searchText.originCity || ''}
                                                                onChange={(e) => setSearchText(prev => ({ ...prev, originCity: e.target.value }))}
                                                                className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none text-sm"
                                                                autoFocus
                                                            />
                                                            <div className="max-h-48 overflow-y-auto">
                                                                {filterCities(citiesMap[formData.originCountry] || [], searchText.originCity || '').map(city => (
                                                                    <button
                                                                        key={city}
                                                                        onClick={() => {
                                                                            handleInputChange('originCity', city);
                                                                            setOpenDropdown(null);
                                                                            setSearchText(prev => ({ ...prev, originCity: '' }));
                                                                        }}
                                                                        className="w-full px-3 md:px-4 py-2.5 text-left hover:bg-yellow-50 transition-colors"
                                                                    >
                                                                        {city}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                                            <div className="relative">
                                                <button
                                                    onClick={() => {
                                                        if (!selectedPicker) {
                                                            setOpenDropdown(openDropdown === 'destinationCountry' ? null : 'destinationCountry');
                                                            setSearchText(prev => ({ ...prev, destinationCountry: '' }));
                                                        }
                                                    }}
                                                    disabled={!!selectedPicker}
                                                    className={`w-full px-3 md:px-4 py-2.5 md:py-2 border rounded-lg text-sm md:text-base flex items-center justify-between ${
                                                        selectedPicker 
                                                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                                                            : 'border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFDF57]'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {formData.destinationCountry && (
                                                            <>
                                                                <FlagIcon countryCode={countryCodeMap[formData.destinationCountry] || ''} className="w-5 h-5" />
                                                                {formData.destinationCountry}
                                                            </>
                                                        )}
                                                        {!formData.destinationCountry && <span className="text-gray-500">Select country</span>}
                                                    </span>
                                                    <ChevronDown size={16} className={`transition-transform ${openDropdown === 'destinationCountry' ? 'rotate-180' : ''}`} />
                                                </button>
                                                {openDropdown === 'destinationCountry' && !selectedPicker && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                                        <input
                                                            type="text"
                                                            placeholder="Search countries..."
                                                            value={searchText.destinationCountry || ''}
                                                            onChange={(e) => setSearchText(prev => ({ ...prev, destinationCountry: e.target.value }))}
                                                            className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none text-sm"
                                                            autoFocus
                                                        />
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {filterCountries(searchText.destinationCountry || '').map(country => (
                                                                <button
                                                                    key={country.code}
                                                                    onClick={() => {
                                                                        handleInputChange('destinationCountry', country.name);
                                                                        setOpenDropdown(null);
                                                                        setSearchText(prev => ({ ...prev, destinationCountry: '' }));
                                                                        getCitiesForCountry(country.name);
                                                                    }}
                                                                    className="w-full px-3 md:px-4 py-2.5 text-left flex items-center gap-2 hover:bg-yellow-50 transition-colors"
                                                                >
                                                                    <FlagIcon countryCode={country.code} className="w-5 h-5" />
                                                                    {country.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-gray-600 mb-2">City</label>
                                            {loadingCities[formData.destinationCountry] ? (
                                                <div className="text-gray-500 text-sm py-2">Loading cities...</div>
                                            ) : (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => {
                                                            if (!selectedPicker) {
                                                                setOpenDropdown(openDropdown === 'destinationCity' ? null : 'destinationCity');
                                                                setSearchText(prev => ({ ...prev, destinationCity: '' }));
                                                            }
                                                        }}
                                                        disabled={!!selectedPicker}
                                                        className={`w-full px-3 md:px-4 py-2.5 md:py-2 border rounded-lg text-sm md:text-base flex items-center justify-between ${
                                                            selectedPicker 
                                                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                                                                : 'border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFDF57]'
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            {formData.destinationCity && <span>{formData.destinationCity}</span>}
                                                            {!formData.destinationCity && <span className="text-gray-500">Select city</span>}
                                                        </span>
                                                        <ChevronDown size={16} className={`transition-transform ${openDropdown === 'destinationCity' ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {openDropdown === 'destinationCity' && !selectedPicker && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                                            <input
                                                                type="text"
                                                                placeholder="Search cities..."
                                                                value={searchText.destinationCity || ''}
                                                                onChange={(e) => setSearchText(prev => ({ ...prev, destinationCity: e.target.value }))}
                                                                className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none text-sm"
                                                                autoFocus
                                                            />
                                                            <div className="max-h-48 overflow-y-auto">
                                                                {filterCities(citiesMap[formData.destinationCountry] || [], searchText.destinationCity || '').map(city => (
                                                                    <button
                                                                        key={city}
                                                                        onClick={() => {
                                                                            handleInputChange('destinationCity', city);
                                                                            setOpenDropdown(null);
                                                                            setSearchText(prev => ({ ...prev, destinationCity: '' }));
                                                                        }}
                                                                        className="w-full px-3 md:px-4 py-2.5 text-left hover:bg-yellow-50 transition-colors"
                                                                    >
                                                                        {city}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
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

                        {/* Step 2 Placeholder */}
                        {currentStep === 2 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">Step 2: Order Details</p>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 md:mt-8">
                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="w-full px-6 py-3 md:py-3 bg-[#FFDF57] text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-base md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : (currentStep === 4 ? 'Submit' : 'Next')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrder;
