import { Heart, MessageSquare, MoreHorizontal, Pin, UserX } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useThreadLikes } from '../../hooks/useLikes';
import { useReplies } from '../../hooks/useReplies';
import { useUserName } from '../../hooks/useUserName';
import { toggleThreadLike } from '../../lib/likes';
import { toggleThreadPin } from '../../lib/pins';
import { Thread } from '../../types';
import { ClickableUserName } from './ClickableUserName';
import { FollowButton } from './FollowButton';
import { PersistentImage } from './PersistentImage';
import { ReportButton } from './ReportButton';

interface ThreadCardProps {
  thread: Thread;
  onClick?: () => void;
  onDelete?: (threadId: string) => void;
  onBlockUser?: (author: string) => void;
  onReportThread?: (threadId: string, author: string) => void;
  onUserClick?: (userId: string, displayName: string) => void;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({
  thread,
  onClick,
  onDelete,
  onBlockUser,
  onReportThread,
  onUserClick
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  
  const { user } = useAuth();
  const { isLiked, likeCount, loading } = useThreadLikes(thread.id, user?.uid || '');
  const { displayName: authorDisplayName, photoURL: authorPhotoURL, loading: authorLoading } = useUserName(thread.authorId || '');
  const { replies: replyList } = useReplies(thread.id, thread.type === 'question' ? 'question' : 'thread');



  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = () => {
    onDelete?.(thread.id);
    setShowMenu(false);
  };

  const handleBlockUser = () => {
    onBlockUser?.(displayAuthorName);
    setShowMenu(false);
  };

  const handleReportThread = () => {
    setShowMenu(false);
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    try {
      await toggleThreadPin(thread.id, user.uid, !thread.isPinned);
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      alert(error.message || '固定の操作に失敗しました');
    }
    setShowMenu(false);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    try {
      console.log('ThreadCard - handleLikeClick:', { threadId: thread.id, userId: user.uid });
      await toggleThreadLike(thread.id, user.uid);
    } catch (error: any) {
      console.error('Error toggling like:', error);
      console.error('Error details:', {
        threadId: thread.id,
        userId: user.uid,
        error: error.message
      });
      
      // 権限エラーの場合は特別なメッセージを表示
      if (error.message.includes('permission')) {
        alert('いいねの操作に権限がありません。ログイン状態を確認してください。');
      } else {
        alert(`いいねの操作に失敗しました: ${error.message}`);
      }
    }
  };

  

  // 投稿者本人かどうかをチェック
  const isAuthor = user?.uid === thread.authorId;
  
  // 表示するユーザー名（最新のユーザー名を優先）
  const displayAuthorName = authorDisplayName || thread.author;

  return (
    <div
      className="p-3 cursor-pointer border-b border-surface-light transition-all duration-300 hover:bg-surface/30"
      onClick={() => {
        onClick?.();
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1">
          <ClickableUserName
            userId={thread.authorId || ''}
            fallbackName={thread.author}
            size="sm"
            onClick={onUserClick}
          />
          <div className="flex items-center space-x-2">
            <div className="text-xs text-text-secondary">
              {thread.createdAt instanceof Date 
                ? thread.createdAt.toLocaleString('ja-JP', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : typeof thread.createdAt === 'string'
                ? new Date(thread.createdAt).toLocaleString('ja-JP', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '日付不明'
              }
            </div>
                         {/* 自分以外の投稿にフォローボタンを表示 */}
             {thread.authorId && thread.authorId !== user?.uid && (
               <FollowButton
                 targetUserId={thread.authorId}
                 variant="ghost"
                 size="xs"
                 className="text-xs px-2 py-1 h-auto min-h-0"
               />
             )}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="p-1 rounded-full hover:bg-surface/50 transition-colors"
          >
            <MoreHorizontal size={16} className="text-text-secondary" />
          </button>
          
                     {showMenu && (
             <div className="absolute right-0 top-8 bg-background border border-surface-light rounded-lg shadow-lg z-10 min-w-[120px]">
               {isAuthor && (
                 <>
                   <button
                     onClick={handleTogglePin}
                     className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/50 flex items-center space-x-2"
                   >
                     <Pin size={14} />
                     <span>{thread.isPinned ? '固定解除' : '固定'}</span>
                   </button>
                   <button
                     onClick={handleDelete}
                     className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-surface/50 flex items-center space-x-2"
                   >
                     <span>削除</span>
                   </button>
                 </>
               )}
               <button
                 onClick={handleBlockUser}
                 className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/50 flex items-center space-x-2"
               >
                 <UserX size={14} />
                 <span>ユーザーをブロック</span>
               </button>
               <div className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/50">
                 <ReportButton
                   targetId={thread.id}
                   targetType="thread"
                   targetTitle={thread.title}
                   targetAuthorId={thread.authorId}
                   targetAuthorName={displayAuthorName}
                   className="flex items-center space-x-2 w-full"
                 />
               </div>
             </div>
           )}
        </div>
      </div>

             <div className="mb-2">
         <div className="flex items-center space-x-2 mb-1">
           <h3 className="text-sm font-medium text-text-primary line-clamp-1">{thread.title}</h3>
           {thread.isPinned && (
             <Pin size={12} className="text-primary flex-shrink-0" />
           )}
         </div>
         <p className="text-xs text-text-secondary line-clamp-2">{thread.content}</p>
       </div>

      {/* 画像表示 */}
      {thread.images && thread.images.length > 0 && (
        <div className="mb-3">
          {thread.images.length === 1 ? (
            <div className="w-full rounded-lg overflow-hidden">
              <PersistentImage
                src={thread.images[0]}
                alt={thread.title}
                className="w-full max-h-96 object-contain"
                clickable={true}
              />
            </div>
          ) : (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {thread.images.slice(0, 5).map((image, index) => (
                <div key={index} className="flex-shrink-0">
                  <PersistentImage
                    src={image}
                    alt={`${thread.title} ${index + 1}`}
                    className="w-80 h-60 object-contain rounded-lg"
                    clickable={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-text-secondary">
            <MessageSquare size={11} />
            <span className="text-xs">{replyList.length}</span>
          </div>
                     <button
             onClick={handleLikeClick}
             disabled={loading}
             className={`flex items-center space-x-1 transition-colors ${
               isLiked 
                 ? 'text-red-500 hover:text-red-400' 
                 : 'text-text-secondary hover:text-red-500'
             }`}
           >
             <Heart size={11} className={isLiked ? 'fill-current' : ''} />
             <span className="text-xs">{likeCount}</span>
           </button>
        </div>

        <div className="flex items-center space-x-1">
          {thread.tags.slice(0, 1).map((tag, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {thread.tags.length > 1 && (
            <span className="text-xs text-text-secondary">+{thread.tags.length - 1}</span>
          )}
        </div>
      </div>

      
    </div>
  );
};
