import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/clients';
import { createLikeNotification } from './notifications';

export type LikeTarget = 'thread' | 'maintenance';

export const toggleLike = async (targetId: string, userId: string, targetType: LikeTarget = 'thread') => {
  console.log('toggleLike called:', { targetId, userId, targetType });
  console.log('Authentication check - userId provided:', !!userId);
  console.log('Authentication check - userId length:', userId?.length);
  
  try {
    // 既存のいいねを確認
    const likeQuery = query(
      collection(db, 'likes'),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      where('userId', '==', userId)
    );

    let likeSnapshot;
    try {
      likeSnapshot = await getDocs(likeQuery);
      console.log('Existing likes found:', likeSnapshot.size);
    } catch (queryError) {
      console.error('Error querying existing likes:', queryError);
      console.log('Assuming no existing likes due to query error');
      // クエリエラーの場合は、いいねが存在しないものとして処理
      likeSnapshot = { empty: true, docs: [] };
    }

    if (likeSnapshot.empty) {
      // いいねを追加
      const likeData = {
        targetId,
        targetType,
        userId,
        createdAt: serverTimestamp(),
      };

      console.log('Adding like with data:', likeData);
      console.log('Current user ID:', userId);
      console.log('Request auth UID:', 'will be checked by Firestore rules');
      console.log('Firestore rules should allow create for authenticated users');
      try {
        const docRef = await addDoc(collection(db, 'likes'), likeData);
        console.log('Like document created successfully with ID:', docRef.id);
      } catch (addError) {
        console.error('Error adding like document:', addError);
        console.error('Add error details:', {
          error: addError instanceof Error ? addError.message : addError,
          likeData,
          userId,
          errorCode: addError instanceof Error ? addError.name : 'Unknown'
        });
        throw addError;
      }

      // 対象のいいね数を更新
      const collectionName = targetType === 'thread' ? 'threads' : 'maintenance_posts';
      const targetRef = doc(db, collectionName, targetId);
      console.log('Updating likes count for:', collectionName, targetId);
      console.log('Target document path:', `${collectionName}/${targetId}`);
      console.log('Update operation: increment likes by 1');
      
      try {
        // まず、対象ドキュメントが存在するか確認
        const targetDoc = await getDoc(targetRef);
        if (!targetDoc.exists()) {
          console.error('Target document does not exist:', targetId);
          throw new Error('Target document not found');
        }
        
        console.log('Target document exists, current data:', targetDoc.data());
        
        await updateDoc(targetRef, {
          likes: increment(1),
          updatedAt: serverTimestamp(),
        });
        console.log('Likes count updated successfully');
      } catch (updateError) {
        console.error('Error updating likes count:', updateError);
        console.error('Update error details:', {
          collectionName,
          targetId,
          error: updateError instanceof Error ? updateError.message : updateError,
          errorCode: updateError instanceof Error ? updateError.name : 'Unknown'
        });
        // いいねドキュメントは作成されたが、カウント更新に失敗した場合
        console.log('Like document created but count update failed');
      }

      // 通知を作成（自分以外の投稿にいいねした場合）
      try {
        const targetDoc = await getDoc(targetRef);
        if (targetDoc.exists()) {
          const targetData = targetDoc.data();
          const targetUserId = targetData.authorId;
          const targetTitle = targetData.title || '投稿';
          
          // 自分以外の投稿にいいねした場合のみ通知を作成
          if (targetUserId && targetUserId !== userId) {
            // いいねしたユーザーの情報を取得
            const userDoc = await getDoc(doc(db, 'users', userId));
            const fromUserName = userDoc.exists() ? userDoc.data().displayName || 'ユーザー' : 'ユーザー';
            
            await createLikeNotification(
              targetUserId,
              userId,
              fromUserName,
              targetId,
              targetType,
              targetTitle
            );
          }
        }
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // 通知の作成に失敗してもいいねは成功させる
      }

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
    console.error('Error details:', {
      targetId,
      userId,
      targetType,
      error: error instanceof Error ? error.message : error
    });
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
