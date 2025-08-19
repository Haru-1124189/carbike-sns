import { useEffect, useState } from 'react';
import { getThreadById } from '../lib/threads';
import { ThreadDoc } from '../types';

export const useThread = (threadId: string) => {
  const [thread, setThread] = useState<ThreadDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const threadData = await getThreadById(threadId);
        
        if (threadData && threadData.type === 'post') {
          setThread(threadData);
        } else {
          setError('投稿が見つかりませんでした');
        }
      } catch (err: any) {
        console.error('Error fetching thread:', err);
        setError(err.message || '投稿の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (threadId) {
      fetchThread();
    }
  }, [threadId]);

  return { thread, loading, error };
};
