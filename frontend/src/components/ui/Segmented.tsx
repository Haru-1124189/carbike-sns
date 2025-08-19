import React from 'react';

interface SegmentedOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const Segmented: React.FC<SegmentedProps> = ({ 
  options, 
  value, 
  onChange, 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-sm'
  };
  
  const buttonSizeClasses = {
    sm: 'py-1 px-2',
    md: 'py-1.5 px-3'
  };
  
  return (
    <div className={`flex bg-surface rounded-xl ${sizeClasses[size]} ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 flex items-center justify-center space-x-1 rounded-lg font-medium transition-all duration-200 ${buttonSizeClasses[size]} ${
            value === option.value
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};
