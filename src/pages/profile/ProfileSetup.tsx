import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Flag, Globe, ChevronDown, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { profileApi, locationsApi } from '../../services';
import type { Country } from '../../services/locations';
import { storage } from '../../utils';
import FlagIcon from '../../components/FlagIcon';
import { STORAGE_KEYS } from '../../constants';

const ProfileSetup = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState<'ORDERER' | 'PICKER' | null>(null);
    const [selectedNationality, setSelectedNationality] = useState('');
    const [selectedTravelFrom, setSelectedTravelFrom] = useState('');
    const [selectedTravelTo, setSelectedTravelTo] = useState('');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
    const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false);
    const [isTravelFromDropdownOpen, setIsTravelFromDropdownOpen] = useState(false);
    const [isTravelToDropdownOpen, setIsTravelToDropdownOpen] = useState(false);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [countries, setCountries] = useState<{ [key: string]: Country }>({});
    const [countryList, setCountryList] = useState<string[]>([]);
    const [countrySearchText, setCountrySearchText] = useState('');
    const [travelFromSearchText, setTravelFromSearchText] = useState('');
    const [travelToSearchText, setTravelToSearchText] = useState('');

    const languages = ['Spanish', 'English', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Polish'];

    useEffect(() => {
        // Get user role from localStorage
        const user = storage.get(STORAGE_KEYS.USER);
        if (user && user.roles && user.roles.length > 0) {
            setUserRole(user.roles[0] as 'ORDERER' | 'PICKER');
        }
    }, []);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countriesData = await locationsApi.getCountries();
                setCountries(countriesData);
                const codes = Object.keys(countriesData);
                setCountryList(codes);
                // Set default to first country
                if (codes.length > 0) {
                    setSelectedNationality(codes[0]);
                    setSelectedTravelFrom(codes[0]);
                    setSelectedTravelTo(codes[1] || codes[0]);
                }
            } catch (error) {
                console.error('Failed to fetch countries:', error);
            }
        };

        fetchCountries();
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const handleContinue = async () => {
        if (selectedLanguages.length === 0) {
            setError('Please select at least one language');
            return;
        }

        // Validate country selections based on role
        if (userRole === 'ORDERER' && !selectedNationality) {
            setError('Please select your current residing country');
            return;
        }

        if (userRole === 'PICKER' && (!selectedTravelFrom || !selectedTravelTo)) {
            setError('Please select both travel from and travel to countries');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();

            // Add country based on role
            if (userRole === 'ORDERER') {
                const countryName = countries[selectedNationality]?.name || selectedNationality;
                formData.append('country', countryName);
            } else if (userRole === 'PICKER') {
                // For picker, store travel from country
                const travelFromCountry = countries[selectedTravelFrom]?.name || selectedTravelFrom;
                formData.append('country', travelFromCountry);
            }

            selectedLanguages.forEach((lang, index) => {
                formData.append(`languages[${index}]`, lang);
            });

            // Always append image, even if null (backend will handle it)
            if (avatarFile) {
                formData.append('image', avatarFile);
            }

            // Use profileApi with FormData
            await profileApi.setupProfile(formData as any);

            // Fetch the updated profile from backend to get the avatar_url
            const profileResponse = await profileApi.getProfile();
            const updatedUser = profileResponse.data;

            // Update localStorage with the complete updated user data
            storage.set(STORAGE_KEYS.USER, updatedUser);

            if (userRole === 'PICKER') {
                // Store travel countries for the next step
                storage.set('TRAVEL_FROM_COUNTRY', selectedTravelFrom);
                storage.set('TRAVEL_TO_COUNTRY', selectedTravelTo);
                navigate('/travel-availability-setup');
            } else {
                navigate('/orderer/dashboard');
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update profile. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white overflow-hidden py-4">
            <div
                className="w-full max-w-[480px] border border-gray-200 bg-white rounded-[32px] p-6 shadow-lg mx-4 max-h-screen overflow-y-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <div className="text-center mb-3">
                    <h1 className="text-[28px] font-bold text-gray-900">Profile Setup</h1>
                </div>

                {error && (
                    <div className="mb-3 p-2.5 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Avatar Upload */}
                <div className="flex justify-center mb-3">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-500 text-sm">No image</span>
                            )}
                        </div>
                        <label htmlFor="avatar-input" className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-2 hover:bg-yellow-500 transition-colors cursor-pointer">
                            <Camera size={20} className="text-gray-900" />
                        </label>
                        <input
                            id="avatar-input"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>
                </div>

                <p className="text-center text-gray-600 text-sm mb-5">Upload profile photo</p>

                {/* Role-Specific Country Fields */}
                {userRole === 'ORDERER' && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Flag size={20} className="text-gray-900" />
                            <label className="text-gray-700 font-semibold text-base">Current residing country</label>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsNationalityDropdownOpen(!isNationalityDropdownOpen);
                                    setCountrySearchText('');
                                }}
                                onKeyDown={(e) => {
                                    if (!isNationalityDropdownOpen) return;
                                    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                                        const newSearch = countrySearchText + e.key;
                                        setCountrySearchText(newSearch);
                                        e.preventDefault();
                                    } else if (e.key === 'Backspace') {
                                        setCountrySearchText(countrySearchText.slice(0, -1));
                                        e.preventDefault();
                                    } else if (e.key === 'Escape') {
                                        setIsNationalityDropdownOpen(false);
                                        setCountrySearchText('');
                                    }
                                }}
                                className="w-full flex items-center gap-3 mb-3 pb-3 border-b border-gray-300 hover:opacity-80 transition-opacity focus:outline-none"
                            >
                                <FlagIcon countryCode={selectedNationality} className="w-6 h-6" />
                                <span className="text-gray-900 font-semibold text-lg">{countries[selectedNationality]?.name || 'Select country'}</span>
                                <ChevronDown size={20} className={`text-gray-900 ml-auto transition-transform ${isNationalityDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isNationalityDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                                    {countrySearchText && (
                                        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
                                            Searching: <span className="font-semibold">{countrySearchText}</span>
                                        </div>
                                    )}
                                    <div className="max-h-48 overflow-y-auto">
                                        {countryList.filter(code => 
                                            !countrySearchText || countries[code]?.name.toLowerCase().includes(countrySearchText.toLowerCase()) ||
                                            code.toLowerCase().includes(countrySearchText.toLowerCase())
                                        ).length > 0 ? (
                                            countryList.filter(code => 
                                                !countrySearchText || countries[code]?.name.toLowerCase().includes(countrySearchText.toLowerCase()) ||
                                                code.toLowerCase().includes(countrySearchText.toLowerCase())
                                            ).map(code => {
                                                const country = countries[code];
                                                return (
                                                    <button
                                                        key={code}
                                                        onClick={() => {
                                                            setSelectedNationality(code);
                                                            setIsNationalityDropdownOpen(false);
                                                            setCountrySearchText('');
                                                        }}
                                                        className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center gap-3 ${selectedNationality === code
                                                                ? 'bg-yellow-50 text-gray-900'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <FlagIcon countryCode={code} className="w-6 h-6" />
                                                        {country.name}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                                No countries found for "{countrySearchText}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-500 text-xs mt-1.5">The country Jetpickers will deliver your order to you</p>
                    </div>
                )}

                {userRole === 'PICKER' && (
                    <>
                        {/* Travel From Country */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Flag size={20} className="text-gray-900" />
                                <label className="text-gray-700 font-semibold text-base">Country of travel from</label>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsTravelFromDropdownOpen(!isTravelFromDropdownOpen);
                                        setTravelFromSearchText('');
                                    }}
                                    onKeyDown={(e) => {
                                        if (!isTravelFromDropdownOpen) return;
                                        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                                            const newSearch = travelFromSearchText + e.key;
                                            setTravelFromSearchText(newSearch);
                                            e.preventDefault();
                                        } else if (e.key === 'Backspace') {
                                            setTravelFromSearchText(travelFromSearchText.slice(0, -1));
                                            e.preventDefault();
                                        } else if (e.key === 'Escape') {
                                            setIsTravelFromDropdownOpen(false);
                                            setTravelFromSearchText('');
                                        }
                                    }}
                                    className="w-full flex items-center gap-3 mb-3 pb-3 border-b border-gray-300 hover:opacity-80 transition-opacity focus:outline-none"
                                >
                                    <FlagIcon countryCode={selectedTravelFrom} className="w-6 h-6" />
                                    <span className="text-gray-900 font-semibold text-lg">{countries[selectedTravelFrom]?.name || 'Select country'}</span>
                                    <ChevronDown size={20} className={`text-gray-900 ml-auto transition-transform ${isTravelFromDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isTravelFromDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                                        {travelFromSearchText && (
                                            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
                                                Searching: <span className="font-semibold">{travelFromSearchText}</span>
                                            </div>
                                        )}
                                        <div className="max-h-48 overflow-y-auto">
                                            {countryList.filter(code => 
                                                !travelFromSearchText || countries[code]?.name.toLowerCase().includes(travelFromSearchText.toLowerCase()) ||
                                                code.toLowerCase().includes(travelFromSearchText.toLowerCase())
                                            ).length > 0 ? (
                                                countryList.filter(code => 
                                                    !travelFromSearchText || countries[code]?.name.toLowerCase().includes(travelFromSearchText.toLowerCase()) ||
                                                    code.toLowerCase().includes(travelFromSearchText.toLowerCase())
                                                ).map(code => {
                                                    const country = countries[code];
                                                    return (
                                                        <button
                                                            key={code}
                                                            onClick={() => {
                                                                setSelectedTravelFrom(code);
                                                                setIsTravelFromDropdownOpen(false);
                                                                setTravelFromSearchText('');
                                                            }}
                                                            className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center gap-3 ${selectedTravelFrom === code
                                                                    ? 'bg-yellow-50 text-gray-900'
                                                                    : 'text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <FlagIcon countryCode={code} className="w-6 h-6" />
                                                            {country.name}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                                    No countries found for "{travelFromSearchText}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-500 text-xs mt-1.5">The country you will get items from</p>
                        </div>

                        {/* Travel To Country */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Flag size={20} className="text-gray-900" />
                                <label className="text-gray-700 font-semibold text-base">Country of travel to</label>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsTravelToDropdownOpen(!isTravelToDropdownOpen);
                                        setTravelToSearchText('');
                                    }}
                                    onKeyDown={(e) => {
                                        if (!isTravelToDropdownOpen) return;
                                        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                                            const newSearch = travelToSearchText + e.key;
                                            setTravelToSearchText(newSearch);
                                            e.preventDefault();
                                        } else if (e.key === 'Backspace') {
                                            setTravelToSearchText(travelToSearchText.slice(0, -1));
                                            e.preventDefault();
                                        } else if (e.key === 'Escape') {
                                            setIsTravelToDropdownOpen(false);
                                            setTravelToSearchText('');
                                        }
                                    }}
                                    className="w-full flex items-center gap-3 mb-3 pb-3 border-b border-gray-300 hover:opacity-80 transition-opacity focus:outline-none"
                                >
                                    <FlagIcon countryCode={selectedTravelTo} className="w-6 h-6" />
                                    <span className="text-gray-900 font-semibold text-lg">{countries[selectedTravelTo]?.name || 'Select country'}</span>
                                    <ChevronDown size={20} className={`text-gray-900 ml-auto transition-transform ${isTravelToDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isTravelToDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                                        {travelToSearchText && (
                                            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
                                                Searching: <span className="font-semibold">{travelToSearchText}</span>
                                            </div>
                                        )}
                                        <div className="max-h-48 overflow-y-auto">
                                            {countryList.filter(code => 
                                                !travelToSearchText || countries[code]?.name.toLowerCase().includes(travelToSearchText.toLowerCase()) ||
                                                code.toLowerCase().includes(travelToSearchText.toLowerCase())
                                            ).length > 0 ? (
                                                countryList.filter(code => 
                                                    !travelToSearchText || countries[code]?.name.toLowerCase().includes(travelToSearchText.toLowerCase()) ||
                                                    code.toLowerCase().includes(travelToSearchText.toLowerCase())
                                                ).map(code => {
                                                    const country = countries[code];
                                                    return (
                                                        <button
                                                            key={code}
                                                            onClick={() => {
                                                                setSelectedTravelTo(code);
                                                                setIsTravelToDropdownOpen(false);
                                                                setTravelToSearchText('');
                                                            }}
                                                            className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center gap-3 ${selectedTravelTo === code
                                                                    ? 'bg-yellow-50 text-gray-900'
                                                                    : 'text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <FlagIcon countryCode={code} className="w-6 h-6" />
                                                            {country.name}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                                    No countries found for "{travelToSearchText}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-500 text-xs mt-1.5">The country you will deliver your items to your Jetbuyer</p>
                        </div>
                    </>
                )}

                {/* Languages Selector */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Globe size={20} className="text-gray-900" />
                        <label className="text-gray-700 font-semibold text-base">Languages</label>
                    </div>

                    {/* Selected Languages Tags - Inside the field */}
                    <div className="relative">
                        <div
                            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                            className="w-full flex items-center gap-2 mb-3 pb-3 border-b border-gray-300 flex-wrap cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            {selectedLanguages.map(lang => (
                                <div
                                    key={lang}
                                    className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                                >
                                    {lang}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLanguage(lang);
                                        }}
                                        className="hover:text-gray-700 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <ChevronDown size={20} className={`text-gray-900 ml-auto transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Language Dropdown */}
                        {isLanguageDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                                {languages.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => toggleLanguage(lang)}
                                        className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center gap-3 ${selectedLanguages.includes(lang)
                                                ? 'bg-yellow-50 text-gray-900'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {selectedLanguages.includes(lang) && (
                                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {!selectedLanguages.includes(lang) && (
                                            <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                                        )}
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-gray-500 text-xs mt-1.5">You can select multiple languages</p>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center mt-8">
                    <Button
                        onClick={handleContinue}
                        className="max-w-[260px] w-full py-3 text-base tracking-wide rounded-xl"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Continue'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
