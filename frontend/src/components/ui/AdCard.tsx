import React from 'react';

interface AdCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export const AdCard: React.FC<AdCardProps> = ({ 
  title = "広告",
  description = "スポンサーコンテンツ",
  className = ''
}) => {
  return (
    <div className={`rounded-2xl bg-orange-500/20 border border-orange-400/30 text-orange-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs opacity-80">{description}</div>
        </div>
        <div className="text-xs opacity-60">AD</div>
      </div>
    </div>
  );
};
