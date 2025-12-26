import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Flag, Globe, ChevronDown, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { ES, US, GB, FR, DE, IT, CA, AU } from 'country-flag-icons/react/3x2';

const ProfileSetup = () => {
    const navigate = useNavigate();
    const [selectedNationality, setSelectedNationality] = useState('Spain');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Spanish', 'English']);
    const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

    const nationalities = [
        { name: 'Spain', code: 'ES', icon: ES },
        { name: 'United States', code: 'US', icon: US },
        { name: 'United Kingdom', code: 'GB', icon: GB },
        { name: 'France', code: 'FR', icon: FR },
        { name: 'Germany', code: 'DE', icon: DE },
        { name: 'Italy', code: 'IT', icon: IT },
        { name: 'Canada', code: 'CA', icon: CA },
        { name: 'Australia', code: 'AU', icon: AU },
    ];
    const languages = ['Spanish', 'English', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Polish'];

    const getNationalityIcon = (country: string) => {
        return nationalities.find(n => n.name === country)?.icon || ES;
    };

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const handleContinue = () => {
        navigate('/dashboard');
    };

    const SelectedFlag = getNationalityIcon(selectedNationality);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white overflow-hidden py-6">
            <div 
                className="w-full max-w-[480px] border border-gray-200 bg-white rounded-[32px] p-8 shadow-lg mx-4 max-h-screen overflow-y-auto"
                style={{ scrollbarWidth: isLanguageDropdownOpen ? 'none' : 'auto' }}
            >
                <div className="text-center mb-4">
                    <h1 className="text-[28px] font-bold text-gray-900 mb-1">Profile Setup</h1>
                </div>

                {/* Avatar Upload */}
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">No image</span>
                        </div>
                        <button className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-2 hover:bg-yellow-500 transition-colors">
                            <Camera size={20} className="text-gray-900" />
                        </button>
                    </div>
                </div>

                <p className="text-center text-gray-600 text-sm mb-4">Upload profile photo</p>

                {/* Nationality Selector */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Flag size={20} className="text-gray-900" />
                        <label className="text-gray-700 font-semibold text-base">Your nationality</label>
                    </div>
                    
                    <div className="relative">
                        <button
                            onClick={() => setIsNationalityDropdownOpen(!isNationalityDropdownOpen)}
                            className="w-full flex items-center gap-3 mb-4 pb-4 border-b border-gray-300 hover:opacity-80 transition-opacity"
                        >
                            <SelectedFlag className="w-8 h-6 rounded" />
                            <span className="text-gray-900 font-semibold text-lg">{selectedNationality}</span>
                            <ChevronDown size={20} className={`text-gray-900 ml-auto transition-transform ${isNationalityDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Nationality Dropdown */}
                        {isNationalityDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                                {nationalities.map(nat => {
                                    const FlagIcon = nat.icon;
                                    return (
                                        <button
                                            key={nat.name}
                                            onClick={() => {
                                                setSelectedNationality(nat.name);
                                                setIsNationalityDropdownOpen(false);
                                            }}
                                            className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center gap-3 ${
                                                selectedNationality === nat.name
                                                    ? 'bg-yellow-50 text-gray-900'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <FlagIcon className="w-6 h-4 rounded" />
                                            {nat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <p className="text-gray-500 text-sm">Used to connect with relevant jet orders</p>
                </div>

                {/* Languages Selector */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={20} className="text-gray-900" />
                        <label className="text-gray-700 font-semibold text-base">Languages</label>
                    </div>

                    {/* Selected Languages Tags - Inside the field */}
                    <div className="relative">
                        <div
                            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                            className="w-full flex items-center gap-2 mb-4 pb-4 border-b border-gray-300 flex-wrap cursor-pointer hover:opacity-80 transition-opacity"
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
                                        className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center gap-3 ${
                                            selectedLanguages.includes(lang)
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

                    <p className="text-gray-500 text-sm">You can select multiple languages</p>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center mt-12">
                    <Button onClick={handleContinue} className="max-w-[260px] w-full py-3 text-base tracking-wide rounded-xl">
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
