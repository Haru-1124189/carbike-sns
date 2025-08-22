import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/clients';
import { ThreadDoc } from '../types';

export const useThread = (threadId: string) => {
  const [thread, setThread] = useState<ThreadDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!threadId) return;

    console.log('useThread - Setting up real-time listener for thread ID:', threadId);
    setLoading(true);
    setError(null);

    const threadRef = doc(db, 'threads', threadId);
    
    const unsubscribe = onSnapshot(
      threadRef,
      (doc) => {
        if (doc.exists()) {
          const threadData = doc.data() as ThreadDoc;
          console.log('useThread - Real-time update received:', threadData);
          
          // TimestampをDateオブジェクトに変換
          const convertedThreadData = {
            ...threadData,
            id: doc.id,
            createdAt: threadData.createdAt?.toDate ? threadData.createdAt.toDate() : threadData.createdAt,
            updatedAt: threadData.updatedAt?.toDate ? threadData.updatedAt.toDate() : threadData.updatedAt,
          };
          console.log('useThread - Setting thread state with:', convertedThreadData);
          setThread(convertedThreadData);
        } else {
          console.error('useThread - Thread not found for ID:', threadId);
          setError('投稿が見つかりませんでした');
        }
        setLoading(false);
      },
      (err) => {
        console.error('useThread - Error in real-time listener:', err);
        setError(err.message || '投稿の取得に失敗しました');
        setLoading(false);
      }
    );

    return () => {
      console.log('useThread - Cleaning up real-time listener');
      unsubscribe();
    };
  }, [threadId]);

  return { thread, loading, error };
};
