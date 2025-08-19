import { ArrowLeft, Bell, Settings, User } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User as UserType } from '../../types';
import { UserDoc } from '../../types/user';

interface AppHeaderProps {
  user: UserType | UserDoc | null;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onBackClick?: () => void;
  showLogo?: boolean;
  showActions?: boolean;
  showSettings?: boolean;
  showBackButton?: boolean;
  unreadNotifications?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  user, 
  onNotificationClick, 
  onProfileClick,
  onBackClick,
  showLogo = false,
  showActions = false,
  showSettings = false,
  showBackButton = false,
  unreadNotifications = 0
}) => {
  const { user: authUser, logout } = useAuth();
  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[420px] mx-auto w-full flex items-center py-4 pl-4 pr-4">
      <div className="flex items-center space-x-3 flex-1">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
        )}
        {showLogo && (
          <>
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent-red rounded-xl flex items-center justify-center shadow-lg bounce-in">
              <User size={24} className="text-white" />
            </div>
            <span className="text-base text-text-primary font-medium slide-in-left pl-0">
              {user ? ('displayName' in user ? user.displayName : user.name) : 'ユーザー'}
            </span>
          </>
        )}
      </div>
      
      {showActions && (
        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={onNotificationClick}
            className="icon-button bg-surface/80 backdrop-blur-sm border border-surface-light/50 shadow-md hover:shadow-lg relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"></div>
            <Bell size={20} className="text-text-primary relative z-10" />
            {unreadNotifications > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent-red rounded-full flex items-center justify-center shadow-lg bounce-in">
                <span className="text-xs font-bold text-white">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              </div>
            )}
          </button>
        </div>
      )}
      
      {showSettings && (
        <div className="flex items-center ml-auto">
          <button
            onClick={onProfileClick}
            className="icon-button bg-surface/80 backdrop-blur-sm border border-surface-light/50 shadow-md hover:shadow-lg"
            data-testid="profile-settings-button"
          >
            <Settings size={20} className="text-text-primary" />
          </button>
        </div>
      )}
      </div>
    </header>
  );
};
