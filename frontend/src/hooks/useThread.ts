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
        console.log('useThread - Fetching thread with ID:', threadId);
        setLoading(true);
        setError(null);
        
        const threadData = await getThreadById(threadId);
        console.log('useThread - Retrieved thread data:', threadData);
        
        if (threadData) {
          // TimestampをDateオブジェクトに変換
          const convertedThreadData = {
            ...threadData,
            createdAt: threadData.createdAt?.toDate ? threadData.createdAt.toDate() : threadData.createdAt,
            updatedAt: threadData.updatedAt?.toDate ? threadData.updatedAt.toDate() : threadData.updatedAt,
          };
          console.log('useThread - Setting thread state with:', convertedThreadData);
          setThread(convertedThreadData);
        } else {
          console.error('useThread - Thread not found for ID:', threadId);
          setError('投稿が見つかりませんでした');
        }
      } catch (err: any) {
        console.error('useThread - Error fetching thread:', err);
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
