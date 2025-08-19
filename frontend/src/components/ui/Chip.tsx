import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ 
  children, 
  className = '',
  variant = 'default',
  size = 'sm',
  onClick
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-surface-light/50 text-text-secondary border border-surface-light/30',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-surface-light text-text-secondary border border-surface-light',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };
  
  const interactiveClasses = onClick ? 'cursor-pointer hover:scale-105' : '';
  
  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
