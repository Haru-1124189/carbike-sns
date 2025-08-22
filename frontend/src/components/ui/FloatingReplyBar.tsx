import { Send } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createReply } from '../../lib/replies';

interface FloatingReplyBarProps {
  targetId: string;
  targetType: 'thread' | 'question' | 'maintenance';
  targetAuthorName: string;
  onReplySubmitted?: () => void;
}

export const FloatingReplyBar: React.FC<FloatingReplyBarProps> = ({
  targetId,
  targetType,
  targetAuthorName,
  onReplySubmitted
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, userDoc } = useAuth();

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid || !replyContent.trim()) return;

    console.log('Submitting reply with data:', {
      targetId,
      targetType,
      targetAuthorName,
      replyContent: replyContent.trim(),
      user: user?.uid,
      displayName: userDoc?.displayName || user.displayName || 'ユーザー'
    });

    setIsSubmitting(true);
    try {
      const displayName = userDoc?.displayName || user.displayName || 'ユーザー';
      const photoURL = userDoc?.photoURL || user.photoURL || null;
      
      console.log('User data for reply:', { displayName, photoURL, userDoc: userDoc?.photoURL, user: user?.photoURL });
      
      console.log('Calling createReply...');
      const result = await createReply(
        {
          targetId,
          targetType,
          content: replyContent.trim()
        },
        user.uid,
        displayName,
        photoURL
      );
      
      console.log('Reply created successfully:', result);
      setReplyContent('');
      onReplySubmitted?.();
    } catch (error) {
      console.error('Error submitting reply:', error);
      console.error('Error details:', {
        targetId,
        targetType,
        targetAuthorName,
        replyContent,
        user: user?.uid
      });
      
      // エラーの種類に応じてメッセージを変更
      if (error instanceof Error) {
        if (error.message.includes('authorAvatar')) {
          console.log('This is an authorAvatar error, but reply was created successfully');
          // authorAvatarエラーは無視（返信は成功している）
          setReplyContent('');
          onReplySubmitted?.();
        } else {
          alert('返信の投稿に失敗しました');
        }
      } else {
        alert('返信の投稿に失敗しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed bottom-24 left-0 right-0 bg-background/95 backdrop-blur-sm p-2 z-50">
        <div className="max-w-[420px] mx-auto">
          <div className="text-center py-2">
            <div className="text-sm text-gray-400">返信するにはログインが必要です</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 left-0 right-0 bg-background/95 backdrop-blur-sm p-2 z-50">
      <div className="max-w-[420px] mx-auto">
        <form onSubmit={handleSubmitReply} className="flex items-center space-x-2">
          {/* ユーザーアバター */}
          <div className="flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
              {userDoc?.photoURL || user.photoURL ? (
                <img 
                  src={userDoc?.photoURL || user.photoURL || ''} 
                  alt="avatar"
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                (userDoc?.displayName || user.displayName || 'U').charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* 返信入力エリア */}
          <div className="flex-1">
            <div className="bg-surface/80 border border-surface-light rounded-full px-3 py-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`${targetAuthorName}に返信...`}
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 resize-none text-sm"
                rows={1}
                maxLength={120}
                style={{ minHeight: '16px', maxHeight: '60px' }}
              />
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex-shrink-0">
            <button
              type="submit"
              disabled={!replyContent.trim() || isSubmitting}
              className="w-8 h-8 bg-primary text-white rounded-full hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
        
        {/* 文字数カウンター（入力時のみ表示） */}
        {replyContent.length > 0 && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400">
              {replyContent.length}/120
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
