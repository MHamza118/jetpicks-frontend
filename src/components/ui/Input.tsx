import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, icon: Icon, rightIcon, className = '', ...props }, ref) => {
        return (
            <div className="flex flex-col w-full">
                <div className="relative flex items-start gap-3 bg-input-bg px-4 py-2 rounded-lg transition-all border-b border-gray-200/20">
                    {Icon && (
                        <div className="mt-1">
                            <Icon className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
                        </div>
                    )}
                    <div className="flex flex-col flex-1">
                        <label className="text-xs font-semibold text-gray-500/80 mb-0.5">
                            {label}
                        </label>
                        <div className="flex items-center">
                            <input
                                ref={ref}
                                className={`w-full bg-transparent border-none outline-none text-gray-700 font-normal text-base placeholder:text-gray-400 ${className}`}
                                autoComplete="off"
                                {...props}
                            />
                            {rightIcon && <div className="ml-2 text-gray-900">{rightIcon}</div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
