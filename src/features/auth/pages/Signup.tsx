import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Toggle from '../../../components/ui/Toggle';
import RoleSelector from '../components/RoleSelector';
import signupBg from '../../../assets/signupbg.jpg';

const Signup = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<'orderer' | 'picker' | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const handleSignup = () => {
        if (selectedRole && agreed) {
            navigate('/profile-setup');
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

                <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />

                <div className="grid gap-1.5">
                    <Input
                        label="Username"
                        placeholder="Esther Howard"
                        icon={User}
                    />

                    <Input
                        label="Phone number"
                        placeholder="12301451223"
                        icon={Phone}
                        type="tel"
                    />

                    <Input
                        label="Email Address"
                        placeholder="bill.sanders@example.com"
                        icon={Mail}
                        type="email"
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

                    <Input
                        label="Confirm password"
                        placeholder="••••••"
                        icon={Lock}
                        type={showConfirmPassword ? "text" : "password"}
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
                    <Button onClick={handleSignup} className="max-w-[260px] w-full py-3 text-base tracking-wide rounded-xl">
                        Sign Up
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
