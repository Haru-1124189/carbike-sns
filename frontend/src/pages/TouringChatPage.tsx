import { ArrowLeft, Calendar, Clock, Heart, MapPin, MessageCircle, Plus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { useTouringLikes } from '../hooks/useLikes';
import { useParticipatingThreads } from '../hooks/useParticipatingThreads';
import { useTouringThreads } from '../hooks/useTouringThreads';
import { incrementTouringThreadReplies } from '../lib/touring';
import { TouringThread } from '../types';

// ツーリングスレッド用いいねボタンコンポーネント
interface TouringLikeButtonProps {
  threadId: string;
}

const TouringLikeButton: React.FC<TouringLikeButtonProps> = ({ threadId }) => {
  const { user } = useAuth();
  const { isLiked, likeCount, toggleLike, loading } = useTouringLikes(threadId, user?.uid || '');

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    try {
      await toggleLike();
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('いいねの処理に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-1 text-xs text-gray-400">
        <Heart size={14} />
        <span>...</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleLike}
      className={`flex items-center space-x-1 text-xs transition-colors ${
        isLiked 
          ? 'text-red-400 hover:text-red-300' 
          : 'text-gray-400 hover:text-red-400'
      }`}
    >
      <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
      <span>{likeCount}</span>
    </button>
  );
};


interface TouringChatPageProps {
  onBack?: () => void;
  onCreateThread?: () => void;
  onThreadClick?: (threadId: string) => void;
  onChatRoomClick?: (chatRoomId: string, threadId: string) => void;
}

export const TouringChatPage: React.FC<TouringChatPageProps> = ({ 
  onBack, 
  onCreateThread, 
  onThreadClick,
  onChatRoomClick 
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'participating'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Firestoreからツーリングスレッドを取得
  const { threads: touringThreads, loading, error } = useTouringThreads();
  
  // 参加予定のツーリングスレッドを取得
  const { participatingThreads, loading: participatingLoading, error: participatingError } = useParticipatingThreads(user?.uid || null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return '締切済み';
    } else if (diffDays === 1) {
      return '明日締切';
    } else {
      return `${diffDays}日後締切`;
    }
  };

  const getDeadlineColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'text-red-400';
    } else if (diffDays <= 3) {
      return 'text-orange-400';
    } else {
      return 'text-gray-400';
    }
  };

  const activeThreads = touringThreads.filter(thread => thread.status === 'active');

  // 検索フィルタリング機能
  const filterThreadsBySearch = (threads: TouringThread[]) => {
    if (!searchQuery.trim()) return threads;
    
    const query = searchQuery.toLowerCase();
    return threads.filter((thread: TouringThread) => 
      thread.description.toLowerCase().includes(query) ||
      thread.prefecture.toLowerCase().includes(query) ||
      thread.location.toLowerCase().includes(query) ||
      thread.tags.some((tag: string) => tag.toLowerCase().includes(query))
    );
  };

  const filteredActiveThreads = filterThreadsBySearch(activeThreads);
  const filteredParticipatingThreads = filterThreadsBySearch(participatingThreads);

  const displayThreads = activeTab === 'active' ? filteredActiveThreads : filteredParticipatingThreads;
  const displayLoading = activeTab === 'active' ? loading : participatingLoading;
  const displayError = activeTab === 'active' ? error : participatingError;

  // いいねボタンのハンドラー
  const handleLikeClick = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // カードクリックを防ぐ
    
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    // いいね機能は個別のコンポーネントで処理するため、ここでは何もしない
    console.log('Like button clicked for thread:', threadId);
  };

  // 返信ボタンのハンドラー
  const handleReplyClick = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // カードクリックを防ぐ
    
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    try {
      await incrementTouringThreadReplies(threadId);
      // 返信機能の詳細ページに遷移するか、モーダルを表示
      alert('返信機能は今後実装予定です');
    } catch (error) {
      console.error('Error incrementing replies:', error);
      alert('返信に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-24 pt-0 fade-in max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm mr-3"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">ツーリングチャット</h1>
          </div>
          <button
            onClick={() => {
              console.log('Create thread button clicked');
              onCreateThread?.();
            }}
            className="p-2 rounded-xl bg-primary border border-primary hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-base font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            募集中
          </button>
          <button
            onClick={() => setActiveTab('participating')}
            className={`px-4 py-2 text-base font-medium transition-colors ${
              activeTab === 'participating'
                ? 'text-text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            参加予定
          </button>
        </div>

        {/* 検索バー */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="県名、地名、タグで検索..."
              className="w-full bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-4 py-3 pl-10 focus:outline-none focus:border-primary transition-colors"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-text-secondary">
              「{searchQuery}」の検索結果: {displayThreads.length}件
            </div>
          )}
        </div>

        {/* ローディング状態 */}
        {displayLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-surface-light border-t-primary mx-auto mb-4"></div>
            <div className="text-sm text-text-secondary">読み込み中...</div>
          </div>
        )}

        {/* エラー状態 */}
        {displayError && (
          <div className="text-center py-16">
            <div className="text-sm text-red-400 mb-4">エラー: {displayError}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
            >
              再試行
            </button>
          </div>
        )}

        {/* ツーリング一覧 */}
        {!displayLoading && !displayError && (
          <div className="space-y-6">
            {displayThreads.length > 0 ? (
              displayThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => {
                  if (activeTab === 'participating' && thread.chatRoomId) {
                    // 参加予定タブではチャットルームにアクセス
                    onChatRoomClick?.(thread.chatRoomId, thread.id);
                  } else {
                    // 募集中タブではスレッド詳細にアクセス
                    onThreadClick?.(thread.id);
                  }
                }}
                className="cursor-pointer hover:bg-surface-light rounded-lg p-6 transition-colors"
              >
                <div className="space-y-4">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-text-primary line-clamp-2 flex-1">
                      {thread.title}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-text-secondary ml-4">
                      <Users size={16} />
                      <span>{thread.currentParticipants}</span>
                      {thread.maxParticipants && <span>/{thread.maxParticipants}</span>}
                    </div>
                  </div>

                  {/* 説明 */}
                  <p className="text-base text-text-secondary line-clamp-2">
                    {thread.description}
                  </p>

                  {/* 場所情報 */}
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      <span>{thread.prefecture} {thread.location}</span>
                    </div>
                  </div>

                  {/* 日時情報 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                      <Calendar size={16} />
                      <span>{formatDate(thread.touringDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock size={16} />
                      <span className={getDeadlineColor(thread.applicationDeadline)}>
                        {formatDeadline(thread.applicationDeadline)}
                      </span>
                    </div>
                  </div>

                  {/* タグ */}
                  {thread.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {thread.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary bg-opacity-20 text-primary text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* フッター */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-text-secondary">
                        投稿者: {thread.authorName}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-text-secondary">
                        <span>{thread.replies}件の返信</span>
                      </div>
                    </div>
                    
                    {/* アクションボタン */}
                    <div className="flex items-center space-x-6">
                      {activeTab === 'participating' && thread.chatRoomId ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (thread.chatRoomId) {
                              onChatRoomClick?.(thread.chatRoomId, thread.id);
                            }
                          }}
                          className="flex items-center space-x-2 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          <MessageCircle size={16} />
                          <span>チャット開始</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => handleReplyClick(thread.id, e)}
                            className="flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                          >
                            <MessageCircle size={16} />
                            <span>返信</span>
                          </button>
                          <TouringLikeButton threadId={thread.id} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
              ) : (
                <div className="text-center py-16">
                  <Users size={48} className="text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {searchQuery ? (
                      `「${searchQuery}」に一致するツーリングが見つかりません`
                    ) : (
                      activeTab === 'active' ? '募集中のツーリングがありません' : '参加予定のツーリングがありません'
                    )}
                  </h3>
                  <p className="text-sm text-text-secondary mb-6">
                    {searchQuery ? (
                      '他のキーワードで検索してみてください'
                    ) : (
                      activeTab === 'active' 
                        ? '新しいツーリングを募集してみましょう' 
                        : '募集中のツーリングに参加してみましょう'
                    )}
                  </p>
                  {activeTab === 'active' && !searchQuery && (
                    <button
                      onClick={onCreateThread}
                      className="px-8 py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                    >
                      <Plus size={18} className="inline mr-2" />
                      ツーリングを募集
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-8 py-4 bg-surface-light text-text-primary rounded-lg font-medium hover:bg-surface transition-colors"
                    >
                      検索をクリア
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
      </main>
    </div>
  );
};
