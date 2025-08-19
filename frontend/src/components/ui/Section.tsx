import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  className = '',
  spacing = 'md',
  padding = 'none'
}) => {
  const spacingClasses = {
    none: '',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };
  
  return (
    <section className={`${spacingClasses[spacing]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </section>
  );
};
