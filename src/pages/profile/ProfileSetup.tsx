import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Flag, Globe, ChevronDown, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { profileApi } from '../../services';
import { storage } from '../../utils';
import FlagIcon from '../../components/FlagIcon';
import { STORAGE_KEYS } from '../../constants';
import { useLocations } from '../../hooks';

const ProfileSetup = () => {
    const navigate = useNavigate();
    const { countries, fetchCities } = useLocations();
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
    const [countrySearchText, setCountrySearchText] = useState('');
    const [travelFromSearchText, setTravelFromSearchText] = useState('');
    const [travelToSearchText, setTravelToSearchText] = useState('');

    const languages = ['Spanish', 'English', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Polish'];

    useEffect(() => {
        const user = storage.get(STORAGE_KEYS.USER);
        if (user && user.roles && user.roles.length > 0) {
            setUserRole(user.roles[0] as 'ORDERER' | 'PICKER');
        }
    }, []);

    useEffect(() => {
        if (countries.length > 0) {
            setSelectedNationality(countries[0].name);
            setSelectedTravelFrom(countries[0].name);
            setSelectedTravelTo(countries[1]?.name || countries[0].name);
        }
    }, [countries]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if click is outside all dropdowns
            if (!target.closest('.nationality-dropdown') && 
                !target.closest('.travel-from-dropdown') && 
                !target.closest('.travel-to-dropdown') && 
                !target.closest('.language-dropdown')) {
                setIsNationalityDropdownOpen(false);
                setIsTravelFromDropdownOpen(false);
                setIsTravelToDropdownOpen(false);
                setIsLanguageDropdownOpen(false);
            }
        };

        if (isNationalityDropdownOpen || isTravelFromDropdownOpen || isTravelToDropdownOpen || isLanguageDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isNationalityDropdownOpen, isTravelFromDropdownOpen, isTravelToDropdownOpen, isLanguageDropdownOpen]);

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

    const filterCountries = (search: string) => {
        if (!search) return countries;
        return countries.filter(country =>
            country.name.toLowerCase().includes(search.toLowerCase()) ||
            country.code.toLowerCase().includes(search.toLowerCase())
        );
    };

    const handleContinue = async () => {
        if (selectedLanguages.length === 0) {
            setError('Please select at least one language');
            return;
        }

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

            if (userRole === 'ORDERER') {
                formData.append('country', selectedNationality);
            } else if (userRole === 'PICKER') {
                formData.append('country', selectedTravelFrom);
            }

            selectedLanguages.forEach((lang, index) => {
                formData.append(`languages[${index}]`, lang);
            });

            if (avatarFile) {
                formData.append('image', avatarFile);
            }

            await profileApi.setupProfile(formData as any);

            const profileResponse = await profileApi.getProfile();
            const updatedUser = profileResponse.data;

            storage.set(STORAGE_KEYS.USER, updatedUser);

            if (userRole === 'PICKER') {
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

                        <div className="relative z-30 nationality-dropdown">
                            <button
                                onClick={() => {
                                    setIsNationalityDropdownOpen(!isNationalityDropdownOpen);
                                    setCountrySearchText('');
                                }}
                                className="w-full flex items-center gap-3 mb-3 pb-3 border-b border-gray-300 hover:opacity-80 transition-opacity focus:outline-none"
                            >
                                <FlagIcon countryCode={countries.find(c => c.name === selectedNationality)?.code || ''} className="w-6 h-6 flex-shrink-0" />
                                <span className="text-gray-900 font-semibold text-lg">{selectedNationality || 'Select country'}</span>
                                <ChevronDown size={20} className={`text-gray-900 transition-transform flex-shrink-0 ml-auto ${isNationalityDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isNationalityDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                    <input
                                        type="text"
                                        placeholder="Search countries..."
                                        value={countrySearchText}
                                        onChange={(e) => setCountrySearchText(e.target.value)}
                                        className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none text-sm"
                                        autoFocus
                                    />
                                    <div className="max-h-48 overflow-y-auto">
                                        {filterCountries(countrySearchText).length > 0 ? (
                                            filterCountries(countrySearchText).map(country => (
                                                <button
                                                    key={country.code}
                                                    onClick={() => {
                                                        setSelectedNationality(country.name);
                                                        setIsNationalityDropdownOpen(false);
                                                        setCountrySearchText('');
                                                        fetchCities(country.name);
                                                    }}
                                                    className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center gap-3 ${selectedNationality === country.name
                                                        ? 'bg-yellow-50 text-gray-900'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <FlagIcon countryCode={country.code} className="w-6 h-6 flex-shrink-0" />
                                                    <span className="truncate">{country.name}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                                No countries found
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

                            <div className="relative z-20 travel-from-dropdown">
                                <button
                                    onClick={() => {
                                        setIsTravelFromDropdownOpen(!isTravelFromDropdownOpen);
                                        setTravelFromSearchText('');
                                    }}
                                    className="w-full flex items-center gap-3 mb-3 pb-3 border-b border-gray-300 hover:opacity-80 transition-opacity focus:outline-none"
                                >
                                    <FlagIcon countryCode={countries.find(c => c.name === selectedTravelFrom)?.code || ''} className="w-6 h-6 flex-shrink-0" />
                                    <span className="text-gray-900 font-semibold text-lg">{selectedTravelFrom || 'Select country'}</span>
                                    <ChevronDown size={20} className={`text-gray-900 transition-transform flex-shrink-0 ml-auto ${isTravelFromDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isTravelFromDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                        <input
                                            type="text"
                                            placeholder="Search countries..."
                                            value={travelFromSearchText}
                                            onChange={(e) => setTravelFromSearchText(e.target.value)}
                                            className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none text-sm"
                                            autoFocus
                                        />
                                        <div className="max-h-48 overflow-y-auto">
                                            {filterCountries(travelFromSearchText).length > 0 ? (
                                                filterCountries(travelFromSearchText).map(country => (
                                                    <button
                                                        key={country.code}
                                                        onClick={() => {
                                                            setSelectedTravelFrom(country.name);
                                                            setIsTravelFromDropdownOpen(false);
                                                            setTravelFromSearchText('');
                                                            fetchCities(country.name);
                                                        }}
                                                        className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center gap-3 ${selectedTravelFrom === country.name
                                                            ? 'bg-yellow-50 text-gray-900'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <FlagIcon countryCode={country.code} className="w-6 h-6 flex-shrink-0" />
                                                        <span className="truncate">{country.name}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                                    No countries found
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

                            <div className="relative z-10 travel-to-dropdown">
                                <button
                                    onClick={() => {
                                        setIsTravelToDropdownOpen(!isTravelToDropdownOpen);
                                        setTravelToSearchText('');
                                    }}
                                    className="w-full flex items-center gap-3 mb-3 pb-3 border-b border-gray-300 hover:opacity-80 transition-opacity focus:outline-none"
                                >
                                    <FlagIcon countryCode={countries.find(c => c.name === selectedTravelTo)?.code || ''} className="w-6 h-6 flex-shrink-0" />
                                    <span className="text-gray-900 font-semibold text-lg">{selectedTravelTo || 'Select country'}</span>
                                    <ChevronDown size={20} className={`text-gray-900 transition-transform flex-shrink-0 ml-auto ${isTravelToDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isTravelToDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                        <input
                                            type="text"
                                            placeholder="Search countries..."
                                            value={travelToSearchText}
                                            onChange={(e) => setTravelToSearchText(e.target.value)}
                                            className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none text-sm"
                                            autoFocus
                                        />
                                        <div className="max-h-48 overflow-y-auto">
                                            {filterCountries(travelToSearchText).length > 0 ? (
                                                filterCountries(travelToSearchText).map(country => (
                                                    <button
                                                        key={country.code}
                                                        onClick={() => {
                                                            setSelectedTravelTo(country.name);
                                                            setIsTravelToDropdownOpen(false);
                                                            setTravelToSearchText('');
                                                            fetchCities(country.name);
                                                        }}
                                                        className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center gap-3 ${selectedTravelTo === country.name
                                                            ? 'bg-yellow-50 text-gray-900'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <FlagIcon countryCode={country.code} className="w-6 h-6 flex-shrink-0" />
                                                        <span className="truncate">{country.name}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                                    No countries found
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

                    <div className="relative z-5 language-dropdown">
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

                        {isLanguageDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
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
                                            <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {!selectedLanguages.includes(lang) && (
                                            <div className="w-4 h-4 border-2 border-gray-300 rounded flex-shrink-0"></div>
                                        )}
                                        <span className="truncate">{lang}</span>
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
