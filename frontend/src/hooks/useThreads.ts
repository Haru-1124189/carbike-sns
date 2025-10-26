import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../firebase/init';
import { canViewUserContent } from '../lib/privacy';
import { Thread } from '../types';
import { filterMutedPosts } from '../utils/muteWords';

interface UseThreadsOptions {
  currentUserId?: string; // 特定ユーザーの投稿のみを取得する場合に指定
  viewerUserId?: string; // 投稿を見るユーザーのID（鍵アカウント判定用）
  limit?: number;
  type?: 'post' | 'question' | 'all';
  blockedUsers?: string[];
  mutedWords?: string[];
}

interface UseThreadsReturn {
  threads: Thread[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

// キャッシュ管理（課金削減のため延長）
const threadCache = new Map<string, { data: Thread[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10分（5分から延長）

export const useThreads = (options: UseThreadsOptions = {}): UseThreadsReturn => {
  const { currentUserId, viewerUserId, limit: limitCount = 15, type = 'all', blockedUsers = [], mutedWords = [] } = options;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<any>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // キャッシュキーを生成
  const getCacheKey = useCallback(() => {
    return `threads_${currentUserId || 'all'}_${viewerUserId || 'all'}_${type}_${limitCount}_${blockedUsers.join(',')}_${mutedWords.join(',')}`;
  }, [currentUserId, viewerUserId, type, limitCount, blockedUsers, mutedWords]);

  // キャッシュからデータを取得
  const getFromCache = useCallback(() => {
    const key = getCacheKey();
    const cached = threadCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 スレッドキャッシュから取得');
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
    // currentUserIdオプションはフィルタリング用のフラグとして使用
    // currentUserIdがundefinedの場合は全ユーザーの投稿を取得
    // currentUserIdが設定されている場合は、そのユーザーの投稿のみを取得
    
    // 全ユーザーの投稿を取得（デフォルト）
    let q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'), limit(limitCount));
    
    if (type !== 'all') {
      q = query(q, where('type', '==', type));
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

      console.log('② スレッドをFirestoreから取得');
      const q = buildQuery();
      const snapshot = await getDocs(q);
      
      const newThreads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Thread[];

      // 削除された投稿を除外
      let filteredThreads = newThreads.filter(thread => !thread.isDeleted);

      // currentUserIdが指定されている場合、そのユーザーの投稿のみを表示（プロフィールページ用）
      if (currentUserId) {
        filteredThreads = filteredThreads.filter(thread => 
          thread.authorId === currentUserId
        );
      }

      // ブロックユーザーの投稿を除外
      if (blockedUsers.length > 0) {
        filteredThreads = filteredThreads.filter(thread => 
          !thread.authorId || !blockedUsers.includes(thread.authorId)
        );
      }

      // ミュートワードを含む投稿を除外
      if (mutedWords.length > 0) {
        filteredThreads = filterMutedPosts(filteredThreads, mutedWords);
      }

      // 鍵アカウントのLink(threads)はフォロワーのみ表示
      if (viewerUserId && !currentUserId) { // 自分のプロフィールを見る時はスキップ
        const visibilityChecked = await Promise.all(
          filteredThreads.map(async (t) => {
            if (!t.authorId) return t;
            const canView = await canViewUserContent(t.authorId, viewerUserId);
            return canView ? t : null;
          })
        );
        filteredThreads = visibilityChecked.filter(Boolean) as Thread[];
      }

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

  // ⚠️ リアルタイムリスナーを削除（課金削減）
  // 必要に応じてユーザーが手動で更新できるようにする

  // 初期読み込み
  useEffect(() => {
    setLoading(true);
    loadData(true);
  }, [loadData]);

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
