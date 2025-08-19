import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'surface' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  variant = 'default',
  padding = 'md'
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-surface border-surface-light hover:border-surface-light/50',
    surface: 'bg-surface/50 border-surface-light/30 hover:border-surface-light/50',
    elevated: 'bg-surface border-surface-light shadow-lg hover:shadow-xl'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const interactiveClasses = onClick ? 'cursor-pointer hover:scale-[1.02]' : '';
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
