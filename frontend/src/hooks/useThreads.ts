import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/clients';
import { Thread, ThreadDoc } from '../types';

interface UseThreadsOptions {
  type?: 'post' | 'question';
  vehicleKey?: string;
}

export const useThreads = (options: UseThreadsOptions = {}) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    console.log('useThreads - Starting fetch with options:', options);

    // Firestoreクエリを構築
    let q = query(
      collection(db, 'threads'),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    // タイプフィルター
    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }

    // 車種フィルター
    if (options.vehicleKey) {
      q = query(q, where('vehicleKey', '==', options.vehicleKey));
    }

    // リアルタイムリスナーを設定
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const threadData: Thread[] = snapshot.docs.map((doc) => {
          const data = doc.data() as ThreadDoc;
          
          // ThreadDocをThread型にマッピング
          return {
            id: doc.id,
            title: data.title,
            content: data.content,
            author: data.authorName,
            authorId: data.authorId, // authorIdを追加
            replies: data.replies,
            likes: data.likes,
            tags: data.tags,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            type: data.type,
            adType: data.adType,
          } as Thread;
        });

        console.log('useThreads - Raw data:', {
          totalDocs: snapshot.docs.length,
          threads: threadData.map(t => ({ id: t.id, title: t.title, type: t.type })),
          refreshKey
        });

        setThreads(threadData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching threads:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // クリーンアップ
    return () => unsubscribe();
  }, [options.type, options.vehicleKey, refreshKey]);

  return { threads, loading, error, refresh };
};
