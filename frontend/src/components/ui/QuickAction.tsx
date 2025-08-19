import * as LucideIcons from 'lucide-react';
import React from 'react';
import { QuickAction as QuickActionType } from '../../types';

interface QuickActionProps {
  action: QuickActionType;
  onClick?: () => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({ action, onClick }) => {
  const IconComponent = LucideIcons[action.icon as keyof typeof LucideIcons] as React.ComponentType<any>;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-16 h-16 transition-all duration-300 fade-in hover:scale-105 active:scale-95"
    >
      <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center mb-2 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl`}>
        <IconComponent size={20} className="text-white transition-all duration-300" />
      </div>
      <span className="text-xs text-white font-medium transition-all duration-300">{action.title}</span>
    </button>
  );
};
