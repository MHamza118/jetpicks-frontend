// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE_SETUP: '/profile-setup',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  EDIT_PROFILE: '/edit-profile',
} as const;

// Nationalities
export const NATIONALITIES = [
  'Spain',
  'United States',
  'United Kingdom',
  'France',
  'Germany',
  'Italy',
  'Canada',
  'Australia',
] as const;

// Languages
export const LANGUAGES = [
  'Spanish',
  'English',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Polish',
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
} as const;
