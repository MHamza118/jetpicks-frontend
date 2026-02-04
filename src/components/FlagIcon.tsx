import React from 'react';
import * as CountryFlags from 'country-flag-icons/react/3x2';

interface FlagIconProps {
  countryCode: string;
  className?: string;
  title?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, className = '', title }) => {
  if (!countryCode || countryCode.length !== 2) {
    return (
      <span 
        className={`inline-flex items-center justify-center bg-gray-200 rounded text-xs font-bold text-gray-600 ${className}`}
        title={title}
      >
        {countryCode}
      </span>
    );
  }

  const code = countryCode.toUpperCase();
  const FlagComponent = (CountryFlags as any)[code];

  if (!FlagComponent) {
    return (
      <span 
        className={`inline-flex items-center justify-center bg-gray-200 rounded text-xs font-bold text-gray-600 ${className}`}
        title={title}
      >
        {code}
      </span>
    );
  }

  return <FlagComponent title={title} className={className} />;
};

export default FlagIcon;
