import { Briefcase, Package } from 'lucide-react';

interface RoleSelectorProps {
    selectedRole: 'ORDERER' | 'PICKER' | null;
    onRoleChange: (role: 'ORDERER' | 'PICKER') => void;
}

const RoleSelector = ({ selectedRole, onRoleChange }: RoleSelectorProps) => {
    return (
        <div className="mb-3">
            <p className="text-gray-900 font-bold text-xs mb-1.5">Select your role</p>
            <div className="grid grid-cols-2 gap-1.5">
                <button
                    onClick={() => onRoleChange('ORDERER')}
                    className={`py-2 px-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        selectedRole === 'ORDERER'
                            ? 'border-[#FFDF57] bg-[#FFDF57]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                    <Briefcase size={18} className={selectedRole === 'ORDERER' ? 'text-gray-900' : 'text-gray-600'} />
                    <span className={`text-xs font-semibold ${selectedRole === 'ORDERER' ? 'text-gray-900' : 'text-gray-700'}`}>Orderer</span>
                </button>

                <button
                    onClick={() => onRoleChange('PICKER')}
                    className={`py-2 px-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        selectedRole === 'PICKER'
                            ? 'border-[#FFDF57] bg-[#FFDF57]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                    <Package size={18} className={selectedRole === 'PICKER' ? 'text-gray-900' : 'text-gray-600'} />
                    <span className={`text-xs font-semibold ${selectedRole === 'PICKER' ? 'text-gray-900' : 'text-gray-700'}`}>Picker</span>
                </button>
            </div>
        </div>
    );
};

export default RoleSelector;
