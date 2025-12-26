import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = "py-3 px-6 rounded-lg font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-md",
        secondary: "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
