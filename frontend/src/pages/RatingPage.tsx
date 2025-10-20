import { ArrowLeft, Star } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRatings } from '../hooks/useRatings';

interface RatingPageProps {
  onBack?: () => void;
  onBackClick?: () => void;
  orderId: string;
  itemId: string;
  sellerId: string;
  buyerId: string;
  itemTitle: string;
  isSeller: boolean; // 出品者かどうか
}

export const RatingPage: React.FC<RatingPageProps> = ({
  onBack,
  onBackClick,
  orderId,
  itemId,
  sellerId,
  buyerId,
  itemTitle,
  isSeller
}) => {
  const { user } = useAuth();
  const { createRating, loading, error } = useRatings();

  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 評価する相手を決定
  const rateeId = isSeller ? buyerId : sellerId;
  const rateeType = isSeller ? 'buyer' : 'seller';

  const handleSubmit = async () => {
    if (!user?.uid || !rating) return;

    try {
      setSubmitting(true);

      // 取引相手を評価
      await createRating(
        itemId,
        orderId,
        user.uid,
        rateeId,
        rating,
        comment,
        rateeType
      );

      console.log('✅ 取引相手評価完了:', {
        rateeId,
        rateeType,
        rating,
        timestamp: new Date().toISOString()
      });

      alert('評価を投稿しました！');
      onBack?.() || onBackClick?.();
    } catch (error) {
      console.error('❌ 評価投稿エラー:', error);
      alert('評価の投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (
    currentRating: number | null,
    onRatingChange: (rating: 1 | 2 | 3 | 4 | 5 | null) => void,
    disabled: boolean = false
  ) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && onRatingChange(star as 1 | 2 | 3 | 4 | 5)}
            disabled={disabled}
            className={`p-1 transition-colors ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <Star
              size={32}
              className={`${
                currentRating && star <= currentRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating: number | null) => {
    if (!rating) return '評価を選択してください';
    
    const labels = {
      1: 'とても悪い',
      2: '悪い',
      3: '普通',
      4: '良い',
      5: 'とても良い'
    };
    
    return labels[rating as keyof typeof labels];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack || onBackClick}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">評価</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 商品情報 */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h2 className="text-lg font-medium text-text-primary mb-2">
            商品: {itemTitle}
          </h2>
          <p className="text-sm text-text-secondary">
            取引が完了しました。{isSeller ? '購入者' : '出品者'}の評価をお願いします。
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 評価フォーム */}
        <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-medium text-text-primary">
            {isSeller ? '購入者' : '出品者'}への評価
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                取引の満足度
              </label>
              {renderStarRating(rating, setRating)}
              {rating && (
                <p className="text-sm text-text-secondary mt-2">
                  {getRatingLabel(rating)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                コメント（任意）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`${isSeller ? '購入者' : '出品者'}への評価コメントを入力してください...`}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary resize-none"
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-text-secondary mt-1">
                {comment.length}/200文字
              </p>
            </div>
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || loading || !rating}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting || loading ? '評価中...' : '評価を投稿'}
          </button>

          <button
            onClick={onBack || onBackClick}
            className="w-full bg-surface text-text-primary py-3 rounded-lg font-medium hover:bg-surface-light transition-colors border border-border"
          >
            キャンセル
          </button>
        </div>

        {/* 評価ガイドライン */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            取引評価のポイント
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 商品の状態は説明通りだったか</li>
            <li>• 発送・配送は迅速だったか</li>
            <li>• コミュニケーションは良好だったか</li>
            <li>• 梱包は丁寧だったか</li>
            <li>• 支払いはスムーズだったか</li>
            <li>• 総合的に満足できる取引だったか</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
