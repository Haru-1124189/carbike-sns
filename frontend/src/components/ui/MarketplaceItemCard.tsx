import { Heart, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Currency, MarketplaceItem } from '../../types/marketplace';
import { createMemoizedComponent, useStableCallback } from '../../utils/componentOptimization';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (sellerType?: 'individual' | 'shop') => void;
  showSellerType?: boolean;
  sellerRating?: number;
  sellerRatingCount?: number;
}

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

const CATEGORY_ICONS: { [key in MarketplaceItem['category']]: string } = {
  engine: '🔧',
  suspension: '🚗',
  brake: '🛑',
  electrical: '⚡',
  body: '🚙',
  tire: '🛞',
  interior: '🪑',
  exterior: '🎨',
  audio: '🔊',
  tool: '🔨',
  other: '📦'
};

const MarketplaceItemCardComponent: React.FC<MarketplaceItemCardProps> = ({
  item,
  viewMode,
  onClick,
  isFavorite = false,
  onToggleFavorite,
  showSellerType = false,
  sellerRating = 0,
  sellerRatingCount = 0
}) => {
  // 画像問題のデバッグのためログを有効化
  console.log('🖼️ MarketplaceItemCard レンダリング:', {
    id: item.id,
    title: item.title,
    hasThumbnail: !!item.thumbnail,
    thumbnail: item.thumbnail,
    hasImages: !!(item.images && item.images.length > 0),
    imagesCount: item.images?.length || 0,
    images: item.images
  });

  const currencySymbol = CURRENCY_SYMBOLS[item.currency];
  const conditionLabel = CONDITION_LABELS[item.condition];
  const categoryIcon = CATEGORY_ICONS[item.category];

  // 画像ローディング状態（スケルトン制御）
  const [imgLoaded, setImgLoaded] = useState(false);
  
  // 画像URLが変更されたときにローディング状態をリセット
  useEffect(() => {
    setImgLoaded(false);
  }, [item.thumbnail, item.images]);

  const handleFavoriteClick = useStableCallback((e: React.MouseEvent) => {
    e.preventDefault(); // デフォルトの動作を防ぐ
    e.stopPropagation(); // 親要素のクリックイベントを防ぐ
    onToggleFavorite?.(item.sellerType);
  }, [onToggleFavorite, item.sellerType]);

  const formatPrice = (price: number, currency: Currency): string => {
    const symbol = CURRENCY_SYMBOLS[currency];
    if (currency === 'JPY') {
      return `${symbol}${price.toLocaleString()}`;
    } else {
      return `${symbol}${price.toFixed(2)}`;
    }
  };


  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="bg-surface border border-border rounded-lg p-4 hover:bg-surface-light transition-colors cursor-pointer"
      >
        <div className="flex space-x-4">
          {/* サムネイル */}
          <div className="w-20 h-20 bg-surface-light rounded-lg overflow-hidden flex-shrink-0">
            {(item.thumbnail && item.thumbnail.trim()) || (item.images && item.images.length > 0 && item.images[0]?.trim()) ? (
              <img
                src={item.thumbnail?.trim() || item.images[0]?.trim()}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('❌ リスト画像読み込みエラー:', {
                    url: item.thumbnail || item.images[0],
                    title: item.title,
                    itemId: item.id
                  });
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary">
                {categoryIcon}
              </div>
            )}
          </div>

          {/* 商品情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-text-primary truncate pr-2">
                  {item.title}
                </h3>
                {showSellerType && (item.sellerType || 'individual') === 'shop' && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-medium">
                    🏪 Shop
                  </span>
                )}
              </div>
              <button 
                onClick={handleFavoriteClick}
                className="flex items-center space-x-1 text-xs hover:bg-surface-light rounded px-2 py-1 transition-colors"
                title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
              >
                <Heart 
                  size={12} 
                  className={`${isFavorite ? 'text-red-500 fill-red-500' : 'text-text-secondary'}`} 
                />
                <span className={isFavorite ? 'text-red-500' : 'text-text-secondary'}>1</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-primary font-medium">
                {formatPrice(item.price, item.currency)}
              </span>
              {item.shipping.fee && item.shipping.fee > 0 && (
                <span className="text-xs text-text-secondary">
                  +{formatPrice(item.shipping.fee, item.currency)} 送料
                </span>
              )}
            </div>


            {/* 出品者評価 */}
            {sellerRating > 0 && (
              <div className="flex items-center space-x-1 mt-2">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={`${
                        star <= Math.round(sellerRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-text-secondary">
                  {sellerRating.toFixed(1)} ({sellerRatingCount}件)
                </span>
              </div>
            )}

            {/* 車種タグ */}
            {item.vehicleTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.vehicleTags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {item.vehicleTags.length > 3 && (
                  <span className="text-xs text-text-secondary">
                    +{item.vehicleTags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // メルカリスタイルのグリッドビュー（コンパクト版）
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* サムネイル */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {/* スケルトン */}
        {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
        {(item.thumbnail && item.thumbnail.trim()) || (item.images && item.images.length > 0 && item.images[0]?.trim()) ? (
          <img
            src={item.thumbnail?.trim() || item.images[0]?.trim()}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
            onLoad={() => {
              console.log('✅ 画像読み込み成功:', item.thumbnail || item.images[0]);
              setImgLoaded(true);
            }}
            onError={(e) => {
              console.error('❌ 画像読み込みエラー詳細:', {
                url: item.thumbnail || item.images[0],
                title: item.title,
                itemId: item.id,
                hasThumbnail: !!item.thumbnail,
                hasImages: !!(item.images && item.images.length > 0),
                imagesCount: item.images?.length || 0,
                thumbnailValue: item.thumbnail,
                imagesValue: item.images,
                errorEvent: e,
                imgElement: e.currentTarget
              });
              
              // 画像URLを直接テスト
              if (item.thumbnail || (item.images && item.images[0])) {
                const testUrl = item.thumbnail || item.images[0];
                console.log('🔍 画像URLテスト:', testUrl);
                
                // 画像URLが有効かチェック
                fetch(testUrl, { method: 'HEAD' })
                  .then(response => {
                    console.log('📡 画像URLレスポンス:', {
                      url: testUrl,
                      status: response.status,
                      statusText: response.statusText,
                      headers: Object.fromEntries(response.headers.entries())
                    });
                  })
                  .catch(fetchError => {
                    console.error('🌐 画像URLフェッチエラー:', {
                      url: testUrl,
                      error: fetchError
                    });
                  });
              }
              
              setImgLoaded(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-2">{categoryIcon}</div>
            <div className="text-xs text-center px-2">
              {item.title || '商品画像'}
            </div>
          </div>
        )}
        
        {/* メルカリスタイルの価格オーバーレイ */}
        <div className="absolute bottom-2 left-2">
          <div className="bg-black/70 rounded-lg px-2 py-1">
            <span className="text-white font-bold text-sm">
              {formatPrice(item.price, item.currency)}
            </span>
          </div>
        </div>

        {/* Shopバッジ */}
        {showSellerType && (item.sellerType || 'individual') === 'shop' && (
          <div className="absolute top-2 left-2 z-40">
            <span className="inline-flex items-center px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
              🏪 Shop
            </span>
          </div>
        )}

        {/* お気に入りボタン */}
        <div className="absolute top-2 right-2 z-50">
          <button 
            onClick={handleFavoriteClick}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className={`p-2 rounded-full hover:bg-white transition-colors cursor-pointer border-2 ${
              isFavorite ? 'bg-red-500 border-red-500' : 'bg-white border-white shadow-lg'
            }`}
            style={{ 
              pointerEvents: 'auto', 
              minWidth: '32px', 
              minHeight: '32px',
              zIndex: 9999,
              position: 'relative'
            }}
            title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            <Heart 
              size={16} 
              className={`${isFavorite ? 'text-white fill-white' : 'text-red-500'}`} 
            />
          </button>
        </div>

        {/* 画像枚数 */}
        {item.images.length > 1 && (
          <div className="absolute bottom-2 right-2">
            <span className="inline-flex items-center px-2 py-1 bg-black/60 text-white rounded-full text-xs">
              +{item.images.length - 1}
            </span>
          </div>
        )}
      </div>

      {/* 商品情報（コンパクト版） */}
      <div className="p-2">
        <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2 leading-tight">
          {item.title}
        </h3>



      </div>
    </div>
  );
};

// メモ化されたコンポーネントをエクスポート
export const MarketplaceItemCard = createMemoizedComponent(
  MarketplaceItemCardComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.title === nextProps.item.title &&
      prevProps.item.price === nextProps.item.price &&
      prevProps.item.thumbnail === nextProps.item.thumbnail &&
      prevProps.isFavorite === nextProps.isFavorite &&
      prevProps.viewMode === nextProps.viewMode &&
      prevProps.showSellerType === nextProps.showSellerType &&
      prevProps.sellerRating === nextProps.sellerRating &&
      prevProps.sellerRatingCount === nextProps.sellerRatingCount
    );
  }
);
