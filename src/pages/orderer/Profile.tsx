import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronRight, HelpCircle, LogOut } from 'lucide-react';
import personalInfoSvg from '../../assets/perrsonalinfo.svg';
import settingsSvg from '../../assets/settings.svg';
import cardsSvg from '../../assets/cards.svg';
import cameraSvg from '../../assets/camera.svg';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';
import { storage } from '../../utils';
import { STORAGE_KEYS } from '../../constants';
import { profileApi } from '../../services';

const OrdererProfile = () => {
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError, refetchAvatar, clearAvatar } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [userProfile, setUserProfile] = useState({
    name: '',
    phone: '',
    roles: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await profileApi.getProfile();
        const profile = response.data;
        setUserProfile({
          name: profile.full_name || '',
          phone: profile.phone_number || '',
          roles: profile.roles || [],
        });
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Initialize orderer role on mount
  useEffect(() => {
    refetchAvatar();
  }, []);

  // Start polling for profile changes after successful upload
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        await refetchAvatar();
      } catch (err) {
        console.error('Silent polling error:', err);
      }
    }, 3000);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const handleLogout = () => {
    clearAvatar();
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    navigate('/');
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadSuccess('');

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Get the API base URL from environment
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.jetpicks.com/api';
      const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);

      // Use the avatar endpoint
      const response = await fetch(`${apiBaseUrl}/user/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload avatar');
      }

      const responseData = await response.json();
      console.log('Avatar upload response:', responseData);

      setUploadSuccess('Avatar updated successfully');
      
      // Wait a moment for the backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch avatar to get the new URL
      await refetchAvatar();
      
      // Start polling to check for changes
      startPolling();

      // Stop polling after 15 seconds (5 polls)
      setTimeout(() => {
        stopPolling();
      }, 15000);

      setTimeout(() => setUploadSuccess(''), 3000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setUploadError('Failed to upload avatar');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const menuItems = [
    {
      id: 'personal',
      label: 'Personal Information',
      icon: null,
      isSvg: true,
      svgSrc: personalInfoSvg,
      action: () => navigate('/orderer/profile/personal'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: null,
      isSvg: true,
      svgSrc: settingsSvg,
      action: () => navigate('/orderer/profile/settings'),
    },
    {
      id: 'payout',
      label: 'Payout Methods',
      icon: null,
      isSvg: true,
      svgSrc: cardsSvg,
      action: () => navigate('/orderer/profile/payout'),
    },
  ];

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="profile" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader
          title="Profile"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          <div className="max-w-2xl mx-auto">
            {/* Upload Status Messages */}
            {uploadError && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{uploadError}</div>}
            {uploadSuccess && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-4">{uploadSuccess}</div>}

            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-4 border-[#FFDF57]">
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
                <button
                  onClick={handleCameraClick}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FFE5EC' }}
                >
                  <img src={cameraSvg} alt="Edit avatar" className="w-4 h-4" />
                </button>
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
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
                      className="w-full flex items-center justify-between px-4 py-3 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {item.isSvg ? (
                          <img src={item.svgSrc} alt={item.label} className="w-5 h-5" />
                        ) : (
                          <>
                            {item.icon && <item.icon size={20} className="text-[#FFDF57]" />}
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
                  <HelpCircle size={20} className="text-[#FFDF57]" />
                  <span className="font-semibold text-sm">Help and support</span>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 hover:opacity-80 transition-opacity"
                >
                  <LogOut size={20} className="text-[#FFDF57]" />
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

export default OrdererProfile;
