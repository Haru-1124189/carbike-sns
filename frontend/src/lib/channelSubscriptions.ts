import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    where
} from 'firebase/firestore';
import { db } from '../firebase/init';

export interface ChannelSubscription {
  id?: string;
  userId: string;
  channelId: string;
  channelName?: string;
  subscribedAt: Timestamp;
}

/**
 * チャンネルを登録する
 */
export const subscribeToChannel = async (
  userId: string, 
  channelId: string, 
  channelName?: string
): Promise<void> => {
  try {
    // 既存の登録をチェック
    const existingSubscriptions = await getUserChannelSubscriptions(userId);
    const alreadySubscribed = existingSubscriptions.some(sub => sub.channelId === channelId);
    
    if (alreadySubscribed) {
      throw new Error('このチャンネルは既に登録されています');
    }

    // 新しい登録を作成
    await addDoc(collection(db, 'channelSubscriptions'), {
      userId,
      channelId,
      channelName,
      subscribedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error subscribing to channel:', error);
    throw error;
  }
};

/**
 * チャンネルの登録を解除する
 */
export const unsubscribeFromChannel = async (
  userId: string, 
  channelId: string
): Promise<void> => {
  try {
    const q = query(
      collection(db, 'channelSubscriptions'),
      where('userId', '==', userId),
      where('channelId', '==', channelId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('登録が見つかりません');
    }

    // 登録を削除
    const batch = querySnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'channelSubscriptions', docSnapshot.id))
    );
    
    await Promise.all(batch);
  } catch (error) {
    console.error('Error unsubscribing from channel:', error);
    throw error;
  }
};

/**
 * ユーザーのチャンネル登録一覧を取得
 */
export const getUserChannelSubscriptions = async (
  userId: string
): Promise<ChannelSubscription[]> => {
  try {
    const q = query(
      collection(db, 'channelSubscriptions'),
      where('userId', '==', userId),
      orderBy('subscribedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChannelSubscription));
  } catch (error) {
    console.error('Error getting user channel subscriptions:', error);
    return [];
  }
};

/**
 * チャンネルの登録者数を取得
 */
export const getChannelSubscriberCount = async (
  channelId: string
): Promise<number> => {
  try {
    const q = query(
      collection(db, 'channelSubscriptions'),
      where('channelId', '==', channelId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting channel subscriber count:', error);
    return 0;
  }
};

/**
 * ユーザーが特定のチャンネルを登録しているかチェック
 */
export const isUserSubscribedToChannel = async (
  userId: string, 
  channelId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'channelSubscriptions'),
      where('userId', '==', userId),
      where('channelId', '==', channelId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking channel subscription:', error);
    return false;
  }
};
