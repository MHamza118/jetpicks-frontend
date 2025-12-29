import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut } from 'lucide-react';
import axios from 'axios';
import { storage } from '../../utils';
import { STORAGE_KEYS } from '../../constants';
import dashboardImage from '../../assets/dashboard.jpeg';
import logo from '../../assets/logo.jpg';

interface Traveler {
    id: string;
    name: string;
    rating: number;
    route: string;
    date: string;
    space: string;
    fee: string;
}

const OrdererDashboard = () => {
    const navigate = useNavigate();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [travelers] = useState<Traveler[]>([
        {
            id: '1',
            name: 'Mathew M.',
            rating: 4.8,
            route: 'From London - Madrid',
            date: '25 Nov',
            space: '10kg',
            fee: '$10/kg',
        },
        {
            id: '2',
            name: 'Mathew M.',
            rating: 4.8,
            route: 'From London - Madrid',
            date: '25 Nov',
            space: '10kg',
            fee: '$10/kg',
        },
        {
            id: '3',
            name: 'Mathew M.',
            rating: 4.8,
            route: 'From London - Madrid',
            date: '25 Nov',
            space: '10kg',
            fee: '$10/kg',
        },
    ]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
                const response = await axios.get('http://localhost:8000/api/user/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (response.data?.data?.avatar_url) {
                    // Prepend backend URL to avatar path
                    const avatarPath = response.data.data.avatar_url;
                    const fullUrl = avatarPath.startsWith('http') 
                        ? avatarPath 
                        : `http://localhost:8000${avatarPath}`;
                    setAvatarUrl(fullUrl);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };
        
        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.USER);
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <div className="w-48 bg-[#FFDF57] p-6 flex flex-col">
                <div className="mb-8">
                    <img src={logo} alt="Logo" className="w-12 h-12 object-cover rounded-lg" />
                </div>

                <nav className="space-y-4 flex-1">
                    <button className="w-full text-left px-4 py-2 bg-gray-900 text-[#FFDF57] rounded-full font-semibold text-sm">
                        Dashboard
                    </button>
                    <button className="w-full text-left px-4 py-2 text-gray-900 font-semibold text-sm hover:opacity-80 transition-opacity">
                        Messages
                    </button>
                    <button className="w-full text-left px-4 py-2 text-gray-900 font-semibold text-sm hover:opacity-80 transition-opacity">
                        My Orders
                    </button>
                    <button className="w-full text-left px-4 py-2 text-gray-900 font-semibold text-sm hover:opacity-80 transition-opacity">
                        Profile
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-[#FFDF57] px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                            <input
                                type="text"
                                placeholder="Search a traveler or route"
                                className="pl-10 pr-4 py-2 bg-white rounded-full text-sm text-gray-700 placeholder-gray-500 focus:outline-none"
                            />
                        </div>
                        <button className="p-2 hover:opacity-80 transition-opacity">
                            <Bell size={20} className="text-gray-900" />
                        </button>
                        <div className="relative">
                            <button 
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="focus:outline-none"
                            >
                                {avatarUrl ? (
                                    <img 
                                        src={avatarUrl} 
                                        alt="Profile" 
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-900 cursor-pointer hover:opacity-80 transition-opacity"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                                        <span className="text-gray-600 text-sm font-semibold">U</span>
                                    </div>
                                )}
                            </button>
                            
                            {showProfileDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-8">
                    {/* Hero Section */}
                    <div className="mb-8 rounded-3xl overflow-hidden h-56 relative flex items-end justify-center pb-8">
                        <img src={dashboardImage} alt="Dashboard" className="w-full h-full object-cover absolute inset-0" />
                        <button className="relative bg-[#FFDF57] text-gray-900 px-6 py-2 rounded-full font-bold text-base hover:bg-yellow-500 transition-colors shadow-lg">
                            Create an Order
                        </button>
                    </div>

                    {/* Travelers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {travelers.map(traveler => (
                            <div key={traveler.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                        <User size={24} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{traveler.name}</h3>
                                        <p className="text-sm text-yellow-500 font-semibold">{traveler.rating} ⭐</p>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                                    <p className="text-sm font-semibold text-gray-900">{traveler.route}</p>
                                    <p className="text-xs text-gray-600">{traveler.date}</p>
                                </div>

                                <div className="flex justify-between text-sm mb-4">
                                    <span className="text-gray-600">Available space: <span className="font-semibold text-gray-900">{traveler.space}</span></span>
                                    <span className="text-gray-600">Fee: <span className="font-semibold text-gray-900">{traveler.fee}</span></span>
                                </div>

                                <button className="w-full bg-[#FFDF57] text-gray-900 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdererDashboard;
