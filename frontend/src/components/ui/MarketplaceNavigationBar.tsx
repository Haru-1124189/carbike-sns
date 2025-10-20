import { Home, MessageSquare, Plus, User, Video, Wrench } from 'lucide-react';
import React from 'react';

interface MarketplaceNavigationBarProps {
  onNavigateToHome?: () => void;
  onNavigateToThreads?: () => void;
  onNavigateToMaintenance?: () => void;
  onNavigateToPost?: () => void;
  onNavigateToVideos?: () => void;
  onNavigateToProfile?: () => void;
  activeTab?: 'home' | 'threads' | 'maintenance' | 'post' | 'videos' | 'profile';
}

export const MarketplaceNavigationBar: React.FC<MarketplaceNavigationBarProps> = ({
  onNavigateToHome,
  onNavigateToThreads,
  onNavigateToMaintenance,
  onNavigateToPost,
  onNavigateToVideos,
  onNavigateToProfile,
  activeTab
}) => {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: onNavigateToHome,
      active: activeTab === 'home'
    },
    {
      id: 'threads',
      label: 'Link',
      icon: MessageSquare,
      onClick: onNavigateToThreads,
      active: activeTab === 'threads'
    },
    {
      id: 'maintenance',
      label: 'Maint',
      icon: Wrench,
      onClick: onNavigateToMaintenance,
      active: activeTab === 'maintenance'
    },
    {
      id: 'post',
      label: 'Post',
      icon: Plus,
      onClick: onNavigateToPost,
      active: activeTab === 'post'
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: Video,
      onClick: onNavigateToVideos,
      active: activeTab === 'videos'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      onClick: onNavigateToProfile,
      active: activeTab === 'profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-surface-light z-50">
      <div className="flex justify-around items-center py-2 px-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                console.log(`MarketplaceNavigationBar: ${item.id} clicked`);
                item.onClick?.();
              }}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors ${
                item.active
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <IconComponent size={20} className="mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
