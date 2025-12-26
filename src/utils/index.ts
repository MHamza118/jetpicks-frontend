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
  set: (key: string, value: any) => {
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
  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.data?.message) return error.data.message;
    return 'An unexpected error occurred';
  },
};
