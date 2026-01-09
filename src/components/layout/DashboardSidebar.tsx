import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import { storage } from '../../utils';
import { STORAGE_KEYS } from '../../constants';
import { useUser } from '../../context/UserContext';

interface DashboardSidebarProps {
  activeTab?: 'dashboard' | 'messages' | 'orders' | 'profile';
}

const DashboardSidebar = ({ activeTab = 'dashboard' }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAvatar } = useUser();

  // Determine if user is a picker or orderer based on current route
  const isPickerRoute = location.pathname.includes('/picker/');

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      action: () => navigate(isPickerRoute ? '/picker/dashboard' : '/orderer/dashboard') 
    },
    { 
      id: 'messages', 
      label: 'Messages',
      action: () => navigate(isPickerRoute ? '/picker/chat' : '/orderer/chat')
    },
    { 
      id: 'orders', 
      label: 'My Orders',
      action: () => navigate(isPickerRoute ? '/picker/my-orders' : '/orderer/my-orders')
    },
    { 
      id: 'profile', 
      label: 'Profile',
      action: () => navigate(isPickerRoute ? '/picker/profile' : '/orderer/profile')
    },
  ];

  const handleLogout = () => {
    clearAvatar();
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    navigate('/login');
  };

  return (
    <div className="hidden md:flex w-48 bg-[#FFDF57] p-6 flex-col h-screen">
      <div className="mb-8 flex justify-center">
        <img src={logo} alt="Logo" className="w-16 h-16 object-cover rounded-lg" />
      </div>

      <nav className="space-y-4 flex-1">
        {navItems.map(({ id, label, action }) => (
          <button
            key={id}
            onClick={action}
            className={`w-full text-left px-4 py-2 font-semibold text-sm rounded-full transition-colors ${
              activeTab === id
                ? 'bg-gray-900 text-[#FFDF57]'
                : 'text-gray-900 hover:opacity-80'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-[#FFDF57] font-semibold text-sm rounded-full hover:bg-gray-800 transition-colors"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default DashboardSidebar;
