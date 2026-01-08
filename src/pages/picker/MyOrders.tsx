import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';

interface OrderItem {
  id: string;
  item_name: string;
  product_images?: string[];
}

interface Order {
  id: string;
  orderer_id: string;
  orderer: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rating: number;
  };
  origin_city: string;
  destination_city: string;
  status: 'pending' | 'delivered' | 'cancelled';
  items_count: number;
  reward_amount: number | string;
  items: OrderItem[];
  created_at: string;
}

// Mock data for UI development
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderer_id: 'orderer-1',
    orderer: {
      id: 'orderer-1',
      full_name: 'Sarah M.',
      avatar_url: '/api/avatars/sarah.jpg',
      rating: 4.8
    },
    origin_city: 'London',
    destination_city: 'New York',
    status: 'delivered',
    items_count: 5,
    reward_amount: 20,
    items: [
      { id: 'item-1', item_name: 'Headphones', product_images: ['/api/products/headphones.jpg'] },
      { id: 'item-2', item_name: 'Watch', product_images: ['/api/products/watch.jpg'] },
      { id: 'item-3', item_name: 'Shoes', product_images: ['/api/products/shoes.jpg'] },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    orderer_id: 'orderer-2',
    orderer: {
      id: 'orderer-2',
      full_name: 'Sarah M.',
      avatar_url: '/api/avatars/sarah.jpg',
      rating: 4.8
    },
    origin_city: 'London',
    destination_city: 'New York',
    status: 'pending',
    items_count: 8,
    reward_amount: 20,
    items: [
      { id: 'item-4', item_name: 'Headphones', product_images: ['/api/products/headphones.jpg'] },
      { id: 'item-5', item_name: 'Watch', product_images: ['/api/products/watch.jpg'] },
      { id: 'item-6', item_name: 'Shoes', product_images: ['/api/products/shoes.jpg'] },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    orderer_id: 'orderer-3',
    orderer: {
      id: 'orderer-3',
      full_name: 'Sarah M.',
      avatar_url: '/api/avatars/sarah.jpg',
      rating: 4.8
    },
    origin_city: 'London',
    destination_city: 'New York',
    status: 'cancelled',
    items_count: 8,
    reward_amount: 20,
    items: [
      { id: 'item-7', item_name: 'Headphones', product_images: ['/api/products/headphones.jpg'] },
      { id: 'item-8', item_name: 'Watch', product_images: ['/api/products/watch.jpg'] },
      { id: 'item-9', item_name: 'Shoes', product_images: ['/api/products/shoes.jpg'] },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    orderer_id: 'orderer-1',
    orderer: {
      id: 'orderer-1',
      full_name: 'Sarah M.',
      avatar_url: '/api/avatars/sarah.jpg',
      rating: 4.8
    },
    origin_city: 'London',
    destination_city: 'New York',
    status: 'delivered',
    items_count: 5,
    reward_amount: 20,
    items: [
      { id: 'item-10', item_name: 'Headphones', product_images: ['/api/products/headphones.jpg'] },
      { id: 'item-11', item_name: 'Watch', product_images: ['/api/products/watch.jpg'] },
      { id: 'item-12', item_name: 'Shoes', product_images: ['/api/products/shoes.jpg'] },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    orderer_id: 'orderer-2',
    orderer: {
      id: 'orderer-2',
      full_name: 'Sarah M.',
      avatar_url: '/api/avatars/sarah.jpg',
      rating: 4.8
    },
    origin_city: 'London',
    destination_city: 'New York',
    status: 'pending',
    items_count: 8,
    reward_amount: 20,
    items: [
      { id: 'item-13', item_name: 'Headphones', product_images: ['/api/products/headphones.jpg'] },
      { id: 'item-14', item_name: 'Watch', product_images: ['/api/products/watch.jpg'] },
      { id: 'item-15', item_name: 'Shoes', product_images: ['/api/products/shoes.jpg'] },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    orderer_id: 'orderer-3',
    orderer: {
      id: 'orderer-3',
      full_name: 'Sarah M.',
      avatar_url: '/api/avatars/sarah.jpg',
      rating: 4.8
    },
    origin_city: 'London',
    destination_city: 'New York',
    status: 'cancelled',
    items_count: 8,
    reward_amount: 20,
    items: [
      { id: 'item-16', item_name: 'Headphones', product_images: ['/api/products/headphones.jpg'] },
      { id: 'item-17', item_name: 'Watch', product_images: ['/api/products/watch.jpg'] },
      { id: 'item-18', item_name: 'Shoes', product_images: ['/api/products/shoes.jpg'] },
    ],
    created_at: new Date().toISOString(),
  },
];

const PickerMyOrders = () => {
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');

  // Filter orders based on active filter
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    return matchesFilter;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getActionButtonText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'View Order Details';
      case 'pending':
        return 'View Details';
      case 'cancelled':
        return 'Accept again';
      default:
        return 'View Details';
    }
  };

  const handleActionClick = (order: Order) => {
    if (order.status === 'pending') {
      navigate(`/picker/orders/${order.id}`);
    } else if (order.status === 'delivered') {
      navigate(`/picker/orders/${order.id}`);
    } else if (order.status === 'cancelled') {
      // Handle accept again action
      navigate(`/picker/orders/${order.id}`);
    }
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <PickerDashboardSidebar activeTab="orders" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PickerDashboardHeader
          title="My Orders"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          {/* Filter Tabs */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accepted Orders</h2>
            <div className="flex gap-3 flex-wrap">
              {['all', 'pending', 'delivered', 'cancelled'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                    activeFilter === filter
                      ? 'bg-[#4D0013] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Grid */}
          {filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Orderer Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={order.orderer.avatar_url || '/api/avatars/default.jpg'}
                      alt={order.orderer.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{order.orderer.full_name}</p>
                      <p className="text-sm text-gray-600">{order.orderer.rating} ⭐</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                      {getStatusBadgeText(order.status)}
                    </span>
                  </div>

                  {/* Route Info */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {order.origin_city} → {order.destination_city}
                    </p>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                          >
                            <img
                              src={item.product_images?.[0] || '/api/products/default.jpg'}
                              alt={item.item_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order.items_count > 3 && (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-700">+{order.items_count - 3}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <p className="text-xs text-gray-600">
                          Total Items <span className="font-semibold text-gray-900">{order.items_count}</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          Reward: <span className="font-semibold text-gray-900">${typeof order.reward_amount === 'string' ? parseFloat(order.reward_amount).toFixed(2) : order.reward_amount.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleActionClick(order)}
                    className="w-full bg-[#4D0013] text-white py-2 rounded-lg font-bold text-sm hover:bg-[#660019] transition-colors"
                  >
                    {getActionButtonText(order.status)}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          )}
        </div>

        <MobileFooter activeTab="home" />
      </div>
    </div>
  );
};

export default PickerMyOrders;
