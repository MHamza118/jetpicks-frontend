import { Briefcase, Package } from 'lucide-react';

interface RoleSelectorProps {
    selectedRole: 'ORDERER' | 'PICKER' | null;
    onRoleChange: (role: 'ORDERER' | 'PICKER') => void;
}

const RoleSelector = ({ selectedRole, onRoleChange }: RoleSelectorProps) => {
    return (
        <div className="mb-6">
            <p className="text-gray-900 font-bold text-sm mb-3">Select your role</p>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => onRoleChange('ORDERER')}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedRole === 'ORDERER'
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                    <Briefcase size={24} className="text-gray-900" />
                    <span className="text-sm font-semibold text-gray-900">Orderer</span>
                </button>

                <button
                    onClick={() => onRoleChange('PICKER')}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedRole === 'PICKER'
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                    <Package size={24} className="text-gray-900" />
                    <span className="text-sm font-semibold text-gray-900">Picker</span>
                </button>
            </div>
        </div>
    );
};

export default RoleSelector;
