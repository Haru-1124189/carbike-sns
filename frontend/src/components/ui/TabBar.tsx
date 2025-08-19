import { Activity, Car, Plus, User, Video, Wrench } from 'lucide-react';
import React from 'react';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Car },
  { id: 'threads', label: 'Threads', icon: Activity },
  { id: 'maintenance', label: 'Maint', icon: Wrench },
  { id: 'post', label: 'Post', icon: Plus },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'profile', label: 'Profile', icon: User },
];

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-surface-light z-50 shadow-lg fade-in">
      <div className="max-w-[420px] mx-auto">
        <div className="flex">
          {tabs.map((tab, index) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 py-3 px-1 flex flex-col items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-2 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-surface shadow-md scale-110' 
                    : 'hover:bg-surface/50 scale-100'
                }`}>
                  <IconComponent 
                    size={20} 
                    className={`mb-1 transition-all duration-300 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`} 
                  />
                </div>
                <span className={`text-xs mt-1 transition-all duration-300 ${
                  isActive ? 'font-semibold scale-105' : 'font-normal scale-100'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
