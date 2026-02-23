import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { profileApi } from '../services';
import { imageUtils } from '../utils';
import { STORAGE_KEYS } from '../constants';

interface UserContextType {
  avatarUrl: string | null;
  avatarError: boolean;
  loading: boolean;
  activeRole: 'PICKER' | 'ORDERER' | null;
  canSwitchRole: boolean;
  switchRole: (role: 'PICKER' | 'ORDERER') => void;
  handleAvatarError: () => void;
  refetchAvatar: () => Promise<void>;
  clearAvatar: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'PICKER' | 'ORDERER' | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
    return stored as 'PICKER' | 'ORDERER' | null;
  });
  const fetchInProgressRef = useRef(false);
  const lastTokenRef = useRef<string | null>(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));

  const fetchAvatar = async () => {
    if (fetchInProgressRef.current) return;
    
    // Only fetch if user is authenticated
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;
    
    fetchInProgressRef.current = true;
    setLoading(true);
    try {
      const response = await profileApi.getProfile();
      const profile = response.data;
      
      if (profile?.avatar_url) {
        const fullUrl = imageUtils.getImageUrl(profile.avatar_url);
        setAvatarUrl(fullUrl);
        setAvatarError(false);
      } else {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Failed to fetch avatar:', error);
      setAvatarError(true);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  // Initialize activeRole on mount
  useEffect(() => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (user) {
      try {
        const userData = typeof user === 'string' ? JSON.parse(user) : user;
        if (userData.roles && Array.isArray(userData.roles)) {
          const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
          if (stored && userData.roles.includes(stored)) {
            setActiveRole(stored as 'PICKER' | 'ORDERER');
          } else {
            const defaultRole = userData.roles[0] as 'PICKER' | 'ORDERER';
            setActiveRole(defaultRole);
            localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, defaultRole);
          }
        }
      } catch (error) {
        console.error('Failed to initialize active role:', error);
      }
    }
  }, []);

  // Fetch avatar on mount only if authenticated
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      fetchAvatar();
    }
  }, []);

  // Monitor token changes (for login/logout in same tab)
  useEffect(() => {
    const checkTokenChange = setInterval(() => {
      const currentToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (currentToken !== lastTokenRef.current) {
        lastTokenRef.current = currentToken;
        
        if (!currentToken) {
          // Logout detected
          setAvatarUrl(null);
          setAvatarError(false);
          setLoading(false);
          setActiveRole(null);
          fetchInProgressRef.current = false;
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
        } else {
          // Login detected - reset and fetch new avatar
          setAvatarUrl(null);
          setAvatarError(false);
          fetchInProgressRef.current = false;
          fetchAvatar();
        }
      }
    }, 500);

    return () => clearInterval(checkTokenChange);
  }, []);

  // Listen for logout from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.AUTH_TOKEN) {
        if (!e.newValue) {
          // Logout detected
          setAvatarUrl(null);
          setAvatarError(false);
          setLoading(false);
          setActiveRole(null);
          fetchInProgressRef.current = false;
          lastTokenRef.current = null;
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
        } else {
          // Login detected - reset and fetch new avatar
          setAvatarUrl(null);
          setAvatarError(false);
          fetchInProgressRef.current = false;
          lastTokenRef.current = e.newValue;
          fetchAvatar();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAvatarError = useCallback(() => {
    setAvatarError(true);
    setAvatarUrl(null);
  }, []);

  const clearAvatar = useCallback(() => {
    setAvatarUrl(null);
    setAvatarError(false);
    setLoading(false);
  }, []);

  const refetchAvatar = useCallback(async () => {
    setLoading(true);
    await fetchAvatar();
  }, []);

  const switchRole = useCallback((role: 'PICKER' | 'ORDERER') => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (user) {
      try {
        const userData = typeof user === 'string' ? JSON.parse(user) : user;
        if (userData.roles && Array.isArray(userData.roles) && userData.roles.includes(role)) {
          setActiveRole(role);
          localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
        }
      } catch (error) {
        console.error('Failed to switch role:', error);
      }
    }
  }, []);

  // Calculate canSwitchRole based on user roles
  const getCanSwitchRole = useCallback(() => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (user) {
      try {
        const userData = typeof user === 'string' ? JSON.parse(user) : user;
        return userData.roles && Array.isArray(userData.roles) && userData.roles.length > 1;
      } catch (error) {
        return false;
      }
    }
    return false;
  }, []);

  const canSwitchRole = getCanSwitchRole();

  return (
    <UserContext.Provider value={{ avatarUrl, avatarError, loading, activeRole, canSwitchRole, switchRole, handleAvatarError, refetchAvatar, clearAvatar }}>
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
