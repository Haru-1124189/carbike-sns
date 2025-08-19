import { addDoc, collection, deleteDoc, doc, getDocs, increment, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/clients';

export type LikeTarget = 'thread' | 'maintenance';

export const toggleLike = async (targetId: string, userId: string, targetType: LikeTarget = 'thread') => {
  console.log('toggleLike called:', { targetId, userId, targetType });
  
  try {
    // 既存のいいねを確認
    const likeQuery = query(
      collection(db, 'likes'),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      where('userId', '==', userId)
    );

    const likeSnapshot = await getDocs(likeQuery);
    console.log('Existing likes found:', likeSnapshot.size);

    if (likeSnapshot.empty) {
      // いいねを追加
      const likeData = {
        targetId,
        targetType,
        userId,
        createdAt: serverTimestamp(),
      };

      console.log('Adding like with data:', likeData);
      await addDoc(collection(db, 'likes'), likeData);

      // 対象のいいね数を更新
      const collectionName = targetType === 'thread' ? 'threads' : 'maintenance_posts';
      const targetRef = doc(db, collectionName, targetId);
      console.log('Updating likes count for:', collectionName, targetId);
      await updateDoc(targetRef, {
        likes: increment(1),
        updatedAt: serverTimestamp(),
      });

      console.log('Like added successfully');
      return true; // いいね追加
    } else {
      // いいねを削除
      const likeDoc = likeSnapshot.docs[0];
      console.log('Removing like:', likeDoc.id);
      await deleteDoc(doc(db, 'likes', likeDoc.id));

      // 対象のいいね数を更新
      const collectionName = targetType === 'thread' ? 'threads' : 'maintenance_posts';
      const targetRef = doc(db, collectionName, targetId);
      console.log('Updating likes count for:', collectionName, targetId);
      await updateDoc(targetRef, {
        likes: increment(-1),
        updatedAt: serverTimestamp(),
      });

      console.log('Like removed successfully');
      return false; // いいね削除
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// スレッド専用のいいね機能（後方互換性のため）
export const toggleThreadLike = async (threadId: string, userId: string) => {
  return toggleLike(threadId, userId, 'thread');
};

// メンテナンス投稿専用のいいね機能
export const toggleMaintenanceLike = async (maintenanceId: string, userId: string) => {
  return toggleLike(maintenanceId, userId, 'maintenance');
};
