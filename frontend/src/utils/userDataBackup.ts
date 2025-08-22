import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/init';

// ユーザーデータのバックアップと復元機能
export class UserDataBackup {
  
  // ユーザーデータをバックアップ
  static async backupUserData(userId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // ローカルストレージにバックアップ
        localStorage.setItem(`user_backup_${userId}`, JSON.stringify({
          data: userData,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
        
        console.log(`✅ ユーザーデータをバックアップしました: ${userId}`);
      }
    } catch (error) {
      console.error('❌ バックアップエラー:', error);
    }
  }
  
  // バックアップから復元
  static async restoreUserData(userId: string): Promise<boolean> {
    try {
      const backupKey = `user_backup_${userId}`;
      const backupData = localStorage.getItem(backupKey);
      
      if (backupData) {
        const backup = JSON.parse(backupData);
        const userDocRef = doc(db, 'users', userId);
        
        // Firestoreに復元
        await setDoc(userDocRef, backup.data, { merge: true });
        
        console.log(`✅ ユーザーデータを復元しました: ${userId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ 復元エラー:', error);
      return false;
    }
  }
  
  // バックアップの存在確認
  static hasBackup(userId: string): boolean {
    const backupKey = `user_backup_${userId}`;
    return localStorage.getItem(backupKey) !== null;
  }
  
  // 古いバックアップをクリーンアップ
  static cleanupOldBackups(): void {
    const keys = Object.keys(localStorage);
    const backupKeys = keys.filter(key => key.startsWith('user_backup_'));
    
    backupKeys.forEach(key => {
      try {
        const backupData = localStorage.getItem(key);
        if (backupData) {
          const backup = JSON.parse(backupData);
          const backupDate = new Date(backup.timestamp);
          const now = new Date();
          const daysDiff = (now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24);
          
          // 30日以上古いバックアップを削除
          if (daysDiff > 30) {
            localStorage.removeItem(key);
            console.log(`🗑️ 古いバックアップを削除: ${key}`);
          }
        }
      } catch (error) {
        console.error('バックアップクリーンアップエラー:', error);
      }
    });
  }
}
