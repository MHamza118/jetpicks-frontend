import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils';
import { STORAGE_KEYS } from '../constants';

/**
 * Component that redirects to the appropriate dashboard based on user role
 */
const DashboardRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const activeRole = storage.get(STORAGE_KEYS.ACTIVE_ROLE);
    const user = storage.get(STORAGE_KEYS.USER);

    // If no active role, try to get from user object
    const role = activeRole || (user?.roles?.[0]);

    if (role === 'ORDERER') {
      navigate('/orderer/dashboard', { replace: true });
    } else if (role === 'PICKER') {
      navigate('/picker/dashboard', { replace: true });
    } else {
      // Fallback to login if no role found
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#FFDF57] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardRedirect;
