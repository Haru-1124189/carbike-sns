import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { useAuth } from '../hooks/useAuth';
import { useQuestion } from '../hooks/useQuestion';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { deleteQuestion } from '../lib/threads';

interface QuestionDetailPageProps {
  questionId: string;
  onBackClick?: () => void;
  onUserClick?: (userId: string) => void;
}

export const QuestionDetailPage: React.FC<QuestionDetailPageProps> = ({ 
  questionId, 
  onBackClick, 
  onUserClick 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { question, loading, error } = useQuestion(questionId);

  const handleBackClick = () => {
    onBackClick?.();
  };

  // スワイプバック機能を有効化
  useSwipeBack({
    onSwipeBack: handleBackClick
  });

  const handleUserClick = () => {
    if (question?.authorName) {
      onUserClick?.(question.authorName);
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
    if (!user?.uid || !question) return;
    
    if (window.confirm('この質問を削除しますか？この操作は取り消せません。')) {
      setIsDeleting(true);
      try {
        await deleteQuestion(questionId, user.uid);
        alert('質問を削除しました');
        onBackClick?.(); // 前のページに戻る
      } catch (error: any) {
        console.error('Error deleting question:', error);
        alert(error.message || '質問の削除に失敗しました');
      } finally {
        setIsDeleting(false);
        setShowMenu(false);
      }
    }
  };

  const handleReport = () => {
    if (window.confirm('この質問を通報しますか？')) {
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
              <span className="text-base text-text-primary font-medium">質問詳細</span>
            </div>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-text-secondary mt-2">読み込み中...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !question) {
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
              <span className="text-base text-text-primary font-medium">質問詳細</span>
            </div>
            <div className="text-center py-8">
              <p className="text-text-secondary">質問が見つかりませんでした</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 投稿者本人かどうかをチェック
  const isAuthor = user?.uid === question.authorId;

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
            <span className="text-base text-text-primary font-medium">質問詳細</span>
          </div>

          {/* 投稿内容 */}
          <div className="bg-surface rounded-xl p-4 mb-4">
            {/* ユーザー情報 */}
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={question.authorAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                alt={question.authorName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{question.authorName}</p>
                <p className="text-xs text-text-secondary">{question.createdAt}</p>
              </div>
              <button
                onClick={handleUserClick}
                className="text-xs text-primary hover:underline"
              >
                プロフィール
              </button>
            </div>

            {/* 質問タイトル */}
            <h1 className="text-lg font-bold text-text-primary mb-3">
              {question.title}
            </h1>

            {/* 質問内容 */}
            <p className="text-text-primary mb-4 leading-relaxed">
              {question.content}
            </p>

            {/* タグ */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-light">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors"
                >
                  <Heart size={18} />
                  <span className="text-sm">{question.likes}</span>
                </button>
                <button
                  onClick={handleComment}
                  className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors"
                >
                  <MessageCircle size={18} />
                  <span className="text-sm">{question.replies}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors"
                >
                  <Share2 size={18} />
                  <span className="text-sm">シェア</span>
                </button>
              </div>

              {/* メニューボタン */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-full hover:bg-surface-light transition-colors"
                >
                  <MoreHorizontal size={18} className="text-text-secondary" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-10 bg-background border border-surface-light rounded-lg shadow-lg z-10 min-w-[120px]">
                    {isAuthor ? (
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-surface/50 disabled:opacity-50"
                      >
                        {isDeleting ? '削除中...' : '削除'}
                      </button>
                    ) : (
                      <button
                        onClick={handleReport}
                        className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-surface/50"
                      >
                        通報
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* コメントセクション */}
          <div className="bg-surface rounded-xl p-4">
            <h3 className="text-lg font-bold text-text-primary mb-4">コメント</h3>
            <div className="text-center py-8">
              <p className="text-text-secondary">コメント機能は準備中です</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
