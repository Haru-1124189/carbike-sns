import { ExternalLink, Star } from 'lucide-react';
import React from 'react';

interface NativeAdProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  rating?: number;
  price?: string;
  ctaText?: string;
  sponsorText?: string;
}

// 車・バイク関連のネイティブ広告データ
const nativeAds: NativeAdProps[] = [
  {
    id: 'ad-1',
    title: 'カスタムパーツ専門店',
    description: 'あなたの愛車をより魅力的に。高品質なカスタムパーツを豊富に取り揃えています。',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    category: 'パーツ',
    rating: 4.8,
    price: '¥5,000〜',
    ctaText: '詳細を見る',
    sponsorText: 'スポンサー'
  },
  {
    id: 'ad-2',
    title: 'プロ仕様の工具セット',
    description: '整備作業に最適な工具セット。プロメカニックも愛用する高品質な工具を提供。',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
    category: '工具',
    rating: 4.9,
    price: '¥15,000〜',
    ctaText: '購入する',
    sponsorText: 'スポンサー'
  },
  {
    id: 'ad-3',
    title: '車検・整備のプロ',
    description: '安心の車検・整備サービス。経験豊富なスタッフが丁寧に対応いたします。',
    imageUrl: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=400&h=300&fit=crop',
    category: 'サービス',
    rating: 4.7,
    ctaText: '予約する',
    sponsorText: 'スポンサー'
  },
  {
    id: 'ad-4',
    title: 'プレミアムカーケア用品',
    description: '愛車を美しく保つ高品質なケア用品。ワックス、クリーナーなど豊富なラインナップ。',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    category: 'ケア用品',
    rating: 4.6,
    price: '¥2,000〜',
    ctaText: '商品を見る',
    sponsorText: 'スポンサー'
  },
  {
    id: 'ad-5',
    title: '中古車情報サイト',
    description: 'あなたにぴったりの一台が見つかる。厳選された中古車情報を多数掲載。',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    category: '中古車',
    rating: 4.5,
    ctaText: '検索する',
    sponsorText: 'スポンサー'
  }
];

// セッション中は同じ広告を返すためのキャッシュ
let sessionAdCache: { [key: string]: NativeAdProps } = {};

// ランダムな広告を取得（セッション中は固定）
export const getRandomAd = (key: string = 'default'): NativeAdProps => {
  // セッションキャッシュから取得
  if (sessionAdCache[key]) {
    return sessionAdCache[key];
  }
  
  // 新しい広告を生成してキャッシュに保存
  const randomIndex = Math.floor(Math.random() * nativeAds.length);
  const selectedAd = nativeAds[randomIndex];
  sessionAdCache[key] = selectedAd;
  
  return selectedAd;
};

export const NativeAd: React.FC<{ ad: NativeAdProps }> = ({ ad }) => {
  // 安全にプロパティにアクセス
  if (!ad) {
    return null;
  }

  return (
    <div className="bg-surface border border-surface-light rounded-xl p-4 mb-4 hover:bg-surface-light transition-colors">
      {/* スポンサー表示 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded-full">
            {ad.sponsorText || 'スポンサー'}
          </span>
          <span className="text-xs text-gray-400">{ad.category || '広告'}</span>
        </div>
        {ad.rating && (
          <div className="flex items-center space-x-1">
            <Star size={12} className="text-yellow-400 fill-current" />
            <span className="text-xs text-gray-400">{ad.rating}</span>
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <div className="flex space-x-3">
        {/* 画像 */}
        <div className="flex-shrink-0">
          <img
            src={ad.imageUrl || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'}
            alt={ad.title || '広告'}
            className="w-20 h-20 object-cover rounded-lg"
          />
        </div>

        {/* テキストコンテンツ */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">
            {ad.title || '広告'}
          </h3>
          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
            {ad.description || '詳細はこちらをご覧ください。'}
          </p>
          
          {/* 価格とCTA */}
          <div className="flex items-center justify-between">
            {ad.price && (
              <span className="text-sm font-medium text-primary">{ad.price}</span>
            )}
            <button className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors">
              <span>{ad.ctaText || '詳細を見る'}</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 投稿一覧に広告を挿入するためのヘルパー関数（完全固定版）
export const insertNativeAds = <T extends { id: string }>(
  items: T[],
  adFrequency: number = 5 // 5件に1回の頻度で広告を挿入
): (T | { type: 'ad'; ad: NativeAdProps; id: string })[] => {
  const result: (T | { type: 'ad'; ad: NativeAdProps; id: string })[] = [];
  
  if (!items || items.length === 0) {
    return result;
  }
  
  // 固定の広告を事前に生成（同じキーで常に同じ広告を返す）
  const fixedAds: NativeAdProps[] = [];
  const maxAds = Math.ceil(items.length / adFrequency);
  for (let i = 0; i < maxAds; i++) {
    fixedAds.push(getRandomAd(`fixed-ad-${i}`));
  }
  
  let adIndex = 0;
  items.forEach((item, index) => {
    result.push(item);
    
    // 指定された頻度で広告を挿入（最初の投稿の後は除く）
    if (index > 0 && (index + 1) % adFrequency === 0 && adIndex < fixedAds.length) {
      const ad = fixedAds[adIndex];
      if (ad) {
        result.push({
          type: 'ad',
          ad,
          id: `fixed-ad-${index}-${ad.id}`
        });
        adIndex++;
      }
    }
  });
  
  return result;
};
