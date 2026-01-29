import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { profileApi } from '../services';
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
  const lastTokenRef = useRef<string | null>(null);
  const fetchInProgressRef = useRef(false);

  const fetchAvatar = async () => {
    if (fetchInProgressRef.current) return;
    
    fetchInProgressRef.current = true;
    try {
      const response = await profileApi.getProfile();
      const profile = response.data;
      
      if (profile?.avatar_url) {
        const fullUrl = imageUtils.getImageUrl(profile.avatar_url);
        console.log('Avatar URL from backend:', profile.avatar_url);
        console.log('Full avatar URL:', fullUrl);
        setAvatarUrl(fullUrl);
        setAvatarError(false);
      } else {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Failed to fetch avatar:', error);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    lastTokenRef.current = token;
    
    if (token) {
      setLoading(true);
      // Fetch immediately without delay
      fetchAvatar();
    } else {
      setAvatarUrl(null);
      setAvatarError(false);
      setLoading(false);
    }
  }, []);

  // Also fetch avatar when component first mounts to ensure it's loaded early
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && !avatarUrl && !fetchInProgressRef.current) {
      fetchAvatar();
    }
  }, [avatarUrl]);

  // Listen for storage changes (logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.AUTH_TOKEN) {
        const newToken = e.newValue;
        
        if (newToken && newToken !== lastTokenRef.current) {
          // Token changed to a new one
          lastTokenRef.current = newToken;
          setLoading(true);
          fetchAvatar();
        } else if (!newToken) {
          // Token was cleared
          lastTokenRef.current = null;
          setAvatarUrl(null);
          setAvatarError(false);
          setLoading(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
