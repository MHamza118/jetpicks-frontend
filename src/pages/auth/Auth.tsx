import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import RoleSelector from '../../components/auth/RoleSelector';
import signupbg2Image from '../../assets/signupbg2.png';
import { authApi } from '../../services';
import { googleAuthApi } from '../../services/googleAuth';
import { storage } from '../../utils';
import { STORAGE_KEYS } from '../../constants';
import type { LoginPayload, SignupPayload } from '../../@types';

const Auth = () => {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);

    // Login state
    const [showPassword, setShowPassword] = useState(false);
    const [loginFormData, setLoginFormData] = useState({
        username: '',
        password: '',
    });

    // Signup state
    const [selectedRole, setSelectedRole] = useState<'ORDERER' | 'PICKER' | null>(null);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [signupFormData, setSignupFormData] = useState({
        full_name: '',
        phone_number: '',
        email: '',
        password: '',
        confirm_password: '',
    });

    // Common state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
    };

    const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let finalValue = value;

        // Only allow numbers for phone_number field
        if (name === 'phone_number') {
            finalValue = value.replace(/[^0-9]/g, '');
        }

        setSignupFormData(prev => ({
            ...prev,
            [name]: finalValue,
        }));
        setError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !loading) {
            if (isSignup) {
                handleSignup();
            } else {
                handleLogin();
            }
        }
    };

    const validateLoginForm = (): boolean => {
        if (!loginFormData.username.trim()) {
            setError('Username or email is required');
            return false;
        }
        if (!loginFormData.password) {
            setError('Password is required');
            return false;
        }
        return true;
    };

    const validateSignupForm = (): boolean => {
        if (!signupFormData.full_name.trim()) {
            setError('Full name is required');
            return false;
        }
        if (!signupFormData.phone_number.trim()) {
            setError('Phone number is required');
            return false;
        }
        if (!signupFormData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!signupFormData.password) {
            setError('Password is required');
            return false;
        }
        if (signupFormData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (signupFormData.password !== signupFormData.confirm_password) {
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

    const handleLogin = async () => {
        if (!validateLoginForm()) return;

        setLoading(true);
        try {
            const payload: LoginPayload = {
                username: loginFormData.username,
                password: loginFormData.password,
            };

            const response = await authApi.login(payload);

            storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
            storage.set(STORAGE_KEYS.USER, response.data.user);

            if (response.data.user.roles && response.data.user.roles.includes('PICKER')) {
                navigate('/picker/dashboard');
            } else {
                navigate('/orderer/dashboard');
            }
        } catch (err: Error | unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!validateSignupForm()) return;

        setLoading(true);
        try {
            const payload: SignupPayload = {
                full_name: signupFormData.full_name,
                email: signupFormData.email,
                phone_number: signupFormData.phone_number,
                password: signupFormData.password,
                confirm_password: signupFormData.confirm_password,
                roles: [selectedRole as 'ORDERER' | 'PICKER'],
            };

            const response = await authApi.register(payload);

            storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
            storage.set(STORAGE_KEYS.USER, response.data.user);

            navigate('/profile-setup', { replace: true });
        } catch (err: Error | unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (mode: 'login' | 'signup') => {
        setError(null);
        setIsSignup(mode === 'signup');
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (codeResponse: any) => {
            setLoading(true);
            try {
                // For signup, require role selection
                if (isSignup && !selectedRole) {
                    setError('Please select a role before signing up with Google');
                    setLoading(false);
                    return;
                }

                // Send the access token to backend for verification
                const response = await googleAuthApi.login({
                    idToken: codeResponse.access_token,
                    role: isSignup ? selectedRole : undefined,
                });

                storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
                storage.set(STORAGE_KEYS.USER, response.data.user);

                // If new user, go to profile setup
                if ((response.data as any).isNewUser) {
                    navigate('/profile-setup', { replace: true });
                } else {
                    // Existing user, go to dashboard
                    if (response.data.user.roles && response.data.user.roles.includes('PICKER')) {
                        navigate('/picker/dashboard');
                    } else {
                        navigate('/orderer/dashboard');
                    }
                }
            } catch (err: any) {
                // Log the actual error for debugging
                console.error('Google login error:', err.response?.data || err.message);
                const errorMessage = err.response?.data?.message || err.message || 'Google login failed. Please try again.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError('Google login failed. Please try again.');
        },
    });

    if (isSignup) {
        return (
            <div 
                className="h-screen w-full flex items-center justify-start overflow-hidden"
                style={{
                    backgroundImage: `url(${signupbg2Image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Form Container - Left Side */}
                <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center px-4 md:px-6">
                    <div className="w-full max-w-[480px] p-5">
                        <div className="text-center mb-3">
                            <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Sign Up</h1>
                            <p className="text-gray-600 font-medium text-xs">Create your jetpicker account</p>
                        </div>

                        {error && (
                            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
                                {error}
                            </div>
                        )}

                        <div className="mb-2">
                            <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
                        </div>

                        <div className="grid gap-2">
                            <Input
                                label="Full Name"
                                placeholder="Esther Howard"
                                icon={User}
                                name="full_name"
                                value={signupFormData.full_name}
                                onChange={handleSignupInputChange}
                                onKeyDown={handleKeyDown}
                            />

                            <Input
                                label="Phone number"
                                placeholder="+44 7911 123456"
                                icon={Phone}
                                type="tel"
                                name="phone_number"
                                value={signupFormData.phone_number}
                                onChange={handleSignupInputChange}
                                onKeyDown={handleKeyDown}
                            />

                            <Input
                                label="Email Address"
                                placeholder="example@gmail.com"
                                icon={Mail}
                                type="email"
                                name="email"
                                value={signupFormData.email}
                                onChange={handleSignupInputChange}
                                onKeyDown={handleKeyDown}
                            />

                            <Input
                                label="Password"
                                placeholder="••••••"
                                icon={Lock}
                                type={showSignupPassword ? "text" : "password"}
                                name="password"
                                value={signupFormData.password}
                                onChange={handleSignupInputChange}
                                onKeyDown={handleKeyDown}
                                rightIcon={
                                    <button onClick={() => setShowSignupPassword(!showSignupPassword)} className="text-gray-500 hover:text-gray-700">
                                        {showSignupPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                }
                            />

                            <Input
                                label="Confirm password"
                                placeholder="••••••"
                                icon={Lock}
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirm_password"
                                value={signupFormData.confirm_password}
                                onChange={handleSignupInputChange}
                                onKeyDown={handleKeyDown}
                                rightIcon={
                                    <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500 hover:text-gray-700">
                                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                }
                            />
                        </div>

                        <div className="mt-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium text-xs">Remember me</span>
                                <Toggle enabled={rememberMe} onChange={setRememberMe} />
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setAgreed(!agreed)}
                                    className={`w-3.5 h-3.5 rounded-[2px] flex items-center justify-center border-2 transition-all flex-shrink-0 ${agreed ? 'bg-gray-900 border-gray-900' : 'bg-transparent border-gray-400'
                                        }`}
                                >
                                    {agreed && (
                                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                                <span className="text-gray-900 font-semibold text-xs">
                                    I agree to Terms and Conditions
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 flex justify-center">
                            <Button 
                                onClick={handleSignup} 
                                className="w-full py-2 text-sm tracking-wide rounded"
                                disabled={loading}
                            >
                                {loading ? 'Signing Up...' : 'Sign Up'}
                            </Button>
                        </div>

                        <div className="mt-2 flex justify-center">
                            <button
                                onClick={() => handleGoogleLogin()}
                                disabled={loading}
                                className="w-full py-2 px-3 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Google
                            </button>
                        </div>

                        <div className="mt-2 text-center text-xs text-gray-700">
                            <span>Already have an account? </span>
                            <button
                                onClick={() => switchMode('login')}
                                className="text-gray-900 font-semibold hover:underline"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="h-screen w-full flex items-center justify-start overflow-hidden"
            style={{
                backgroundImage: `url(${signupbg2Image})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Form Container - Left Side */}
            <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center px-4 md:px-8">
                <div className="w-full max-w-[500px] p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600 font-medium text-base">Pick the parcel and start earning</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-3">
                        <Input
                            label="Username"
                            placeholder="Esther Howard"
                            icon={Mail}
                            name="username"
                            value={loginFormData.username}
                            onChange={handleLoginInputChange}
                            onKeyDown={handleKeyDown}
                        />

                        <Input
                            label="Password"
                            placeholder="••••••"
                            icon={Lock}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={loginFormData.password}
                            onChange={handleLoginInputChange}
                            onKeyDown={handleKeyDown}
                            rightIcon={
                                <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-700">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                        />
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>By connecting your account confirm that you agree with our <span className="font-bold text-gray-900">Term and Condition</span></p>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Button 
                            onClick={handleLogin} 
                            className="w-full py-3 text-base tracking-wide rounded-lg"
                            disabled={loading}
                        >
                            {loading ? 'Logging In...' : 'Log In'}
                        </Button>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => handleGoogleLogin()}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-white border-2 border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    <div className="mt-6 text-center text-base text-gray-600">
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="text-gray-900 font-semibold hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <div className="mt-6 text-center text-base text-gray-600">
                        <span>Don't have an account? </span>
                        <button
                            onClick={() => switchMode('signup')}
                            className="text-gray-900 font-semibold hover:underline"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
