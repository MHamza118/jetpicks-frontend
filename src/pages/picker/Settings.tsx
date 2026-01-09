import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';
import { pickerProfileApi } from '../../services/picker/profile';

const Settings = () => {
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [settings, setSettings] = useState({
    push_notifications_enabled: false,
    in_app_notifications_enabled: true,
    message_notifications_enabled: true,
    location_services_enabled: true,
    translation_language: 'Spanish',
    auto_translate_messages: false,
    show_original_and_translated: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await pickerProfileApi.getSettings();
        if (response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        setError('Failed to load settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings(prev => ({
      ...prev,
      [key]: newValue,
    }));

    // Save to backend
    try {
      setError('');
      setSuccess('');
      await pickerProfileApi.updateSettings({
        [key]: newValue,
      });
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update settings');
      console.error(err);
      // Revert the change
      setSettings(prev => ({
        ...prev,
        [key]: !newValue,
      }));
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSettings(prev => ({
      ...prev,
      translation_language: newLanguage,
    }));

    // Save to backend
    try {
      setError('');
      setSuccess('');
      await pickerProfileApi.updateSettings({
        translation_language: newLanguage,
      });
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update settings');
      console.error(err);
      // Revert the change
      setSettings(prev => ({
        ...prev,
        translation_language: settings.translation_language,
      }));
    }
  };

  const handlePrivacyPolicy = () => {
    // TODO: Navigate to privacy policy or open modal
    console.log('Open privacy policy');
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <PickerDashboardSidebar activeTab="profile" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PickerDashboardHeader
          title="Profile"
          showBackButton={true}
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 bg-white">
          <div className="max-w-md mx-auto">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

            {/* Status Messages */}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-4">{success}</div>}

            {loading ? (
              <div className="text-center text-gray-500">Loading settings...</div>
            ) : (
              <>
                {/* Notifications Section */}
                <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Notifications</h2>
                  
                  <div className="space-y-4">
                    {/* Push Notification */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">Push Notification</label>
                      <button
                        onClick={() => handleToggle('push_notifications_enabled')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.push_notifications_enabled ? 'bg-[#4D0013]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.push_notifications_enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* In App Notifications */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">In app notifications</label>
                      <button
                        onClick={() => handleToggle('in_app_notifications_enabled')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.in_app_notifications_enabled ? 'bg-[#4D0013]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.in_app_notifications_enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">Messages</label>
                      <button
                        onClick={() => handleToggle('message_notifications_enabled')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.message_notifications_enabled ? 'bg-[#4D0013]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.message_notifications_enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Location */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">Location</label>
                      <button
                        onClick={() => handleToggle('location_services_enabled')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.location_services_enabled ? 'bg-[#4D0013]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.location_services_enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Language & Translations Section */}
                <div className="mb-8">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Language & Translations</h2>
                  
                  <div className="space-y-4">
                    {/* Translation Language */}
                    <div>
                      <label className="text-xs text-gray-600 block mb-2">Translation language</label>
                      <select
                        value={settings.translation_language}
                        onChange={handleLanguageChange}
                        className="w-full bg-transparent border-b-2 border-gray-300 text-gray-900 font-semibold text-sm focus:outline-none focus:border-[#4D0013] pb-2"
                      >
                        <option value="Spanish">Spanish</option>
                        <option value="English">English</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>

                    {/* Translate Incoming Messages */}
                    <div className="flex items-center justify-between pt-2">
                      <label className="text-sm text-gray-600">Translate incoming messages automatically</label>
                      <button
                        onClick={() => handleToggle('auto_translate_messages')}
                        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-2 ${
                          settings.auto_translate_messages ? 'bg-[#4D0013]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.auto_translate_messages ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Show Original + Translated Text */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">Show original + translated text</label>
                      <button
                        onClick={() => handleToggle('show_original_and_translated')}
                        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-2 ${
                          settings.show_original_and_translated ? 'bg-[#4D0013]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.show_original_and_translated ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Other Section */}
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-4">Other</h2>
                  
                  <button
                    onClick={handlePrivacyPolicy}
                    className="w-full flex items-center justify-between py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-sm">Privacy Policy</span>
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <MobileFooter activeTab="profile" />
      </div>
    </div>
  );
};

export default Settings;
