import { ArrowLeft, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCreateReview, useItem } from '../hooks/useMarketplace';

interface MarketplaceReviewsPageProps {
  itemId?: string;
  item?: any;
  onBack?: () => void;
  onBackClick?: () => void;
}

export const MarketplaceReviewsPage: React.FC<MarketplaceReviewsPageProps> = ({
  itemId: propItemId,
  item: propItem,
  onBack,
  onBackClick
}) => {
  const { user } = useAuth();
  const { item } = useItem(propItemId || '');
  const { createReview, loading } = useCreateReview();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: '',
    recommend: true
  });

  // ダミーレビューデータ（実際の実装ではFirestoreから取得）
  const reviews = [
    {
      id: '1',
      userId: 'user1',
      userName: '山田太郎',
      rating: 5,
      title: 'とても良い商品でした',
      comment: '説明通りで、梱包も丁寧でした。また機会があれば購入したいと思います。',
      recommend: true,
      createdAt: new Date('2025-10-09'),
      helpful: 3
    },
    {
      id: '2',
      userId: 'user2',
      userName: '佐藤花子',
      rating: 4,
      title: '満足しています',
      comment: '期待していた品質でした。配送も早くて助かりました。',
      recommend: true,
      createdAt: new Date('2025-10-08'),
      helpful: 1
    },
    {
      id: '3',
      userId: 'user3',
      userName: '田中一郎',
      rating: 3,
      title: '普通でした',
      comment: '特に問題はありませんでしたが、もう少し安いと嬉しかったです。',
      recommend: false,
      createdAt: new Date('2025-10-07'),
      helpful: 0
    }
  ];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !item) return;

    try {
       await createReview({
         orderId: '', // 実際の実装では注文IDが必要
         targetUserId: item.sellerId,
         rating: reviewData.rating,
         title: reviewData.title,
         comment: reviewData.comment,
         recommend: reviewData.recommend
       }, user.uid);
      
      alert('レビューを投稿しました！');
      setShowReviewForm(false);
      setReviewData({
        rating: 5,
        title: '',
        comment: '',
        recommend: true
      });
    } catch (error) {
      console.error('レビュー投稿エラー:', error);
      alert('レビューの投稿に失敗しました');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-gray-900 text-white z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onBack?.()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">レビュー</h1>
          </div>
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            レビューを書く
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 商品情報 */}
        {item && (
          <div className="bg-surface border border-border rounded-lg p-4 mb-6">
            <h2 className="font-bold text-text-primary mb-2">{item.title}</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">出品者:</span>
              <span className="text-sm text-text-primary">出品者名</span>
            </div>
          </div>
        )}

        {/* レビュー統計 */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">レビュー統計</h3>
            <div className="flex items-center space-x-1">
              {renderStars(4)}
              <span className="ml-2 text-sm text-text-secondary">4.0 (12件)</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary w-8">{star}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${(reviews.filter(r => r.rating === star).length / reviews.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-text-secondary w-8">
                  {reviews.filter(r => r.rating === star).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* レビュー一覧 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-text-primary">レビュー一覧</h3>
          
          {reviews.map(review => (
            <div key={review.id} className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-text-primary">{review.userName}</span>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <h4 className="font-medium text-text-primary mb-2">{review.title}</h4>
                </div>
                <div className="flex items-center space-x-1">
                  {review.recommend ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <ThumbsUp size={14} />
                      <span className="text-xs">おすすめ</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <ThumbsDown size={14} />
                      <span className="text-xs">おすすめしない</span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-text-secondary text-sm mb-3">{review.comment}</p>
              
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span>{review.createdAt.toLocaleDateString('ja-JP')}</span>
                <button className="flex items-center space-x-1 hover:text-text-secondary transition-colors">
                  <ThumbsUp size={12} />
                  <span>参考になった ({review.helpful})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* レビュー投稿フォーム */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-text-primary mb-4">レビューを投稿</h3>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    評価
                  </label>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewData(prev => ({ ...prev, rating: i + 1 }))}
                        className="p-1"
                      >
                        <Star
                          size={24}
                          className={`${
                            i < reviewData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    タイトル
                  </label>
                  <input
                    type="text"
                    value={reviewData.title}
                    onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                    placeholder="レビューのタイトル"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    コメント
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                    rows={4}
                    placeholder="商品についての感想を書いてください"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    この商品をおすすめしますか？
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recommend"
                        checked={reviewData.recommend}
                        onChange={() => setReviewData(prev => ({ ...prev, recommend: true }))}
                        className="mr-2"
                      />
                      <span className="text-text-primary">はい</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recommend"
                        checked={!reviewData.recommend}
                        onChange={() => setReviewData(prev => ({ ...prev, recommend: false }))}
                        className="mr-2"
                      />
                      <span className="text-text-primary">いいえ</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-surface transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                  >
                    {loading ? '投稿中...' : '投稿'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
