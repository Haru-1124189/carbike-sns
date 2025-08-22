import { useEffect, useState } from 'react';
import {
    deleteNotification,
    getUnreadNotificationCount,
    getUserNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from '../lib/notifications';
import { NotificationDoc } from '../types/notification';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 通知を取得
  const fetchNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedNotifications = await getUserNotifications(user.uid);
      setNotifications(fetchedNotifications);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || '通知の取得に失敗しました');
      setNotifications([]); // エラーの場合は空配列を設定
    } finally {
      setLoading(false);
    }
  };

  // 未読通知数を取得
  const fetchUnreadCount = async () => {
    if (!user?.uid) return;
    
    try {
      const count = await getUnreadNotificationCount(user.uid);
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Error fetching unread count:', err);
    }
  };

  // 通知を既読にする
  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // ローカル状態を更新
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // 未読数を更新
      await fetchUnreadCount();
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err.message || '通知の既読処理に失敗しました');
    }
  };

  // すべての通知を既読にする
  const markAllAsRead = async () => {
    if (!user?.uid) return;
    
    try {
      await markAllNotificationsAsRead(user.uid);
      
      // ローカル状態を更新
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // 未読数を即座に0にする
      setUnreadCount(0);
      
      // さらに確実にするために少し遅延して再取得
      setTimeout(async () => {
        try {
          const count = await getUnreadNotificationCount(user.uid);
          setUnreadCount(count);
        } catch (err) {
          console.error('Error re-fetching unread count:', err);
        }
      }, 500);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      setError(err.message || '通知の既読処理に失敗しました');
    }
  };

  // 通知を削除
  const deleteNotificationById = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // ローカル状態を更新
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // 未読数を更新
      await fetchUnreadCount();
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      setError(err.message || '通知の削除に失敗しました');
    }
  };

  // 初期化時に通知を取得
  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.uid]);

  // 定期的に未読数を更新（5分ごと）
  useEffect(() => {
    if (!user?.uid) return;
    
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5 * 60 * 1000); // 5分
    
    return () => clearInterval(interval);
  }, [user?.uid]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationById,
  };
};
