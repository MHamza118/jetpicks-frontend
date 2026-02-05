import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import signupbg2Image from '../../assets/signupbg2.png';
import { passwordResetApi } from '../../services/passwordReset';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setError(null);
    };

    const validateForm = (): boolean => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await passwordResetApi.forgotPassword(email);
            setSuccess(true);
            setError(null);
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to send reset link. Please try again.';
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

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center overflow-auto py-6"
            style={{
                backgroundImage: `url(${signupbg2Image})`,
                backgroundSize: 'cover',
                backgroundPosition: window.innerWidth < 768 ? 'right center' : 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="w-full max-w-[480px] p-8 mx-4">
                <div className="mb-6">
                    <h1 className="text-[28px] font-bold text-gray-900">Forgot Password?</h1>
                    <p className="text-gray-500 font-medium text-xs">We'll send you a reset link</p>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            <p className="font-semibold mb-2">Check your email!</p>
                            <p className="text-sm">We've sent a password reset link to <span className="font-bold">{email}</span></p>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">
                            The link will expire in 15 minutes. If you don't see the email, check your spam folder.
                        </p>
                        <Button
                            onClick={() => navigate('/')}
                            className="max-w-[260px] w-full py-3 text-base tracking-wide rounded-xl"
                        >
                            Back to Login
                        </Button>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-6">
                            <p className="text-gray-600 text-sm mb-4">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            <Input
                                label="Email Address"
                                placeholder="your.email@example.com"
                                icon={Mail}
                                type="email"
                                value={email}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate('/')}
                                className="flex-1 py-3 text-base tracking-wide rounded-xl bg-gray-200 text-gray-900 hover:bg-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                className="flex-1 py-3 text-base tracking-wide rounded-xl"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
