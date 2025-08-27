import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/clients';
import { CreateNotificationData, NotificationDoc } from '../types/notification';

// 通知設定をチェック
export const checkNotificationSetting = async (userId: string, settingKey: string): Promise<boolean> => {
  try {
    const settingsDoc = await getDoc(doc(db, 'notificationSettings', userId));
    
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data();
      return settings[settingKey] !== false; // デフォルトはtrue
    }
    
    // 設定が存在しない場合はデフォルトで有効
    return true;
  } catch (error) {
    console.error('Error checking notification setting:', error);
    // エラーの場合はデフォルトで有効
    return true;
  }
};

// 通知を作成
export const createNotification = async (data: CreateNotificationData): Promise<string> => {
  try {
    const notificationData = {
      ...data,
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// 通知を作成（設定をチェック）
export const createNotificationWithCheck = async (data: CreateNotificationData, settingKey: string): Promise<string | null> => {
  try {
    // 通知設定をチェック
    const isEnabled = await checkNotificationSetting(data.userId, settingKey);
    
    if (!isEnabled) {
      console.log(`Notification disabled for user ${data.userId}, setting: ${settingKey}`);
      return null;
    }
    
    // 設定が有効な場合のみ通知を作成
    return await createNotification(data);
  } catch (error) {
    console.error('Error creating notification with check:', error);
    throw error;
  }
};

// ユーザーの通知を取得
export const getUserNotifications = async (userId: string): Promise<NotificationDoc[]> => {
  try {
    // セキュリティルールが完全開放されたので、元のクエリに戻す
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: NotificationDoc[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      try {
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as NotificationDoc);
      } catch (parseError) {
        console.error('Error parsing notification data:', parseError, data);
        // 破損したデータはスキップ
      }
    });
    
    return notifications;
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    if (error.code === 'failed-precondition') {
      throw new Error('通知の取得に必要なインデックスが作成されていません。しばらく待ってから再試行してください。');
    } else if (error.code === 'permission-denied') {
      throw new Error('通知の取得権限がありません。');
    } else {
      throw new Error(`通知の取得に失敗しました: ${error.message || '不明なエラー'}`);
    }
  }
};

// 通知を既読にする
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// すべての通知を既読にする
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    // セキュリティルールが完全開放されたので、元のクエリに戻す
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map((doc) => 
      updateDoc(doc.ref, {
        isRead: true,
        updatedAt: serverTimestamp(),
      })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// 未読通知数を取得
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    // セキュリティルールが完全開放されたので、元のクエリに戻す
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error: any) {
    console.error('Error getting unread notification count:', error);
    if (error.code === 'failed-precondition') {
      console.warn('Index not ready for unread count query');
      return 0; // インデックスが準備できていない場合は0を返す
    } else if (error.code === 'permission-denied') {
      console.warn('Permission denied for unread count query');
      return 0; // 権限がない場合は0を返す
    } else {
      console.error('Unexpected error getting unread count:', error);
      return 0; // 予期しないエラーの場合も0を返す
    }
  }
};

// 通知を削除
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// いいね通知を作成
export const createLikeNotification = async (
  targetUserId: string,
  fromUserId: string,
  fromUserName: string,
  targetId: string,
  targetType: 'thread' | 'question' | 'maintenance',
  targetTitle: string
): Promise<string> => {
  const title = 'いいねがつきました';
  const content = `${fromUserName}さんがあなたの投稿「${targetTitle}」にいいねしました`;
  
  return createNotification({
    userId: targetUserId,
    type: 'like',
    title,
    content,
    targetId,
    targetType,
    fromUserId,
    fromUserName,
  });
};

// 返信通知を作成
export const createReplyNotification = async (
  targetUserId: string,
  fromUserId: string,
  fromUserName: string,
  targetId: string,
  targetType: 'thread' | 'question' | 'maintenance',
  targetTitle: string
): Promise<string> => {
  const title = '返信がつきました';
  const content = `${fromUserName}さんがあなたの投稿「${targetTitle}」に返信しました`;
  
  return createNotification({
    userId: targetUserId,
    type: 'reply',
    title,
    content,
    targetId,
    targetType,
    fromUserId,
    fromUserName,
  });
};
