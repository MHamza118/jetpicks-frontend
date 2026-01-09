import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronRight, HelpCircle, LogOut } from 'lucide-react';
import personalInfoSvg from '../../assets/perrsonalinfo.svg';
import travelDetailsSvg from '../../assets/3dcube.svg';
import settingsSvg from '../../assets/settings.svg';
import cardsSvg from '../../assets/cards.svg';
import cameraSvg from '../../assets/camera.svg';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';
import { storage } from '../../utils';
import { STORAGE_KEYS } from '../../constants';

const PickerProfile = () => {
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [userProfile, setUserProfile] = useState({
    name: 'Esther Howard',
    phone: '0301 1234012450',
    roles: ['Jetpicker', 'Jetorderer'],
  });

  const handleLogout = () => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'personal',
      label: 'Personal Information',
      icon: null,
      isSvg: true,
      svgSrc: personalInfoSvg,
      action: () => navigate('/picker/profile/personal'),
    },
    {
      id: 'travel',
      label: 'Travel Details',
      icon: null,
      isSvg: true,
      svgSrc: travelDetailsSvg,
      action: () => navigate('/picker/profile/travel'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: null,
      isSvg: true,
      svgSrc: settingsSvg,
      action: () => navigate('/picker/profile/settings'),
    },
    {
      id: 'payout',
      label: 'Payout Methods',
      icon: null,
      isSvg: true,
      svgSrc: cardsSvg,
      action: () => navigate('/picker/profile/payout'),
    },
  ];

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <PickerDashboardSidebar activeTab="profile" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PickerDashboardHeader
          title="Profile"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-4 border-[#4D0013]">
                  {avatarUrl && !avatarError ? (
                    <img
                      src={avatarUrl}
                      alt={userProfile.name}
                      className="w-full h-full object-cover"
                      onError={handleAvatarError}
                    />
                  ) : (
                    <User size={48} className="text-gray-600" />
                  )}
                </div>
                {/* Edit Avatar Button */}
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity" style={{ backgroundColor: '#FFE5EC' }}>
                  <img src={cameraSvg} alt="Edit avatar" className="w-4 h-4" />
                </button>
              </div>

              {/* User Info */}
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{userProfile.name}</h2>
              <p className="text-gray-600 text-sm mb-4">{userProfile.phone}</p>
            </div>

            {/* Menu Items */}
            <div className="max-w-md mx-auto">
              <div className="space-y-3 mb-8">
                {menuItems.map((item: any) => {
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center justify-between px-4 py-3 bg-pink-100 rounded-lg hover:bg-pink-200 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {item.isSvg ? (
                          <img src={item.svgSrc} alt={item.label} className="w-5 h-5" />
                        ) : (
                          <>
                            {item.icon && <item.icon size={20} className="text-[#4D0013]" />}
                          </>
                        )}
                        <span className="font-semibold text-gray-900 text-sm">{item.label}</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-600 group-hover:text-gray-900 transition-colors" />
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                {/* Help and Support */}
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 hover:opacity-80 transition-opacity">
                  <HelpCircle size={20} className="text-[#4D0013]" />
                  <span className="font-semibold text-sm">Help and support</span>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 hover:opacity-80 transition-opacity"
                >
                  <LogOut size={20} className="text-[#4D0013]" />
                  <span className="font-semibold text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <MobileFooter activeTab="profile" />
      </div>
    </div>
  );
};

export default PickerProfile;
