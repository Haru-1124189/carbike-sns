import { useCallback, useEffect, useState } from 'react';
import {
    ChannelSubscription,
    getChannelSubscriberCount,
    getUserChannelSubscriptions,
    isUserSubscribedToChannel,
    subscribeToChannel,
    unsubscribeFromChannel
} from '../lib/channelSubscriptions';

/**
 * ユーザーのチャンネル登録を管理するフック
 */
export const useChannelSubscriptions = (userId?: string) => {
  const [subscriptions, setSubscriptions] = useState<ChannelSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ユーザーの登録チャンネル一覧を取得
  const loadSubscriptions = useCallback(async () => {
    if (!userId) {
      setSubscriptions([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const userSubscriptions = await getUserChannelSubscriptions(userId);
      setSubscriptions(userSubscriptions);
    } catch (err) {
      console.error('Error loading channel subscriptions:', err);
      setError('登録チャンネルの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // チャンネルを登録する
  const subscribe = useCallback(async (channelId: string, channelName?: string) => {
    if (!userId) {
      throw new Error('ログインが必要です');
    }

    try {
      await subscribeToChannel(userId, channelId, channelName);
      await loadSubscriptions(); // 登録一覧を再読み込み
    } catch (err) {
      console.error('Error subscribing to channel:', err);
      throw err;
    }
  }, [userId, loadSubscriptions]);

  // チャンネルの登録を解除する
  const unsubscribe = useCallback(async (channelId: string) => {
    if (!userId) {
      throw new Error('ログインが必要です');
    }

    try {
      await unsubscribeFromChannel(userId, channelId);
      await loadSubscriptions(); // 登録一覧を再読み込み
    } catch (err) {
      console.error('Error unsubscribing from channel:', err);
      throw err;
    }
  }, [userId, loadSubscriptions]);

  // 特定のチャンネルを登録しているかチェック
  const isSubscribed = useCallback((channelId: string): boolean => {
    return subscriptions.some(sub => sub.channelId === channelId);
  }, [subscriptions]);

  // 登録チャンネルIDの配列を取得
  const subscribedChannelIds = subscriptions.map(sub => sub.channelId);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  return {
    subscriptions,
    subscribedChannelIds,
    loading,
    error,
    subscribe,
    unsubscribe,
    isSubscribed,
    reload: loadSubscriptions
  };
};

/**
 * 特定のチャンネルの登録者数を取得するフック
 */
export const useChannelSubscriberCount = (channelId?: string) => {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadSubscriberCount = useCallback(async () => {
    if (!channelId) {
      setSubscriberCount(0);
      return;
    }

    setLoading(true);
    try {
      const count = await getChannelSubscriberCount(channelId);
      setSubscriberCount(count);
    } catch (error) {
      console.error('Error loading subscriber count:', error);
      setSubscriberCount(0);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    loadSubscriberCount();
  }, [loadSubscriberCount]);

  return {
    subscriberCount,
    loading,
    reload: loadSubscriberCount
  };
};

/**
 * 特定のチャンネルの登録状態をチェックするフック
 */
export const useChannelSubscriptionStatus = (userId?: string, channelId?: string) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!userId || !channelId) {
      setIsSubscribed(false);
      return;
    }

    setLoading(true);
    try {
      const subscribed = await isUserSubscribedToChannel(userId, channelId);
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [userId, channelId]);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  return {
    isSubscribed,
    loading,
    reload: checkSubscriptionStatus
  };
};
