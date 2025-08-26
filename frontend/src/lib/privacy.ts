import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/init';

/**
 * ユーザーの鍵アカウント設定を更新
 */
export const updatePrivacySettings = async (userId: string, isPrivate: boolean): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isPrivate,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    throw new Error('プライバシー設定の更新に失敗しました');
  }
};

/**
 * ユーザーの鍵アカウント設定を取得
 */
export const getUserPrivacySettings = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false; // デフォルトは公開アカウント
    }
    
    const userData = userDoc.data();
    return userData.isPrivate || false;
  } catch (error) {
    console.error('Error getting privacy settings:', error);
    return false; // エラーの場合は公開アカウント
  }
};

/**
 * 投稿が表示可能かどうかをチェック
 * 鍵アカウントの場合、フォロワーのみ表示可能
 */
export const canViewUserContent = async (
  contentAuthorId: string, 
  viewerId: string
): Promise<boolean> => {
  try {
    // 自分自身のコンテンツは常に表示可能
    if (contentAuthorId === viewerId) {
      return true;
    }

    // 投稿者のプライバシー設定を取得
    const isPrivate = await getUserPrivacySettings(contentAuthorId);
    
    // 公開アカウントの場合は常に表示可能
    if (!isPrivate) {
      return true;
    }

    // 鍵アカウントの場合、フォロー関係をチェック
    const { isFollowing } = await import('./follows');
    return await isFollowing(viewerId, contentAuthorId);
  } catch (error) {
    console.error('Error checking content visibility:', error);
    return false; // エラーの場合は表示しない
  }
};
