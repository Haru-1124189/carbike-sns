import { MoreHorizontal, Pin } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useReplies } from '../../hooks/useReplies';
import { useTouringReplies } from '../../hooks/useTouringReplies';
import { useUserName } from '../../hooks/useUserName';
import { toggleReplyPin } from '../../lib/pins';
import { PersistentImage } from './PersistentImage';

interface ReplySectionProps {
  targetId: string;
  targetType: 'thread' | 'question' | 'maintenance' | 'touring';
  onUserClick?: (authorId: string, authorName: string) => void;
  onReplySubmitted?: () => void;
}

// 個別の返信コンポーネント
const ReplyItem: React.FC<{
  reply: any;
  onUserClick?: (authorId: string, authorName: string) => void;
  onTogglePin: (replyId: string, isPinned: boolean) => void;
  showMenuFor: string | null;
  setShowMenuFor: (id: string | null) => void;
  isAuthor: boolean;
}> = ({ reply, onUserClick, onTogglePin, showMenuFor, setShowMenuFor, isAuthor }) => {
  const { displayName, photoURL } = useUserName(reply.authorId || reply.author);

  const formatTime = (dateString: string | Date) => {
    if (!dateString) return '不明';
    
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) return '不明';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}時間前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}日前`;
    
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
          {photoURL ? (
            <img 
              src={photoURL} 
              alt={displayName || reply.author}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            (displayName || reply.authorName || reply.author || 'U').charAt(0).toUpperCase()
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUserClick?.(reply.authorId || reply.author, displayName || reply.authorName || reply.author)}
              className="text-sm font-medium text-white hover:text-primary transition-colors"
            >
              {displayName || reply.authorName || reply.author || 'ユーザー'}
            </button>
            <span className="text-xs text-gray-400">
              {formatTime(reply.createdAt)}
            </span>
            {reply.isPinned && (
              <Pin size={12} className="text-primary" />
            )}
          </div>
          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowMenuFor(showMenuFor === reply.id ? null : reply.id)}
                className="p-1 rounded-full hover:bg-surface/50 transition-colors"
              >
                <MoreHorizontal size={14} className="text-gray-400" />
              </button>
              
              {showMenuFor === reply.id && (
                <div className="absolute right-0 top-6 bg-background border border-surface-light rounded-lg shadow-lg z-10 min-w-[100px]">
                  <button
                    onClick={() => onTogglePin(reply.id, reply.isPinned || false)}
                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/50 flex items-center space-x-2"
                  >
                    <Pin size={14} />
                    <span>{reply.isPinned ? '固定解除' : '固定'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-300 whitespace-pre-wrap">
          {reply.content}
        </div>
        
        {/* 返信の画像表示 */}
        {reply.images && reply.images.length > 0 && (
          <div className="mt-2">
            {reply.images.length === 1 ? (
              <div className="w-full rounded-lg overflow-hidden">
                <PersistentImage
                  src={reply.images[0]}
                  alt="返信画像"
                  className="w-full max-h-80 object-contain"
                  clickable={true}
                />
              </div>
            ) : (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {reply.images.slice(0, 5).map((image: string, index: number) => (
                  <div key={index} className="flex-shrink-0">
                    <PersistentImage
                      src={image}
                      alt={`返信画像 ${index + 1}`}
                      className="w-64 h-48 object-contain rounded-lg"
                      clickable={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const ReplySection: React.FC<ReplySectionProps> = ({
  targetId,
  targetType,
  onUserClick,
  onReplySubmitted
}) => {
  console.log('ReplySection rendered with:', { targetId, targetType });
  
  // ツーリングスレッドの場合は専用のフックを使用
  const isTouring = targetType === 'touring';
  const touringThreadId = isTouring ? targetId : '';
  const regularThreadId = !isTouring ? targetId : '';
  
  console.log('ReplySection hook selection:', { isTouring, touringThreadId, regularThreadId });
  
  const touringReplies = useTouringReplies(touringThreadId);
  const regularReplies = useReplies(regularThreadId, targetType as any);
  
  const { replies, loading, error } = isTouring ? touringReplies : regularReplies;
  const { user } = useAuth();
  const [showMenuFor, setShowMenuFor] = React.useState<string | null>(null);

  console.log('ReplySection state:', { 
    replies: replies.length, 
    loading, 
    error, 
    targetType,
    isTouring,
    touringRepliesState: isTouring ? touringReplies : null,
    regularRepliesState: !isTouring ? regularReplies : null
  });

  const handleTogglePin = async (replyId: string, isPinned: boolean) => {
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    try {
      await toggleReplyPin(replyId, user.uid, !isPinned);
    } catch (error: any) {
      console.error('Error toggling reply pin:', error);
      alert(error.message || '返信の固定に失敗しました');
    }
    setShowMenuFor(null);
  };

  if (loading) {
    return (
      <div className="border-t border-surface-light pt-4">
        <div className="text-center py-4">
          <div className="text-sm text-gray-400">返信を読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t border-surface-light pt-4">
        <div className="text-center py-4">
          <div className="text-sm text-red-400">返信の読み込みに失敗しました</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-surface-light pt-4">
      {/* 返信一覧 */}
      <div className="space-y-3 mb-4">
        {replies.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-sm text-gray-400">まだ返信がありません</div>
          </div>
        ) : (
          replies.map((reply) => {
            const isAuthor = user?.uid === reply.authorId;
            
            return (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onUserClick={onUserClick}
                onTogglePin={handleTogglePin}
                showMenuFor={showMenuFor}
                setShowMenuFor={setShowMenuFor}
                isAuthor={isAuthor}
              />
            );
          })
        )}
      </div>

      {/* 返信投稿フォームは削除 - FloatingReplyBarを使用 */}
    </div>
  );
};
