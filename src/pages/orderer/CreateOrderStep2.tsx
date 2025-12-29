import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import { profileApi } from '../../api';
import { API_CONFIG } from '../../config/api';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';

interface OrderItem {
    id: string;
    name: string;
    storeLink: string;
    weight: string;
    price: string;
    quantity: string;
    notes: string;
    images: string[];
}

const CreateOrderStep2 = () => {
    const navigate = useNavigate();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState(false);
    const [items, setItems] = useState<OrderItem[]>([
        {
            id: '1',
            name: 'Watch',
            storeLink: '',
            weight: '1/4 Kg',
            price: '$ 50',
            quantity: '01',
            notes: '',
            images: [],
        },
    ]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await profileApi.getProfile();
                const profile = response.data;
                if (profile?.avatar_url) {
                    const avatarPath = profile.avatar_url;
                    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
                    const fullUrl = avatarPath.startsWith('http')
                        ? avatarPath
                        : `${baseUrl}${avatarPath}`;
                    setAvatarUrl(fullUrl);
                    setAvatarError(false);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleAddItem = () => {
        setItems([...items, {
            id: Date.now().toString(),
            name: '',
            storeLink: '',
            weight: '',
            price: '',
            quantity: '',
            notes: '',
            images: [],
        }]);
    };

    const handleItemChange = (id: string, field: string, value: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleImageUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages = Array.from(files).map(file => URL.createObjectURL(file));
            setItems(items.map(item =>
                item.id === itemId ? { ...item, images: [...item.images, ...newImages] } : item
            ));
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleNext = () => {
        navigate('/orderer/create-order-step3');
    };

    const handleAvatarError = () => {
        setAvatarError(true);
        setAvatarUrl(null);
    };

    return (
        <div className="flex h-dvh bg-white flex-col md:flex-row">
            <DashboardSidebar activeTab="dashboard" />

            <div className="flex-1 flex flex-col h-dvh md:h-screen overflow-hidden">
                {/* Mobile Header */}
                <div className="bg-white px-4 py-3 md:hidden flex items-center gap-3 border-b border-gray-200">
                    <button
                        onClick={handleBack}
                        className="w-10 h-10 rounded-full bg-[#FFDF57] flex items-center justify-center hover:bg-yellow-500 transition-colors flex-shrink-0"
                    >
                        <ArrowLeft size={20} className="text-gray-900" />
                    </button>
                    <div className="flex gap-1.5 flex-1 justify-center">
                        {[1, 2, 3].map(step => (
                            <div
                                key={step}
                                className={`w-2 h-2 rounded-full ${
                                    step === 2 ? 'bg-[#FFDF57]' : step < 2 ? 'bg-gray-400' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                    <div className="w-10 flex-shrink-0" />
                </div>

                {/* Desktop Header */}
                <div className="hidden md:block">
                    <DashboardHeader 
                        title="Dashboard" 
                        avatarUrl={avatarUrl}
                        avatarError={avatarError}
                        onAvatarError={handleAvatarError}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-12 pb-32 md:pb-20 bg-white">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Information</h2>

                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={item.id}>
                                    <label className="block text-sm font-medium text-gray-600 mb-3">Upload product images</label>
                                    <div className="flex gap-3 mb-6 flex-wrap">
                                        {item.images.map((image, idx) => (
                                            <div key={idx} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                <img src={image} alt={`Product ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                                            </div>
                                        ))}
                                        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0 cursor-pointer">
                                            <Upload size={20} className="text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-400 text-center">Add Photos</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(item.id, e)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Item Name</label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                                placeholder="Watch"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Store link</label>
                                            <input
                                                type="text"
                                                value={item.storeLink}
                                                onChange={(e) => handleItemChange(item.id, 'storeLink', e.target.value)}
                                                placeholder="e.g Amazone"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Weight</label>
                                            <input
                                                type="text"
                                                value={item.weight}
                                                onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)}
                                                placeholder="1/4 Kg"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Price of Item</label>
                                            <input
                                                type="text"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                                placeholder="$ 50"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Quantity</label>
                                            <input
                                                type="text"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                placeholder="01"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Special notes <span className="text-gray-400">(optional)</span></label>
                                            <textarea
                                                value={item.notes}
                                                onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                                                placeholder="Write here"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] resize-none text-sm"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddItem}
                            className="mt-6 flex items-center justify-center gap-2 w-full py-3 text-gray-900 font-semibold hover:opacity-80 transition-opacity text-sm"
                        >
                            <div className="w-6 h-6 rounded-full bg-[#FFDF57] flex items-center justify-center">
                                <Plus size={16} className="text-gray-900" />
                            </div>
                            Add More Item
                        </button>

                        <button
                            onClick={handleNext}
                            className="w-full mt-8 px-6 py-3 bg-[#FFDF57] text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-base"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrderStep2;
