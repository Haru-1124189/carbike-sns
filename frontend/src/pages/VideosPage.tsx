import { BarChart3, Play, Plus, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { OptimizedVideoGrid } from '../components/ui/OptimizedVideoGrid';
import { SearchBar } from '../components/ui/SearchBar';
import { useAuth } from '../hooks/useAuth';
import { useChannelSubscriberCount, useChannelSubscriptions } from '../hooks/useChannelSubscriptions';
import { useCreatorApplication } from '../hooks/useCreatorApplication';
import { useSearch } from '../hooks/useSearch';
import { useUserName } from '../hooks/useUserName';
import { useVideos } from '../hooks/useVideos';

// 動画の作者名を表示するコンポーネント
const VideoAuthorName: React.FC<{
  authorId: string;
  fallbackName: string;
  onClick: (authorId: string, authorName: string) => void;
}> = ({ authorId, fallbackName, onClick }) => {
  const { displayName, loading } = useUserName(authorId);
  
  const handleClick = () => {
    onClick(authorId, displayName || fallbackName);
  };

  // displayNameが取得できている場合はそれを優先、なければフォールバック名を使用
  const displayText = loading 
    ? '読み込み中...' 
    : (displayName || fallbackName);

  return (
    <button
      onClick={handleClick}
      className="text-xs text-gray-400 hover:text-primary transition-colors"
    >
      {displayText}
    </button>
  );
};

// チャンネル（ユーザー）名表示用のコンポーネント
const ChannelDisplayName: React.FC<{ userId: string; fallbackName?: string }>
  = ({ userId, fallbackName }) => {
  const { displayName, loading } = useUserName(userId);
  if (loading) return <span className="text-xs text-gray-400">読み込み中...</span>;
  return <span className="text-xs text-white text-center leading-tight">{displayName || fallbackName || 'ユーザー'}</span>;
};

// チャンネル登録者数表示用のコンポーネント
const ChannelSubscriberCount: React.FC<{ channelId: string }> = ({ channelId }) => {
  const { subscriberCount, loading } = useChannelSubscriberCount(channelId);
  if (loading) return <span className="text-xs text-gray-400">読み込み中...</span>;
  return <span className="text-xs text-gray-400">{subscriberCount.toLocaleString()}人登録</span>;
};

interface VideosPageProps {
  onVideoClick?: (videoId: string) => void;
  onUserClick?: (userId: string, displayName: string) => void;
  onDeleteVideo?: (videoId: string) => void;
  onUploadVideo?: () => void;
  onCreatorApplication?: () => void;
  onShowChannels?: () => void;
  onVideoAnalytics?: (videoId: string) => void;
  onCreatorAnalytics?: () => void;
}

export const VideosPage: React.FC<VideosPageProps> = ({ onVideoClick, onUserClick, onDeleteVideo, onUploadVideo, onCreatorApplication, onShowChannels, onVideoAnalytics, onCreatorAnalytics }) => {
  const { user, userDoc } = useAuth();
  const { videos, userVideos, deleteVideo, hasMore, loadMore, loading } = useVideos(user?.uid);
  const { userApplication } = useCreatorApplication(user?.uid);
  const { subscriptions, subscribedChannelIds: subscribedChannelIdsFromHook, subscribe, unsubscribe, isSubscribed } = useChannelSubscriptions(user?.uid);
  
  const [showChannels, setShowChannels] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscribed' | 'all'>('subscribed');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // 検索機能を実装
  const { searchQuery, setSearchQuery, filteredItems: searchedVideos } = useSearch(videos, ['title', 'description', 'tags']);

  // ユーザーが動画アップロード権限を持っているかチェック
  const canUploadVideos = userDoc?.role === 'creator' || userDoc?.role === 'admin' || userDoc?.isAdmin === true || userApplication?.status === 'approved';

  // 権限に応じた色分けのロジック
  const getPermissionColor = () => {
    if (userDoc?.isAdmin === true) {
      return 'text-green-500'; // 管理者のみ：緑色
    } else if (userDoc?.role === 'creator' || userDoc?.role === 'admin' || userApplication?.status === 'approved') {
      return 'text-blue-500'; // クリエイターと管理者：青色
    }
    return 'text-gray-500'; // その他：グレー
  };

  const permissionColor = getPermissionColor();

  // デバッグ情報をコンソールに出力
  console.log('VideosPage Debug:', {
    userUid: user?.uid,
    userDoc: userDoc,
    userRole: userDoc?.role,
    isAdmin: userDoc?.isAdmin,
    userApplication: userApplication,
    canUploadVideos: canUploadVideos
  });

  const handleVideoClick = (videoId: string) => {
    onVideoClick?.(videoId);
  };

  const handleSubscribeToggle = async (channelId: string) => {
    try {
      if (isSubscribed(channelId)) {
        await unsubscribe(channelId);
      } else {
        const channel = channels.find(ch => ch.id === channelId);
        await subscribe(channelId, channel?.name);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      alert('登録状態の変更に失敗しました');
    }
  };

  const handleUserClick = (userId: string, displayName: string) => {
    onUserClick?.(userId, displayName);
  };

  const handleChannelClick = (channelId: string) => {
    setSelectedChannel(selectedChannel === channelId ? null : channelId);
  };

  const handleUploadClick = () => {
    onUploadVideo?.();
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm('この動画を削除しますか？')) {
      try {
        await deleteVideo(videoId);
        alert('動画を削除しました');
      } catch (err) {
        console.error('Delete error:', err);
        alert('動画の削除に失敗しました');
      }
    }
  };

  // チャンネル情報を動画から生成（メモ化）
  const channels = useMemo(() => {
    return Array.from(new Set(videos.map(v => v.channelId))).map(channelId => {
      const channelVideos = videos.filter(v => v.channelId === channelId);
      const firstVideo = channelVideos[0];
      return {
        id: channelId,
        name: channelId, // 実際のユーザー名はChannelDisplayNameコンポーネントで取得
        avatar: firstVideo?.thumbnailUrl || '',
        subscriberCount: Math.floor(Math.random() * 1000) + 100,
        description: `${channelVideos.length}本の動画`,
        isSubscribed: isSubscribed(channelId)
      };
    });
  }, [videos, isSubscribed]);

  // 登録チャンネルの動画を取得（メモ化）
  const subscribedVideos = useMemo(() => {
    return searchedVideos.filter(video => subscribedChannelIdsFromHook.includes(video.channelId));
  }, [searchedVideos, subscribedChannelIdsFromHook]);

  // 選択されたチャンネルの動画を取得（メモ化）
  const selectedChannelVideos = useMemo(() => {
    if (!selectedChannel) return [];
    return searchedVideos
      .filter(video => video.channelId === selectedChannel)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchedVideos, selectedChannel]);

  // 動画を最新順にソート（メモ化）
  const sortedSubscribedVideos = useMemo(() => {
    return subscribedVideos.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [subscribedVideos]);

  const sortedAllVideos = useMemo(() => {
    return searchedVideos.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [searchedVideos]);

  // 表示する動画を決定（メモ化）
  const displayVideos = useMemo(() => {
    if (selectedChannel) return selectedChannelVideos;
    return activeTab === 'subscribed' ? sortedSubscribedVideos : sortedAllVideos;
  }, [selectedChannel, selectedChannelVideos, activeTab, sortedSubscribedVideos, sortedAllVideos]);

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-24 pt-0 fade-in">
        {/* 検索バー */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="動画を検索..."
          />
        </div>

        {/* アクションボタン */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {canUploadVideos && (
              <>
                <button
                  onClick={handleUploadClick}
                  className={`flex items-center space-x-1 px-2 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors shadow-sm whitespace-nowrap ${permissionColor}`}
                  style={{ minWidth: 'auto' }}
                >
                  <Plus size={12} />
                  <span>アップロード</span>
                </button>
                <button
                  onClick={() => onCreatorAnalytics?.()}
                  className="flex items-center space-x-1 px-2 py-2 bg-surface border border-surface-light rounded-lg text-xs font-medium hover:scale-95 active:scale-95 transition-transform shadow-sm whitespace-nowrap"
                  style={{ minWidth: 'auto' }}
                >
                  <BarChart3 size={12} />
                  <span>分析</span>
                </button>
              </>
            )}
            <button
              onClick={() => onShowChannels?.()}
              className="flex items-center space-x-1 px-2 py-2 bg-surface border border-surface-light rounded-lg text-xs font-medium hover:scale-95 active:scale-95 transition-transform shadow-sm whitespace-nowrap"
              style={{ minWidth: 'auto' }}
            >
              <Users size={12} />
              <span>チャンネル一覧</span>
            </button>
          </div>
        </div>

        {/* 動画アップロード権限がない場合の案内 */}
        {!canUploadVideos && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold mb-1">🎬 動画配信者になりませんか？</h3>
                <p className="text-xs opacity-90">動画配信の申請をして、あなたの動画を共有しましょう</p>
              </div>
              <button
                onClick={() => onCreatorApplication?.()}
                className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-xs font-medium hover:bg-opacity-30 transition-colors"
              >
                申請する
              </button>
            </div>
          </div>
        )}

        {/* 登録チャンネルアイコン一覧（YouTube風） */}
        {!showChannels && channels.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {channels.filter(ch => ch.isSubscribed).map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelClick(channel.id)}
                  className={`flex flex-col items-center space-y-2 min-w-[60px] transition-transform hover:scale-105 flex-shrink-0 ${
                    selectedChannel === channel.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-colors ${
                    selectedChannel === channel.id 
                      ? 'border-primary shadow-lg' 
                      : 'border-transparent hover:border-gray-400'
                  }`}>
                    <img
                      src={channel.avatar}
                      alt={channel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <ChannelDisplayName userId={channel.id} fallbackName={channel.name} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 選択されたチャンネル表示 */}
        {selectedChannel && !showChannels && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={channels.find(ch => ch.id === selectedChannel)?.avatar}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <div>
                <h3 className="text-sm font-bold text-white">
                  <ChannelDisplayName userId={selectedChannel} fallbackName="チャンネル" />
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedChannelVideos.length}本の動画
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedChannel(null)}
              className="text-xs text-primary hover:text-primary-light transition-colors"
            >
              すべて表示
            </button>
          </div>
        )}

        {/* タブ切り替え */}
        {!selectedChannel && (
          <div className="flex space-x-1 mb-4 bg-surface rounded-xl p-0.5">
            <button
              onClick={() => setActiveTab('subscribed')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'subscribed'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              登録チャンネル
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              すべて
            </button>
          </div>
        )}

        {/* 前広告用プレースホルダー */}
        <div className="mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold mb-1">🎬 スポンサー動画</h3>
              <p className="text-xs opacity-90">車・バイク関連の動画広告</p>
            </div>
            <Play size={20} />
          </div>
        </div>

        {showChannels ? (
          /* チャンネル一覧 */
          <div key="channels" className="space-y-3 fade-in">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="bg-surface rounded-xl border border-surface-light p-4 cursor-pointer hover:scale-95 active:scale-95 transition-transform shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={channel.avatar}
                    alt={channel.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{channel.name}</h3>
                    <p className="text-xs text-gray-400">{channel.subscriberCount.toLocaleString()}人登録</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{channel.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubscribeToggle(channel.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      channel.isSubscribed
                        ? 'bg-gray-600 text-white'
                        : 'bg-primary text-white'
                    }`}
                  >
                    {channel.isSubscribed ? '登録済み' : '登録'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 最適化された動画グリッド */
          <OptimizedVideoGrid
            key={`${activeTab}-${selectedChannel ?? 'none'}`}
            videos={displayVideos as any}
            channels={channels}
            currentUserId={user?.uid}
            onVideoClick={handleVideoClick}
            onUserClick={handleUserClick}
            onVideoAnalytics={onVideoAnalytics}
            onDeleteVideo={handleDeleteVideo}
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={loading}
            enableVirtualScroll={displayVideos.length > 20}
            enableInfiniteScroll={true}
            enablePreloading={true}
          />
        )}

        {/* 無限スクロール用のプレースホルダー */}
        {!showChannels && displayVideos.length > 0 && (
          <div className="text-center py-8">
            <div className="text-sm text-gray-400">さらに読み込み中...</div>
          </div>
        )}
      </main>
    </div>
  );
};
