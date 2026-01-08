import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';

interface OrderItem {
  id: string;
  name: string;
  store: string;
  weight: string;
  reward: number;
  image_url?: string;
}

interface Picker {
  id: string;
  name: string;
  rating: number;
  avatar_url?: string;
}

interface OrderDetailsData {
  id: string;
  origin_city: string;
  destination_city: string;
  items: OrderItem[];
  picker: Picker;
  status: 'pending' | 'delivered' | 'cancelled';
  delivery_status?: 'completed' | 'issue' | null;
  remaining_time?: string;
}

// Mock data for UI development
const MOCK_ORDER: OrderDetailsData = {
  id: '1',
  origin_city: 'London',
  destination_city: 'Madrid',
  items: [
    {
      id: '1',
      name: 'Watch',
      store: 'Amazone',
      weight: '1/4kg',
      reward: 10,
      image_url: '/api/placeholder/150/150',
    },
  ],
  picker: {
    id: '1',
    name: 'Sarah M.',
    rating: 4.8,
    avatar_url: '/api/placeholder/80/80',
  },
  status: 'delivered',
  delivery_status: 'completed',
  remaining_time: '47h:12m',
};

const OrdererOrderDetailsView = () => {
  const { orderId } = useParams();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [order] = useState<OrderDetailsData>(MOCK_ORDER);
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [issueWithDelivery, setIssueWithDelivery] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTip, setSelectedTip] = useState('5');

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
          {/* Route Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {order.origin_city} - {order.destination_city}
            </h1>
          </div>

          <div className="max-w-xl mx-auto space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Route</p>
                <p className="font-semibold text-gray-900">From {order.origin_city} to {order.destination_city}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Item list</p>
                <p className="font-semibold text-gray-900">Watch</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Store</p>
                <p className="font-semibold text-gray-900">Amazone</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Weight</p>
                <p className="font-semibold text-gray-900">1/4kg</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Reward</p>
                <p className="font-semibold text-gray-900">$10</p>
              </div>
            </div>
          </div>

          {/* Product Image and Picker Info Section */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* Product Image */}
            <div className="w-40 h-40 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
              <img
                src={order.items[0]?.image_url || '/api/placeholder/150/150'}
                alt="Product"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Picker Info Section */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={order.picker.avatar_url || '/api/placeholder/80/80'}
                  alt={order.picker.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">JetPicker</h3>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{order.picker.name}</p>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">{order.picker.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Status Section */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-4 text-base">ORDER MARKED AS DELIVERED BY JETPICKER</h3>

            {/* Status Indicators */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setDeliveryCompleted(!deliveryCompleted)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  deliveryCompleted
                    ? 'border-green-500 bg-white'
                    : 'border-gray-300 bg-white'
                }`}>
                  {deliveryCompleted && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                </div>
                <p className="font-semibold text-gray-900 text-base">Delivery Completed</p>
              </button>
              <button
                onClick={() => setIssueWithDelivery(!issueWithDelivery)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  issueWithDelivery
                    ? 'border-red-500 bg-white'
                    : 'border-gray-300 bg-white'
                }`}>
                  {issueWithDelivery && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
                </div>
                <p className="font-semibold text-gray-900 text-base">Issue with delivery</p>
              </button>
            </div>

            {/* Remaining Time */}
            {order.remaining_time && (
              <div className="rounded-lg p-3 mb-6 text-center w-full" style={{ backgroundColor: '#FFF3BD' }}>
                <p className="font-semibold text-gray-900 text-sm">Remaining Time: {order.remaining_time}</p>
              </div>
            )}

            {/* Confirmation Message */}
            <p className="text-center text-gray-900 text-base">
              You have 48 hours to confirm. Otherwise money will be transferred automatically
            </p>
          </div>

          {/* Rate and Tip Section */}
          <div className="rounded-2xl p-8 mb-6" style={{ backgroundColor: '#FFFACD' }}>
            <h3 className="text-center font-bold text-gray-900 mb-6 text-lg">Rate your experience with Jetpicker</h3>

            {/* Star Rating */}
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Comment Box */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment"
              className="w-full bg-white rounded-lg p-4 mb-6 text-gray-900 placeholder-gray-500 focus:outline-none resize-none h-24 border border-gray-200"
            />

            {/* Tip Option */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <p className="font-semibold text-gray-900 mb-4">Tip Option</p>
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedTip('5')}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedTip === '5'
                      ? 'border-green-500 bg-white'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selectedTip === '5' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                  </div>
                  <span className="font-semibold text-gray-900">$5</span>
                </button>
                <button
                  onClick={() => setSelectedTip('10')}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedTip === '10'
                      ? 'border-green-500 bg-white'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selectedTip === '10' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                  </div>
                  <span className="font-semibold text-gray-900">$10</span>
                </button>
                <button
                  onClick={() => setSelectedTip('custom')}
                  className="flex items-center gap-3 cursor-pointer flex-1 whitespace-nowrap"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedTip === 'custom'
                      ? 'border-green-500 bg-white'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selectedTip === 'custom' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">Custom amount</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors">
              Submit
            </button>
          </div>
          </div>
        </div>

        <MobileFooter activeTab="home" />
      </div>
    </div>
  );
};

export default OrdererOrderDetailsView;
