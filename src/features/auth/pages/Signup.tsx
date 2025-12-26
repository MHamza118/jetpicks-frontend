import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Toggle from '../../../components/ui/Toggle';
import RoleSelector from '../components/RoleSelector';
import signupBg from '../../../assets/signupbg.jpg';
import { authApi } from '../../../services/authApi';
import { storage } from '../../../utils';
import { STORAGE_KEYS } from '../../../constants';
import type { SignupPayload } from '../../../types';

const Signup = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<'ORDERER' | 'PICKER' | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        email: '',
        password: '',
        confirm_password: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
    };

    const validateForm = (): boolean => {
        if (!formData.full_name.trim()) {
            setError('Full name is required');
            return false;
        }
        if (!formData.phone_number.trim()) {
            setError('Phone number is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return false;
        }
        if (!selectedRole) {
            setError('Please select a role');
            return false;
        }
        if (!agreed) {
            setError('You must agree to terms and conditions');
            return false;
        }
        return true;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload: SignupPayload = {
                full_name: formData.full_name,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password,
                confirm_password: formData.confirm_password,
                roles: [selectedRole as 'ORDERER' | 'PICKER'],
            };

            const response = await authApi.register(payload);

            // Store token and user data
            storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
            storage.set(STORAGE_KEYS.USER, response.data.user);

            // Navigate to profile setup or dashboard
            navigate('/profile-setup');
        } catch (err: any) {
            const errorMessage = err?.message || 'Signup failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-no-repeat overflow-auto py-6"
            style={{ backgroundImage: `url(${signupBg})`, backgroundPosition: 'center 70%' }}
        >
            <div className="w-full max-w-[480px] border border-white/20 bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_0_50px_rgba(255,255,255,0.3)] mx-4">
                <div className="text-center mb-6">
                    <h1 className="text-[28px] font-bold text-gray-900 mb-1">Sign Up</h1>
                    <p className="text-gray-500 font-medium text-xs">Create your jetpicker account</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />

                <div className="grid gap-1.5">
                    <Input
                        label="Full Name"
                        placeholder="Esther Howard"
                        icon={User}
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                    />

                    <Input
                        label="Phone number"
                        placeholder="12301451223"
                        icon={Phone}
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                    />

                    <Input
                        label="Email Address"
                        placeholder="bill.sanders@example.com"
                        icon={Mail}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                    />

                    <Input
                        label="Password"
                        placeholder="••••••"
                        icon={Lock}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        rightIcon={
                            <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-700">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />

                    <Input
                        label="Confirm password"
                        placeholder="••••••"
                        icon={Lock}
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        rightIcon={
                            <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500 hover:text-gray-700">
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />
                </div>

                <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium text-sm">Remember me</span>
                        <Toggle enabled={rememberMe} onChange={setRememberMe} />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setAgreed(!agreed)}
                            className={`w-5 h-5 rounded-[4px] flex items-center justify-center border-2 transition-all ${agreed ? 'bg-gray-900 border-gray-900' : 'bg-transparent border-gray-400'
                                }`}
                        >
                            {agreed && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                        <span className="text-gray-900 font-bold text-sm">
                            I agree to terms and conditions
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <Button 
                        onClick={handleSignup} 
                        className="max-w-[260px] w-full py-3 text-base tracking-wide rounded-xl"
                        disabled={loading}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </Button>
                </div>

                <div className="mt-4 text-center text-xs text-gray-600">
                    <span>Already have an account? </span>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-900 font-semibold hover:underline"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Signup;
