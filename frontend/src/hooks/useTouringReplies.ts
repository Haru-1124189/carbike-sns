import { useEffect, useState } from 'react';
import { subscribeTouringReplies } from '../lib/touring';
import { TouringReply } from '../types';

export const useTouringReplies = (threadId: string) => {
  const [replies, setReplies] = useState<TouringReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useTouringReplies useEffect called with threadId:', threadId);
    
    if (!threadId) {
      console.log('No threadId provided, clearing replies');
      setReplies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeTouringReplies(threadId, (fetchedReplies) => {
      console.log('useTouringReplies callback received replies:', fetchedReplies);
      setReplies(fetchedReplies);
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error('useTouringReplies error:', error);
      setError(error.message || '返信の取得に失敗しました');
      setLoading(false);
    });

    return () => {
      console.log('useTouringReplies cleanup');
      unsubscribe();
    };
  }, [threadId]);

  const refreshReplies = async () => {
    // リアルタイム更新なので手動リフレッシュは不要
    console.log('Touring replies refreshed');
  };

  return {
    replies,
    loading,
    error,
    refreshReplies
  };
};
