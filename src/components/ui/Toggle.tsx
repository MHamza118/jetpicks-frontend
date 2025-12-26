import React from 'react';

interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange }) => {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-gray-800' : 'bg-gray-400'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
};

export default Toggle;
