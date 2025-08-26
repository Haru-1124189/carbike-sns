import { ArrowLeft, Bell, Heart, MessageCircle, Trash2, UserPlus, Video } from 'lucide-react';
import React, { useEffect } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { AdminNotification, useAdminNotifications } from '../hooks/useAdminNotifications';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationDoc } from '../types/notification';

interface NotificationsPageProps {
  onBackClick?: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBackClick }) => {
  const { user, userDoc } = useAuth();
  const { 
    notifications, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    fetchUnreadCount,
    unreadCount
  } = useNotifications();

  const { 
    notifications: adminNotifications, 
    unreadCount: adminUnreadCount,
    markAllAsRead: markAllAdminAsRead
  } = useAdminNotifications();

  // 通知ページが開かれた時に全ての通知を既読にする
  useEffect(() => {
    const markAllNotificationsAsRead = async () => {
      if (!user?.uid) return;
      
      try {
        console.log('Marking all notifications as read...');
        await markAllAsRead();
        console.log('All notifications marked as read successfully');
        
        // 管理者の場合は管理者通知も既読にする
        if (userDoc?.isAdmin && adminUnreadCount > 0) {
          console.log('Marking all admin notifications as read...');
          await markAllAdminAsRead();
          console.log('All admin notifications marked as read successfully');
        }
        
        // 強制的に未読カウントを0にする
        setTimeout(() => {
          fetchUnreadCount();
        }, 100);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    };

    // 通知データが読み込まれた後に実行（一度だけ）
    if (!loading && !error && user?.uid) {
      markAllNotificationsAsRead();
    }
  }, [loading, error, user?.uid, markAllAsRead, fetchUnreadCount, userDoc?.isAdmin, adminUnreadCount, markAllAdminAsRead]);

  // 通知ページが開かれた瞬間に未読カウントを強制的にリセット
  useEffect(() => {
    if (user?.uid) {
      console.log('NotificationsPage opened - forcing unread count reset');
      // 即座に未読カウントを再取得
      fetchUnreadCount();
    }
  }, [user?.uid, fetchUnreadCount]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={16} className="text-red-500" />;
      case 'reply':
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'follow':
        return <UserPlus size={16} className="text-green-500" />;
      case 'maintenance':
        return <Bell size={16} className="text-green-500" />;
      case 'creator_application':
        return <Video size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  const handleNotificationClick = async (notification: NotificationDoc) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }
      
      // フォロー通知の場合はフォロワーのプロフィールページに遷移
      if (notification.type === 'follow' && notification.followData) {
        // TODO: フォロワーのプロフィールページに遷移する処理を追加
        console.log('Navigate to follower profile:', notification.followData.followerId);
      }
      // TODO: 他の通知タイプに関連する投稿に遷移する処理を追加
    } catch (error) {
      console.error('Error handling notification click:', error);
      alert('通知の処理中にエラーが発生しました。');
    }
  };

  const handleAdminNotificationClick = async (notification: AdminNotification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }
      
      // 配信者申請の通知の場合は申請管理ページに遷移
      if (notification.type === 'creator_application') {
        // TODO: 申請管理ページに遷移する処理を追加
        console.log('Navigate to admin applications page');
      }
    } catch (error) {
      console.error('Error handling admin notification click:', error);
      alert('通知の処理中にエラーが発生しました。');
    }
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (window.confirm('この通知を削除しますか？')) {
        await deleteNotification(notificationId);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('通知の削除中にエラーが発生しました。');
    }
  };

  const formatTime = (date: Date) => {
    try {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) return '今';
      if (minutes < 60) return `${minutes}分前`;
      if (hours < 24) return `${hours}時間前`;
      if (days < 7) return `${days}日前`;
      return date.toLocaleDateString('ja-JP');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '不明';
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader 
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />
      
              <main className="p-4 pb-24 pt-0">
          {/* ヘッダー */}
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">通知</h1>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-400">(未読: {unreadCount})</span>
            )}
          </div>

          {/* 管理者通知と一般通知を統合して表示 */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-400">読み込み中...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-sm text-red-400 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
              >
                再試行
              </button>
            </div>
          ) : (notifications.length === 0 && adminNotifications.length === 0) ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-400">通知はありません</div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 管理者通知 */}
              {userDoc?.isAdmin && adminNotifications.map((notification) => (
                <div
                  key={`admin-${notification.id}`}
                  onClick={() => handleAdminNotificationClick(notification)}
                  className={`bg-surface rounded-xl border border-surface-light p-4 cursor-pointer hover:scale-95 active:scale-95 transition-transform ${
                    !notification.isRead ? 'bg-surface-light border-primary border-opacity-30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white mb-1">
                        {notification.title || '管理者通知'}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">
                        {notification.content || '通知内容がありません'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notification.createdAt ? formatTime(notification.createdAt.toDate()) : '不明'}
                        </span>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 一般通知 */}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-surface rounded-xl border border-surface-light p-4 cursor-pointer hover:scale-95 active:scale-95 transition-transform ${
                    !notification.isRead ? 'bg-surface-light border-primary border-opacity-30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white mb-1">
                        {notification.title || '通知'}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">
                        {notification.content || '通知内容がありません'}
                      </p>
                      {notification.type === 'follow' && notification.followData && (
                        <div className="mb-2">
                          <span className="text-xs text-primary">
                            @{notification.followData.followerName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notification.createdAt ? formatTime(notification.createdAt) : '不明'}
                        </span>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                            className="p-1 rounded-full hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                          >
                            <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}


       </main>
    </div>
  );
};
