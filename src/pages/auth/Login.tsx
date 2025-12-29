import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import signupBg from '../../assets/signupbg.jpg';
import { authApi } from '../../api';
import { storage } from '../../utils';
import { STORAGE_KEYS } from '../../constants';
import type { LoginPayload } from '../../@types';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
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
        if (!formData.username.trim()) {
            setError('Username or email is required');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload: LoginPayload = {
                username: formData.username,
                password: formData.password,
            };

            const response = await authApi.login(payload);

            // Store token and user data
            storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
            storage.set(STORAGE_KEYS.USER, response.data.user);

            // Role-based navigation
            if (response.data.user.roles && response.data.user.roles.includes('PICKER')) {
                navigate('/travel-availability-setup');
            } else {
                navigate('/orderer/dashboard');
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'Login failed. Please try again.';
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
                    <h1 className="text-[28px] font-bold text-gray-900 mb-1">Welcome Back</h1>
                    <p className="text-gray-500 font-medium text-xs">Pick the parcel and start earning</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="grid gap-2">
                    <Input
                        label="Username"
                        placeholder="Esther Howard"
                        icon={Mail}
                        name="username"
                        value={formData.username}
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
                </div>

                <div className="mt-8 text-center text-sm text-gray-600">
                    <p>By connecting your account confirm that you agree with our <span className="font-bold text-gray-900">Term and Condition</span></p>
                </div>

                <div className="mt-10 flex justify-center">
                    <Button 
                        onClick={handleLogin} 
                        className="max-w-[260px] w-full py-4 text-base tracking-wide rounded-xl"
                        disabled={loading}
                    >
                        {loading ? 'Logging In...' : 'Log In'}
                    </Button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <span>Don't have an account? </span>
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-gray-900 font-semibold hover:underline"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
