import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/init';
import { Follow } from '../types';
import { createNotificationWithCheck } from './notifications';

// フォロー通知を作成する関数
const createFollowNotification = async (followerId: string, followingId: string, followerName: string) => {
  try {
    // 通知設定をチェックして通知を作成
    await createNotificationWithCheck(
      {
        userId: followingId,
        type: 'follow',
        title: '新しいフォロワー',
        content: `${followerName}さんがあなたをフォローしました`,
        fromUserId: followerId,
        fromUserName: followerName
      },
      'followNotifications'
    );
    console.log('Follow notification created successfully');
  } catch (error) {
    console.error('Error creating follow notification:', error);
    // 通知の作成に失敗してもフォローは続行
  }
};

// フォローする
export const followUser = async (followerId: string, followingId: string): Promise<void> => {
  console.log('followUser called:', { followerId, followingId });
  
  if (followerId === followingId) {
    throw new Error('自分自身をフォローすることはできません');
  }

  // ユーザーの存在確認
  try {
    const followerDoc = await getDoc(doc(db, 'users', followerId));
    const followingDoc = await getDoc(doc(db, 'users', followingId));
    
    if (!followerDoc.exists()) {
      throw new Error(`フォロワー（${followerId}）が存在しません`);
    }
    
    if (!followingDoc.exists()) {
      throw new Error(`フォロー対象（${followingId}）が存在しません`);
    }
    
    console.log('ユーザー存在確認完了');
  } catch (error) {
    console.error('ユーザー存在確認エラー:', error);
    throw error;
  }

  // 既にフォローしているかチェック
  const existingFollow = await getFollowRelation(followerId, followingId);
  if (existingFollow) {
    throw new Error('既にフォローしています');
  }

  const batch = writeBatch(db);

  try {
    console.log('バッチ処理開始');
    
    // フォロー関係を追加
    const followRef = doc(collection(db, 'follows'));
    batch.set(followRef, {
      followerId,
      followingId,
      createdAt: serverTimestamp()
    });

    // フォロワー数を増加
    const followingUserRef = doc(db, 'users', followingId);
    batch.update(followingUserRef, {
      followersCount: increment(1),
      updatedAt: serverTimestamp()
    });

    // フォロー数を増加
    const followerUserRef = doc(db, 'users', followerId);
    batch.update(followerUserRef, {
      followingCount: increment(1),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    console.log('バッチ処理完了');

    // フォロー通知を作成
    const followerData = await getDoc(doc(db, 'users', followerId));
    const followerName = followerData.data()?.displayName || 'ユーザー';
    await createFollowNotification(followerId, followingId, followerName);
  } catch (error) {
    console.error('Error following user:', error);
    throw new Error(`フォローに失敗しました: ${error}`);
  }
};

// アンフォローする
export const unfollowUser = async (followerId: string, followingId: string): Promise<void> => {
  const followRelation = await getFollowRelation(followerId, followingId);
  if (!followRelation) {
    throw new Error('フォロー関係が見つかりません');
  }

  const batch = writeBatch(db);

  try {
    // フォロー関係を削除
    const followRef = doc(db, 'follows', followRelation.id);
    batch.delete(followRef);

    // フォロワー数を減少
    const followingUserRef = doc(db, 'users', followingId);
    batch.update(followingUserRef, {
      followersCount: increment(-1),
      updatedAt: serverTimestamp()
    });

    // フォロー数を減少
    const followerUserRef = doc(db, 'users', followerId);
    batch.update(followerUserRef, {
      followingCount: increment(-1),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw new Error('アンフォローに失敗しました');
  }
};

// フォロー関係を取得
export const getFollowRelation = async (followerId: string, followingId: string): Promise<Follow | null> => {
  try {
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Follow;
  } catch (error) {
    console.error('Error getting follow relation:', error);
    return null;
  }
};

// ユーザーのフォロワー一覧を取得
export const getFollowers = async (userId: string): Promise<string[]> => {
  try {
    const q = query(
      collection(db, 'follows'),
      where('followingId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().followerId);
  } catch (error) {
    console.error('Error getting followers:', error);
    return [];
  }
};

// ユーザーのフォロー中一覧を取得
export const getFollowing = async (userId: string): Promise<string[]> => {
  try {
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().followingId);
  } catch (error) {
    console.error('Error getting following:', error);
    return [];
  }
};

// フォロー状態をチェック
export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const relation = await getFollowRelation(followerId, followingId);
  return relation !== null;
};

// ユーザーのフォロー統計を更新
export const updateUserFollowStats = async (userId: string): Promise<void> => {
  try {
    const [followers, following] = await Promise.all([
      getFollowers(userId),
      getFollowing(userId)
    ]);

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      followersCount: followers.length,
      followingCount: following.length,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user follow stats:', error);
    throw new Error('フォロー統計の更新に失敗しました');
  }
};
