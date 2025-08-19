import { ArrowLeft, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { useAuth } from '../hooks/useAuth';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { useThread } from '../hooks/useThread';
import { deleteThread } from '../lib/threads';

interface ThreadDetailPageProps {
  threadId: string;
  onBackClick?: () => void;
  onUserClick?: (userId: string) => void;
}

export const ThreadDetailPage: React.FC<ThreadDetailPageProps> = ({ 
  threadId, 
  onBackClick, 
  onUserClick 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { thread, loading, error } = useThread(threadId);

  const handleBackClick = () => {
    onBackClick?.();
  };

  // スワイプバック機能を有効化
  useSwipeBack({
    onSwipeBack: handleBackClick
  });

  const handleUserClick = () => {
    if (thread?.authorName) {
      onUserClick?.(thread.authorName);
    }
  };

  const handleLike = () => {
    // TODO: いいね機能を実装
    console.log('Like clicked');
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
    if (!user?.uid || !thread) return;
    
    if (window.confirm('この投稿を削除しますか？この操作は取り消せません。')) {
      setIsDeleting(true);
      try {
        await deleteThread(threadId, user.uid);
        alert('投稿を削除しました');
        onBackClick?.(); // 前のページに戻る
      } catch (error: any) {
        console.error('Error deleting thread:', error);
        alert(error.message || '投稿の削除に失敗しました');
      } finally {
        setIsDeleting(false);
        setShowMenu(false);
      }
    }
  };

  const handleReport = () => {
    if (window.confirm('この投稿を通報しますか？')) {
      // TODO: 通報機能を実装
      console.log('Report clicked');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[420px] mx-auto">
          <AppHeader
            user={{ id: '', name: '', avatar: '', cars: [], interestedCars: [] }}
          />
          <main className="px-4 pb-20 pt-0">
            <BannerAd />
            {/* 戻るボタン */}
            <div className="flex items-center space-x-3 mb-4 mt-4">
              <button
                onClick={handleBackClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <span className="text-base text-text-primary font-medium">投稿詳細</span>
            </div>
            <div className="text-center">
              <div className="text-white">読み込み中...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[420px] mx-auto">
          <AppHeader
            user={{ id: '', name: '', avatar: '', cars: [], interestedCars: [] }}
          />
          <main className="px-4 pb-20 pt-0">
            <BannerAd />
            {/* 戻るボタン */}
            <div className="flex items-center space-x-3 mb-4 mt-4">
              <button
                onClick={handleBackClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <span className="text-base text-text-primary font-medium">投稿詳細</span>
            </div>
            <div className="text-center">
              <div className="text-red-400">投稿が見つかりませんでした</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isAuthor = user?.uid === thread.authorId;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        <AppHeader
          user={{ id: '', name: '', avatar: '', cars: [], interestedCars: [] }}
        />
        
        <main className="px-4 pb-20 pt-0">
          <BannerAd />
          
          {/* 戻るボタン */}
          <div className="flex items-center space-x-3 mb-4 mt-4">
            <button
              onClick={handleBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <span className="text-base text-text-primary font-medium">投稿詳細</span>
          </div>

          {/* 投稿詳細 */}
          <div className="bg-surface rounded-xl border border-surface-light p-4 mb-4">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleUserClick}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {thread.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {thread.authorName}
                  </span>
                </button>
              </div>
              
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

            {/* 投稿内容 */}
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-text-primary mb-2">
                {thread.title}
              </h1>
              <p className="text-text-secondary leading-relaxed">
                {thread.content}
              </p>
            </div>

            {/* タグ */}
            {thread.tags && thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {thread.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* アクション */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-1 text-text-secondary hover:text-red-500 transition-colors"
                >
                  <Heart size={16} />
                  <span className="text-sm">{thread.likes}</span>
                </button>
                <button
                  onClick={handleComment}
                  className="flex items-center space-x-1 text-text-secondary hover:text-primary transition-colors"
                >
                  <MessageCircle size={16} />
                  <span className="text-sm">{thread.replies}</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-full hover:bg-surface-light transition-colors"
                >
                  <MoreHorizontal size={16} className="text-text-secondary" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-background border border-surface-light rounded-lg shadow-lg z-10 min-w-[120px]">
                    {isAuthor ? (
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-surface/50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>{isDeleting ? '削除中...' : '削除'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleReport}
                        className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/50 flex items-center space-x-2"
                      >
                        <span>通報</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* コメントセクション（プレースホルダー） */}
          <div className="bg-surface rounded-xl border border-surface-light p-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              コメント ({thread.replies})
            </h3>
            <div className="text-center py-8">
              <div className="text-text-secondary">
                コメント機能は準備中です
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

