import { Calendar, Car, Clock, DollarSign, Heart, MapPin, MessageCircle, MoreHorizontal, Package, Pin, Wrench } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useMaintenanceLikes } from '../../hooks/useLikes';
import { useUserName } from '../../hooks/useUserName';
import { toggleMaintenancePin } from '../../lib/pins';
import { MaintenancePost } from '../../types';
import { ClickableUserName } from './ClickableUserName';
import { FollowButton } from './FollowButton';
import { PersistentImage } from './PersistentImage';
import { ReportButton } from './ReportButton';


interface MaintenanceCardProps {
  post: MaintenancePost;
  onClick?: () => void;
  onUserClick?: (userId: string, displayName: string) => void;
  onDelete?: (postId: string) => void;
}

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ post, onClick, onUserClick, onDelete }) => {
  const { user } = useAuth();
  const { isLiked, likeCount, toggleLike, loading: likeLoading } = useMaintenanceLikes(post.id, user?.uid || '');
  const { displayName: authorDisplayName, photoURL: authorPhotoURL, loading: authorLoading } = useUserName(post.authorId || '');
  const [showMenu, setShowMenu] = React.useState(false);
  

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }
    await toggleLike();
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Comment clicked');
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUserClick?.(post.authorId || '', authorDisplayName || post.author);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('この整備記録を削除しますか？')) {
      onDelete?.(post.id);
    }
    setShowMenu(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    try {
      await toggleMaintenancePin(post.id, user.uid, !post.isPinned);
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      alert(error.message || '固定の操作に失敗しました');
    }
    setShowMenu(false);
  };

  

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      engine: 'bg-red-500 bg-opacity-20 text-red-400',
      suspension: 'bg-blue-500 bg-opacity-20 text-blue-400',
      brake: 'bg-orange-500 bg-opacity-20 text-orange-400',
      electrical: 'bg-yellow-500 bg-opacity-20 text-yellow-400',
      body: 'bg-purple-500 bg-opacity-20 text-purple-400',
      tire: 'bg-green-500 bg-opacity-20 text-green-400',
      oil: 'bg-indigo-500 bg-opacity-20 text-indigo-400',
      custom: 'bg-pink-500 bg-opacity-20 text-pink-400',
      other: 'bg-gray-500 bg-opacity-20 text-gray-400'
    };
    return colors[category] || colors.other;
  };

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

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-500 bg-opacity-20 text-green-400',
      medium: 'bg-yellow-500 bg-opacity-20 text-yellow-400',
      hard: 'bg-red-500 bg-opacity-20 text-red-400'
    };
    return colors[difficulty] || colors.easy;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      easy: '初級',
      medium: '中級',
      hard: '上級'
    };
    return labels[difficulty] || '初級';
  };

  return (
    <div
      onClick={onClick}
      className="p-3 border-b border-surface-light transition-all duration-300 cursor-pointer fade-in hover:bg-surface/30"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1">
          <ClickableUserName
            userId={post.authorId || ''}
            fallbackName={post.author}
            size="sm"
            onClick={onUserClick}
          />
          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-secondary transition-all duration-300">{post.createdAt}</span>
            {/* 自分以外の投稿にフォローボタンを表示 */}
            {post.authorId && post.authorId !== user?.uid && (
              <FollowButton
                targetUserId={post.authorId}
                variant="ghost"
                size="xs"
                className="text-xs px-2 py-1 h-auto min-h-0"
              />
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${getCategoryColor(post.category)}`}>
            {getCategoryLabel(post.category)}
          </span>
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-1 rounded-full hover:bg-surface/50 transition-colors"
            >
              <MoreHorizontal size={16} className="text-text-secondary" />
            </button>
            
                         {showMenu && (
               <div className="absolute right-0 top-8 bg-background border border-surface-light rounded-lg shadow-lg z-10 min-w-[120px]">
                 {user?.uid === post.authorId && (
                   <>
                     <button
                       onClick={handleTogglePin}
                       className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/50 flex items-center space-x-2"
                     >
                       <Pin size={14} />
                       <span>{post.isPinned ? '固定解除' : '固定'}</span>
                     </button>
                     <button
                       onClick={handleDelete}
                       className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-surface/50 flex items-center space-x-2"
                     >
                       <span>削除</span>
                     </button>
                   </>
                 )}
                 <div className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/50">
                   <ReportButton
                     targetId={post.id}
                     targetType="maintenance"
                     targetTitle={post.title}
                     targetAuthorId={post.authorId}
                     targetAuthorName={authorDisplayName || post.author}
                     className="flex items-center space-x-2 w-full"
                   />
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* 車種情報 */}
      <div className="flex items-center space-x-2 mb-2">
        <Car size={14} className="text-primary transition-all duration-300" />
        <span className="text-sm text-text-secondary transition-all duration-300">{post.carModel}</span>
      </div>

      {/* メイン画像 */}
      {post.carImage && (
        <div className="mb-2">
          <PersistentImage
            src={post.carImage}
            alt={post.carModel}
            className="w-full h-20 object-contain rounded-lg transition-all duration-300 hover:scale-105"
            clickable={true}
          />
        </div>
      )}

      {/* アップロードされた画像 */}
      {post.images && post.images.length > 0 && (
        <div className="mb-2">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {post.images.slice(0, 5).map((image, index) => (
              <div key={index} className="flex-shrink-0">
                <PersistentImage
                  src={image}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-48 h-36 object-contain rounded-lg transition-all duration-300 hover:scale-110"
                  clickable={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 手順の写真プレビュー */}
      {post.steps.length > 0 && (
        <div className="mb-2">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {post.steps.slice(0, 5).map((step, index) => (
              step.image && (
                <div key={step.id} className="flex-shrink-0">
                  <PersistentImage
                    src={step.image}
                    alt={`Step ${step.order}`}
                    className="w-48 h-36 object-contain rounded-lg transition-all duration-300 hover:scale-110"
                    clickable={true}
                  />
                </div>
              )
            ))}
          </div>
        </div>
      )}

             {/* タイトルとコンテンツ */}
       <div className="mb-2">
         <div className="flex items-center space-x-2 mb-1">
           <h3 className="text-sm font-semibold text-text-primary transition-all duration-300 line-clamp-1">{post.title}</h3>
           {post.isPinned && (
             <Pin size={12} className="text-primary flex-shrink-0" />
           )}
         </div>
         <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 transition-all duration-300">{post.content}</p>
       </div>

      {/* 作業情報 */}
      <div className="flex items-center justify-between mb-3 text-xs text-text-secondary">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 transition-all duration-300">
            <Calendar size={14} />
            <span>{post.workDate}</span>
          </div>
          <div className="flex items-center space-x-1 transition-all duration-300">
            <MapPin size={14} />
            <span>{post.mileage.toLocaleString()}km</span>
          </div>
          <div className="flex items-center space-x-1 transition-all duration-300">
            <DollarSign size={14} />
            <span>¥{post.cost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 手順・時間・難易度情報 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-xs text-text-secondary transition-all duration-300">
            <Wrench size={14} />
            <span>{post.steps.length}手順</span>
          </div>
          {post.totalTime && (
            <div className="flex items-center space-x-1 text-xs text-text-secondary transition-all duration-300">
              <Clock size={14} />
              <span>{post.totalTime}</span>
            </div>
          )}
          {post.difficulty && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${getDifficultyColor(post.difficulty)}`}>
              {getDifficultyLabel(post.difficulty)}
            </span>
          )}
        </div>
      </div>

      {/* 工具・パーツ情報 */}
      {(post.tools || post.parts) && (
        <div className="mb-3">
          <div className="flex items-center space-x-4 text-xs">
            {post.tools && (
              <div className="flex items-center space-x-1 text-text-secondary transition-all duration-300">
                <Wrench size={12} />
                <span>工具: {post.tools.length}点</span>
              </div>
            )}
            {post.parts && (
              <div className="flex items-center space-x-1 text-text-secondary transition-all duration-300">
                <Package size={12} />
                <span>パーツ: {post.parts.length}点</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* タグ */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-primary/5 text-primary rounded-full transition-all duration-300 hover:scale-105"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
                     <button
             onClick={handleLike}
             disabled={likeLoading}
             className={`flex items-center space-x-1 transition-all duration-300 ${
               isLiked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'
             }`}
           >
             <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} className="transition-all duration-300" />
             <span className="text-xs transition-all duration-300">{likeCount}</span>
           </button>
          <button
            onClick={handleComment}
            className="flex items-center space-x-1 text-text-secondary hover:text-primary transition-all duration-300"
          >
            <MessageCircle size={12} className="transition-all duration-300" />
            <span className="text-xs transition-all duration-300">{post.comments}</span>
          </button>
        </div>
      </div>

      
    </div>
  );
};
