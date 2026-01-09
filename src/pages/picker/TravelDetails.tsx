import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';
import { pickerProfileApi } from '../../services/picker/profile';

interface TravelJourney {
  id: string;
  departure_country: string;
  departure_city: string;
  departure_date: string;
  arrival_country: string;
  arrival_city: string;
  arrival_date: string;
  luggage_weight_capacity: string;
  created_at: string;
}

const TravelDetails = () => {
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [expandedHistory, setExpandedHistory] = useState(true);
  const [weightCapacity, setWeightCapacity] = useState('10');
  const [expandedCapacity, setExpandedCapacity] = useState(false);
  const [travelHistory, setTravelHistory] = useState<TravelJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Fetch travel journeys on mount
  useEffect(() => {
    const fetchTravelJourneys = async () => {
      try {
        setLoading(true);
        const response = await pickerProfileApi.getTravelJourneys();
        setTravelHistory(response.data);
        // Set weight capacity from the first (active) journey if it exists
        if (response.data.length > 0) {
          setWeightCapacity(response.data[0].luggage_weight_capacity);
        }
      } catch (err) {
        setError('Failed to load travel history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelJourneys();
  }, []);

  const handleCreateJourney = () => {
    navigate('/picker/create-journey');
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

            {/* Status Messages */}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-4">{success}</div>}

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
                    {loading ? (
                      <p className="text-xs text-gray-500">Loading travel history...</p>
                    ) : error ? (
                      <p className="text-xs text-red-500">{error}</p>
                    ) : travelHistory.length > 0 ? (
                      travelHistory.map((journey) => (
                        <div key={journey.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-b-0">
                          <p className="text-xs font-semibold text-[#C41E3A]">
                            From {journey.departure_city}, {journey.departure_country} - {journey.arrival_city}, {journey.arrival_country}
                          </p>
                          <p className="text-xs font-semibold text-[#C41E3A]">
                            {new Date(journey.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No travel history yet</p>
                    )}
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
                onClick={async () => {
                  try {
                    setSaving(true);
                    setError('');
                    setSuccess('');

                    // Get the active (first) journey
                    if (travelHistory.length === 0) {
                      setError('No active travel journey found');
                      setSaving(false);
                      return;
                    }

                    const activeJourney = travelHistory[0];
                    await pickerProfileApi.updateTravelJourney(activeJourney.id, {
                      luggage_weight_capacity: weightCapacity,
                    });

                    setSuccess('Weight capacity updated successfully');
                    setTimeout(() => setSuccess(''), 3000);
                  } catch (err) {
                    setError('Failed to update weight capacity');
                    console.error(err);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving || loading}
                className="bg-[#C41E3A] text-white py-3 px-12 rounded-lg font-bold text-sm hover:bg-[#A01830] transition-colors mx-auto block disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
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
