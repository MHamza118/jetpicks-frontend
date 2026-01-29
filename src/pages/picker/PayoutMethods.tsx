import { useState } from 'react';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';

type PayoutMethodType = 'bank' | 'paypal' | 'mobile';

const PayoutMethods = () => {
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethodType>('bank');
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    branchCode: '',
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
    // TODO: Integrate API to save payout method
    console.log('Saving payout method:', { selectedMethod, ...formData });
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

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 bg-white">
          <div className="max-w-2xl mx-auto">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Payout Methods</h1>

            {/* Select Payout Method Section */}
            <div className="max-w-md mx-auto">
              <h2 className="text-base font-bold text-gray-900 mb-6">Select Payout Method</h2>

              <div className="space-y-6">
                {/* Bank Account Option */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="radio"
                      id="bank"
                      name="payoutMethod"
                      value="bank"
                      checked={selectedMethod === 'bank'}
                      onChange={() => setSelectedMethod('bank')}
                      className="w-5 h-5 cursor-pointer accent-[#C41E3A]"
                    />
                    <label htmlFor="bank" className="text-sm font-semibold text-[#C41E3A] cursor-pointer">
                      Bank Account
                    </label>
                  </div>

                  {selectedMethod === 'bank' && (
                    <div className="space-y-6">
                      {/* Bank Name */}
                      <div>
                        <label className="text-sm font-semibold text-[#C41E3A] block mb-3">
                          Bank Name
                        </label>
                        <select
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#C41E3A] pb-2 cursor-pointer"
                        >
                          <option value="">Bank name</option>
                          <option value="Bank of America">Bank of America</option>
                          <option value="Chase">Chase</option>
                          <option value="Wells Fargo">Wells Fargo</option>
                        </select>
                      </div>

                      {/* Account Holder Name */}
                      <div>
                        <label className="text-sm font-semibold text-[#C41E3A] block mb-3">
                          Account Holder name
                        </label>
                        <input
                          type="text"
                          name="accountHolderName"
                          value={formData.accountHolderName}
                          onChange={handleInputChange}
                          placeholder="Name"
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#C41E3A] pb-2 placeholder-gray-400"
                        />
                      </div>

                      {/* Account Number/IBAN */}
                      <div>
                        <label className="text-sm font-semibold text-[#C41E3A] block mb-3">
                          Account Number/IBAN
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleInputChange}
                          placeholder="----/-----/----/-------"
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#C41E3A] pb-2 placeholder-gray-400"
                        />
                      </div>

                      {/* Branch Code */}
                      <div>
                        <label className="text-sm font-semibold text-[#C41E3A] block mb-3">
                          Branch Code
                        </label>
                        <input
                          type="text"
                          name="branchCode"
                          value={formData.branchCode}
                          onChange={handleInputChange}
                          placeholder="-----"
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#C41E3A] pb-2 placeholder-gray-400"
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
                      name="payoutMethod"
                      value="paypal"
                      checked={selectedMethod === 'paypal'}
                      onChange={() => setSelectedMethod('paypal')}
                      className="w-5 h-5 cursor-pointer accent-[#C41E3A]"
                    />
                    <label htmlFor="paypal" className="text-sm font-semibold text-[#C41E3A] cursor-pointer">
                      PayPal
                    </label>
                  </div>

                  {selectedMethod === 'paypal' && (
                    <div className="ml-8 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-[#C41E3A] block mb-2">
                          Enter PayPal Email
                        </label>
                        <input
                          type="email"
                          name="paypalEmail"
                          value={formData.paypalEmail}
                          onChange={handleInputChange}
                          placeholder="Enter Email"
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-[#C41E3A] pb-2 placeholder-gray-400"
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        Payments will be deposited to your PayPal account after order completion.
                      </p>
                    </div>
                  )}
                </div>

                {/* Mobile Wallet Option */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="radio"
                      id="mobile"
                      name="payoutMethod"
                      value="mobile"
                      checked={selectedMethod === 'mobile'}
                      onChange={() => setSelectedMethod('mobile')}
                      className="w-5 h-5 cursor-pointer accent-[#C41E3A]"
                    />
                    <label htmlFor="mobile" className="text-sm font-semibold text-[#C41E3A] cursor-pointer">
                      Mobile Wallet
                    </label>
                  </div>

                  {selectedMethod === 'mobile' && (
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-semibold text-[#C41E3A] block mb-3">
                          Wallet Type
                        </label>
                        <select
                          name="walletType"
                          value={formData.walletType}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#C41E3A] pb-2 cursor-pointer"
                        >
                          <option value="Wallet">Wallet</option>
                          <option value="Apple Pay">Apple Pay</option>
                          <option value="Google Pay">Google Pay</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-[#C41E3A] block mb-3">
                          Registered Mobile Number
                        </label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleInputChange}
                          placeholder="Enter Mobile Number"
                          className="w-full bg-transparent border-b-2 border-gray-300 text-gray-600 text-sm focus:outline-none focus:border-[#C41E3A] pb-2 placeholder-gray-400"
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
                className="w-full bg-[#C41E3A] text-white py-3 rounded-lg font-bold text-base hover:bg-[#A01830] transition-colors"
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

export default PayoutMethods;
