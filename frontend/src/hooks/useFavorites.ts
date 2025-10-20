import {
    addDoc,
    collection,
    deleteDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { MarketplaceItem } from '../types/marketplace';
import { useAuth } from './useAuth';

// お気に入り機能のフック
export const useFavorites = (marketplaceType?: 'individual' | 'shop') => {
  const { user } = useAuth();
  const [favoriteItems, setFavoriteItems] = useState<MarketplaceItem[]>([]);
  const [favoriteItemIds, setFavoriteItemIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // お気に入りアイテムIDの取得
  useEffect(() => {
    if (!user) {
      setFavoriteItemIds(new Set());
      setFavoriteItems([]);
      setLoading(false);
      return;
    }

    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      favoritesQuery,
      (snapshot) => {
        console.log('📡 Favorites updated:', { 
          count: snapshot.size, 
          userId: user.uid,
          docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
        }); // デバッグ用に再有効化
        const itemIds = new Set<string>();
        snapshot.forEach((doc) => {
          const data = doc.data();
          itemIds.add(data.itemId);
        });
        console.log('💾 Favorite IDs set:', Array.from(itemIds)); // デバッグ用に再有効化
        setFavoriteItemIds(itemIds);
        setLoading(false);
      },
      (err) => {
        console.error('お気に入り取得エラー:', err);
        setError('お気に入りの取得に失敗しました');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // お気に入り商品の詳細情報を取得
  useEffect(() => {
    if (favoriteItemIds.size === 0) {
      setFavoriteItems([]);
      return;
    }

    let itemsQuery = query(
      collection(db, 'items'),
      where('__name__', 'in', Array.from(favoriteItemIds)),
      where('status', '==', 'active')
    );

    // マーケットプレイスタイプでフィルタリング
    if (marketplaceType === 'individual') {
      // フリーマーケット: sellerTypeが'shop'でない商品のみ
      // クライアントサイドでフィルタリング（Firestoreの複合クエリ制限のため）
    } else if (marketplaceType === 'shop') {
      // Shop: sellerTypeが'shop'の商品のみ
      // クライアントサイドでフィルタリング（Firestoreの複合クエリ制限のため）
    }

    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const items: MarketplaceItem[] = [];
        snapshot.forEach((doc) => {
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
            // フィルタなしの場合は全て表示
            items.push(item);
          }
        });
        setFavoriteItems(items);
      },
      (err) => {
        console.error('お気に入り商品詳細取得エラー:', err);
        setError('お気に入り商品の取得に失敗しました');
      }
    );

    return () => unsubscribe();
  }, [favoriteItemIds, marketplaceType]);

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
