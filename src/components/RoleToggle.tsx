import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useDashboardCache } from '../context/DashboardCacheContext';
import { memo } from 'react';

interface RoleToggleProps {
  currentRole: 'PICKER' | 'ORDERER';
}

const RoleToggle = ({ currentRole }: RoleToggleProps) => {
  const navigate = useNavigate();
  const { canSwitchRole, switchRole } = useUser();
  const { clearCache, clearPickerCache } = useDashboardCache();

  if (!canSwitchRole) {
    return null;
  }

  const otherRole = currentRole === 'PICKER' ? 'ORDERER' : 'PICKER';
  const isPickerMode = currentRole === 'PICKER';

  const handleToggle = () => {
    // Clear caches
    clearCache();
    clearPickerCache();

    // Switch role
    switchRole(otherRole);

    // Navigate to appropriate dashboard
    if (otherRole === 'PICKER') {
      navigate('/picker/dashboard');
    } else {
      navigate('/orderer/dashboard');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="relative inline-flex h-9 w-20 items-center rounded-full transition-all duration-300 focus:outline-none border-2 bg-white"
      style={{
        borderColor: isPickerMode ? '#4D0013' : '#FFDF57',
      }}
      title={`Switch to ${otherRole} mode`}
    >
      {/* Toggle circle */}
      <span
        className="absolute h-7 w-9 rounded-full transition-all duration-300 flex items-center justify-center text-sm font-bold"
        style={{
          backgroundColor: isPickerMode ? '#4D0013' : '#FFDF57',
          color: isPickerMode ? '#FFDF57' : '#4D0013',
          left: isPickerMode ? '1px' : 'auto',
          right: isPickerMode ? 'auto' : '1px',
        }}
      >
        {isPickerMode ? 'P' : 'O'}
      </span>
    </button>
  );
};

export default memo(RoleToggle);
