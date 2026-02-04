import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Bell, User, ArrowLeft, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi, searchApi } from '../../services';
import { useAcceptedOrderPolling, useCounterOfferPolling } from '../../context/OrderNotificationContext';
import { memo } from 'react';
import type { SearchOrderResult } from '../../services/search';
import { imageUtils } from '../../utils';

interface PickerDashboardHeaderProps {
    title: string;
    showBackButton?: boolean;
    avatarUrl?: string | null;
    avatarError?: boolean;
    onAvatarError?: () => void;
    avatarLoading?: boolean;
}

const PickerDashboardHeader = ({
    title,
    showBackButton = false,
    avatarUrl,
    avatarError,
    onAvatarError,
    avatarLoading = false,
}: PickerDashboardHeaderProps) => {
    const navigate = useNavigate();
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchOrderResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const { notification, acceptedOrdersHistory, showNotificationModal, setShowNotificationModal, handleNotificationClick } = useAcceptedOrderPolling();
    const { counterOfferNotification, counterOffersHistory, showCounterOfferModal, setShowCounterOfferModal, handleCounterOfferClick } = useCounterOfferPolling();

    // Get user's first letter from localStorage
    const getUserInitial = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.full_name) {
                    return user.full_name.charAt(0).toUpperCase();
                }
            }
        } catch (error) {
            console.error('Failed to get user initial:', error);
        }
        return 'U';
    };

    // Combine all notifications
    const allNotifications = [...acceptedOrdersHistory, ...counterOffersHistory];
    const unreadCount = allNotifications.filter(n => !n.isRead).length;

    // Handle click outside to close search results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        if (showSearchResults) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showSearchResults]);

    // Debounced search function
    const performSearch = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await searchApi.searchOrders(query, undefined, undefined, undefined, 1, 10);
            const data = (response as any).data || [];
            setSearchResults(data);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounced search
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(query);
        }, 300);
    };

    const handleOrderClick = (orderId: string) => {
        navigate(`/picker/orders/${orderId}/view`);
        setSearchQuery('');
        setShowSearchResults(false);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    return (
        <div className="bg-[#4D0013] px-6 py-4 md:px-8 md:py-4">
            {/* Mobile Header */}
            <div className="flex justify-between items-center md:hidden mb-4">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <button onClick={() => navigate(-1)} className="p-1">
                            <ArrowLeft size={24} className="text-white" />
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/picker/profile')}
                        className="focus:outline-none"
                    >
                        {avatarLoading ? (
                            <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse border-2 border-white/50"></div>
                        ) : avatarUrl && !avatarError ? (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover border-2 border-white/50 cursor-pointer hover:opacity-80 transition-opacity"
                                onError={onAvatarError}
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/50 cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="text-white text-lg font-semibold">{getUserInitial()}</span>
                            </div>
                        )}
                    </button>
                </div>
                <button
                    onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                    className="p-2 relative"
                >
                    <Bell size={24} className="text-white" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{unreadCount}</span>
                    )}
                </button>
            </div>

            {/* Mobile Search Bar */}
            <div className="relative md:hidden pb-2" ref={searchContainerRef}>
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search items or routes"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    className="w-full pl-11 pr-10 py-3.5 bg-white rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none shadow-sm"
                />
                {searchQuery && (
                    <button onClick={clearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <X size={20} />
                    </button>
                )}

                {/* Mobile Search Results Dropdown */}
                {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {searchLoading ? (
                            <div className="p-4 flex items-center justify-center">
                                <Loader size={20} className="animate-spin text-gray-400" />
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {searchResults.map((order) => (
                                    <button
                                        key={order.id}
                                        onClick={() => handleOrderClick(order.id)}
                                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                                    >
                                        {order.orderer.avatar_url ? (
                                            <img
                                                src={imageUtils.getImageUrl(order.orderer.avatar_url)}
                                                alt={order.orderer.full_name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                <User size={16} className="text-gray-600" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{order.orderer.full_name}</p>
                                            <p className="text-xs text-gray-500">{order.origin_city} → {order.destination_city}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-sm">${order.reward_amount}</p>
                                            <p className="text-xs text-gray-500">{order.items_count} items</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No orders found
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <div className="flex items-center gap-4">
                    <div className="relative w-64" ref={searchContainerRef}>
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            placeholder="Search items or routes"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => searchQuery && setShowSearchResults(true)}
                            className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-sm text-gray-700 placeholder-gray-500 focus:outline-none"
                        />

                        {/* Desktop Search Results Dropdown */}
                        {showSearchResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                                {searchLoading ? (
                                    <div className="p-4 flex items-center justify-center">
                                        <Loader size={20} className="animate-spin text-gray-400" />
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {searchResults.map((order) => (
                                            <button
                                                key={order.id}
                                                onClick={() => handleOrderClick(order.id)}
                                                className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                                            >
                                                {order.orderer.avatar_url ? (
                                                    <img
                                                        src={imageUtils.getImageUrl(order.orderer.avatar_url)}
                                                        alt={order.orderer.full_name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <User size={16} className="text-gray-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm truncate">{order.orderer.full_name}</p>
                                                    <p className="text-xs text-gray-500">{order.origin_city} → {order.destination_city}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 text-sm">${order.reward_amount}</p>
                                                    <p className="text-xs text-gray-500">{order.items_count} items</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        No orders found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                        className="p-2 hover:opacity-80 transition-opacity relative"
                    >
                        <Bell size={20} className="text-white" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{unreadCount}</span>
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/picker/profile')}
                        className="focus:outline-none"
                    >
                        {avatarLoading ? (
                            <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse border-2 border-white/50"></div>
                        ) : avatarUrl && !avatarError ? (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/50 cursor-pointer hover:opacity-80 transition-opacity"
                                onError={onAvatarError}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/50 cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="text-white text-sm font-semibold">{getUserInitial()}</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Notifications Dropdown Modal */}
            {showNotificationsDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setShowNotificationsDropdown(false)}>
                    <div className="absolute top-20 right-4 md:right-8 bg-white rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto z-50">
                        <div className="sticky top-0 bg-white flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            <button onClick={() => setShowNotificationsDropdown(false)}>
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {allNotifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {allNotifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={async () => {
                                            // Mark as read in backend if not already read
                                            if (!notif.isRead) {
                                                try {
                                                    await notificationsApi.markAsRead(notif.id);
                                                } catch (error) {
                                                    console.error('Failed to mark notification as read:', error);
                                                }
                                            }

                                            if ('offerId' in notif) {
                                                const counterNotif = notif as any;
                                                handleCounterOfferClick(counterNotif.orderId, counterNotif.offerId);
                                            } else {
                                                handleNotificationClick(notif.orderId);
                                            }
                                        }}
                                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <p className="text-sm font-semibold text-gray-900">
                                            {'offerId' in notif
                                                ? `${notif.pickerName} sent a counter offer`
                                                : `${notif.pickerName} has accepted your order`
                                            }
                                        </p>
                                        {!notif.isRead && (
                                            <span className="text-xs text-blue-600 font-medium mt-1 block">New</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No notifications yet
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Auto-show Notification Modal (5 seconds) */}
            {showNotificationModal && notification && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Order Accepted!</h2>
                            <button onClick={() => setShowNotificationModal(false)}>
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        <p className="text-gray-700 mb-4">
                            {notification.pickerName} has accepted your order
                        </p>

                        <button
                            onClick={() => handleNotificationClick(notification.orderId)}
                            className="w-full bg-[#4D0013] text-white py-2 rounded-lg font-bold hover:bg-[#660019] transition-colors"
                        >
                            View Order
                        </button>
                    </div>
                </div>
            )}

            {/* Auto-show Counter Offer Modal (5 seconds) */}
            {showCounterOfferModal && counterOfferNotification && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Counter Offer!</h2>
                            <button onClick={() => setShowCounterOfferModal(false)}>
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        <p className="text-gray-700 mb-4">
                            {counterOfferNotification.pickerName} sent you a counter offer
                        </p>

                        <button
                            onClick={() => handleCounterOfferClick(counterOfferNotification.orderId, counterOfferNotification.offerId)}
                            className="w-full bg-[#4D0013] text-white py-2 rounded-lg font-bold hover:bg-[#660019] transition-colors"
                        >
                            View Offer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(PickerDashboardHeader);
