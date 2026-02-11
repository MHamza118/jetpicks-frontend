// Local Storage Utilities
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`Failed to set ${key} in localStorage`);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      console.error(`Failed to remove ${key} from localStorage`);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch {
      console.error('Failed to clear localStorage');
    }
  },
};

// Validation Utilities
export const validators = {
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  isPhone: (phone: string): boolean => {
    const phoneRegex = /^\d{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },
  isStrongPassword: (password: string): boolean => {
    return password.length >= 8;
  },
  isUsername: (username: string): boolean => {
    return username.length >= 3 && username.length <= 20;
  },
};

// String Utilities
export const stringUtils = {
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  truncate: (str: string, length: number): string => {
    return str.length > length ? str.substring(0, length) + '...' : str;
  },
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
};

// Date Utilities
export const dateUtils = {
  formatDate: (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },
  formatTime: (date: Date | string): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },
  isExpired: (date: Date | string): boolean => {
    return new Date(date) < new Date();
  },
};

// Error Utilities
export const errorUtils = {
  getErrorMessage: (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) return (error as { message: string }).message;
    if (error && typeof error === 'object' && 'data' in error) {
      const data = (error as { data: unknown }).data;
      if (data && typeof data === 'object' && 'message' in data) return (data as { message: string }).message;
    }
    return 'An unexpected error occurred';
  },
};

// Image URL Utilities
export const imageUtils = {
  getImageUrl: (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    
    // If it's already an absolute URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Get the base URL from environment
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.jetpicks.com/api';
    
    // Remove /api from the END only to get the domain
    const domain = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
    
    // If path already starts with /storage/, just prepend domain
    if (imagePath.startsWith('/storage/')) {
      // Add cache-busting query parameter for avatars
      if (imagePath.includes('/avatars/')) {
        return domain + imagePath + '?t=' + Date.now();
      }
      return domain + imagePath;
    }
    
    // Otherwise ensure imagePath starts with /
    const path = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
    
    // Add cache-busting query parameter for avatars
    if (path.includes('/avatars/')) {
      return domain + path + '?t=' + Date.now();
    }
    
    return domain + path;
  },
};
