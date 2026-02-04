import React, { useMemo } from 'react';

interface FlagIconProps {
  countryCode: string;
  className?: string;
  title?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, className = '', title }) => {
  const FlagComponent = useMemo(() => {
    if (!countryCode || countryCode.length !== 2) {
      return null;
    }

    try {
      // Dynamically import the flag component
      const code = countryCode.toUpperCase();
      // Use require to dynamically load the flag
      const flagModule = require(`country-flag-icons/react/3x2/${code}`);
      return flagModule.default || flagModule[code];
    } catch (error) {
      return null;
    }
  }, [countryCode]);

  if (!FlagComponent) {
    return (
      <span 
        className={`inline-flex items-center justify-center bg-gray-200 rounded text-xs font-bold text-gray-600 ${className}`}
        title={title}
      >
        {countryCode.toUpperCase()}
      </span>
    );
  }

  return <FlagComponent title={title} className={className} />;
};

export default FlagIcon;
