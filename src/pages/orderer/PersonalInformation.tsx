import { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, Lock, Flag, Globe, ChevronDown, X } from 'lucide-react';
import eyeSvg from '../../assets/eye.svg';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';
import { ordererProfileApi } from '../../services/orderer/profile';

const PersonalInformation = () => {
  const { avatarUrl, avatarError, handleAvatarError, refetchAvatar } = useUser();
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
    password_confirmation: '',
    country: '',
    languages: [] as string[],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const availableLanguages = ['Spanish', 'English', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Polish'];

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await ordererProfileApi.getProfile();
        const profile = response.data;
        setFormData(prev => ({
          ...prev,
          full_name: profile.full_name || '',
          phone_number: profile.phone_number || '',
          email: profile.email || '',
          country: profile.country || '',
          password: '',
          password_confirmation: '',
          languages: Array.isArray(profile.languages)
            ? profile.languages.map((lang: any) => typeof lang === 'string' ? lang : lang?.language_name || lang?.name || '')
            : [],
        }));
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await ordererProfileApi.getProfile();
        const profile = response.data;
        setFormData(prev => ({
          ...prev,
          full_name: profile.full_name || '',
          phone_number: profile.phone_number || '',
          email: profile.email || '',
          country: profile.country || '',
          password: '',
          password_confirmation: '',
          languages: Array.isArray(profile.languages)
            ? profile.languages.map((lang: any) => typeof lang === 'string' ? lang : lang?.language_name || lang?.name || '')
            : [],
        }));
        // Also update avatar if changed
        await refetchAvatar();
      } catch (err) {
        console.error('Silent polling error:', err);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const toggleLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Validate required fields
      if (!formData.full_name.trim()) {
        setError('Full name is required');
        setSaving(false);
        return;
      }

      if (!formData.phone_number.trim()) {
        setError('Phone number is required');
        setSaving(false);
        return;
      }

      if (!formData.country) {
        setError('Country is required');
        setSaving(false);
        return;
      }

      if (formData.languages.length === 0) {
        setError('Please select at least one language');
        setSaving(false);
        return;
      }

      // Validate password if provided
      if (formData.password.trim()) {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setSaving(false);
          return;
        }

        if (formData.password !== formData.password_confirmation) {
          setError('Passwords do not match');
          setSaving(false);
          return;
        }
      }

      // Update profile
      await ordererProfileApi.updateProfile({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        country: formData.country,
        languages: formData.languages,
      });

      // Change password if provided
      if (formData.password.trim()) {
        await ordererProfileApi.changePassword(formData.password, formData.password_confirmation);
      }

      setSuccess('Profile updated successfully');
      
      // Start polling to check for changes
      startPolling();

      // Stop polling after 15 seconds (5 polls)
      setTimeout(() => {
        stopPolling();
      }, 15000);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="profile" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader
          title="Profile"
          showBackButton={true}
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          <div className="max-w-2xl mx-auto">
            {/* Page Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Personal Details</h1>

            {/* Status Messages */}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-4">{success}</div>}

            {/* Form Container */}
            <div className="space-y-3 mb-8 max-w-md mx-auto">
              {loading ? (
                <div className="text-center text-gray-500">Loading profile...</div>
              ) : (
                <>
                  {/* Full Name Field */}
                  <div className="bg-yellow-100 rounded-lg p-3 flex items-center gap-3">
                    <User size={20} className="text-gray-900 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-gray-900 font-medium block leading-none">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        disabled={saving}
                        className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none leading-tight text-sm disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Phone Number Field */}
                  <div className="bg-yellow-100 rounded-lg p-3 flex items-center gap-3">
                    <Phone size={20} className="text-gray-900 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-gray-900 font-medium block leading-none">Phone number</label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        disabled={saving}
                        className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none leading-tight text-sm disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="bg-yellow-100 rounded-lg p-3 flex items-center gap-3">
                    <Mail size={20} className="text-gray-900 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-gray-900 font-medium block leading-none">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                        className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none leading-tight text-sm opacity-60 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="bg-yellow-100 rounded-lg p-3 flex items-center gap-3">
                    <Lock size={20} className="text-gray-900 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-gray-900 font-medium block leading-none">New Password</label>
                      <div className="flex items-center gap-2">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          disabled={saving}
                          placeholder="Leave empty to keep current password"
                          className="flex-1 bg-transparent text-gray-900 font-semibold focus:outline-none leading-tight text-sm placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-2 text-gray-900 hover:opacity-70 transition-opacity flex-shrink-0 cursor-pointer"
                        >
                          {showPassword ? (
                            <img src={eyeSvg} alt="Hide password" className="w-5 h-5" />
                          ) : (
                            <img src={eyeSvg} alt="Show password" className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Confirmation Field */}
                  {formData.password && (
                    <div className="bg-yellow-100 rounded-lg p-3 flex items-center gap-3">
                      <Lock size={20} className="text-gray-900 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <label className="text-xs text-gray-900 font-medium block leading-none">Confirm Password</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleInputChange}
                          disabled={saving}
                          placeholder="Confirm your new password"
                          className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none leading-tight text-sm placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs disabled:opacity-50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Country Field */}
                  <div className="bg-yellow-100 rounded-lg p-3 flex items-center gap-3">
                    <Flag size={20} className="text-gray-900 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-gray-900 font-medium block leading-none">Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled={saving}
                        className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none cursor-pointer leading-tight text-sm disabled:opacity-50"
                      >
                        <option value="">Select Country</option>
                        <option value="Spain">Spain</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Italy">Italy</option>
                        <option value="Netherlands">Netherlands</option>
                        <option value="Belgium">Belgium</option>
                      </select>
                    </div>
                  </div>

                  {/* Languages Field */}
                  <div className="bg-yellow-100 rounded-lg p-3 flex items-center gap-3">
                    <Globe size={20} className="text-gray-900 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-gray-900 font-medium block leading-none mb-2">Languages</label>
                      <div className="relative">
                        <div
                          onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                          className="w-full flex items-center gap-2 flex-wrap cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {formData.languages.length > 0 ? (
                            formData.languages.map(lang => (
                              <div
                                key={lang}
                                className="bg-[#FFDF57] text-gray-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2"
                              >
                                {lang}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLanguage(lang);
                                  }}
                                  className="hover:opacity-70 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs">Select languages...</span>
                          )}
                          <ChevronDown size={16} className={`text-gray-900 ml-auto transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Language Dropdown */}
                        {isLanguageDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                            {availableLanguages.map(lang => (
                              <button
                                key={lang}
                                onClick={() => toggleLanguage(lang)}
                                className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center gap-3 text-sm ${
                                  formData.languages.includes(lang)
                                    ? 'bg-yellow-100 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {formData.languages.includes(lang) && (
                                  <svg className="w-4 h-4 text-[#FFDF57]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {!formData.languages.includes(lang) && (
                                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                                )}
                                {lang}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-[#FFDF57] text-gray-900 py-3 px-16 rounded-lg font-bold text-base hover:bg-yellow-500 transition-colors max-w-sm mx-auto block disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <MobileFooter activeTab="profile" />
      </div>
    </div>
  );
};

export default PersonalInformation;
