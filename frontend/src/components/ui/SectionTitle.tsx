import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-center justify-between mb-4 fade-in">
      <div>
        <h2 className="text-sm font-bold text-white transition-all duration-300">{title}</h2>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1 transition-all duration-300">{subtitle}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs text-primary hover:scale-105 active:scale-95 transition-all duration-300 hover:text-primary-light"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
