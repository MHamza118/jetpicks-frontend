import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { profileApi } from '../services';
import { API_CONFIG } from '../config/api';
import { imageUtils } from '../utils';
import { STORAGE_KEYS } from '../constants';

interface UserContextType {
  avatarUrl: string | null;
  avatarError: boolean;
  loading: boolean;
  handleAvatarError: () => void;
  refetchAvatar: () => Promise<void>;
  clearAvatar: () => void;
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
      } else {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Failed to fetch avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Watch for auth token changes and fetch avatar when it changes
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (token) {
      // Token exists, fetch avatar
      setLoading(true);
      fetchAvatar();
    } else {
      // No token, clear avatar
      setAvatarUrl(null);
      setAvatarError(false);
      setLoading(false);
    }
  }, []);

  // Set up an interval to check for token changes
  useEffect(() => {
    let lastToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    const checkTokenChange = setInterval(() => {
      const currentToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (currentToken !== lastToken) {
        lastToken = currentToken;
        
        if (currentToken) {
          // Token changed to a new one, fetch avatar
          setLoading(true);
          fetchAvatar();
        } else {
          // Token was cleared, clear avatar
          setAvatarUrl(null);
          setAvatarError(false);
          setLoading(false);
        }
      }
    }, 500);
    
    return () => clearInterval(checkTokenChange);
  }, []);

  const handleAvatarError = () => {
    setAvatarError(true);
    setAvatarUrl(null);
  };

  const clearAvatar = () => {
    setAvatarUrl(null);
    setAvatarError(false);
    setLoading(false);
  };

  const refetchAvatar = async () => {
    setLoading(true);
    await fetchAvatar();
  };

  return (
    <UserContext.Provider value={{ avatarUrl, avatarError, loading, handleAvatarError, refetchAvatar, clearAvatar }}>
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
