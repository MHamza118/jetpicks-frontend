import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import signupBg from '../../../assets/signupbg.jpg';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        navigate('/profile-setup');
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

                <div className="grid gap-2">
                    <Input
                        label="Username"
                        placeholder="Esther Howard"
                        icon={User}
                    />

                    <Input
                        label="Password"
                        placeholder="••••••"
                        icon={Lock}
                        type={showPassword ? "text" : "password"}
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
                    <Button onClick={handleLogin} className="max-w-[260px] w-full py-4 text-base tracking-wide rounded-xl">
                        Log In
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
