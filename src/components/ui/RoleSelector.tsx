import React from 'react';
import { Package, Truck } from 'lucide-react';

interface RoleSelectorProps {
    selectedRole: 'orderer' | 'picker' | null;
    onRoleChange: (role: 'orderer' | 'picker') => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => {
    return (
        <div className="grid grid-cols-2 gap-2 mb-5">
            <button
                onClick={() => onRoleChange('orderer')}
                className={`p-3 rounded-lg border-b border-gray-200/20 transition-all ${
                    selectedRole === 'orderer'
                        ? 'bg-input-bg'
                        : 'bg-white/50 hover:bg-white/70'
                }`}
            >
                <div className="flex items-center gap-2">
                    <Package
                        size={20}
                        className={selectedRole === 'orderer' ? 'text-gray-900' : 'text-gray-500'}
                        strokeWidth={2.5}
                    />
                    <span className={`text-sm font-medium ${
                        selectedRole === 'orderer' ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                        Orderer
                    </span>
                </div>
            </button>

            <button
                onClick={() => onRoleChange('picker')}
                className={`p-3 rounded-lg border-b border-gray-200/20 transition-all ${
                    selectedRole === 'picker'
                        ? 'bg-input-bg'
                        : 'bg-white/50 hover:bg-white/70'
                }`}
            >
                <div className="flex items-center gap-2">
                    <Truck
                        size={20}
                        className={selectedRole === 'picker' ? 'text-gray-900' : 'text-gray-500'}
                        strokeWidth={2.5}
                    />
                    <span className={`text-sm font-medium ${
                        selectedRole === 'picker' ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                        Picker
                    </span>
                </div>
            </button>
        </div>
    );
};

export default RoleSelector;
