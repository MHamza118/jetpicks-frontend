import { createContext, useContext, useState, useRef, type ReactNode } from 'react';

interface CachedDashboardData {
  pickers: any[];
  timestamp: number;
}

interface DashboardCacheContextType {
  cachedData: CachedDashboardData | null;
  setCachedData: (data: CachedDashboardData) => void;
  clearCache: () => void;
  isCacheValid: () => boolean;
  invalidateCache: () => void;
}

const DashboardCacheContext = createContext<DashboardCacheContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const DashboardCacheProvider = ({ children }: { children: ReactNode }) => {
  const [cachedData, setCachedData] = useState<CachedDashboardData | null>(null);
  const cacheInvalidatedRef = useRef<boolean>(false);

  const isCacheValid = () => {
    // If cache was manually invalidated, it's not valid
    if (cacheInvalidatedRef.current) {
      return false;
    }
    
    if (!cachedData) return false;
    const now = Date.now();
    return now - cachedData.timestamp < CACHE_DURATION;
  };

  const clearCache = () => {
    setCachedData(null);
    cacheInvalidatedRef.current = false;
  };

  const invalidateCache = () => {
    cacheInvalidatedRef.current = true;
  };

  return (
    <DashboardCacheContext.Provider value={{ cachedData, setCachedData, clearCache, isCacheValid, invalidateCache }}>
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
