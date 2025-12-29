import { Home, Calendar, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileFooterProps {
  activeTab?: 'home' | 'orders' | 'chat' | 'profile';
}

const MobileFooter = ({ activeTab = 'home' }: MobileFooterProps) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, action: () => navigate('/orderer/dashboard') },
    { id: 'orders', label: 'Orders', icon: Calendar },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFDF57] border-t border-gray-200 px-4 py-3 flex items-center justify-around z-40">
      {tabs.map(({ id, label, icon: Icon, action }) => (
        <button
          key={id}
          onClick={action}
          className={`flex flex-col items-center gap-1 transition-opacity ${
            activeTab === id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
          }`}
        >
          <Icon size={24} className="text-gray-900" />
          <span className="text-xs font-semibold text-gray-900">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default MobileFooter;
