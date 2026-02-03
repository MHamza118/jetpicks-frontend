import { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import { ordersApi } from '../../services';
import { useOrder } from '../../context/OrderContext';
import { useUser } from '../../context/UserContext';
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
    images: File[];
    errors?: {
        name?: string;
        quantity?: string;
        price?: string;
    };
}

const CreateOrderStep2 = () => {
    const navigate = useNavigate();
    const { orderData, updateOrderData } = useOrder();
    const { avatarUrl, avatarError, handleAvatarError } = useUser();
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [items, setItems] = useState<OrderItem[]>(
        orderData.items.length > 0 ? orderData.items : [
            {
                id: '1',
                name: '',
                storeLink: '',
                weight: '',
                price: '',
                quantity: '',
                notes: '',
                images: [],
                errors: {},
            },
        ]
    );

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
            errors: {},
        }]);
    };

    const handleItemChange = (id: string, field: string, value: string) => {
        setValidationError(null);
        setItems(items.map(item =>
            item.id === id ? { 
                ...item, 
                [field]: value,
                errors: { ...item.errors, [field]: undefined }
            } : item
        ));
    };

    const handleImageUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setItems(items.map(item =>
                item.id === itemId ? { ...item, images: [...item.images, ...newFiles] } : item
            ));
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleNext = async () => {
        if (!orderData.orderId) {
            alert('Order ID not found. Please start from step 1.');
            return;
        }

        // Validate required fields
        let hasErrors = false;
        const updatedItems = items.map(item => {
            const errors: { name?: string; quantity?: string; price?: string } = {};
            
            if (!item.name.trim()) {
                errors.name = 'Item Name is required';
                hasErrors = true;
            }
            if (!item.quantity.trim()) {
                errors.quantity = 'Quantity is required';
                hasErrors = true;
            }
            if (!item.price.trim()) {
                errors.price = 'Price is required';
                hasErrors = true;
            }
            
            return { ...item, errors };
        });

        setItems(updatedItems);

        if (hasErrors) {
            setValidationError('Please fill out all the required boxes');
            // Scroll to first error
            const firstErrorItem = updatedItems.find(item => Object.keys(item.errors || {}).length > 0);
            if (firstErrorItem) {
                const element = document.getElementById(`item-${firstErrorItem.id}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setLoading(true);
        try {
            // Save all items to backend
            for (const item of items) {
                const formData = new FormData();
                formData.append('item_name', item.name);
                formData.append('quantity', (parseInt(item.quantity) || 1).toString());
                formData.append('price', item.price);

                if (item.weight?.trim()) {
                    formData.append('weight', item.weight.trim());
                }

                if (item.notes?.trim()) {
                    formData.append('special_notes', item.notes.trim());
                }

                if (item.storeLink?.trim()) {
                    formData.append('store_link', item.storeLink.trim());
                }

                if (item.images && item.images.length > 0) {
                    item.images.forEach(image => {
                        formData.append('product_images[]', image);
                    });
                }

                await ordersApi.addOrderItem(orderData.orderId, formData);
            }

            updateOrderData({ items });
            navigate('/orderer/create-order-step3');
        } catch (error) {
            console.error('Failed to save items:', error);
            setValidationError('Something went wrong. Please try again.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
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
                                className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-[#FFDF57]' : step < 2 ? 'bg-gray-400' : 'bg-gray-200'
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Information</h2>
                        <p className="text-gray-600 text-sm mb-6">Please provide as much details as possible so that your Jetpickers can find & purchase your item.</p>

                        {validationError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 font-medium text-sm">{validationError}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={item.id} id={`item-${item.id}`}>
                                    <label className="block text-sm font-medium text-gray-600 mb-3">Upload product images</label>
                                    <div className="flex gap-3 mb-6 flex-wrap">
                                        {item.images.map((image, idx) => (
                                            <div key={idx} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                <img src={URL.createObjectURL(image)} alt={`Product ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
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
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Item Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                                placeholder="Watch"
                                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                                                    item.errors?.name
                                                        ? 'border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-[#FFDF57]'
                                                }`}
                                            />
                                            {item.errors?.name && (
                                                <p className="text-red-500 text-xs mt-1">{item.errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Store link</label>
                                            <input
                                                type="text"
                                                value={item.storeLink}
                                                onChange={(e) => handleItemChange(item.id, 'storeLink', e.target.value)}
                                                placeholder="Enter store link or product name"
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
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Price of Item <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                                placeholder="50"
                                                step="0.01"
                                                min="0"
                                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                                                    item.errors?.price
                                                        ? 'border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-[#FFDF57]'
                                                }`}
                                            />
                                            {item.errors?.price && (
                                                <p className="text-red-500 text-xs mt-1">{item.errors.price}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Quantity <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                placeholder="1"
                                                step="1"
                                                min="1"
                                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                                                    item.errors?.quantity
                                                        ? 'border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-[#FFDF57]'
                                                }`}
                                            />
                                            {item.errors?.quantity && (
                                                <p className="text-red-500 text-xs mt-1">{item.errors.quantity}</p>
                                            )}
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
                            disabled={loading}
                            className={`w-full mt-8 px-6 py-3 bg-[#FFDF57] text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Saving...' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrderStep2;
