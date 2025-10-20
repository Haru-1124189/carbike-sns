import { Star } from 'lucide-react';
import React from 'react';
import { MarketplaceRating } from '../types/marketplace';

interface RatingListProps {
  ratings: MarketplaceRating[];
  title?: string;
  showItemInfo?: boolean;
}

export const RatingList: React.FC<RatingListProps> = ({
  ratings,
  title = '評価一覧',
  showItemInfo = false
}) => {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingTypeLabel = (type: 'seller' | 'buyer') => {
    return type === 'seller' ? '出品者' : '購入者';
  };

  const getRatingTypeColor = (type: 'seller' | 'buyer') => {
    return type === 'seller' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (ratings.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 text-center">
        <Star size={48} className="mx-auto text-text-secondary mb-4" />
        <p className="text-text-secondary">まだ評価がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      
      <div className="space-y-3">
        {ratings.map((rating) => (
          <div
            key={rating.id}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingTypeColor(rating.type)}`}
                >
                  {getRatingTypeLabel(rating.type)}
                </span>
                <div className="flex items-center space-x-2">
                  {renderStars(rating.rating)}
                  <span className="text-sm font-medium text-text-primary">
                    {rating.rating}/5
                  </span>
                </div>
              </div>
              <span className="text-xs text-text-secondary">
                {formatTime(rating.createdAt)}
              </span>
            </div>

            {showItemInfo && (
              <div className="mb-3">
                <p className="text-sm text-text-secondary">
                  商品ID: {rating.itemId}
                </p>
              </div>
            )}

            {rating.comment && (
              <div className="bg-background rounded-lg p-3">
                <p className="text-sm text-text-primary whitespace-pre-wrap">
                  {rating.comment}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
