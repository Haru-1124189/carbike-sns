import { collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/clients';
import { canViewUserContent } from '../lib/privacy';
import { Thread } from '../types';
import { ThreadDoc } from '../types/thread';

interface UseThreadsOptions {
  type?: 'post' | 'question';
  vehicleKey?: string;
  currentUserId?: string; // プライバシーフィルタリング用
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
      async (snapshot) => {
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
             images: data.images, // 画像フィールドを追加
             isDeleted: data.isDeleted,
             isPinned: data.isPinned,
             pinnedAt: data.pinnedAt?.toDate ? data.pinnedAt.toDate() : data.pinnedAt,
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

         // プライバシーフィルタリング（非同期処理）
         if (options.currentUserId) {
           const privacyFilteredThreads = await Promise.all(
             filteredThreadData.map(async (thread) => {
               if (!thread.authorId) return thread; // 投稿者IDがない場合は表示
               
               const canView = await canViewUserContent(thread.authorId, options.currentUserId!);
               return canView ? thread : null;
             })
           );
           
           filteredThreadData = privacyFilteredThreads.filter(thread => thread !== null) as Thread[];
         }

                   // 固定された投稿を最初に表示し、その後は新着順にソート
          const sortedThreadData = filteredThreadData.sort((a, b) => {
            // 固定された投稿を最初に
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            
            // 両方とも固定されている場合は固定日時順
            if (a.isPinned && b.isPinned) {
              const pinnedAtA = a.pinnedAt instanceof Date ? a.pinnedAt.getTime() : new Date(a.pinnedAt || 0).getTime();
              const pinnedAtB = b.pinnedAt instanceof Date ? b.pinnedAt.getTime() : new Date(b.pinnedAt || 0).getTime();
              return pinnedAtB - pinnedAtA; // 新しい固定を上に
            }
            
            // 固定されていない場合は作成日時順
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime(); // 新着順
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
