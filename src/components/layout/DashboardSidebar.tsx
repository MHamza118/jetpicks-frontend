import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

interface DashboardSidebarProps {
  activeTab?: 'dashboard' | 'messages' | 'orders' | 'profile';
}

const DashboardSidebar = ({ activeTab = 'dashboard' }: DashboardSidebarProps) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', action: () => navigate('/orderer/dashboard') },
    { id: 'messages', label: 'Messages' },
    { id: 'orders', label: 'My Orders' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="hidden md:flex w-48 bg-[#FFDF57] p-6 flex-col">
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
    </div>
  );
};

export default DashboardSidebar;
