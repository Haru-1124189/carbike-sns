import { ArrowLeft, Calendar, Heart, MapPin, MoreHorizontal, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { FloatingReplyBar } from '../components/ui/FloatingReplyBar';
import { LikeHistoryModal } from '../components/ui/LikeHistoryModal';
import { ReplySection } from '../components/ui/ReplySection';
import { ReportButton } from '../components/ui/ReportButton';
import { useAuth } from '../hooks/useAuth';
import { useTouringLikes } from '../hooks/useLikes';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { useUserName } from '../hooks/useUserName';
import { earlyCloseTouringThread } from '../lib/touring';
import { TouringThread } from '../types';

interface TouringThreadDetailPageProps {
  thread: TouringThread;
  onBackClick?: () => void;
  onUserClick?: (userId: string, userName?: string) => void;
  onDeleteClick?: (threadId: string) => void;
}

export const TouringThreadDetailPage: React.FC<TouringThreadDetailPageProps> = ({ 
  thread, 
  onBackClick, 
  onUserClick,
  onDeleteClick
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLikeHistory, setShowLikeHistory] = useState(false);
  const [isEarlyClosing, setIsEarlyClosing] = useState(false);
  const { user } = useAuth();
  const { isLiked, likeCount, toggleLike, loading: likeLoading } = useTouringLikes(thread.id, user?.uid || '');
  const { displayName: authorDisplayName, photoURL: authorPhotoURL, loading: authorLoading } = useUserName(thread.authorId);

  // スワイプバック機能を有効化
  useSwipeBack({
    onSwipeBack: onBackClick
  });

  const handleBackClick = () => {
    onBackClick?.();
  };

  const handleUserClick = () => {
    onUserClick?.(thread.authorId, authorDisplayName || thread.authorName || '');
  };

  const handleReplyUserClick = (authorId: string, authorName: string) => {
    onUserClick?.(authorId, authorName);
  };

  const handleReplySubmitted = () => {
    // 返信が投稿された後の処理
    console.log('Touring reply submitted');
  };

  const handleLike = async () => {
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }
    await toggleLike();
  };

  const handleDelete = async () => {
    if (!user?.uid) return;
    
    if (window.confirm('このツーリング募集を削除しますか？この操作は取り消せません。')) {
      setIsDeleting(true);
      try {
        onDeleteClick?.(thread.id);
        alert('ツーリング募集を削除しました');
        onBackClick?.(); // 前のページに戻る
      } catch (error: any) {
        console.error('Error deleting touring thread:', error);
        alert(error.message || 'ツーリング募集の削除に失敗しました');
      } finally {
        setIsDeleting(false);
        setShowMenu(false);
      }
    }
  };


  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEarlyClose = async () => {
    if (!user?.uid) return;
    
    if (window.confirm('このツーリング募集を早期締切しますか？締切後は新しい参加を受け付けられません。')) {
      setIsEarlyClosing(true);
      try {
        await earlyCloseTouringThread(thread.id, user.uid);
        alert('ツーリング募集を早期締切しました。チャットルームが作成されました。');
        setShowMenu(false);
        // ページをリフレッシュして最新の状態を反映
        window.location.reload();
      } catch (error: any) {
        console.error('Error early closing touring thread:', error);
        alert(error.message || '早期締切に失敗しました');
      } finally {
        setIsEarlyClosing(false);
      }
    }
  };

  const isAuthor = user?.uid === thread.authorId;

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 締切までの日数を計算
  const getDaysUntilDeadline = (deadlineString: string) => {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return '締切済み';
    } else if (diffDays === 1) {
      return '明日締切';
    } else {
      return `${diffDays}日後締切`;
    }
  };

  const getDeadlineColor = (deadlineString: string) => {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'text-red-400';
    } else if (diffDays <= 3) {
      return 'text-orange-400';
    } else {
      return 'text-gray-400';
    }
  };

  if (!thread) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={() => console.log('Profile clicked')}
        />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">ツーリングスレッドが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="pb-24 pt-0">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-surface-light">
          <button
            onClick={handleBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">ツーリング詳細</h1>
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <MoreHorizontal size={20} className="text-white" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-surface-light rounded-xl shadow-lg z-10">
                <div className="py-2">
                  {isAuthor && thread.status === 'active' && (
                    <button
                      onClick={handleEarlyClose}
                      disabled={isEarlyClosing}
                      className="w-full px-4 py-2 text-left text-orange-400 hover:bg-surface-light transition-colors"
                    >
                      {isEarlyClosing ? '早期締切中...' : '早期締切'}
                    </button>
                  )}
                  {isAuthor && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-surface-light transition-colors"
                    >
                      {isDeleting ? '削除中...' : '削除'}
                    </button>
                  )}
                  <ReportButton
                    targetId={thread.id}
                    targetType="touring"
                    targetTitle={thread.title}
                    className="w-full px-4 py-2 text-left text-gray-400 hover:bg-surface-light transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="p-4 space-y-6">
          {/* タイトルと説明 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white leading-relaxed">
              {thread.title}
            </h2>
            
            {/* ステータス表示 */}
            {thread.status === 'closed' && (
              <div className="inline-flex items-center px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                <X size={16} className="mr-1" />
                早期締切済み
              </div>
            )}
            
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {thread.description}
            </p>
          </div>

          {/* 場所情報 */}
          <div className="bg-surface rounded-xl p-4 space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <MapPin size={20} className="text-primary mr-2" />
              場所
            </h3>
            <div className="text-gray-300">
              <p className="text-lg font-medium">{thread.prefecture}</p>
              <p className="text-sm text-gray-400">{thread.location}</p>
            </div>
          </div>

          {/* 日時情報 */}
          <div className="bg-surface rounded-xl p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calendar size={20} className="text-primary mr-2" />
              日時
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">ツーリング日時</span>
                <div className="text-right">
                  <p className="text-white font-medium">{formatDate(thread.touringDate)}</p>
                  <p className="text-sm text-gray-400">{formatTime(thread.touringDate)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">募集締切</span>
                <div className="text-right">
                  <p className="text-white font-medium">{formatDate(thread.applicationDeadline)}</p>
                  <p className={`text-sm font-medium ${getDeadlineColor(thread.applicationDeadline)}`}>
                    {getDaysUntilDeadline(thread.applicationDeadline)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 参加者情報 */}
          <div className="bg-surface rounded-xl p-4 space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Users size={20} className="text-primary mr-2" />
              参加者
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">現在の参加者</span>
              <div className="text-right">
                <p className="text-white font-medium">
                  {thread.currentParticipants}人
                  {thread.maxParticipants && ` / ${thread.maxParticipants}人`}
                </p>
                {!thread.maxParticipants && (
                  <p className="text-xs text-gray-400">制限なし</p>
                )}
              </div>
            </div>
          </div>

          {/* タグ */}
          {thread.tags.length > 0 && (
            <div className="bg-surface rounded-xl p-4 space-y-3">
              <h3 className="text-lg font-semibold text-white">タグ</h3>
              <div className="flex flex-wrap gap-2">
                {thread.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary bg-opacity-20 text-primary text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 投稿者情報 */}
          <div className="bg-surface rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium">{authorDisplayName || thread.authorName}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(thread.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUserClick}
                className="px-4 py-2 bg-primary bg-opacity-20 text-primary rounded-lg hover:bg-opacity-30 transition-colors"
              >
                プロフィール
              </button>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center justify-between bg-surface rounded-xl p-4">
            {thread.status === 'closed' && thread.chatRoomId ? (
              // 早期締切済みの場合、チャットルームアクセスボタンを表示
              <button
                onClick={() => {
                  // ツーリングチャットページに移動して参加予定タブを表示
                  window.location.href = '/touring-chat?tab=participating';
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors font-medium"
              >
                <Users size={18} />
                <span>チャットルームに参加</span>
              </button>
            ) : (
              // 募集中の場合、いいねと返信ボタンを表示
              <>
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-500 bg-opacity-20 text-red-400' 
                      : 'bg-surface-light text-gray-400 hover:text-white'
                  }`}
                >
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                  <span>{likeCount}</span>
                </button>
                
                <button
                  onClick={() => setShowLikeHistory(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-surface-light text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  <Users size={18} />
                  <span>いいねした人</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 返信セクション（募集中のみ表示） */}
        {thread.status === 'active' && (
          <>
            <ReplySection
              targetId={thread.id}
              targetType="touring"
              onUserClick={handleReplyUserClick}
              onReplySubmitted={handleReplySubmitted}
            />

            {/* フローティング返信バーのための余白 */}
            <div className="h-24"></div>

            {/* フローティング返信バー */}
            <FloatingReplyBar
              targetId={thread.id}
              targetType="touring"
              targetAuthorName={thread.authorName}
              onReplySubmitted={handleReplySubmitted}
            />
          </>
        )}

        {/* いいね履歴モーダル */}
        {showLikeHistory && (
          <LikeHistoryModal
            targetId={thread.id}
            targetType="touring"
            onClose={() => setShowLikeHistory(false)}
          />
        )}
      </main>
    </div>
  );
};
