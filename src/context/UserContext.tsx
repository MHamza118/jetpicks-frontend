import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { profileApi } from '../services';
import { API_CONFIG } from '../config/api';
import { imageUtils } from '../utils';

interface UserContextType {
  avatarUrl: string | null;
  avatarError: boolean;
  loading: boolean;
  handleAvatarError: () => void;
  refetchAvatar: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAvatar = async () => {
    try {
      const response = await profileApi.getProfile();
      const profile = response.data;
      if (profile?.avatar_url) {
        const fullUrl = imageUtils.getImageUrl(profile.avatar_url, API_CONFIG.BASE_URL);
        setAvatarUrl(fullUrl);
        setAvatarError(false);
      }
    } catch (error) {
      console.error('Failed to fetch avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, []);

  const handleAvatarError = () => {
    setAvatarError(true);
    setAvatarUrl(null);
  };

  const refetchAvatar = async () => {
    setLoading(true);
    await fetchAvatar();
  };

  return (
    <UserContext.Provider value={{ avatarUrl, avatarError, loading, handleAvatarError, refetchAvatar }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
