import { ArrowLeft, Calendar, Clock, DollarSign, Heart, MapPin, MessageCircle, MoreHorizontal, Package, Users, Wrench } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { FloatingReplyBar } from '../components/ui/FloatingReplyBar';
import { LikeHistoryModal } from '../components/ui/LikeHistoryModal';
import { PersistentImage } from '../components/ui/PersistentImage';
import { ReplySection } from '../components/ui/ReplySection';
import { ReportButton } from '../components/ui/ReportButton';
import { useAuth } from '../hooks/useAuth';
import { useMaintenanceLikes } from '../hooks/useLikes';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { useUserName } from '../hooks/useUserName';
import { MaintenancePostDoc } from '../types';

interface MaintenanceDetailPageProps {
  post: MaintenancePostDoc;
  onBackClick: () => void;
  onUserClick?: (authorId: string, authorName?: string) => void;
  onEditClick?: (postId: string) => void;
}

export const MaintenanceDetailPage: React.FC<MaintenanceDetailPageProps> = ({ 
  post, 
  onBackClick, 
  onUserClick,
  onEditClick
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showLikeHistory, setShowLikeHistory] = useState(false);
  const { user } = useAuth();
  const { isLiked, likeCount, toggleLike, loading: likeLoading } = useMaintenanceLikes(post.id, user?.uid || '');
  const { displayName: authorDisplayName, photoURL: authorPhotoURL, loading: authorLoading } = useUserName(post.authorId || '');

  // スワイプバック機能を有効化
  useSwipeBack({
    onSwipeBack: onBackClick
  });

  const handleLike = async () => {
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }
    await toggleLike();
  };

  const handleUserClick = () => {
    if (post.authorId) {
      onUserClick?.(post.authorId, authorDisplayName || post.authorName || '');
    }
  };

  const handleReplyUserClick = (authorId: string, authorName: string) => {
    onUserClick?.(authorId, authorName);
  };

  const handleReplySubmitted = () => {
    // 返信が投稿された後の処理（必要に応じて実装）
    console.log('Reply submitted');
  };

  const handleComment = () => {
    // TODO: コメント機能を実装
    console.log('Comment clicked');
  };

  const handleShare = () => {
    // TODO: シェア機能を実装
    console.log('Share clicked');
  };

  const handleDelete = async () => {
    if (!user?.uid) return;
    
    if (window.confirm('この整備記録を削除しますか？この操作は取り消せません。')) {
      // TODO: 削除機能を実装
      console.log('Delete clicked');
      setShowMenu(false);
    }
  };

  const handleReport = () => {
    setShowMenu(false);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEditClick?.(post.id);
  };

  const handleLikeHistoryClick = () => {
    setShowLikeHistory(true);
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

  const isAuthor = user?.uid === post.authorId;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        <AppHeader
          onNotificationClick={() => {}}
          onProfileClick={() => {}}
        />
        
        <main className="px-4 pb-24 pt-0">
          
          {/* 戻るボタン */}
          <div className="flex items-center space-x-3 mb-4 mt-4">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <span className="text-base text-text-primary font-medium">整備記録詳細</span>
          </div>

                     {/* 整備記録詳細 */}
           <div className="p-4 mb-4">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleUserClick}
                  className="flex items-center space-x-2"
                >
                                                       <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary">
                    {authorPhotoURL ? (
                      <PersistentImage
                        src={authorPhotoURL}
                        alt={authorDisplayName || post.authorName || 'ユーザー'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        fallback={
                          <span className="text-white text-sm font-bold">
                            {(authorDisplayName || post.authorName || 'U').charAt(0).toUpperCase()}
                          </span>
                        }
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {(authorDisplayName || post.authorName || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                   <span className="text-sm font-medium text-text-primary">
                     {authorLoading ? '読み込み中...' : (authorDisplayName || post.authorName || 'Unknown User')}
                   </span>
                </button>
              </div>
              
              <div className="text-xs text-text-secondary">
                {post.createdAt instanceof Date
                  ? post.createdAt.toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : typeof post.createdAt === 'string'
                  ? new Date(post.createdAt).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : post.createdAt && typeof post.createdAt === 'object' && 'toDate' in (post.createdAt as any)
                  ? (post.createdAt as any).toDate().toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '日付不明'
                }
              </div>
            </div>

            {/* カテゴリータグ */}
            <div className="mb-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category)}`}>
                {getCategoryLabel(post.category)}
              </span>
            </div>

            {/* 車種情報 */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm text-text-secondary">車種:</span>
              <span className="text-sm font-medium text-text-primary">{post.carModel}</span>
            </div>

            {/* メイン画像 */}
            {post.carImage && (
              <div className="mb-3">
                <PersistentImage
                  src={post.carImage}
                  alt={post.carModel}
                  className="w-full max-h-64 object-contain rounded-lg"
                  clickable={true}
                />
              </div>
            )}

            {/* アップロードされた画像 */}
            {post.images && post.images.length > 0 && (
              <div className="mb-3">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {post.images.slice(0, 5).map((image, index) => (
                    <div key={index} className="flex-shrink-0">
                      <PersistentImage
                        src={image}
                        alt={`Uploaded image ${index + 1}`}
                        className="w-80 h-60 object-contain rounded-lg"
                        clickable={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* タイトルとコンテンツ */}
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-text-primary mb-2">
                {post.title}
              </h1>
              <p className="text-text-secondary leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* 詳細情報 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-primary" />
                <div>
                  <div className="text-xs text-text-secondary">作業日</div>
                  <div className="text-sm text-text-primary font-medium">{post.workDate}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-primary" />
                <div>
                  <div className="text-xs text-text-secondary">走行距離</div>
                  <div className="text-sm text-text-primary font-medium">{post.mileage.toLocaleString()}km</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign size={16} className="text-primary" />
                <div>
                  <div className="text-xs text-text-secondary">費用</div>
                  <div className="text-sm text-text-primary font-medium">¥{post.cost.toLocaleString()}</div>
                </div>
              </div>
              {post.totalTime && (
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-primary" />
                  <div>
                    <div className="text-xs text-text-secondary">作業時間</div>
                    <div className="text-sm text-text-primary font-medium">{post.totalTime}</div>
                  </div>
                </div>
              )}
            </div>

            {/* 作業情報 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-sm text-text-secondary">
                  <Wrench size={16} />
                  <span>{post.steps.length}手順</span>
                </div>
                {post.difficulty && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(post.difficulty)}`}>
                    {getDifficultyLabel(post.difficulty)}
                  </span>
                )}
              </div>
            </div>

            {/* 工具・パーツ情報 */}
            {(post.tools || post.parts) && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2">必要な工具・パーツ</h3>
                <div className="space-y-2">
                  {post.tools && (
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Wrench size={14} className="text-primary" />
                        <span className="text-xs font-medium text-text-primary">工具 ({post.tools.length}点)</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {post.tools.map((tool, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-primary bg-opacity-20 text-primary rounded-full">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {post.parts && (
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Package size={14} className="text-primary" />
                        <span className="text-xs font-medium text-text-primary">パーツ ({post.parts.length}点)</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {post.parts.map((part, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-green-500 bg-opacity-20 text-green-400 rounded-full">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 作業手順 */}
            {post.steps && post.steps.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">作業手順</h3>
                <div className="space-y-4">
                  {post.steps.map((step, index) => (
                    <div key={step.id || index} className="bg-surface border border-surface-light rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {step.order}
                        </div>
                        <h4 className="text-sm font-semibold text-text-primary">{step.title}</h4>
                      </div>
                      
                      {step.description && (
                        <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                      
                                             {step.image && (
                         <div className="mb-3">
                           <PersistentImage
                             src={step.image}
                             alt={`手順${step.order}の画像`}
                             className="w-full max-h-64 object-contain rounded-lg"
                             clickable={true}
                           />
                         </div>
                       )}
                      
                      {step.tips && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-semibold text-primary">💡 コツ・注意点</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {step.tips}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 投稿日時 */}
            <div className="text-xs text-text-secondary mb-4">
              {post.createdAt instanceof Date 
                ? post.createdAt.toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : typeof post.createdAt === 'string'
                ? new Date(post.createdAt).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : post.createdAt && typeof post.createdAt === 'object' && 'toDate' in (post.createdAt as any)
                ? (post.createdAt as any).toDate().toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '日付不明'
              }
            </div>

                         {/* アクション */}
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4">
                 <button
                   onClick={handleLike}
                   disabled={likeLoading}
                   className={`flex items-center space-x-1 transition-colors ${
                     isLiked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'
                   }`}
                 >
                   <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                   <span className="text-sm">{likeCount}</span>
                 </button>
                 {/* 自分の投稿の場合のみいいね履歴ボタンを表示 */}
                 {isAuthor && likeCount > 0 && (
                   <button
                     onClick={handleLikeHistoryClick}
                     className="flex items-center space-x-1 text-text-secondary hover:text-primary transition-colors"
                     title="いいね履歴を見る"
                   >
                     <Users size={16} />
                   </button>
                 )}
                 <button
                   onClick={handleComment}
                   className="flex items-center space-x-1 text-text-secondary hover:text-primary transition-colors"
                 >
                   <MessageCircle size={16} />
                   <span className="text-sm">{post.comments}</span>
                 </button>
               </div>
               
               <div className="flex items-center space-x-2">
                 {isAuthor && (
                   <div className="relative">
                     <button
                       onClick={() => setShowMenu(!showMenu)}
                       className="p-1 rounded-full hover:bg-surface-light transition-colors"
                     >
                       <MoreHorizontal size={16} className="text-text-secondary" />
                     </button>
                     
                                           {showMenu && (
                        <div className="absolute right-0 top-8 bg-background border border-surface-light rounded-lg shadow-lg z-10 min-w-[120px]">
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
                        </div>
                      )}
                   </div>
                 )}
                 
                 <ReportButton
                   targetId={post.id}
                   targetType="maintenance"
                   targetTitle={post.title}
                   targetAuthorId={post.authorId}
                   targetAuthorName={authorDisplayName || post.authorName || 'Unknown User'}
                   className="flex items-center space-x-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                 />
               </div>
             </div>
          </div>

                     {/* タグ */}
           {post.tags.length > 0 && (
             <div className="p-4 mb-4 border-t border-surface-light">
              <h3 className="text-sm font-semibold text-text-primary mb-2">タグ</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-primary bg-opacity-20 text-primary rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

                     {/* 返信セクション */}
           <div className="p-4 pb-52">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              返信 ({post.comments})
            </h3>
            <ReplySection
              targetId={post.id}
              targetType="maintenance"
              onUserClick={handleReplyUserClick}
            />
          </div>

          {/* 常駐返信バー */}
          <FloatingReplyBar
            targetId={post.id}
            targetType="maintenance"
            targetAuthorName={authorDisplayName || post.authorName || 'Unknown User'}
            onReplySubmitted={handleReplySubmitted}
          />

          {/* いいね履歴モーダル */}
          {showLikeHistory && (
            <LikeHistoryModal
              targetId={post.id}
              targetType="maintenance"
              onClose={() => setShowLikeHistory(false)}
              onUserClick={onUserClick}
            />
          )}
        </main>
      </div>
    </div>
  );
};
