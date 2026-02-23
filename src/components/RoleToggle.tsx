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
      className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2"
      style={{
        backgroundColor: currentRole === 'PICKER' ? '#4D0013' : '#FFDF57',
        color: currentRole === 'PICKER' ? '#FFDF57' : '#4D0013',
        border: `2px solid ${currentRole === 'PICKER' ? '#FFDF57' : '#4D0013'}`,
      }}
      title={`Switch to ${otherRole} mode`}
    >
      <span className="hidden sm:inline">{otherRole}</span>
      <span className="sm:hidden">{otherRole.charAt(0)}</span>
    </button>
  );
};

export default memo(RoleToggle);
