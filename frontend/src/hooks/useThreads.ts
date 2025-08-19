import { collection, onSnapshot, query } from 'firebase/firestore';
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
    console.log('useThreads - Firebase db object:', db);
    console.log('useThreads - Collection path:', 'threads');
    
    // 基本的なFirebase接続テスト
    try {
      const testCollection = collection(db, 'threads');
      console.log('useThreads - Test collection created:', testCollection);
    } catch (error) {
      console.error('useThreads - Error creating collection:', error);
      setError('Firebase connection failed');
      setLoading(false);
      return;
    }

              // Firestoreクエリを構築（インデックスエラーを回避）
     let q = query(
       collection(db, 'threads')
     );
     console.log('useThreads - Using basic query without filters to avoid index error');

    // リアルタイムリスナーを設定
    console.log('useThreads - Setting up listener with query:', q);
    
    console.log('useThreads - About to set up onSnapshot with query:', q);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('useThreads - onSnapshot success callback triggered');
        console.log('useThreads - Snapshot metadata:', {
          empty: snapshot.empty,
          size: snapshot.size,
          docs: snapshot.docs.length
        });
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
             createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
             type: data.type,
             adType: data.adType,
             vehicleKey: data.vehicleKey,
             isDeleted: data.isDeleted,
           } as Thread;
        });

        console.log('useThreads - Raw data:', {
          totalDocs: snapshot.docs.length,
          threads: threadData.map(t => ({ 
            id: t.id, 
            title: t.title, 
            type: t.type, 
            authorId: t.authorId,
            author: t.author 
          })),
          refreshKey
        });

        // 各ドキュメントの生データも確認
        console.log('useThreads - Raw Firestore documents:', 
          snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }))
        );

        // データマッピングの詳細を確認
        console.log('useThreads - Data mapping details:', 
          snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              content: data.content,
              authorName: data.authorName,
              authorId: data.authorId,
              type: data.type,
              createdAt: data.createdAt,
              isDeleted: data.isDeleted
            };
          })
        );

                 // クライアント側でフィルタリングとソート
         let filteredThreadData = threadData.filter(thread => {
           // isDeletedフィルター
           if (thread.isDeleted) return false;
           
           // タイプフィルター
           if (options.type && thread.type !== options.type) return false;
           
           // 車種フィルター
           if (options.vehicleKey && thread.vehicleKey !== options.vehicleKey) return false;
           
           return true;
         });

         // 新着順にソート
         const sortedThreadData = filteredThreadData.sort((a, b) => {
           const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
           const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
           return dateB.getTime() - dateA.getTime();
         });
         
         console.log('useThreads - Filtered and sorted data:', {
           originalCount: threadData.length,
           filteredCount: filteredThreadData.length,
           finalCount: sortedThreadData.length,
           options
         });
         
         setThreads(sortedThreadData);
         setLoading(false);
      },
             (err) => {
         console.error('useThreads - Error fetching threads:', err);
         console.error('useThreads - Error details:', {
           code: err.code,
           message: err.message,
           stack: err.stack
         });
         
         // インデックスエラーの場合は空の配列を設定して続行
         if (err.code === 'failed-precondition') {
           console.warn('useThreads - Index error detected, setting empty array');
           setThreads([]);
           setLoading(false);
         } else {
           setError(err.message);
           setLoading(false);
         }
       }
    );

    // クリーンアップ
    return () => unsubscribe();
  }, [options.type, options.vehicleKey, refreshKey]);

  return { threads, loading, error, refresh };
};
