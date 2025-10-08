import { AlertTriangle, ArrowLeft, Bell, Car, Heart, Mail, MapPin, MessageCircle, Trash2, UserPlus, Video } from 'lucide-react';
import React, { useEffect } from 'react';
import { AdminNotification, useAdminNotifications } from '../hooks/useAdminNotifications';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationDoc } from '../types/index';

interface NotificationsPageProps {
  onBackClick?: () => void;
  onVehicleRequestClick?: (requestId: string, requestData: any, fromUserId: string, fromUserName: string, createdAt: Date) => void;
  onReportClick?: (reportId: string, reportData: any, createdAt: Date) => void;
  onNavigateToAdminDashboard?: () => void;
  onNavigateToContactReplyDetail?: (inquiryId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBackClick, onVehicleRequestClick, onReportClick, onNavigateToAdminDashboard, onNavigateToContactReplyDetail }) => {
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

  // 管理者通知と一般通知を統合して時系列順にソート
  const allNotifications = React.useMemo(() => {
    const combined = [
      ...adminNotifications.map(admin => ({
        ...admin,
        isAdminNotification: true
      })),
      ...notifications.map(notif => ({
        ...notif,
        isAdminNotification: false
      }))
    ];
    
    // 作成日時で降順ソート（新しいものが上）
    return combined.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [adminNotifications, notifications]);

  // 通知ページが開かれた時に全ての通知を既読にする（一度だけ実行）
  useEffect(() => {
    let hasExecuted = false;
    
    const markAllNotificationsAsRead = async () => {
      if (!user?.uid || hasExecuted) return;
      hasExecuted = true;
      
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
  }, [loading, error, user?.uid]); // 依存配列を簡素化

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
      case 'nearby_touring':
        return <MapPin size={16} className="text-orange-500" />;
      case 'contact_inquiry':
        return <Mail size={16} className="text-blue-500" />;
      case 'user_report':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'vehicle_request':
        return <Car size={16} className="text-green-500" />;
      case 'contact_reply':
        return <Mail size={16} className="text-blue-500" />;
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
      
      // 近くのツーリング通知の場合はツーリングチャットページに遷移
      if (notification.type === 'nearby_touring' && notification.data?.threadId) {
        // ツーリングチャットページに遷移
        window.location.href = '/touring-chat';
      }
      
      // お問い合わせ返信通知の場合は返信詳細ページに遷移
      if (notification.type === 'contact_reply' && notification.data?.inquiryId) {
        console.log('Navigate to contact reply detail:', notification.data.inquiryId);
        onNavigateToContactReplyDetail?.(notification.data.inquiryId);
      }
      
      // TODO: 他の通知タイプに関連する投稿に遷移する処理を追加
    } catch (error) {
      console.error('Error handling notification click:', error);
      alert('通知の処理中にエラーが発生しました。');
    }
  };

  // 統合された通知クリック処理
  const handleUnifiedNotificationClick = async (notification: any) => {
    try {
      if (!notification.isRead) {
        if (notification.isAdminNotification) {
          // 管理者通知の既読処理（useAdminNotificationsのmarkAsReadを使用）
          // 管理者通知の既読処理は別途実装が必要
          console.log('Mark admin notification as read:', notification.id);
        } else {
          await markAsRead(notification.id);
        }
      }
      
      // 管理者通知の場合
      if (notification.isAdminNotification) {
        if (notification.type === 'contact_inquiry') {
          onNavigateToAdminDashboard?.();
        }
        // 他の管理者通知タイプの処理を追加
        return;
      }
      
      // 一般通知の処理
      if (notification.type === 'follow' && notification.followData) {
        console.log('Navigate to follower profile:', notification.followData.followerId);
      }
      
      if (notification.type === 'nearby_touring' && notification.data?.threadId) {
        window.location.href = '/touring-chat';
      }
      
      if (notification.type === 'contact_reply' && notification.data?.inquiryId) {
        console.log('Navigate to contact reply detail:', notification.data.inquiryId);
        onNavigateToContactReplyDetail?.(notification.data.inquiryId);
      }
      
    } catch (error) {
      console.error('Error handling unified notification click:', error);
      alert('通知の処理中にエラーが発生しました。');
    }
  };

  const handleAdminNotificationClick = async (notification: AdminNotification) => {
    try {
      console.log('Admin notification clicked:', notification);
      
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }
      
      // 車種申請の通知の場合は車種申請詳細ページに遷移
      if (notification.type === 'vehicle_request' && notification.requestData && notification.fromUserId && notification.fromUserName) {
        console.log('Vehicle request notification clicked, calling onVehicleRequestClick');
        onVehicleRequestClick?.(
          notification.id,
          notification.requestData,
          notification.fromUserId,
          notification.fromUserName,
          notification.createdAt.toDate()
        );
        return;
      }
      
      // 通報の通知の場合は通報詳細ページに遷移
      if (notification.type === 'report' && notification.reportData) {
        console.log('Report notification clicked, calling onReportClick');
        onReportClick?.(
          notification.id,
          notification.reportData,
          notification.createdAt.toDate()
        );
        return;
      }
      
      // お問い合わせの通知の場合は管理者ダッシュボードに遷移
      if (notification.type === 'contact_inquiry') {
        console.log('Contact inquiry notification clicked, navigating to admin dashboard');
        onNavigateToAdminDashboard?.();
        return;
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* ヘッダー */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-surface-light rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">通知</h1>
          {unreadCount > 0 && (
            <span className="text-sm text-text-secondary">(未読: {unreadCount})</span>
          )}
        </div>


        {/* 管理者通知と一般通知を統合して表示 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-surface-light border-t-primary mx-auto mb-4"></div>
            <div className="text-sm text-text-secondary">読み込み中...</div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-sm text-red-400 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
            >
              再試行
            </button>
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-text-primary text-lg font-medium mb-2">通知はありません</div>
            <div className="text-text-secondary">新しい通知が届いたらここに表示されます</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 統合された通知リスト（時系列順） */}
            {allNotifications.map((notification) => (
              <div
                key={`${notification.isAdminNotification ? 'admin-' : ''}${notification.id}`}
                onClick={() => handleUnifiedNotificationClick(notification)}
                className={`cursor-pointer hover:bg-surface-light rounded-lg p-4 transition-colors ${
                  !notification.isRead ? 'bg-surface-light' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-text-primary mb-2">
                      {notification.title || (notification.isAdminNotification ? '管理者通知' : '通知')}
                    </h3>
                    <p className="text-sm text-text-secondary mb-3">
                      {notification.content || '通知内容がありません'}
                    </p>
                    {notification.type === 'follow' && notification.followData && (
                      <div className="mb-3">
                        <span className="text-sm text-primary">
                          @{notification.followData.followerName}
                        </span>
                      </div>
                    )}
                    {notification.type === 'nearby_touring' && notification.data && (
                      <div className="mb-3 bg-orange-500/10 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin size={14} className="text-orange-400" />
                          <span className="text-orange-400">
                            {notification.data.prefecture}
                            {/* プライバシー保護のため詳細な場所情報は非表示 */}
                          </span>
                        </div>
                        {notification.data.touringDate && (
                          <div className="text-sm text-text-secondary mt-1">
                            ツーリング日: {new Date(notification.data.touringDate).toLocaleDateString('ja-JP')}
                          </div>
                        )}
                        <div className="text-sm text-text-secondary mt-1">
                          詳細はツーリングチャットでご確認ください
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">
                        {notification.createdAt ? 
                          formatTime(notification.createdAt.toDate ? notification.createdAt.toDate() : notification.createdAt) : 
                          '不明'
                        }
                      </span>
                      <div className="flex items-center space-x-3">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                        <button
                          onClick={(e) => handleDeleteNotification(notification.id, e)}
                          className="p-2 rounded-full hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                        >
                          <Trash2 size={16} className="text-text-secondary hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
