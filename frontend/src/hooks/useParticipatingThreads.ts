import { useEffect, useState } from 'react';
import { getUserParticipatingThreads } from '../lib/touring';
import { TouringThread } from '../types';

export const useParticipatingThreads = (userId: string | null) => {
  const [participatingThreads, setParticipatingThreads] = useState<TouringThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useParticipatingThreads useEffect called with userId:', userId);

    if (!userId) {
      console.log('No userId provided, clearing participating threads');
      setParticipatingThreads([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchParticipatingThreads = async () => {
      try {
        console.log('Fetching participating threads for user:', userId);
        const threads = await getUserParticipatingThreads(userId);
        console.log('useParticipatingThreads received threads:', threads);
        setParticipatingThreads(threads);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('useParticipatingThreads error:', err);
        setError(err instanceof Error ? err.message : '参加予定の取得に失敗しました');
        setLoading(false);
      }
    };

    fetchParticipatingThreads();

    // 定期的に更新（30秒ごと）
    const interval = setInterval(fetchParticipatingThreads, 30000);

    return () => {
      console.log('useParticipatingThreads cleanup');
      clearInterval(interval);
    };
  }, [userId]);

  const refreshParticipatingThreads = async () => {
    if (!userId) return;
    
    console.log('Refreshing participating threads');
    try {
      const threads = await getUserParticipatingThreads(userId);
      setParticipatingThreads(threads);
      setError(null);
    } catch (err) {
      console.error('Error refreshing participating threads:', err);
      setError(err instanceof Error ? err.message : '参加予定の更新に失敗しました');
    }
  };

  return {
    participatingThreads,
    loading,
    error,
    refreshParticipatingThreads
  };
};
