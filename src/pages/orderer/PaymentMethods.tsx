import { useState } from 'react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';

type PaymentMethodType = 'card' | 'paypal' | 'wallet';

const PaymentMethods = () => {
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('card');
  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    paypalEmail: '',
    walletType: 'Wallet',
    mobileNumber: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Integrate API to save payment method
    console.log('Saving payment method:', { selectedMethod, ...formData });
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="profile" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader
          title="Profile"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 bg-white">
          <div className="max-w-2xl mx-auto">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment Methods</h1>

            {/* Select Payment Method Section */}
            <div className="max-w-md mx-auto">
              <h2 className="text-base font-bold text-gray-900 mb-6">Select Payment Method</h2>

              <div className="space-y-6">
                {/* Credit/Debit Card Option */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="radio"
                      id="card"
                      name="paymentMethod"
                      value="card"
                      checked={selectedMethod === 'card'}
                      onChange={() => setSelectedMethod('card')}
                      className="w-5 h-5 cursor-pointer accent-[#FFDF57]"
                    />
                    <label htmlFor="card" className="text-sm font-semibold text-gray-900 cursor-pointer">
                      Credit/Debit Card
                    </label>
                  </div>

                  {selectedMethod === 'card' && (
                    <div className="space-y-6">
                      {/* Card Holder Name */}
                      <div>
                        <label className="text-sm font-semibold text-gray-900 block mb-3">
                          Card Holder Name
                        </label>
                        <input
                          type="text"
                          name="cardHolderName"
                          value={formData.cardHolderName}
                          onChange={handleInputChange}
                          placeholder="Name"
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#FFDF57] pb-2 placeholder-gray-400"
                        />
                      </div>

                      {/* Card Number */}
                      <div>
                        <label className="text-sm font-semibold text-gray-900 block mb-3">
                          Card Number
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#FFDF57] pb-2 placeholder-gray-400"
                        />
                      </div>

                      {/* Expiry and CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-900 block mb-3">
                            Expiry Month
                          </label>
                          <input
                            type="text"
                            name="expiryMonth"
                            value={formData.expiryMonth}
                            onChange={handleInputChange}
                            placeholder="MM"
                            className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#FFDF57] pb-2 placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-900 block mb-3">
                            Expiry Year
                          </label>
                          <input
                            type="text"
                            name="expiryYear"
                            value={formData.expiryYear}
                            onChange={handleInputChange}
                            placeholder="YY"
                            className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#FFDF57] pb-2 placeholder-gray-400"
                          />
                        </div>
                      </div>

                      {/* CVV */}
                      <div>
                        <label className="text-sm font-semibold text-gray-900 block mb-3">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#FFDF57] pb-2 placeholder-gray-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal Option */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="radio"
                      id="paypal"
                      name="paymentMethod"
                      value="paypal"
                      checked={selectedMethod === 'paypal'}
                      onChange={() => setSelectedMethod('paypal')}
                      className="w-5 h-5 cursor-pointer accent-[#FFDF57]"
                    />
                    <label htmlFor="paypal" className="text-sm font-semibold text-gray-900 cursor-pointer">
                      PayPal
                    </label>
                  </div>

                  {selectedMethod === 'paypal' && (
                    <div className="ml-8 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-900 block mb-2">
                          Enter PayPal Email
                        </label>
                        <input
                          type="email"
                          name="paypalEmail"
                          value={formData.paypalEmail}
                          onChange={handleInputChange}
                          placeholder="Enter Email"
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-[#FFDF57] pb-2 placeholder-gray-400"
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        Payments will be processed through your PayPal account.
                      </p>
                    </div>
                  )}
                </div>

                {/* Mobile Wallet Option */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="radio"
                      id="wallet"
                      name="paymentMethod"
                      value="wallet"
                      checked={selectedMethod === 'wallet'}
                      onChange={() => setSelectedMethod('wallet')}
                      className="w-5 h-5 cursor-pointer accent-[#FFDF57]"
                    />
                    <label htmlFor="wallet" className="text-sm font-semibold text-gray-900 cursor-pointer">
                      Mobile Wallet
                    </label>
                  </div>

                  {selectedMethod === 'wallet' && (
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-semibold text-gray-900 block mb-3">
                          Wallet Type
                        </label>
                        <select
                          name="walletType"
                          value={formData.walletType}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#FFDF57] pb-2 cursor-pointer"
                        >
                          <option value="Wallet">Wallet</option>
                          <option value="Apple Pay">Apple Pay</option>
                          <option value="Google Pay">Google Pay</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-900 block mb-3">
                          Registered Mobile Number
                        </label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleInputChange}
                          placeholder="Enter Mobile Number"
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#FFDF57] pb-2 placeholder-gray-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-12 max-w-md mx-auto">
              <button
                onClick={handleSave}
                className="w-full bg-[#FFDF57] text-gray-900 py-3 rounded-lg font-bold text-base hover:bg-yellow-500 transition-colors"
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

export default PaymentMethods;
