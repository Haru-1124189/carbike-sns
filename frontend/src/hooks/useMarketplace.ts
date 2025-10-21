import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { db, storage } from '../firebase/init';
import {
  CreateItemData,
  CreateOrderData,
  CreateReviewData,
  ItemSearchFilter,
  MarketplaceItem,
  MarketplaceOrder,
  MarketplaceReview,
  OrderStatus,
  SortOption
} from '../types/marketplace';

// 商品出品用のフック
export const useCreateItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = async (itemData: CreateItemData, userId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // 画像をアップロード
      const imageUrls: string[] = [];
      const thumbnailUrl = await uploadImages(itemData.images, userId, imageUrls);

      // 検索用キーワードを生成
      const keywords = generateSearchKeywords(itemData);
      const normalizedTitle = itemData.title.toLowerCase().trim();

      // 商品データを作成
      const item: Omit<MarketplaceItem, 'id'> = {
        sellerId: userId,
        sellerType: itemData.sellerType,
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        tags: itemData.tags,
        vehicleTags: itemData.vehicleTags,
        condition: itemData.condition,
        price: itemData.price,
        currency: itemData.currency,
        shipping: itemData.shipping,
        images: imageUrls,
        thumbnail: thumbnailUrl,
        status: 'active',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        moderated: {
          state: 'clean'
        },
        sellerLanguage: 'ja',
        sellerCountry: 'JP',
        search: {
          keywords,
          normalizedTitle
        }
      };

      // compatibilityがundefinedでない場合のみ追加
      if (itemData.compatibility !== undefined) {
        item.compatibility = itemData.compatibility;
      }

      console.log('📦 保存する商品データ:', item);
      const docRef = await addDoc(collection(db, 'items'), item);
      console.log('✅ 商品保存完了, ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('商品作成エラー:', err);
      setError(err instanceof Error ? err.message : '商品の作成に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createItem, loading, error };
};

// 画像アップロード関数
const uploadImages = async (files: File[], userId: string, imageUrls: string[]): Promise<string> => {
  // 開発環境でも実際の画像アップロードを使用
  console.log('📤 画像アップロード開始:', files.length, 'ファイル');
  
  // 実際の画像アップロード処理
  const uploadPromises = files.map(async (file, index) => {
    const fileName = `${Date.now()}_${index}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `marketplace-items/${userId}/${fileName}`);
    
    console.log(`📁 アップロード中: ${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`✅ アップロード完了: ${downloadURL}`);
    imageUrls.push(downloadURL);
    return downloadURL;
  });

  const urls = await Promise.all(uploadPromises);
  console.log('🎉 全画像アップロード完了:', urls);
  return urls[0]; // 最初の画像をサムネイルとして使用
};

// 検索キーワード生成関数
const generateSearchKeywords = (itemData: CreateItemData): string[] => {
  const keywords = new Set<string>();
  
  // タイトルからキーワードを抽出
  const titleWords = itemData.title.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
  
  titleWords.forEach(word => keywords.add(word));
  
  // タグを追加
  itemData.tags.forEach(tag => keywords.add(tag.toLowerCase()));
  
  // 車種タグを追加
  itemData.vehicleTags.forEach(tag => keywords.add(tag.toLowerCase()));
  
  // カテゴリを追加
  keywords.add(itemData.category.toLowerCase());
  
  // 状態を追加
  keywords.add(itemData.condition.toLowerCase());
  
  return Array.from(keywords);
};

// 商品検索用のフック
export const useItemSearch = (filter: ItemSearchFilter, sortOption: SortOption = 'newest') => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [pendingCompletedOrderIds, setPendingCompletedOrderIds] = useState<string[]>([]); // リマインダー用（将来の拡張）

  useEffect(() => {
    console.log('🔄 useItemSearch useEffect triggered:', {
      filter: filter,
      sortOption: sortOption,
      timestamp: new Date().toISOString()
    });
    
    // タブ切り替え時（sellerIdの有無）のみリセット
    // マーケットプレイスタイプの変更は、クライアントサイドフィルタリングで対応
    const isTabSwitch = filter.sellerId !== undefined;
    
    if (isTabSwitch) {
      console.log('🔄 タブが変更されたため、商品リストをリセット');
      setItems([]);
      setLastDoc(null);
      setHasMore(true);
      setError(null);
    }
    
    loadItems();
    return () => {
      // バッチ読み取りではunsubscribeは不要
    };
    // JSON文字列化して依存比較を安定化（useMemoされたfilterでもネスト差分を検出）
  }, [JSON.stringify(filter), sortOption]);

  const loadItems = async () => {
    console.log('🔍 loadItems called with filter:', filter);
    setLoading(true);
    setError(null);

    try {
      // まず、Firestoreの商品総数を確認
      const countQuery = query(collection(db, 'items'));
      getDocs(countQuery).then((countSnapshot) => {
        console.log('📊 Firestore商品総数:', countSnapshot.size);
        console.log('📊 全商品の詳細:', 
          countSnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }))
        );
      });

      // フィルタの状態をチェック
      const hasFilters = filter.sellerId || filter.category || filter.priceMin || filter.priceMax;
      
      let q = query(collection(db, 'items'));
      
      if (hasFilters) {
        console.log('🔧 フィルタ付きクエリ構築:', {
          baseQuery: 'items',
          note: 'フィルタあり - インデックス使用'
        });

        // 基本的なフィルタを適用
        if (filter.sellerId) {
          q = query(q, where('sellerId', '==', filter.sellerId));
          console.log('👤 sellerIdフィルタ適用:', filter.sellerId);
        }

        if (filter.category) {
          q = query(q, where('category', '==', filter.category));
          console.log('🏷️ カテゴリフィルタ適用:', filter.category);
        }

        // 並び替えを追加（インデックスが必要）
        q = query(q, orderBy('createdAt', 'desc'));
        console.log('📅 並び替え適用: desc');
      } else {
        console.log('🔧 フィルタなしクエリ構築:', {
          baseQuery: 'items',
          note: 'フィルタなし - シンプルクエリ'
        });
        // フィルタがない場合は、シンプルなクエリ（インデックス不要）
      }

      // ページネーション
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
        console.log('📄 ページネーション適用: startAfter lastDoc');
      }
      q = query(q, limit(20));
      
      console.log('🔧 最終クエリ構築完了:', {
        hasPagination: !!lastDoc,
        limit: 20,
        note: 'シンプルなクエリで全商品を取得（sellerTypeフィルタなし）'
      });

      // バッチ読み取り最適化（リアルタイムリスナーではなく一度だけ取得）
      const executeQuery = async (retryCount = 0) => {
        try {
          console.log('🔍 バッチ読み取り開始（Firestore読み取り最適化）');
          
          // キャッシュチェック（5分間有効）
          const cacheKey = `marketplace-items-${JSON.stringify(filter)}-${sortOption}`;
          const cachedData = localStorage.getItem(cacheKey);
          const cacheTime = localStorage.getItem(`${cacheKey}-time`);
          
          if (cachedData && cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
            console.log('📦 キャッシュから商品データを取得');
            const parsedData = JSON.parse(cachedData);
            setItems(parsedData.items);
            setHasMore(parsedData.hasMore);
            setLastDoc(parsedData.lastDoc);
            setLoading(false);
            return;
          }

          // 一度だけ取得（onSnapshotではなくgetDocs）
          const snapshot = await getDocs(q);
          
          let newItems: MarketplaceItem[] = [];
          snapshot.forEach((doc) => {
            const itemData = { id: doc.id, ...doc.data() } as MarketplaceItem;
            
            // 最初の3件のみログ出力（読み取り削減）
            if (newItems.length < 3) {
              console.log('📦 商品データ詳細:', {
                id: itemData.id,
                title: itemData.title,
                hasThumbnail: !!itemData.thumbnail,
                thumbnail: itemData.thumbnail,
                hasImages: !!(itemData.images && itemData.images.length > 0),
                imagesCount: itemData.images?.length || 0,
                images: itemData.images
              });
            }
            
            newItems.push(itemData);
          });

          console.log('📦 バッチ取得完了:', newItems.length, '件');

          // クライアントサイドで全フィルタリング（一度に処理）
          let filteredItems = newItems.filter(item => {
            // ステータスフィルタ
            if (item.status !== 'active') return false;
            
            // カテゴリフィルタ
            if (filter.category && item.category !== filter.category) {
              return false;
            }
            
            // 価格フィルタ
            if (filter.priceMin !== undefined && item.price < filter.priceMin) {
              return false;
            }
            if (filter.priceMax !== undefined && item.price > filter.priceMax) {
              return false;
            }
            
            // 状態フィルタ
            if (filter.condition && item.condition !== filter.condition) {
              return false;
            }
            
            // 通貨フィルタ
            if (filter.currency && item.currency !== filter.currency) {
              return false;
            }
            
            // 出品者タイプフィルタ
            if (filter.sellerType) {
              if (filter.sellerType === 'individual' && item.sellerType !== 'individual') return false;
              if (filter.sellerType === 'shop' && item.sellerType !== 'shop') return false;
            }
            
            // 検索クエリフィルタ（searchQueryプロパティが存在しない場合はスキップ）
            if ((filter as any).searchQuery && (filter as any).searchQuery.trim()) {
              const query = (filter as any).searchQuery.toLowerCase().trim();
              const searchableText = `${item.title} ${item.description} ${item.tags?.join(' ') || ''}`.toLowerCase();
              if (!searchableText.includes(query)) return false;
            }
            
            return true;
          });

          // クライアントサイドソート
          filteredItems = filteredItems.sort((a, b) => {
            switch (sortOption) {
              case 'newest':
                return b.createdAt.toMillis() - a.createdAt.toMillis();
              case 'price_low':
                return a.price - b.price;
              case 'price_high':
                return b.price - a.price;
              case 'popular':
                // 人気順は作成日時で代替（favoriteCountプロパティが存在しないため）
                return b.createdAt.toMillis() - a.createdAt.toMillis();
              default:
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            }
          });

          console.log('✅ フィルタリング完了:', {
            total: newItems.length,
            filtered: filteredItems.length,
            filter: filter,
            sortOption: sortOption
          });

          // 結果をキャッシュに保存
          const cacheData = {
            items: lastDoc ? [...items, ...filteredItems] : filteredItems,
            hasMore: snapshot.docs.length === 20,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
          };
          
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          localStorage.setItem(`${cacheKey}-time`, Date.now().toString());

          if (lastDoc) {
            // 追加読み込み
            setItems(prev => [...prev, ...filteredItems]);
          } else {
            // 初回読み込み
            setItems(filteredItems);
          }

          setHasMore(snapshot.docs.length === 20);
          setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
          setLoading(false);

        } catch (error) {
          console.error('バッチ読み取りエラー:', error);
          setError('商品の取得に失敗しました');
          setLoading(false);
        }
      };

      // クエリ実行
      await executeQuery();
    } catch (err) {
      console.error('商品検索エラー:', err);
      setError('商品の取得に失敗しました');
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadItems();
    }
  };

  const reset = () => {
    setItems([]);
    setLastDoc(null);
    setHasMore(true);
  };

  return { items, loading, error, hasMore, loadMore, reset };
};

// 商品詳細取得用のフック
export const useItem = (itemId: string) => {
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'items', itemId),
      (doc) => {
        if (doc.exists()) {
          setItem({ id: doc.id, ...doc.data() } as MarketplaceItem);
        } else {
          setItem(null);
          setError('商品が見つかりません');
        }
        setLoading(false);
      },
      (err) => {
        console.error('商品取得エラー:', err);
        setError('商品の取得に失敗しました');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [itemId]);

  const updateItem = async (itemData: CreateItemData, newImageFiles: File[] = []) => {
    if (!itemId || !item) {
      throw new Error('商品情報がありません');
    }

    setUpdateLoading(true);
    setError(null);

    try {
      const imageUrls: string[] = [...item.images || []];
      let thumbnailUrl = item.thumbnail;

      // 新しい画像がある場合はアップロード
      if (newImageFiles.length > 0) {
        const newUrls = await uploadImages(newImageFiles, item.sellerId, imageUrls);
        thumbnailUrl = newUrls;
      }

      const keywords = generateSearchKeywords(itemData);
      const normalizedTitle = itemData.title.toLowerCase().replace(/[^\w\s]/g, '');

      const updateData: Partial<MarketplaceItem> = {
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        tags: itemData.tags,
        vehicleTags: itemData.vehicleTags,
        condition: itemData.condition,
        price: itemData.price,
        currency: itemData.currency,
        shipping: itemData.shipping,
        images: imageUrls,
        thumbnail: thumbnailUrl,
        updatedAt: serverTimestamp() as Timestamp,
        search: {
          keywords,
          normalizedTitle
        }
      };

      // compatibilityがundefinedでない場合のみ追加
      if (itemData.compatibility !== undefined) {
        updateData.compatibility = itemData.compatibility;
      }

      await updateDoc(doc(db, 'items', itemId), updateData);
      console.log('✅ 商品更新完了');
    } catch (err) {
      console.error('商品更新エラー:', err);
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  };

  return { item, loading, error, updateItem, updateLoading };
};

// 注文作成用のフック
export const useCreateOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (orderData: CreateOrderData, buyerId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // 商品情報を取得
      const itemDoc = await getDoc(doc(db, 'items', orderData.itemId));
      if (!itemDoc.exists()) {
        throw new Error('商品が見つかりません');
      }

      const item = itemDoc.data() as MarketplaceItem;
      
      // 出品者と購入者が同じでないかチェック
      if (item.sellerId === buyerId) {
        throw new Error('自分の商品は購入できません');
      }

      // 商品がアクティブかチェック
      if (item.status !== 'active') {
        throw new Error('この商品は現在購入できません');
      }

      // 注文データを作成
      const order: Omit<MarketplaceOrder, 'id'> = {
        itemId: orderData.itemId,
        sellerId: item.sellerId,
        buyerId,
        amount: item.price + (item.shipping.fee || 0),
        currency: item.currency,
        marketplaceFee: Math.round((item.price + (item.shipping.fee || 0)) * 0.072), // 7.2%の手数料
        status: 'pending' as OrderStatus,
        shippingAddress: orderData.shippingAddress,
        timestamps: {
          createdAt: serverTimestamp() as Timestamp
        }
      };

      const docRef = await addDoc(collection(db, 'orders'), order);

      // 商品を予約状態に更新
      await updateDoc(doc(db, 'items', orderData.itemId), {
        status: 'reserved',
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (err) {
      console.error('注文作成エラー:', err);
      setError(err instanceof Error ? err.message : '注文の作成に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
};

// レビュー作成用のフック
export const useCreateReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReview = async (reviewData: CreateReviewData, authorId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // 注文情報を取得してレビュー権限をチェック
      const orderDoc = await getDoc(doc(db, 'orders', reviewData.orderId));
      if (!orderDoc.exists()) {
        throw new Error('注文が見つかりません');
      }

      const order = orderDoc.data() as MarketplaceOrder;
      
      // レビュー権限チェック
      if (order.buyerId !== authorId || order.status !== 'completed') {
        throw new Error('レビューを投稿する権限がありません');
      }

      // 既存レビューチェック
      const existingReviewQuery = query(
        collection(db, 'reviews'),
        where('orderId', '==', reviewData.orderId),
        where('authorUserId', '==', authorId)
      );
      const existingReviews = await getDocs(existingReviewQuery);
      if (!existingReviews.empty) {
        throw new Error('この注文のレビューは既に投稿済みです');
      }

      // レビューデータを作成
      const review: Omit<MarketplaceReview, 'id'> = {
        orderId: reviewData.orderId,
        targetUserId: order.sellerId,
        authorUserId: authorId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: serverTimestamp() as Timestamp
      };

      const docRef = await addDoc(collection(db, 'reviews'), review);

      // 出品者の評価を更新（簡易版）
      await updateSellerRating(order.sellerId);

      return docRef.id;
    } catch (err) {
      console.error('レビュー作成エラー:', err);
      setError(err instanceof Error ? err.message : 'レビューの作成に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createReview, loading, error };
};

// 出品者評価更新関数
const updateSellerRating = async (sellerId: string) => {
  try {
    // レビューを取得
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('targetUserId', '==', sellerId)
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    let totalRating = 0;
    let reviewCount = 0;
    
    reviewsSnapshot.forEach((doc) => {
      const review = doc.data() as MarketplaceReview;
      totalRating += review.rating;
      reviewCount++;
    });
    
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    
    // ユーザーの評価を更新
    await updateDoc(doc(db, 'users', sellerId), {
      rating: Math.round(averageRating * 10) / 10, // 小数点第1位まで
      ratingCount: reviewCount
    });
  } catch (error) {
    console.error('評価更新エラー:', error);
  }
};

// 商品削除機能
export const useDeleteItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteItem = async (itemId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🗑️ 商品削除開始:', { itemId, timestamp: new Date().toISOString() });

      // Firestoreから商品を削除
      await deleteDoc(doc(db, 'items', itemId));

      console.log('✅ 商品削除完了:', { itemId, timestamp: new Date().toISOString() });
      
      return true;
    } catch (error) {
      console.error('❌ 商品削除エラー:', error);
      setError('商品の削除に失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteItem, loading, error };
};
