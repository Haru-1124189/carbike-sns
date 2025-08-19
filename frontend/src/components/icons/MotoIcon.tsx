import React from 'react';

interface MotoIconProps {
  size?: number;
  className?: string;
}

export const MotoIcon: React.FC<MotoIconProps> = ({ size = 24, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6.5" cy="16.5" r="3.5" />
      <circle cx="17.5" cy="16.5" r="3.5" />
      <path d="M10 16.5h4" />
      <path d="M12 13l3-6h3l-2 4" />
      <path d="M9 13l-3-3H3" />
      <path d="M12 13h-2" />
    </svg>
  );
};


