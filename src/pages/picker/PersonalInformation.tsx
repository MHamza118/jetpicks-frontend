import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Flag, Globe, EyeOff } from 'lucide-react';
import eyeSvg from '../../assets/eye.svg';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useUser } from '../../context/UserContext';

const PersonalInformation = () => {
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const [formData, setFormData] = useState({
    username: 'Esther Howard',
    phone: '12301451223',
    email: 'bill.sanders@example.com',
    password: '122456',
    country: 'Spain',
    languages: ['Spanish', 'English'],
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Integrate API to save personal information
    console.log('Saving personal information:', formData);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Personal Details</h1>

            {/* Form Container */}
            <div className="space-y-3 mb-8 max-w-md mx-auto">
              {/* Username Field */}
              <div className="bg-pink-100 rounded-lg p-3 flex items-center gap-3">
                <User size={20} className="text-[#4D0013] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-[#4D0013] font-medium block leading-none">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none leading-tight text-sm"
                  />
                </div>
              </div>

              {/* Phone Number Field */}
              <div className="bg-pink-100 rounded-lg p-3 flex items-center gap-3">
                <Phone size={20} className="text-[#4D0013] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-[#4D0013] font-medium block leading-none">Phone number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none leading-tight text-sm"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="bg-pink-100 rounded-lg p-3 flex items-center gap-3">
                <Mail size={20} className="text-[#4D0013] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-[#4D0013] font-medium block leading-none">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none leading-tight text-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="bg-pink-100 rounded-lg p-3 flex items-center gap-3">
                <Lock size={20} className="text-[#4D0013] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-[#4D0013] font-medium block leading-none">Password</label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent text-gray-900 font-semibold focus:outline-none leading-tight text-sm"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#4D0013] hover:opacity-70 transition-opacity flex-shrink-0"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-[#4D0013]" />
                      ) : (
                        <img src={eyeSvg} alt="Show password" className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Country Field */}
              <div className="bg-pink-100 rounded-lg p-3 flex items-center gap-3">
                <Flag size={20} className="text-[#4D0013] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-[#4D0013] font-medium block leading-none">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-gray-900 font-semibold focus:outline-none cursor-pointer leading-tight text-sm"
                  >
                    <option value="Spain">Spain</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>

              {/* Languages Field */}
              <div className="bg-pink-100 rounded-lg p-3 flex items-center gap-3">
                <Globe size={20} className="text-[#4D0013] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-[#4D0013] font-medium block leading-none">Languages</label>
                  <div className="flex gap-2">
                    {formData.languages.map((lang) => (
                      <span key={lang} className="text-gray-900 font-semibold text-xs leading-tight">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="bg-[#C41E3A] text-white py-3 px-16 rounded-lg font-bold text-base hover:bg-[#A01830] transition-colors max-w-sm mx-auto block"
            >
              Save
            </button>
          </div>
        </div>

        <MobileFooter activeTab="profile" />
      </div>
    </div>
  );
};

export default PersonalInformation;
