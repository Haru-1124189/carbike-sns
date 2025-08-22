import React from 'react';
import { useReplies } from '../../hooks/useReplies';

interface ReplySectionProps {
  targetId: string;
  targetType: 'thread' | 'question' | 'maintenance';
  onUserClick?: (authorId: string, authorName: string) => void;
}

export const ReplySection: React.FC<ReplySectionProps> = ({
  targetId,
  targetType,
  onUserClick
}) => {
  const { replies, loading, error } = useReplies(targetId, targetType);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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
          replies.map((reply) => (
            <div key={reply.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                  {reply.authorAvatar ? (
                    <img 
                      src={reply.authorAvatar} 
                      alt={reply.author}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    reply.author.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <button
                    onClick={() => onUserClick?.(reply.author, reply.author)}
                    className="text-sm font-medium text-white hover:text-primary transition-colors"
                  >
                    {reply.author}
                  </button>
                  <span className="text-xs text-gray-400">
                    {formatTime(reply.createdAt)}
                  </span>
                </div>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">
                  {reply.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 返信投稿フォームは削除 - FloatingReplyBarを使用 */}
    </div>
  );
};
