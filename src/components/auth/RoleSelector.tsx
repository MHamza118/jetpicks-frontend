import { Briefcase, Package } from 'lucide-react';

interface RoleSelectorProps {
    selectedRoles: ('ORDERER' | 'PICKER')[];
    onRolesChange: (roles: ('ORDERER' | 'PICKER')[]) => void;
}

const RoleSelector = ({ selectedRoles, onRolesChange }: RoleSelectorProps) => {
    const toggleRole = (role: 'ORDERER' | 'PICKER') => {
        if (selectedRoles.includes(role)) {
            // Don't allow deselecting if it's the only role
            if (selectedRoles.length > 1) {
                onRolesChange(selectedRoles.filter(r => r !== role));
            }
        } else {
            onRolesChange([...selectedRoles, role]);
        }
    };

    return (
        <div className="mb-3">
            <p className="text-gray-900 font-bold text-xs mb-1.5">Select your role(s) <span className="text-red-500">*</span></p>
            <p className="text-gray-600 text-xs mb-2">You can be both an orderer and picker</p>
            <div className="grid grid-cols-2 gap-1.5">
                <button
                    onClick={() => toggleRole('ORDERER')}
                    className={`py-2 px-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        selectedRoles.includes('ORDERER')
                            ? 'border-[#FFDF57] bg-[#FFDF57]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                    <Briefcase size={18} className={selectedRoles.includes('ORDERER') ? 'text-gray-900' : 'text-gray-600'} />
                    <span className={`text-xs font-semibold ${selectedRoles.includes('ORDERER') ? 'text-gray-900' : 'text-gray-700'}`}>Orderer</span>
                </button>

                <button
                    onClick={() => toggleRole('PICKER')}
                    className={`py-2 px-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        selectedRoles.includes('PICKER')
                            ? 'border-[#FFDF57] bg-[#FFDF57]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                    <Package size={18} className={selectedRoles.includes('PICKER') ? 'text-gray-900' : 'text-gray-600'} />
                    <span className={`text-xs font-semibold ${selectedRoles.includes('PICKER') ? 'text-gray-900' : 'text-gray-700'}`}>Picker</span>
                </button>
            </div>
        </div>
    );
};

export default RoleSelector;
