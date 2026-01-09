import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';

interface TravelJourney {
  id: string;
  from: string;
  to: string;
  date: string;
}

const TravelDetails = () => {
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [expandedHistory, setExpandedHistory] = useState(true);
  const [weightCapacity, setWeightCapacity] = useState('10');
  const [expandedCapacity, setExpandedCapacity] = useState(false);

  // Mock travel history data
  const [travelHistory] = useState<TravelJourney[]>([
    { id: '1', from: 'London', to: 'Madrid', date: '12 Dec' },
    { id: '2', from: 'London', to: 'Madrid', date: '12 Dec' },
    { id: '3', from: 'London', to: 'Madrid', date: '12 Dec' },
  ]);

  const handleCreateJourney = () => {
    navigate('/picker/create-journey');
  };

  const handleSaveCapacity = () => {
    // TODO: Integrate API to save weight capacity
    console.log('Saving weight capacity:', weightCapacity);
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <PickerDashboardSidebar activeTab="profile" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PickerDashboardHeader
          title="Profile"
          showBackButton={true}
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-0 bg-white">
          <div className="max-w-2xl mx-auto">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Travel Details</h1>

            {/* Travel History Section */}
            <div className="mb-8 max-w-md mx-auto">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <button
                  onClick={() => setExpandedHistory(!expandedHistory)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h2 className="text-base font-bold text-gray-900">Travel History</h2>
                  <ChevronDown
                    size={18}
                    className={`text-gray-600 transition-transform ${expandedHistory ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedHistory && (
                  <div className="space-y-2">
                    {travelHistory.map((journey) => (
                      <div key={journey.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-b-0">
                        <p className="text-xs font-semibold text-[#C41E3A]">
                          From {journey.from} -{journey.to}
                        </p>
                        <p className="text-xs font-semibold text-[#C41E3A]">{journey.date}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Create New Journey Button */}
            <div className="mb-8 max-w-md mx-auto">
              <button
                onClick={handleCreateJourney}
                className="bg-[#C41E3A] text-white py-2.5 px-8 rounded-lg font-bold text-sm hover:bg-[#A01830] transition-colors mx-auto block"
              >
                Create new Journey
              </button>
            </div>

            {/* Weight Capacity Section */}
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setExpandedCapacity(!expandedCapacity)}
                className="w-full flex items-center justify-between pb-3 border-b border-gray-300"
              >
                <h2 className="text-base font-bold text-gray-900">Update weight capacity</h2>
                <ChevronDown
                  size={18}
                  className={`text-[#4D0013] transition-transform ${expandedCapacity ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedCapacity && (
                <div className="space-y-3 pt-4">
                  <div>
                    <select
                      value={weightCapacity}
                      onChange={(e) => setWeightCapacity(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 text-gray-900 font-semibold text-xs focus:outline-none focus:border-[#C41E3A] pb-2"
                    >
                      <option value="5">5kg</option>
                      <option value="10">10kg</option>
                      <option value="15">15kg</option>
                      <option value="20">20kg</option>
                      <option value="25">25kg</option>
                      <option value="30">30kg</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-8 max-w-md mx-auto">
              <button
                onClick={handleSaveCapacity}
                className="bg-[#C41E3A] text-white py-3 px-12 rounded-lg font-bold text-sm hover:bg-[#A01830] transition-colors mx-auto block"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <MobileFooter activeTab="profile" />
      </div>
    </div>
  );
};

export default TravelDetails;
