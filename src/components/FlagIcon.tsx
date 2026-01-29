import React from 'react';
import { GB, ES, US, FR, DE, IT, CA, AU, JP, CN, IN, BR, MX, ZA, SG, AE, NZ, TH, MY } from 'country-flag-icons/react/3x2';

interface FlagIconProps {
  countryCode: string;
  className?: string;
  title?: string;
}

const flagMap: { [key: string]: React.ComponentType<any> } = {
  GB,
  ES,
  US,
  FR,
  DE,
  IT,
  CA,
  AU,
  JP,
  CN,
  IN,
  BR,
  MX,
  ZA,
  SG,
  AE,
  NZ,
  TH,
  MY,
};

export const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, className = '', title }) => {
  const FlagComponent = flagMap[countryCode.toUpperCase()];

  if (!FlagComponent) {
    return <span className={className}>{countryCode}</span>;
  }

  return <FlagComponent title={title} className={className} />;
};

export default FlagIcon;
