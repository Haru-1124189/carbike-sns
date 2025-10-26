import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../firebase/init';
import { MaintenancePostDoc } from '../types';
import { filterMutedPosts } from '../utils/muteWords';

interface UseMaintenancePostsOptions {
  currentUserId?: string; // プライバシーフィルタリング用
  blockedUsers?: string[];
  mutedWords?: string[];
}

// キャッシュ管理
const maintenanceCache = new Map<string, { data: MaintenancePostDoc[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分

export const useMaintenancePosts = (options: UseMaintenancePostsOptions = {}) => {
  const { currentUserId, blockedUsers = [], mutedWords = [] } = options;
  const [maintenancePosts, setMaintenancePosts] = useState<MaintenancePostDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

  // キャッシュキーを生成
  const getCacheKey = useCallback(() => {
    return `maintenance_${currentUserId || 'all'}_${blockedUsers.join(',')}_${mutedWords.join(',')}`;
  }, [currentUserId, blockedUsers, mutedWords]);

  // キャッシュからデータを取得
  const getFromCache = useCallback(() => {
    const key = getCacheKey();
    const cached = maintenanceCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [getCacheKey]);

  // キャッシュにデータを保存
  const saveToCache = useCallback((data: MaintenancePostDoc[]) => {
    const key = getCacheKey();
    maintenanceCache.set(key, { data, timestamp: Date.now() });
  }, [getCacheKey]);

  // データを読み込み（バッチ読み取り最適化）
  const loadData = useCallback(async () => {
    try {
      setError(null);
      
      // キャッシュチェック
      const cached = getFromCache();
      if (cached) {
        console.log('📦 整備記録キャッシュから取得');
        setMaintenancePosts(cached);
        setLoading(false);
        return;
      }

      console.log('🔍 整備記録バッチ読み取り開始');
      
      const q = query(
        collection(db, 'maintenance_posts'),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc'),
        limit(50) // 最大50件まで一度に取得
      );

      const snapshot = await getDocs(q);
      
      const posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        } as MaintenancePostDoc;
      });

      // currentUserIdが指定されている場合、そのユーザーの投稿のみを表示（プロフィールページ用）
      let filteredPosts = posts;
      if (currentUserId) {
        filteredPosts = posts.filter(post => 
          post.authorId === currentUserId
        );
      }

      // ブロックユーザーの投稿を除外
      if (blockedUsers.length > 0) {
        filteredPosts = filteredPosts.filter(post => 
          !post.authorId || !blockedUsers.includes(post.authorId)
        );
      }

      // ミュートワードを含む投稿を除外
      if (mutedWords.length > 0) {
        filteredPosts = filterMutedPosts(filteredPosts, mutedWords);
      }

      console.log('📦 整備記録バッチ取得完了:', filteredPosts.length, '件');

      // キャッシュに保存
      saveToCache(filteredPosts);
      
      setMaintenancePosts(filteredPosts);
      setLoading(false);
      
    } catch (err: any) {
      console.error('整備記録取得エラー:', err);
      setError(err.message || '整備記録の取得に失敗しました');
      setLoading(false);
    }
  }, [currentUserId, blockedUsers, mutedWords, getFromCache, saveToCache]);

  useEffect(() => {
    // 連続実行を防ぐ
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) {
      return;
    }
    lastFetchRef.current = now;
    
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    // キャッシュをクリアして再読み込み
    const key = getCacheKey();
    maintenanceCache.delete(key);
    loadData();
  }, [getCacheKey, loadData]);

  return { maintenancePosts, loading, error, refresh };
};
