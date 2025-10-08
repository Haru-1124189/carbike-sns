import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { useAuth } from './useAuth';

export interface AdminNotification {
  id: string;
  type: 'report' | 'system' | 'user' | 'creator_application' | 'vehicle_request' | 'contact_inquiry';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  reportId?: string;
  reportData?: {
    type: string;
    targetType: string;
    targetId: string;
    targetTitle?: string;
    reporterName: string;
    content: string;
  };
  applicationData?: {
    channelName: string;
    channelDescription: string;
    contentCategory: string;
    userName: string;
    userId: string;
  };
  requestData?: {
    maker: string;
    model: string;
    year: string;
    notes: string;
  };
  contactData?: {
    subject: string;
    message: string;
    userName: string;
    userEmail: string;
    userId: string;
  };
  fromUserId?: string;
  fromUserName?: string;
}

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userDoc } = useAuth();

  useEffect(() => {
    // 管理者でない場合は何もしない
    if (!userDoc?.isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 管理者用の通知を取得（adminNotificationsコレクションから）
      const q = query(
        collection(db, 'adminNotifications'),
        where('adminId', '==', userDoc.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationList: AdminNotification[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notificationList.push({
            id: doc.id,
            type: data.type,
            title: data.title,
            content: data.content,
            isRead: data.isRead,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            reportId: data.reportId,
            reportData: data.reportData,
            applicationData: data.applicationData,
            requestData: data.requestData,
            contactData: data.contactData,
            fromUserId: data.fromUserId,
            fromUserName: data.fromUserName
          });
        });
        console.log('Admin notifications fetched:', notificationList.length);
        setNotifications(notificationList);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching admin notifications:', error);
        setError('通知の取得に失敗しました');
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up admin notifications listener:', error);
      setError('通知の取得に失敗しました');
      setLoading(false);
    }
  }, [userDoc?.isAdmin]);

  // 未読通知数を取得
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 管理者通知を既読にする
  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'adminNotifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking admin notification as read:', error);
    }
  };

  // すべての管理者通知を既読にする
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const updatePromises = unreadNotifications.map(notification => {
        const notificationRef = doc(db, 'adminNotifications', notification.id);
        return updateDoc(notificationRef, {
          isRead: true,
          updatedAt: serverTimestamp(),
        });
      });
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all admin notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead
  };
};
