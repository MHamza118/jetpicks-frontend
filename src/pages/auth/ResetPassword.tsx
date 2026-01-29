import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import signupBg from '../../assets/signupbg.jpg';
import { passwordResetApi } from '../../services/passwordReset';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
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
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (!formData.confirmPassword) {
            setError('Please confirm your password');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (!token || !email) {
            setError('Invalid reset link. Please request a new one.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await passwordResetApi.resetPassword(
                token!,
                email!,
                formData.password,
                formData.confirmPassword
            );
            setSuccess(true);
            setError(null);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to reset password. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !loading) {
            handleSubmit();
        }
    };

    if (!token || !email) {
        return (
            <div
                className="min-h-screen w-full flex items-center justify-center bg-cover bg-no-repeat overflow-auto py-6"
                style={{ backgroundImage: `url(${signupBg})`, backgroundPosition: 'center 70%' }}
            >
                <div className="w-full max-w-[480px] border border-white/20 bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_0_50px_rgba(255,255,255,0.3)] mx-4 text-center">
                    <h1 className="text-[28px] font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
                    <p className="text-gray-600 mb-6">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Button
                        onClick={() => navigate('/')}
                        className="max-w-[260px] w-full py-4 text-base tracking-wide rounded-xl"
                    >
                        Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-no-repeat overflow-auto py-6"
            style={{ backgroundImage: `url(${signupBg})`, backgroundPosition: 'center 70%' }}
        >
            <div className="w-full max-w-[480px] border border-white/20 bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_0_50px_rgba(255,255,255,0.3)] mx-4">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="p-1 hover:opacity-80 transition-opacity"
                    >
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <div>
                        <h1 className="text-[28px] font-bold text-gray-900">Reset Password</h1>
                        <p className="text-gray-500 font-medium text-xs">Create a new password</p>
                    </div>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            <p className="font-semibold">Password Reset Successfully!</p>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">
                            Your password has been reset. Redirecting to login...
                        </p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-2 mb-6">
                            <Input
                                label="New Password"
                                placeholder="••••••"
                                icon={Lock}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                rightIcon={
                                    <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-700">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />

                            <Input
                                label="Confirm Password"
                                placeholder="••••••"
                                icon={Lock}
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                rightIcon={
                                    <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500 hover:text-gray-700">
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate('/')}
                                className="flex-1 py-4 text-base tracking-wide rounded-xl bg-gray-200 text-gray-900 hover:bg-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                className="flex-1 py-4 text-base tracking-wide rounded-xl"
                                disabled={loading}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
