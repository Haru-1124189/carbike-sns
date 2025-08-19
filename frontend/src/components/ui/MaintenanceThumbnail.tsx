import { Heart, MoreHorizontal } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useMaintenanceLikes } from '../../hooks/useLikes';
import { toggleMaintenanceLike } from '../../lib/likes';
import { MaintenancePost } from '../../types';
import { Chip } from './Chip';

interface MaintenanceThumbnailProps {
  post: MaintenancePost;
  onClick?: () => void;
  onDelete?: (postId: string) => void;
}

export const MaintenanceThumbnail: React.FC<MaintenanceThumbnailProps> = ({ 
  post, 
  onClick,
  onDelete
}) => {
  const { user } = useAuth();
  const { isLiked, likeCount, loading } = useMaintenanceLikes(post.id, user?.uid || '');
  const [showMenu, setShowMenu] = React.useState(false);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      engine: 'エンジン',
      suspension: 'サスペンション',
      brake: 'ブレーキ',
      electrical: '電気',
      body: 'ボディ',
      tire: 'タイヤ',
      oil: 'オイル',
      custom: 'カスタム',
      other: 'その他'
    };
    return labels[category] || 'その他';
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    try {
      console.log('MaintenanceThumbnail - handleLikeClick:', { maintenanceId: post.id, userId: user.uid });
      await toggleMaintenanceLike(post.id, user.uid);
    } catch (error: any) {
      console.error('Error toggling like:', error);
      alert(`いいねの操作に失敗しました: ${error.message}`);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = () => {
    onDelete?.(post.id);
    setShowMenu(false);
  };

  // 投稿者本人かどうかをチェック
  const isAuthor = user?.uid === post.authorId || user?.email === post.author;

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-full cursor-pointer transition-all duration-300 hover:scale-105 fade-in"
    >
      {/* サムネイル画像 - アスペクト比固定 */}
      <div className="relative mb-2">
        <div className="aspect-[4/3] w-full rounded-lg overflow-hidden">
          <img
            src={post.carImage || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>
        {/* カテゴリーバッジ */}
        <div className="absolute top-2 left-2">
          <Chip variant="primary" size="sm">
            {getCategoryLabel(post.category)}
          </Chip>
        </div>
      </div>

      {/* タイトル */}
      <div className="px-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-text-primary line-clamp-2 leading-tight flex-1 mr-2">
            {post.title}
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleLikeClick}
              disabled={loading}
              className={`flex-shrink-0 p-1 rounded-full transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-text-secondary hover:text-red-500'
              }`}
            >
              <Heart size={14} className={isLiked ? 'fill-current' : ''} />
            </button>
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="p-1 rounded-full hover:bg-surface/50 transition-colors"
              >
                <MoreHorizontal size={14} className="text-text-secondary" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-6 bg-background border border-surface-light rounded-lg shadow-lg z-10 min-w-[80px]">
                  {isAuthor && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-surface/50"
                    >
                      削除
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
