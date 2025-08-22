import { Bell, Settings } from 'lucide-react';
import React from 'react';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { PersistentImage } from './PersistentImage';

interface AppHeaderProps {
  user?: {
    id: string;
    name: string;
    avatar: string;
    cars: string[];
    interestedCars: string[];
  };
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  showProfileButton?: boolean;
  showTitle?: boolean;
  showLogo?: boolean;
  showNotification?: boolean;
  showSettings?: boolean;
  showUserName?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  user, 
  onNotificationClick, 
  onProfileClick,
  onSettingsClick,
  showProfileButton = false,
  showTitle = false,
  showLogo = false,
  showNotification = false,
  showSettings = false,
  showUserName = false
}) => {
  const { userDoc } = useAuth();
  const { unreadCount } = useNotifications();
  const { unreadCount: adminUnreadCount } = useAdminNotifications();

  // 管理者の場合は管理者通知の数を、一般ユーザーの場合は通常の通知の数を表示
  const displayUnreadCount = userDoc?.isAdmin ? adminUnreadCount : unreadCount;

  return (
    <header className="bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        {/* ロゴ・タイトル */}
        <div className="flex items-center space-x-3">
          {showLogo && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary">
              {userDoc?.photoURL || user?.avatar ? (
                <PersistentImage
                  src={userDoc?.photoURL || user?.avatar || ''}
                  alt={userDoc?.displayName || user?.name || 'ユーザー'}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fallback={
                    <span className="text-white text-sm font-bold">
                      {(userDoc?.displayName || user?.name || 'C').charAt(0)}
                    </span>
                  }
                />
              ) : (
                <span className="text-white text-sm font-bold">
                  {(userDoc?.displayName || user?.name || 'C').charAt(0)}
                </span>
              )}
            </div>
          )}
          {showTitle && (
            <h1 className="text-lg font-bold text-white">RevLink</h1>
          )}
          {showUserName && (
            <h1 className="text-lg font-bold text-white">
              {userDoc?.displayName || user?.name || 'ユーザー'}
            </h1>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center space-x-3">
          {/* 通知ボタン */}
          {showNotification && (
            <button
              onClick={onNotificationClick}
              className="relative p-2 rounded-lg hover:bg-surface-light transition-colors"
            >
              <Bell size={20} className="text-white" />
              {displayUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
                </span>
              )}
            </button>
          )}

          {/* 設定ボタン */}
          {showSettings && (
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg hover:bg-surface-light transition-colors"
            >
              <Settings size={20} className="text-white" />
            </button>
          )}

          {/* プロフィールボタン（showProfileButtonがtrueの場合のみ表示） */}
          {showProfileButton && (
            <button
              onClick={onProfileClick}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-surface-light transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary">
                {userDoc?.photoURL || user?.avatar ? (
                  <PersistentImage
                    src={userDoc?.photoURL || user?.avatar || ''}
                    alt={userDoc?.displayName || user?.name || 'ユーザー'}
                    className="w-full h-full object-cover"
                    loading="eager"
                    fallback={
                      <span className="text-white text-sm font-bold">
                        {(userDoc?.displayName || user?.name || 'U').charAt(0)}
                      </span>
                    }
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {(userDoc?.displayName || user?.name || 'U').charAt(0)}
                  </span>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
