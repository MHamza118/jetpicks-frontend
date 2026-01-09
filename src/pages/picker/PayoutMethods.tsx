import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';

const Settings = () => {
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [settings, setSettings] = useState({
    pushNotification: false,
    inAppNotifications: true,
    messages: true,
    location: true,
    translationLanguage: 'Spanish',
    translateIncoming: false,
    showOriginalTranslated: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      translationLanguage: e.target.value,
    }));
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

            {/* Notifications Section */}
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Notifications</h2>
              
              <div className="space-y-4">
                {/* Push Notification */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Push Notification</label>
                  <button
                    onClick={() => handleToggle('pushNotification')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.pushNotification ? 'bg-[#4D0013]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.pushNotification ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* In App Notifications */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">In app notifications</label>
                  <button
                    onClick={() => handleToggle('inAppNotifications')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.inAppNotifications ? 'bg-[#4D0013]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.inAppNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Messages</label>
                  <button
                    onClick={() => handleToggle('messages')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.messages ? 'bg-[#4D0013]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.messages ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Location */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Location</label>
                  <button
                    onClick={() => handleToggle('location')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.location ? 'bg-[#4D0013]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.location ? 'translate-x-6' : 'translate-x-0.5'
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
                    value={settings.translationLanguage}
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
                    onClick={() => handleToggle('translateIncoming')}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-2 ${
                      settings.translateIncoming ? 'bg-[#4D0013]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.translateIncoming ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Original + Translated Text */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Show original + translated text</label>
                  <button
                    onClick={() => handleToggle('showOriginalTranslated')}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-2 ${
                      settings.showOriginalTranslated ? 'bg-[#4D0013]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.showOriginalTranslated ? 'translate-x-6' : 'translate-x-0.5'
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
          </div>
        </div>

        <MobileFooter activeTab="profile" />
      </div>
    </div>
  );
};

export default Settings;
