import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Luggage, Calendar } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { travelApi } from '../services/travelApi';
import type { TravelJourneyPayload } from '../../../types/index';

const TravelAvailabilitySetup = () => {
    const navigate = useNavigate();
    const [useLocation, setUseLocation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        departure_country: 'Spain',
        departure_city: 'Madrid',
        departure_date: '',
        arrival_country: 'United States',
        arrival_city: 'New York',
        arrival_date: '',
        luggage_weight_capacity: '5',
    });

    const countries = [
        'Spain', 'United States', 'United Kingdom', 'France', 'Germany',
        'Italy', 'Canada', 'Australia', 'Japan', 'China', 'India', 'Brazil'
    ];

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

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white overflow-hidden py-6">
            <div 
                className="w-full max-w-[600px] border border-gray-200 bg-white rounded-[32px] p-8 shadow-lg mx-4 max-h-screen overflow-y-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <div className="text-center mb-4">
                    <h1 className="text-[22px] font-bold text-gray-900 mb-1">Travel Availability Setup</h1>
                    <p className="text-gray-500 text-xs font-medium">Share your travel details to get relevant Jetorders</p>
                </div>

                {error && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs">
                        {error}
                    </div>
                )}

                {/* Departure Section */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
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
                                <option value="Spain">Spain</option>
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
                                <option value="Madrid">Madrid</option>
                                <option value="Barcelona">Barcelona</option>
                                <option value="Valencia">Valencia</option>
                                <option value="Seville">Seville</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Arrival Section */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
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
                                <option value="United States">United States</option>
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
                                <option value="New York">New York</option>
                                <option value="Los Angeles">Los Angeles</option>
                                <option value="Chicago">Chicago</option>
                                <option value="Houston">Houston</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Departure Date */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
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
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
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
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
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
                <div className="mb-4 flex items-center gap-3">
                    <button
                        onClick={() => setUseLocation(!useLocation)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            useLocation ? 'bg-green-500 border-green-500' : 'border-green-500'
                        }`}
                    >
                        {useLocation && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                    <span className="text-gray-900 font-semibold text-sm">Use my location</span>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 mt-6">
                    <Button 
                        onClick={handleContinue} 
                        className="w-full py-2 text-sm tracking-wide rounded-xl bg-red-700 hover:bg-red-800 text-white"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Continue'}
                    </Button>
                    <button
                        onClick={handleSkip}
                        className="w-full py-2 text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        Skip for Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TravelAvailabilitySetup;
