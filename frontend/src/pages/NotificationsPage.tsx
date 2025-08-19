import { ArrowLeft, Bell, Heart, MessageCircle } from 'lucide-react';
import React from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { notifications } from '../data/dummy';

interface NotificationsPageProps {
  onBackClick?: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBackClick }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={16} className="text-red-500" />;
      case 'reply':
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'follow':
      case 'maintenance':
        return <Bell size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader 
        user={{ id: "1", name: "RevLinkユーザー", avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U", cars: [], interestedCars: [] }}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />
      
      <main className="p-4 pb-20 pt-0">
          {/* ヘッダー */}
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">通知</h1>
          </div>

          {/* 通知一覧 */}
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-surface rounded-xl border border-surface-light p-4 cursor-pointer hover:scale-95 active:scale-95 transition-transform ${
                  !notification.isRead ? 'bg-surface-light border-primary border-opacity-30' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white mb-1">{notification.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">{notification.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{notification.time}</span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 無限スクロール用のプレースホルダー */}
          <div className="text-center py-8">
            <div className="text-sm text-gray-400">さらに読み込み中...</div>
                     </div>
       </main>
    </div>
  );
};
