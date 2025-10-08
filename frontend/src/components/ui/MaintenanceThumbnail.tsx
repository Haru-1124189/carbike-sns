import { Heart, MoreHorizontal } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useMaintenanceLikes } from '../../hooks/useLikes';
import { toggleMaintenanceLike } from '../../lib/likes';
import { MaintenancePost } from '../../types';
import { PersistentImage } from './PersistentImage';

interface MaintenanceThumbnailProps {
  post: MaintenancePost;
  onClick?: () => void;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string) => void;
}

export const MaintenanceThumbnail: React.FC<MaintenanceThumbnailProps> = ({ 
  post, 
  onClick,
  onDelete,
  onEdit
}) => {
  const { user } = useAuth();
  const { isLiked, likeCount, loading } = useMaintenanceLikes(post.id, user?.uid || '');
  const [showMenu, setShowMenu] = React.useState(false);



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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(post.id);
    setShowMenu(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(post.id);
    setShowMenu(false);
  };

  // 投稿者本人かどうかをチェック
  const isAuthor = user?.uid === post.authorId;

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-full cursor-pointer transition-all duration-300 hover:scale-105 fade-in"
    >
      {/* サムネイル画像 - アスペクト比固定 */}
      <div className="relative mb-2">
        <div className="aspect-[4/3] w-full rounded-lg overflow-hidden">
          {post.carImage ? (
            <div onClick={onClick} className="w-full h-full cursor-pointer">
              <PersistentImage
                src={post.carImage}
                alt={post.title}
                className="w-full h-full object-contain transition-all duration-300"
                clickable={false}
              />
            </div>
          ) : post.images && post.images.length > 0 ? (
            <div onClick={onClick} className="w-full h-full cursor-pointer">
              <PersistentImage
                src={post.images[0]}
                alt={post.title}
                className="w-full h-full object-contain transition-all duration-300"
                clickable={false}
              />
            </div>
          ) : (
            <div onClick={onClick} className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800 cursor-pointer">
              <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-sm text-gray-600 font-bold">車</span>
              </div>
            </div>
          )}
        </div>

        {/* 複数画像インジケーター */}
        {post.images && post.images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            +{post.images.length - 1}
          </div>
        )}
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
                <div 
                  className="absolute right-0 top-6 bg-background border border-surface-light rounded-lg shadow-lg z-10 min-w-[80px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isAuthor && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/50"
                      >
                        編集
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-surface/50"
                      >
                        削除
                      </button>
                    </>
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
