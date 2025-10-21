import {
    addDoc,
    collection,
    deleteDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../firebase/init';
import { MarketplaceItem } from '../types/marketplace';
import { useAuth } from './useAuth';

// キャッシュ管理
const favoritesCache = new Map<string, { data: { itemIds: Set<string>; items: MarketplaceItem[] }; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分

// お気に入り機能のフック
export const useFavorites = (marketplaceType?: 'individual' | 'shop') => {
  const { user } = useAuth();
  const [favoriteItems, setFavoriteItems] = useState<MarketplaceItem[]>([]);
  const [favoriteItemIds, setFavoriteItemIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

  // キャッシュキーを生成
  const getCacheKey = useCallback(() => {
    return `favorites_${user?.uid || 'none'}_${marketplaceType || 'all'}`;
  }, [user?.uid, marketplaceType]);

  // キャッシュからデータを取得
  const getFromCache = useCallback(() => {
    const key = getCacheKey();
    const cached = favoritesCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [getCacheKey]);

  // キャッシュにデータを保存
  const saveToCache = useCallback((data: { itemIds: Set<string>; items: MarketplaceItem[] }) => {
    const key = getCacheKey();
    favoritesCache.set(key, { data, timestamp: Date.now() });
  }, [getCacheKey]);

  // お気に入りデータを読み込み（バッチ読み取り最適化）
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteItemIds(new Set());
      setFavoriteItems([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // キャッシュチェック
      const cached = getFromCache();
      if (cached) {
        console.log('📦 お気に入りキャッシュから取得');
        setFavoriteItemIds(cached.itemIds);
        setFavoriteItems(cached.items);
        setLoading(false);
        return;
      }

      console.log('🔍 お気に入りバッチ読み取り開始');
      
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(favoritesQuery);
      
      const itemIds = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        itemIds.add(data.itemId);
      });
      
      console.log('📦 お気に入りバッチ取得完了:', itemIds.size, '件');

      // お気に入り商品の詳細情報を取得
      if (itemIds.size > 0) {
        const itemsQuery = query(
          collection(db, 'items'),
          where('__name__', 'in', Array.from(itemIds)),
          where('status', '==', 'active')
        );

        const itemsSnapshot = await getDocs(itemsQuery);
        const items: MarketplaceItem[] = [];
        
        itemsSnapshot.forEach((doc) => {
          const item = { id: doc.id, ...doc.data() } as MarketplaceItem;
          
          // マーケットプレイスタイプでフィルタリング
          if (marketplaceType === 'individual') {
            // フリーマーケット: sellerTypeが'shop'でない商品のみ
            if ((item.sellerType || 'individual') !== 'shop') {
              items.push(item);
            }
          } else if (marketplaceType === 'shop') {
            // Shop: sellerTypeが'shop'の商品のみ
            if (item.sellerType === 'shop') {
              items.push(item);
            }
          } else {
            // 全ての商品
            items.push(item);
          }
        });

        console.log('📦 お気に入り商品詳細取得完了:', items.length, '件');

        // キャッシュに保存
        saveToCache({ itemIds, items });
        
        setFavoriteItemIds(itemIds);
        setFavoriteItems(items);
      } else {
        setFavoriteItemIds(itemIds);
        setFavoriteItems([]);
      }
      
      setLoading(false);
      
    } catch (err: any) {
      console.error('お気に入り取得エラー:', err);
      setError('お気に入りの取得に失敗しました');
      setLoading(false);
    }
  }, [user, marketplaceType, getFromCache, saveToCache]);

  useEffect(() => {
    // 連続実行を防ぐ
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) {
      return;
    }
    lastFetchRef.current = now;
    
    loadFavorites();
  }, [loadFavorites]);

  // お気に入りに追加
  const addToFavorites = async (itemId: string, sellerType?: 'individual' | 'shop') => {
    if (!user) {
      throw new Error('ログインが必要です');
    }

    try {
      console.log('➕ Adding to favorites:', { itemId, userId: user.uid, sellerType });
      const docRef = await addDoc(collection(db, 'favorites'), {
        userId: user.uid,
        itemId: itemId,
        sellerType: sellerType || 'individual', // デフォルトはindividual
        createdAt: serverTimestamp()
      });
      console.log('✅ Added to favorites successfully:', { docId: docRef.id, itemId });
      
      // キャッシュをクリアして再読み込み
      const key = getCacheKey();
      favoritesCache.delete(key);
      loadFavorites();
    } catch (err) {
      console.error('❌ お気に入り追加エラー:', err);
      throw new Error('お気に入りの追加に失敗しました');
    }
  };

  // お気に入りから削除
  const removeFromFavorites = async (itemId: string) => {
    if (!user) {
      throw new Error('ログインが必要です');
    }

    try {
      // お気に入りドキュメントを検索して削除
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid),
        where('itemId', '==', itemId)
      );

      const snapshot = await getDocs(favoritesQuery);
      const deletePromises = snapshot.docs.map((doc: any) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('お気に入りから削除しました:', itemId);
      
      // キャッシュをクリアして再読み込み
      const key = getCacheKey();
      favoritesCache.delete(key);
      loadFavorites();
    } catch (err) {
      console.error('お気に入り削除エラー:', err);
      throw new Error('お気に入りの削除に失敗しました');
    }
  };

  // お気に入りの切り替え
  const toggleFavorite = async (itemId: string, sellerType?: 'individual' | 'shop') => {
    console.log('🔄 toggleFavorite called:', { itemId, user: user?.uid, favoriteItemIds: Array.from(favoriteItemIds), sellerType });
    
    if (!user) {
      console.log('❌ No user found');
      throw new Error('ログインが必要です');
    }

    try {
      if (favoriteItemIds.has(itemId)) {
        console.log('🗑️ Removing from favorites:', itemId);
        await removeFromFavorites(itemId);
      } else {
        console.log('❤️ Adding to favorites:', itemId);
        await addToFavorites(itemId, sellerType);
      }
    } catch (err) {
      console.error('お気に入り切り替えエラー:', err);
      throw err;
    }
  };

  // お気に入り状態の確認
  const isFavorite = (itemId: string) => {
    const result = favoriteItemIds.has(itemId);
    return result;
  };

  return {
    favoriteItems,
    favoriteItemIds,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite
  };
};
