import { Navigate } from 'react-router-dom';
import { storage } from '../utils';
import { STORAGE_KEYS } from '../constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'PICKER' | 'ORDERER';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  // Check if token exists
  const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user data exists
  const userData = storage.get(STORAGE_KEYS.USER);
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Handle both string and object formats
    let user;
    if (typeof userData === 'string') {
      user = JSON.parse(userData);
    } else {
      user = userData;
    }
    
    // Verify user has the required role
    if (!user.roles || !Array.isArray(user.roles) || !user.roles.includes(requiredRole)) {
      // User doesn't have the required role, redirect to their actual dashboard
      if (user.roles && user.roles.includes('PICKER')) {
        return <Navigate to="/picker/dashboard" replace />;
      } else if (user.roles && user.roles.includes('ORDERER')) {
        return <Navigate to="/orderer/dashboard" replace />;
      }
      // If no valid role, redirect to login
      return <Navigate to="/login" replace />;
    }

    // User has the required role, render the component
    return <>{children}</>;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
