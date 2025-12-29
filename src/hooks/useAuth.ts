import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { storage, errorUtils } from '../utils';
import { STORAGE_KEYS, ROUTES, SUCCESS_MESSAGES } from '../constants';
import type { User, LoginPayload, SignupPayload } from '../@types';

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => storage.get(STORAGE_KEYS.USER));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(payload);
      const { user, token } = response.data;  // AuthResponse has data property
      
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      storage.set(STORAGE_KEYS.USER, user);
      setUser(user);
      
      navigate(ROUTES.PROFILE_SETUP);
      return { success: true, message: SUCCESS_MESSAGES.LOGIN_SUCCESS };
    } catch (err) {
      const message = errorUtils.getErrorMessage(err);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const signup = useCallback(async (payload: SignupPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.register(payload);  // Use 'register' not 'signup'
      const { user, token } = response.data;  // AuthResponse has data property
      
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      storage.set(STORAGE_KEYS.USER, user);
      setUser(user);
      
      navigate(ROUTES.PROFILE_SETUP);
      return { success: true, message: SUCCESS_MESSAGES.SIGNUP_SUCCESS };
    } catch (err) {
      const message = errorUtils.getErrorMessage(err);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      setUser(null);
      setError(null);
      navigate(ROUTES.LOGIN);
      setLoading(false);
    }
  }, [navigate]);

  const isAuthenticated = !!user && !!storage.get(STORAGE_KEYS.AUTH_TOKEN);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
  };
};
