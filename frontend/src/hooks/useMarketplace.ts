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
    
    const unsubscribe = loadItems();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // JSON文字列化して依存比較を安定化（useMemoされたfilterでもネスト差分を検出）
  }, [JSON.stringify(filter), sortOption]);

  const loadItems = () => {
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

      // エラーハンドリングを強化し、リトライ機能を追加
      const executeQuery = (retryCount = 0) => {
        // デバッグログを削除（多すぎるため）
        return onSnapshot(
          q,
          (snapshot) => {
            let newItems: MarketplaceItem[] = [];
            snapshot.forEach((doc) => {
              newItems.push({ id: doc.id, ...doc.data() } as MarketplaceItem);
            });

            // クライアントサイドでstatusとsellerType、通貨/国/言語/価格をフィルタリング
            if (filter.status) {
              newItems = newItems.filter(item => (item.status || 'active') === filter.status);
            }
            if (filter.currency) {
              newItems = newItems.filter(item => (item.currency || 'JPY') === filter.currency);
            }
            if (filter.country) {
              newItems = newItems.filter(item => (item.sellerCountry || 'JP') === filter.country);
            }
            if (filter.language) {
              newItems = newItems.filter(item => (item.sellerLanguage || 'ja') === filter.language);
            }
            if (filter.priceMin !== undefined) {
              newItems = newItems.filter(item => (item.price || 0) >= (filter.priceMin as number));
            }
            if (filter.priceMax !== undefined) {
              newItems = newItems.filter(item => (item.price || 0) <= (filter.priceMax as number));
            }
            // sellerTypeフィルタリングを完全に削除 - 全ての商品を表示
            console.log('🔧 全商品表示:', {
              beforeFiltering: newItems.length,
              note: 'sellerTypeフィルタリングを削除して全商品を表示'
            });

            // 価格フィルタをクライアントサイドで適用
            if (filter.priceMin !== undefined) {
              const beforeCount = newItems.length;
              newItems = newItems.filter(item => (item.price || 0) >= filter.priceMin!);
              console.log('💰 最低価格フィルタ適用:', {
                priceMin: filter.priceMin,
                beforeCount,
                afterCount: newItems.length
              });
            }
            
            if (filter.priceMax !== undefined) {
              const beforeCount = newItems.length;
              newItems = newItems.filter(item => (item.price || 0) <= filter.priceMax!);
              console.log('💰 最高価格フィルタ適用:', {
                priceMax: filter.priceMax,
                beforeCount,
                afterCount: newItems.length
              });
            }

            // 状態フィルタをクライアントサイドで適用
            if (filter.condition) {
              const beforeCount = newItems.length;
              newItems = newItems.filter(item => item.condition === filter.condition);
              console.log('🏷️ 状態フィルタ適用:', {
                condition: filter.condition,
                beforeCount,
                afterCount: newItems.length
              });
            }

            // フィルタがない場合は、クライアントサイドでソート
            if (!hasFilters) {
              newItems.sort((a, b) => {
                const aTime = a.createdAt?.toDate?.() || new Date();
                const bTime = b.createdAt?.toDate?.() || new Date();
                return bTime.getTime() - aTime.getTime(); // 新着順
              });
              console.log('📅 クライアントサイドソート適用（フィルタなし）');
            }

            // 詳細なログ出力
            console.log('🔍 Firestoreクエリ結果:', {
              rawCount: snapshot.docs.length,
              filteredCount: newItems.length,
              filter: filter,
              sellerTypeFilter: filter.sellerType,
              timestamp: new Date().toISOString()
            });
            
            // 各商品のsellerTypeをログ出力
            if (snapshot.docs.length > 0) {
              console.log('📦 取得された商品のsellerType:', 
                snapshot.docs.map(doc => ({
                  id: doc.id,
                  sellerType: doc.data().sellerType || 'undefined',
                  title: doc.data().title
                }))
              );
            }
            
            if (newItems.length <= 5) {
              console.warn('⚠️ 商品数が少ない:', {
                rawCount: snapshot.docs.length,
                filteredCount: newItems.length,
                filter: filter,
                timestamp: new Date().toISOString()
              });
            }

            // createdAtの降順で再ソート（Firestoreのタイムスタンプ有/Date混在を考慮）
            newItems.sort((a, b) => {
              const getTimestamp = (item: any) => {
                const createdAt = item.createdAt;
                if (!createdAt) return 0;
                
                // Firestore Timestampの場合
                if (createdAt.toDate && typeof createdAt.toDate === 'function') {
                  return createdAt.toDate().getTime();
                }
                
                // Dateオブジェクトの場合
                if (createdAt instanceof Date) {
                  return createdAt.getTime();
                }
                
                // 数値の場合（ミリ秒）
                if (typeof createdAt === 'number') {
                  return createdAt;
                }
                
                // 文字列の場合
                if (typeof createdAt === 'string') {
                  return new Date(createdAt).getTime();
                }
                
                return 0;
              };
              
              const timeA = getTimestamp(a);
              const timeB = getTimestamp(b);
              
              // ソートログは削除（多すぎるため）
              
              return timeB - timeA; // 降順（新しいものが上）
            });
            setItems(newItems);

            // hasMoreの判定を修正：取得したドキュメント数がlimitと同じ場合のみ次のページがあると判定
            setHasMore(snapshot.docs.length === 20);
            if (snapshot.docs.length > 0) {
              setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }
            setLoading(false);
            setError(null); // 成功時はエラーをクリア
          },
          (err) => {
            console.error('❌ 商品検索エラー:', err);
            console.error('❌ エラーの詳細:', {
              message: err.message,
              code: err.code,
              stack: err.stack,
              filter: filter,
              sortOption: sortOption,
              retryCount
            });
            
            // リトライロジック（最大5回、間隔を延長）
            if (retryCount < 5 && (err.code === 'unavailable' || err.code === 'deadline-exceeded' || err.code === 'failed-precondition')) {
              const delay = Math.pow(2, retryCount) * 1000; // 指数バックオフ: 1s, 2s, 4s, 8s
              console.log(`🔄 Retrying query in ${delay/1000} seconds... (attempt ${retryCount + 1}/5)`);
              setTimeout(() => {
                executeQuery(retryCount + 1);
              }, delay);
              return;
            }
            
            setError('商品の取得に失敗しました');
            setLoading(false);
          }
        );
      };
      
      const unsubscribe = executeQuery();

      return unsubscribe;
    } catch (err) {
      console.error('商品検索エラー:', err);
      setError('商品の取得に失敗しました');
      setLoading(false);
      return () => {};
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
