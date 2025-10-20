import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/init';

export const checkAdminUsers = async () => {
  try {
    console.log('Checking for admin users...');
    
    // 管理者ユーザーを検索
    const usersSnapshot = await getDocs(
      query(
        collection(db, 'users'),
        where('role', 'in', ['admin'])
      )
    );

    console.log(`Found ${usersSnapshot.size} users with role: admin`);
    
    usersSnapshot.forEach((doc) => {
      console.log('Admin user:', doc.id, doc.data());
    });

    // isAdminフラグで検索
    const isAdminSnapshot = await getDocs(
      query(
        collection(db, 'users'),
        where('isAdmin', '==', true)
      )
    );

    console.log(`Found ${isAdminSnapshot.size} users with isAdmin: true`);
    
    isAdminSnapshot.forEach((doc) => {
      console.log('Admin user (isAdmin):', doc.id, doc.data());
    });

    return {
      roleAdmins: usersSnapshot.size,
      isAdminUsers: isAdminSnapshot.size,
      totalAdmins: usersSnapshot.size + isAdminSnapshot.size
    };

  } catch (error) {
    console.error('Error checking admin users:', error);
    throw error;
  }
};

export const checkAdminNotifications = async () => {
  try {
    console.log('Checking admin notifications...');
    
    const notificationsSnapshot = await getDocs(
      collection(db, 'adminNotifications')
    );

    console.log(`Found ${notificationsSnapshot.size} admin notifications`);
    
    notificationsSnapshot.forEach((doc) => {
      console.log('Admin notification:', doc.id, doc.data());
    });

    return notificationsSnapshot.size;

  } catch (error) {
    console.error('Error checking admin notifications:', error);
    throw error;
  }
};
