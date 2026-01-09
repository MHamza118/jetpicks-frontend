import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import { storage } from '../../utils';
import { STORAGE_KEYS } from '../../constants';
import { useUser } from '../../context/UserContext';

interface PickerDashboardSidebarProps {
  activeTab?: 'dashboard' | 'messages' | 'orders' | 'profile';
}

const PickerDashboardSidebar = ({ activeTab = 'dashboard' }: PickerDashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAvatar } = useUser();

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      action: () => navigate('/picker/dashboard') 
    },
    { 
      id: 'messages', 
      label: 'Messages',
      action: () => navigate('/picker/chat')
    },
    { 
      id: 'orders', 
      label: 'My Orders',
      action: () => navigate('/picker/my-orders')
    },
    { 
      id: 'profile', 
      label: 'Profile',
      action: () => navigate('/picker/profile')
    },
  ];

  const handleLogout = () => {
    clearAvatar();
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    navigate('/login');
  };

  return (
    <div className="hidden md:flex w-48 bg-[#4D0013] p-6 flex-col h-screen">
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
                ? 'bg-white text-[#4D0013]'
                : 'text-white hover:opacity-80'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#4D0013] font-semibold text-sm rounded-full hover:bg-gray-100 transition-colors"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default PickerDashboardSidebar;
