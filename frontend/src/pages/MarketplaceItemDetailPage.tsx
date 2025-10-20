import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Star,
  Truck,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ClickableUserName } from '../components/ui/ClickableUserName';
import { db } from '../firebase/init';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { useDeleteItem } from '../hooks/useMarketplace';
import { useRatings } from '../hooks/useRatings';
import { useUserName } from '../hooks/useUserName';
import { Currency, MarketplaceItem } from '../types/marketplace';

const CURRENCY_SYMBOLS: { [key in Currency]: string } = {
  JPY: '¥',
  USD: '$',
  EUR: '€'
};

const CONDITION_LABELS: { [key in MarketplaceItem['condition']]: string } = {
  new: '新品',
  used: '中古',
  junk: 'ジャンク'
};

const CATEGORY_LABELS: { [key in MarketplaceItem['category']]: string } = {
  engine: 'エンジン',
  suspension: 'サスペンション',
  brake: 'ブレーキ',
  electrical: '電気',
  body: 'ボディ',
  tire: 'タイヤ',
  interior: 'インテリア',
  exterior: '外装',
  audio: 'オーディオ',
  tool: '工具',
  other: 'その他'
};

interface MarketplaceItemDetailPageProps {
  itemId?: string;
  item?: any;
  onBack?: () => void;
  onNavigateToCheckout?: (itemId: string) => void;
  onNavigateToEdit?: (itemId: string) => void;
  onNavigateToAnalytics?: (itemId: string) => void;
  onNavigateToMarketplace?: () => void;
  onNavigateToMessages?: (itemId: string, sellerId: string) => void;
  onNavigateToRating?: (itemId: string, sellerId: string, buyerId: string) => void;
  onBackClick?: () => void;
  onEditClick?: () => void;
  onCheckoutClick?: () => void;
  onReviewsClick?: () => void;
  onUserClick?: (userId: string, displayName?: string) => void;
}

export const MarketplaceItemDetailPage: React.FC<MarketplaceItemDetailPageProps> = ({ 
  itemId: propItemId,
  item: propItem,
  onBack,
  onNavigateToCheckout,
  onNavigateToEdit,
  onNavigateToMarketplace,
  onNavigateToMessages,
  onNavigateToRating,
  onBackClick,
  onEditClick,
  onCheckoutClick,
  onReviewsClick,
  onNavigateToAnalytics,
  onUserClick
}) => {
  const { user } = useAuth();
  const { deleteItem, loading: deleteLoading } = useDeleteItem();
  const { getItemRatings, getUserRatings, calculateUserAverageRating } = useRatings();
  const itemId = propItemId || '';
  
  // 商品データの状態管理
  const [item, setItem] = useState<MarketplaceItem | null>(propItem || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [showRatings, setShowRatings] = useState(false);
  const [canRate, setCanRate] = useState(false); // 評価可能かどうか
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  
  // デバッグログを削減
  // console.log('MarketplaceItemDetailPage - Props:', {
  //   propItemId,
  //   item: propItem,
  //   itemId,
  //   onNavigateToEdit: !!onNavigateToEdit
  // });
  
  // console.log('Current item state:', {
  //   item,
  //   loading,
  //   error,
  //   hasPrice: !!item?.price,
  //   hasDescription: !!item?.description,
  //   priceValue: item?.price,
  //   descriptionValue: item?.description
  // });
  
  const { toggleFavorite, isFavorite } = useFavorites();
  const { displayName: sellerName, loading: sellerLoading } = useUserName(item?.sellerId || '');
  const [sellerData, setSellerData] = useState<any>(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleUserClick = (userId: string, displayName: string) => {
    console.log('MarketplaceItemDetailPage - handleUserClick called:', { userId, displayName });
    console.log('onUserClick function:', onUserClick);
    onUserClick?.(userId, displayName);
  };

  // 商品データを取得
  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) {
        console.log('No itemId provided');
        return;
      }

      // 既にpropItemがある場合はそれを使用
      if (propItem) {
        console.log('Using propItem:', propItem);
        console.log('PropItem details:', {
          id: propItem.id,
          title: propItem.title,
          price: propItem.price,
          currency: propItem.currency,
          description: propItem.description,
          sellerId: propItem.sellerId,
          images: propItem.images,
          shipping: propItem.shipping
        });
        setItem(propItem);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching item from Firestore:', itemId);
        const itemDoc = await getDoc(doc(db, 'items', itemId));
        
        console.log('Document exists:', itemDoc.exists());
        console.log('Document data:', itemDoc.data());
        console.log('Document ID:', itemDoc.id);
        
        if (itemDoc.exists()) {
          const itemData = {
            id: itemDoc.id,
            ...itemDoc.data()
          } as MarketplaceItem;
          console.log('Item found:', itemData);
          console.log('Item data details:', {
            id: itemData.id,
            title: itemData.title,
            price: itemData.price,
            currency: itemData.currency,
            description: itemData.description,
            sellerId: itemData.sellerId,
            images: itemData.images,
            shipping: itemData.shipping
          });
          setItem(itemData);
        } else {
          console.error('Item not found:', itemId);
          setError('商品が見つかりません');
          setItem(null);
        }
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('商品の取得に失敗しました');
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, propItem]);

  // 出品者のユーザーデータを取得
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!item?.sellerId) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', item.sellerId));
        
        if (userDoc.exists()) {
          setSellerData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
      }
    };

    fetchSellerData();
  }, [item?.sellerId]);

  // 評価データを読み込み
  useEffect(() => {
    const loadRatings = async () => {
      if (itemId) {
        const ratingsData = await getItemRatings(itemId);
        setRatings(ratingsData);
      }
    };

    loadRatings();
  }, [itemId, getItemRatings]);

  // 出品者の評価データを読み込み
  useEffect(() => {
    const loadSellerRatings = async () => {
      if (item?.sellerId) {
        const ratingStats = await calculateUserAverageRating(item.sellerId);
        setAverageRating(ratingStats.averageRating);
        setTotalRatings(ratingStats.totalRatings);
      }
    };

    loadSellerRatings();
  }, [item?.sellerId, calculateUserAverageRating]);

  // 評価可能かどうかをチェック
  useEffect(() => {
    const checkCanRate = () => {
      if (!user?.uid || !item) return;
      
      // 出品者で、かつ商品が売却済みの場合のみ評価可能
      // 実際の実装では、注文テーブルから購入者情報を取得する必要がある
      const isSeller = user.uid === item.sellerId;
      const isSold = item.status === 'sold';
      
      // 暫定的に出品者のみ評価可能とする
      // 実際の実装では、注文完了後の相互評価システムを実装する
      setCanRate(isSeller && isSold);
    };

    checkCanRate();
  }, [user?.uid, item]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '商品が見つかりません'}</p>
          <button
            onClick={() => onBack?.()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  // 商品データが存在しない場合は早期リターン
  if (!item) {
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-text-primary mb-2">読み込み中...</div>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-text-primary mb-2">{error}</div>
            <button
              onClick={onBackClick}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-primary mb-2">商品が見つかりません</div>
          <button
            onClick={onBackClick}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const currencySymbol = CURRENCY_SYMBOLS[item.currency];
  const conditionLabel = CONDITION_LABELS[item.condition];
  const categoryLabel = CATEGORY_LABELS[item.category];

  // デバッグ用：送料情報をコンソールに出力
  // console.log('送料デバッグ:', { 
  //   fee: item.shipping?.fee, 
  //   method: item.shipping?.method,
  //   shipping: item.shipping 
  // });

  const formatPrice = (price: number | undefined, currency: Currency | undefined): string => {
    // 価格または通貨がundefinedの場合はデフォルト値を返す
    if (price === undefined || price === null) {
      return '価格不明';
    }
    
    if (currency === undefined) {
      return `${price.toLocaleString()}`;
    }
    
    const symbol = CURRENCY_SYMBOLS[currency] || '¥';
    if (currency === 'JPY') {
      return `${symbol}${price.toLocaleString()}`;
    } else {
      return `${symbol}${price.toFixed(2)}`;
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const nextImage = () => {
    if (!item.images || item.images.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev < item.images.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    if (!item.images || item.images.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : item.images.length - 1
    );
  };

  const handlePurchase = () => {
    console.log('🛒 handlePurchase called!', { 
      user: user?.uid, 
      itemId: item.id, 
      sellerId: item.sellerId,
      onNavigateToCheckout: !!onNavigateToCheckout 
    });
    
    if (!user) {
      console.log('❌ No user found');
      window.alert('ログインが必要です');
      return;
    }
    
    if (user.uid === item.sellerId) {
      console.log('❌ Cannot buy own item');
      window.alert('自分の商品は購入できません');
      return;
    }
    
    console.log('✅ Calling onNavigateToCheckout...');
    onNavigateToCheckout?.(item.id);
  };

  const handleContact = () => {
    // TODO: メッセージ機能を実装
    window.alert('メッセージ機能は準備中です');
  };

  const handleReport = () => {
    // TODO: 通報機能を実装
    window.alert('通報機能は準備中です');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: item.description || '商品の説明はありません',
          url: window.location.href,
        });
      } else {
        // フォールバック: URLをクリップボードにコピー
        await navigator.clipboard.writeText(window.location.href);
        window.alert('URLをクリップボードにコピーしました');
      }
    } catch (error) {
      console.error('共有エラー:', error);
      // フォールバック: URLをクリップボードにコピー
      try {
        await navigator.clipboard.writeText(window.location.href);
        window.alert('URLをクリップボードにコピーしました');
      } catch (clipboardError) {
        window.alert('共有に失敗しました');
      }
    }
  };

  const handleFavorite = async () => {
    console.log('💖 MarketplaceItemDetailPage handleFavorite called:', { itemId: item.id, user: user?.uid, isFavorite: isFavorite(item.id) });
    
    if (!user) {
      window.alert('ログインが必要です');
      return;
    }
    
    try {
      await toggleFavorite(item.id);
      console.log('✅ toggleFavorite completed successfully');
      // 成功メッセージは表示しない（UIで状態が変わるため）
    } catch (error) {
      console.error('お気に入り切り替えエラー:', error);
      window.alert('お気に入りの切り替えに失敗しました');
    }
  };

  const isOwner = user?.uid === item.sellerId;
  
  // デバッグ用：所有者判定をコンソールに出力
  // console.log('所有者判定デバッグ:', { 
  //   currentUserId: user?.uid, 
  //   sellerId: item.sellerId, 
  //   isOwner: isOwner,
  //   itemTitle: item.title
  // });

  return (
    <div className="min-h-screen bg-background">
      {/* メルカリスタイルのヘッダー */}
      <div className="sticky top-0 bg-gray-900 text-white z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                onBack?.();
                onBackClick?.();
              }}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-lg font-bold text-white truncate">
              {item.title}
            </h1>
          </div>
          
                 <div className="flex items-center space-x-3">
                   <button 
                     onClick={handleShare}
                     className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                   >
                     <Share2 size={20} className="text-white" />
                   </button>
                   <button
                     onClick={handleFavorite}
                     className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                   >
                     <Heart 
                       size={20} 
                       className={`${isFavorite(item.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                     />
                   </button>
                   <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                     <MoreHorizontal size={20} className="text-white" />
                   </button>
                 </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
          {/* 左側：画像ギャラリー */}
          <div className="space-y-4">
            {/* メイン画像 */}
            <div className="aspect-square bg-surface-light rounded-lg overflow-hidden relative">
              {item.images && item.images.length > 0 ? (
                <>
                  <img
                    src={item.images[currentImageIndex]}
                    alt={`${item.title} - 画像 ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* ナビゲーションボタン */}
                  {item.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  
                  {/* 画像インデックス */}
                  {item.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex space-x-1 bg-black/50 px-3 py-1 rounded-full">
                        {item.images?.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-text-secondary">
                  📦
                </div>
              )}
            </div>

            {/* サムネイル一覧 */}
            {item.images && item.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex 
                        ? 'border-primary' 
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`サムネイル ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右側：商品情報 */}
          <div className="space-y-6">
            {/* 商品タイトルと価格 */}
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {item.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(item.price, item.currency)}
                </span>
                {item.shipping?.fee !== undefined && (
                  <span className="text-lg text-text-secondary">
                    {item.shipping.fee === 0 ? '送料0円' : `+${formatPrice(item.shipping.fee, item.currency)} 送料`}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {conditionLabel}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-surface-light text-text-primary rounded-full text-sm">
                  {categoryLabel}
                </span>
              </div>
            </div>

            {/* 商品説明 */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-3">商品説明</h2>
              <div className="prose prose-sm max-w-none">
                <p className={`text-text-secondary leading-relaxed ${
                  showFullDescription ? '' : 'line-clamp-4'
                }`}>
                  {item.description || '商品の説明はありません'}
                </p>
                {item.description && item.description.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-primary hover:text-primary-dark transition-colors mt-2"
                  >
                    {showFullDescription ? '折りたたむ' : '続きを読む'}
                  </button>
                )}
              </div>
            </div>

            {/* 車種タグ */}
            {item.vehicleTags && item.vehicleTags.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-3">対応車種</h2>
                <div className="flex flex-wrap gap-2">
                  {item.vehicleTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 配送情報 */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-3">配送情報</h2>
              <div className="bg-surface rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Truck size={16} className="text-text-secondary" />
                  <span className="text-text-primary">
                    送料: {item.shipping?.method === 'seller_pays' ? '出品者負担' : '購入者負担'}
                  </span>
                </div>
                {item.shipping?.area && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-text-secondary" />
                    <span className="text-text-primary">配送地域: {item.shipping.area}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 出品者情報 */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-3">出品者</h2>
              <div className="bg-surface rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <ClickableUserName 
                        userId={item.sellerId} 
                        fallbackName="出品者"
                        size="sm"
                        showAvatar={false}
                        onClick={(userId, displayName) => {
                          handleUserClick(userId, displayName);
                        }}
                        className="font-medium text-text-primary hover:text-primary transition-colors"
                      />
                      {/* 認証済みバッジの表示ロジック */}
                      {user && user.uid === item.sellerId ? (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                          あなた
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                          認証済み
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={`${
                              star <= Math.round(averageRating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-text-secondary">
                        {averageRating > 0 ? `${averageRating.toFixed(1)} (${totalRatings}件の評価)` : '評価なし'}
                      </span>
                    </div>
                    
                    {/* Shop情報（承認済みの場合のみ表示） */}
                    {sellerData?.shopInfo && sellerData?.shopApplication?.status === 'approved' && (
                      <div className="mt-2 p-2 bg-blue-600 bg-opacity-20 border border-blue-600 rounded-lg">
                        <div className="text-xs text-blue-300">
                          <div className="font-medium text-blue-400 mb-1">Shop情報</div>
                          <div>屋号: {sellerData.shopInfo.shopName}</div>
                          {sellerData.shopInfo.businessLicense && (
                            <div>許可番号: {sellerData.shopInfo.businessLicense}</div>
                          )}
                          {sellerData.shopInfo.taxId && (
                            <div>税務署届出番号: {sellerData.shopInfo.taxId}</div>
                          )}
                          <div>住所: {sellerData.shopInfo.businessAddress.prefecture}{sellerData.shopInfo.businessAddress.city}{sellerData.shopInfo.businessAddress.address}</div>
                          <div>連絡先: {sellerData.shopInfo.contactEmail}
                            {sellerData.shopInfo.contactPhone && (
                              <span> / {sellerData.shopInfo.contactPhone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="p-2 hover:bg-surface-light rounded-full transition-colors">
                    <Flag size={16} className="text-text-secondary" />
                  </button>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="space-y-3">
              {isOwner ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      console.log('🖱️ 編集ボタンクリック！');
                      e.preventDefault();
                      e.stopPropagation();
                      if (onNavigateToEdit && item?.id) {
                        console.log('✅ 編集ページに遷移します:', item.id);
                        onNavigateToEdit(item.id);
                      } else {
                        console.error('❌ 編集ボタンエラー - onNavigateToEditまたはitemIdがありません');
                      }
                    }}
                    onMouseDown={(e) => {
                      console.log('🖱️ onMouseDown 編集ボタン');
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors cursor-pointer pointer-events-auto"
                    style={{ zIndex: 9999, position: 'relative' }}
                  >
                    商品を編集
                  </button>
                  <button
                    onClick={() => onNavigateToAnalytics?.(item.id)}
                    className="w-full bg-surface text-text-primary py-3 rounded-lg font-medium hover:bg-surface-light transition-colors"
                  >
                    売上分析
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('本当にこの商品を削除しますか？この操作は取り消せません。')) {
                        if (item?.id) {
                          const success = await deleteItem(item.id);
                          if (success) {
                            alert('商品を削除しました');
                            onNavigateToMarketplace?.();
                          } else {
                            alert('商品の削除に失敗しました');
                          }
                        }
                      }
                    }}
                    disabled={deleteLoading}
                    className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? '削除中...' : '商品を削除'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={(e) => {
                      console.log('🔴 Purchase button clicked!', e);
                      handlePurchase();
                    }}
                    className="w-full bg-red-500 text-white py-4 rounded-lg font-bold hover:bg-red-600 transition-colors text-lg"
                  >
                    購入手続きへ
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (item?.id && item?.sellerId) {
                          console.log('💬 メッセージボタンクリック:', {
                            itemId: item.id,
                            sellerId: item.sellerId,
                            timestamp: new Date().toISOString()
                          });
                          onNavigateToMessages?.(item.id, item.sellerId);
                        }
                      }}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MessageCircle size={16} />
                      <span>メッセージ</span>
                    </button>
                    {/* 取引完了後の評価ボタン - 取引完了時のみ表示 */}
                    {canRate && (
                      <button
                        onClick={() => {
                          if (item?.id && item?.sellerId && user?.uid) {
                            console.log('⭐ 取引完了評価ボタンクリック:', {
                              itemId: item.id,
                              sellerId: item.sellerId,
                              buyerId: user.uid,
                              timestamp: new Date().toISOString()
                            });
                            onNavigateToRating?.(item.id, item.sellerId, user.uid);
                          }
                        }}
                        className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Star size={16} />
                        <span>取引完了評価</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 出品日時 */}
            <div className="text-sm text-text-secondary">
              出品日: {formatDate(item.createdAt)}
            </div>
          </div>
        </div>

        {/* 評価セクションは上部の出品者評価サマリーで代替するため非表示にしました */}
      </div>
    </div>
  );
};
