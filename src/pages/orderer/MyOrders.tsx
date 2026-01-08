import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';

interface Order {
  id: string;
  origin_city: string;
  destination_city: string;
  status: 'pending' | 'delivered' | 'cancelled';
  items_count: number;
  total_cost: number;
  created_at: string;
}

// Mock data for UI development
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    origin_city: 'London',
    destination_city: 'Spain',
    status: 'delivered',
    items_count: 3,
    total_cost: 70,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    origin_city: 'London',
    destination_city: 'Spain',
    status: 'delivered',
    items_count: 3,
    total_cost: 70,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    origin_city: 'London',
    destination_city: 'Spain',
    status: 'delivered',
    items_count: 3,
    total_cost: 70,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    origin_city: 'London',
    destination_city: 'Spain',
    status: 'delivered',
    items_count: 3,
    total_cost: 70,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    origin_city: 'London',
    destination_city: 'Spain',
    status: 'delivered',
    items_count: 3,
    total_cost: 70,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    origin_city: 'London',
    destination_city: 'Spain',
    status: 'delivered',
    items_count: 3,
    total_cost: 70,
    created_at: new Date().toISOString(),
  },
];

const OrdererMyOrders = () => {
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

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="orders" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader
          title="My Orders"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          {/* Order History Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order History</h2>
            <div className="flex gap-3 flex-wrap">
              {['all', 'pending', 'delivered', 'cancelled'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                    activeFilter === filter
                      ? 'bg-[#FFDF57] text-gray-900'
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
                  {/* Route, Date and Status Badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {order.origin_city} - {order.destination_city}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                      {getStatusBadgeText(order.status)}
                    </span>
                  </div>

                  {/* Items and Cost */}
                  <div className="mb-6 pb-6 border-b border-gray-200 flex items-center justify-between gap-4">
                    <div className="border-2 border-[#FFDF57] rounded-lg px-4 py-2">
                      <p className="text-sm font-semibold text-gray-900">{order.items_count} Items</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Total Cost: <span className="font-semibold text-gray-900">${order.total_cost}</span>
                    </p>
                  </div>

                  {/* View Order Details Button */}
                  <button
                    onClick={() => navigate(`/orderer/orders/${order.id}`)}
                    className="w-full bg-[#FFDF57] text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors"
                  >
                    View Order Details
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

export default OrdererMyOrders;
