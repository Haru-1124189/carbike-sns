import { useEffect, useState } from 'react';
import { subscribeTouringThreads } from '../lib/touring';
import { TouringThread } from '../types';

export const useTouringThreads = () => {
  const [threads, setThreads] = useState<TouringThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeTouringThreads((fetchedThreads) => {
      setThreads(fetchedThreads);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const refreshThreads = async () => {
    // リアルタイム更新を使用しているため、手動リフレッシュは不要
    console.log('Touring threads refreshed via real-time subscription');
  };

  return {
    threads,
    loading,
    error,
    refreshThreads
  };
};
