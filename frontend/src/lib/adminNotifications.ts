import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/clients';

export interface AdminNotificationData {
  type: 'contact_inquiry' | 'user_report' | 'creator_application' | 'vehicle_request';
  title: string;
  content: string;
  contactData?: any;
  reportData?: any;
  applicationData?: any;
  requestData?: any;
}

/**
 * 管理者に通知を送信
 */
export const notifyAdmins = async (notificationData: AdminNotificationData): Promise<void> => {
  try {
    console.log('Sending admin notification:', notificationData);

    // 管理者ユーザーを取得（role: 'admin'）
    const roleAdminSnapshot = await getDocs(
      query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      )
    );

    // 管理者ユーザーを取得（isAdmin: true）
    const isAdminSnapshot = await getDocs(
      query(
        collection(db, 'users'),
        where('isAdmin', '==', true)
      )
    );

    console.log('Role admin users found:', roleAdminSnapshot.size);
    console.log('IsAdmin users found:', isAdminSnapshot.size);

    // 重複を除いて結合
    const allAdmins = new Map();
    
    roleAdminSnapshot.docs.forEach(doc => {
      allAdmins.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    isAdminSnapshot.docs.forEach(doc => {
      allAdmins.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const usersSnapshot = { docs: Array.from(allAdmins.values()).map(admin => ({ id: admin.id, data: () => admin })), size: allAdmins.size };

    if (usersSnapshot.size === 0) {
      console.warn('No admin users found');
      return;
    }

    // 各管理者に通知を送信
    const notificationPromises = usersSnapshot.docs.map(async (adminDoc) => {
      const adminData = adminDoc.data();
      
      const notification: any = {
        adminId: adminDoc.id,
        adminEmail: adminData.email,
        type: notificationData.type,
        title: notificationData.title,
        content: notificationData.content,
        isRead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 通知タイプに応じたデータを追加（undefinedの場合は除外）
      if (notificationData.contactData) {
        notification.contactData = notificationData.contactData;
      }
      if (notificationData.reportData) {
        notification.reportData = notificationData.reportData;
      }
      if (notificationData.applicationData) {
        notification.applicationData = notificationData.applicationData;
      }
      if (notificationData.requestData) {
        notification.requestData = notificationData.requestData;
      }

      return addDoc(collection(db, 'adminNotifications'), notification);
    });

    await Promise.all(notificationPromises);
    
    console.log(`Sent admin notifications to ${usersSnapshot.size} admin(s)`);
    
    // 作成された通知を確認
    const notificationCheck = await getDocs(
      collection(db, 'adminNotifications')
    );
    console.log('Total admin notifications in database:', notificationCheck.size);

  } catch (error) {
    console.error('Error sending admin notifications:', error);
    throw error;
  }
};

/**
 * 管理者通知を取得
 */
export const getAdminNotifications = async (adminId: string) => {
  try {
    const notificationsSnapshot = await getDocs(
      query(
        collection(db, 'adminNotifications'),
        where('adminId', '==', adminId),
        where('isRead', '==', false)
      )
    );

    return notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    throw error;
  }
};

/**
 * 管理者通知を既読にする
 */
export const markAdminNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'adminNotifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking admin notification as read:', error);
    throw error;
  }
};
