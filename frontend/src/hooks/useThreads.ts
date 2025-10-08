import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../firebase/clients';
import { Thread } from '../types';

interface UseThreadsOptions {
  currentUserId?: string;
  limit?: number;
  type?: 'post' | 'question' | 'all';
}

interface UseThreadsReturn {
  threads: Thread[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

// キャッシュ管理
const threadCache = new Map<string, { data: Thread[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分

export const useThreads = (options: UseThreadsOptions = {}): UseThreadsReturn => {
  const { currentUserId, limit: limitCount = 20, type = 'all' } = options;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<any>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // キャッシュキーを生成
  const getCacheKey = useCallback(() => {
    return `threads_${currentUserId || 'all'}_${type}_${limitCount}`;
  }, [currentUserId, type, limitCount]);

  // キャッシュからデータを取得
  const getFromCache = useCallback(() => {
    const key = getCacheKey();
    const cached = threadCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [getCacheKey]);

  // キャッシュにデータを保存
  const saveToCache = useCallback((data: Thread[]) => {
    const key = getCacheKey();
    threadCache.set(key, { data, timestamp: Date.now() });
  }, [getCacheKey]);

  // クエリを構築
  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'), limit(limitCount));
    
    if (type !== 'all') {
      q = query(q, where('type', '==', type));
    }
    
    if (currentUserId) {
      q = query(q, where('authorId', '==', currentUserId));
    }
    
    return q;
  }, [currentUserId, type, limitCount]);

  // データを読み込み
  const loadData = useCallback(async (isInitial = false) => {
    try {
      setError(null);
      
      if (isInitial) {
        const cached = getFromCache();
        if (cached) {
          setThreads(cached);
          setLoading(false);
          return;
        }
      }

      const q = buildQuery();
      const snapshot = await getDocs(q);
      
      const newThreads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Thread[];

      // 削除された投稿を除外
      const filteredThreads = newThreads.filter(thread => !thread.isDeleted);

      console.log('useThreads - Raw threads:', newThreads.length);
      console.log('useThreads - Filtered threads:', filteredThreads.length);
      console.log('useThreads - Query options:', { currentUserId, type, limitCount });

      if (isInitial) {
        setThreads(filteredThreads);
        saveToCache(filteredThreads);
      } else {
        setThreads(prev => [...prev, ...filteredThreads]);
      }

      setHasMore(filteredThreads.length === limitCount);
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
      
    } catch (err) {
      console.error('Error loading threads:', err);
      setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, getFromCache, saveToCache, limitCount, currentUserId, type]);

  // リアルタイムリスナーを設定
  const setupRealtimeListener = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const q = buildQuery();
    
    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const newThreads = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Thread[];
        
        // 削除された投稿を除外
        const filteredThreads = newThreads.filter(thread => !thread.isDeleted);
        
        setThreads(filteredThreads);
        saveToCache(filteredThreads);
        setLoading(false);
      },
      (err) => {
        console.error('Error in realtime listener:', err);
        setError(err.message);
        setLoading(false);
      }
    );
  }, [buildQuery, saveToCache]);

  // 初期読み込み
  useEffect(() => {
    setLoading(true);
    loadData(true);
  }, [loadData]);

  // リアルタイムリスナー
  useEffect(() => {
    setupRealtimeListener();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [setupRealtimeListener]);

  // より多くのデータを読み込み
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    await loadData(false);
  }, [loading, hasMore, loadData]);

  // データをリフレッシュ
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    lastDocRef.current = null;
    setHasMore(true);
    
    // キャッシュをクリア
    const key = getCacheKey();
    threadCache.delete(key);
    
    await loadData(true);
  }, [getCacheKey, loadData]);

  return {
    threads,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};
