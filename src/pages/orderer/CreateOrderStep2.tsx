import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    const { orderId } = useParams<{ orderId: string }>();
    const { orderData, updateOrderData } = useOrder();
    const { avatarUrl, avatarError, handleAvatarError } = useUser();
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [waitingDays, setWaitingDays] = useState(orderData.waitingDays || '');
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

    // Fetch order details from backend using URL param
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                navigate('/orderer/create-order');
                return;
            }

            try {
                const res = await ordersApi.getOrderDetails(orderId);
                const order = (res as any).data;
                
                // Update context with order data
                updateOrderData({
                    orderId: order.id,
                    originCountry: order.origin_country,
                    originCity: order.origin_city,
                    destinationCountry: order.destination_country,
                    destinationCity: order.destination_city,
                    specialNotes: order.special_notes || '',
                });
            } catch (error) {
                console.error('Failed to fetch order:', error);
                navigate('/orderer/create-order');
            }
        };

        fetchOrderDetails();
    }, [orderId]);

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
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
            const validFiles: File[] = [];
            let hasInvalidFiles = false;

            Array.from(files).forEach(file => {
                if (file.size > MAX_FILE_SIZE) {
                    hasInvalidFiles = true;
                    console.warn(`File ${file.name} exceeds 5MB limit`);
                } else {
                    validFiles.push(file);
                }
            });

            if (hasInvalidFiles) {
                setValidationError('Some images exceed 5MB limit. Only valid images have been added.');
            }

            if (validFiles.length > 0) {
                setItems(items.map(item =>
                    item.id === itemId ? { ...item, images: [...item.images, ...validFiles] } : item
                ));
            }
        }
    };

    const handleRemoveImage = (itemId: string, imageIndex: number) => {
        setItems(items.map(item =>
            item.id === itemId 
                ? { ...item, images: item.images.filter((_, idx) => idx !== imageIndex) }
                : item
        ));
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleNext = async () => {
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

        if (!waitingDays.trim()) {
            setValidationError('Please specify how long you can wait for your items');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            // First, delete all existing items for this order (replace strategy)
            await ordersApi.deleteOrderItems(orderId!);

            // Then, update the order with waiting_days
            await ordersApi.updateOrder(orderId!, { waiting_days: parseInt(waitingDays) });

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

                await ordersApi.addOrderItem(orderId!, formData);
            }

            updateOrderData({ items, waitingDays });
            navigate(`/orderer/create-order/${orderId}/step3`);
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
                                            <div key={idx} className="relative w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                <img src={URL.createObjectURL(image)} alt={`Product ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(item.id, idx)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                                                    aria-label="Remove image"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
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
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={item.weight.split(' ')[0] || ''}
                                                    onChange={(e) => {
                                                        const unit = item.weight.split(' ')[1] || 'kg';
                                                        const newWeight = e.target.value ? `${e.target.value} ${unit}` : '';
                                                        handleItemChange(item.id, 'weight', newWeight);
                                                    }}
                                                    onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                                                    placeholder="0"
                                                    step="1"
                                                    min="0"
                                                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm"
                                                />
                                                <select
                                                    value={item.weight.split(' ')[1] || 'kg'}
                                                    onChange={(e) => {
                                                        const value = item.weight.split(' ')[0] || '';
                                                        const newWeight = value ? `${value} ${e.target.value}` : '';
                                                        handleItemChange(item.id, 'weight', newWeight);
                                                    }}
                                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF57] text-sm bg-white"
                                                >
                                                    <option value="kg">kg</option>
                                                    <option value="g">g</option>
                                                    <option value="mg">mg</option>
                                                    <option value="lb">lb</option>
                                                    <option value="oz">oz</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Price of Item <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                                                placeholder="50"
                                                step="1"
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
                                                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
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
                                            <label className="block text-sm font-medium text-gray-600 mb-2">How long can you wait for your items in days? <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                value={waitingDays}
                                                onChange={(e) => {
                                                    setWaitingDays(e.target.value);
                                                    setValidationError(null);
                                                }}
                                                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                                                placeholder="Enter number of days"
                                                step="1"
                                                min="1"
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
