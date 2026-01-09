import { createContext, useContext, useState, useRef, type ReactNode } from 'react';

interface CachedDashboardData {
  pickers: any[];
  timestamp: number;
}

interface CachedPickerDashboardData {
  orders: any;
  timestamp: number;
}

interface DashboardCacheContextType {
  // Orderer cache
  cachedData: CachedDashboardData | null;
  setCachedData: (data: CachedDashboardData) => void;
  clearCache: () => void;
  isCacheValid: () => boolean;
  invalidateCache: () => void;
  
  // Picker cache
  pickerCachedData: CachedPickerDashboardData | null;
  setPickerCachedData: (data: CachedPickerDashboardData) => void;
  clearPickerCache: () => void;
  isPickerCacheValid: () => boolean;
  invalidatePickerCache: () => void;
}

const DashboardCacheContext = createContext<DashboardCacheContextType | undefined>(undefined);

const CACHE_DURATION = 1 * 60 * 1000; // 1 minute

export const DashboardCacheProvider = ({ children }: { children: ReactNode }) => {
  const [cachedData, setCachedData] = useState<CachedDashboardData | null>(null);
  const [pickerCachedData, setPickerCachedData] = useState<CachedPickerDashboardData | null>(null);
  const cacheInvalidatedRef = useRef<boolean>(false);
  const pickerCacheInvalidatedRef = useRef<boolean>(false);

  const isCacheValid = () => {
    if (cacheInvalidatedRef.current) {
      return false;
    }
    
    if (!cachedData) return false;
    const now = Date.now();
    return now - cachedData.timestamp < CACHE_DURATION;
  };

  const isPickerCacheValid = () => {
    if (pickerCacheInvalidatedRef.current) {
      return false;
    }
    
    if (!pickerCachedData) return false;
    const now = Date.now();
    return now - pickerCachedData.timestamp < CACHE_DURATION;
  };

  const clearCache = () => {
    setCachedData(null);
    cacheInvalidatedRef.current = false;
  };

  const clearPickerCache = () => {
    setPickerCachedData(null);
    pickerCacheInvalidatedRef.current = false;
  };

  const invalidateCache = () => {
    setCachedData(null);
    cacheInvalidatedRef.current = false;
  };

  const invalidatePickerCache = () => {
    setPickerCachedData(null);
    pickerCacheInvalidatedRef.current = false;
  };

  return (
    <DashboardCacheContext.Provider value={{
      cachedData,
      setCachedData,
      clearCache,
      isCacheValid,
      invalidateCache,
      pickerCachedData,
      setPickerCachedData,
      clearPickerCache,
      isPickerCacheValid,
      invalidatePickerCache,
    }}>
      {children}
    </DashboardCacheContext.Provider>
  );
};

export const useDashboardCache = () => {
  const context = useContext(DashboardCacheContext);
  if (!context) {
    throw new Error('useDashboardCache must be used within DashboardCacheProvider');
  }
  return context;
};
