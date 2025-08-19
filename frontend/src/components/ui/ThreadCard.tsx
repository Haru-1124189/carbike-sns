import { Flag, Heart, MessageSquare, MoreHorizontal, UserX } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useThreadLikes } from '../../hooks/useLikes';
import { toggleThreadLike } from '../../lib/likes';
import { Thread } from '../../types';

interface ThreadCardProps {
  thread: Thread;
  onClick?: () => void;
  onDelete?: (threadId: string) => void;
  onBlockUser?: (author: string) => void;
  onReportThread?: (threadId: string, author: string) => void;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({
  thread,
  onClick,
  onDelete,
  onBlockUser,
  onReportThread
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const { user } = useAuth();
  const { isLiked, likeCount, loading } = useThreadLikes(thread.id, user?.uid || '');

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = () => {
    onDelete?.(thread.id);
    setShowMenu(false);
  };

  const handleBlockUser = () => {
    onBlockUser?.(thread.author);
    setShowMenu(false);
  };

  const handleReportThread = () => {
    onReportThread?.(thread.id, thread.author);
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
      alert(`いいねの操作に失敗しました: ${error.message}`);
    }
  };

  // 投稿者本人かどうかをチェック
  const isAuthor = user?.uid === thread.authorId || user?.email === thread.author;

  return (
    <div
      className="p-4 cursor-pointer border-b border-surface-light transition-all duration-300 hover:bg-surface/30"
      onClick={() => {
        onClick?.();
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {thread.author.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-text-primary">{thread.author}</div>
                         <div className="text-xs text-text-secondary">
               {thread.createdAt instanceof Date 
                 ? thread.createdAt.toLocaleString('ja-JP', {
                     year: 'numeric',
                     month: '2-digit',
                     day: '2-digit',
                     hour: '2-digit',
                     minute: '2-digit'
                   })
                 : typeof thread.createdAt === 'string'
                 ? new Date(thread.createdAt).toLocaleString('ja-JP', {
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
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-surface/50 flex items-center space-x-2"
                >
                  <span>削除</span>
                </button>
              )}
              <button
                onClick={handleBlockUser}
                className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/50 flex items-center space-x-2"
              >
                <UserX size={14} />
                <span>ユーザーをブロック</span>
              </button>
              <button
                onClick={handleReportThread}
                className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/50 flex items-center space-x-2"
              >
                <Flag size={14} />
                <span>報告</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-sm font-medium text-text-primary mb-1 line-clamp-2">{thread.title}</h3>
        <p className="text-xs text-text-secondary line-clamp-2">{thread.content}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-text-secondary">
            <MessageSquare size={12} />
            <span className="text-xs">{thread.replies}</span>
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
            <Heart size={12} className={isLiked ? 'fill-current' : ''} />
            <span className="text-xs">{likeCount}</span>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          {thread.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 bg-primary/5 text-primary text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {thread.tags.length > 2 && (
            <span className="text-xs text-text-secondary">+{thread.tags.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  );
};
