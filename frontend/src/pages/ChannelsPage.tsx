import { ArrowLeft, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { ClickableUserName } from '../components/ui/ClickableUserName';
import { TabBar } from '../components/ui/TabBar';
import { useAuth } from '../hooks/useAuth';
import { useChannelSubscriberCount, useChannelSubscriptions } from '../hooks/useChannelSubscriptions';
import { useUserName } from '../hooks/useUserName';
import { useVideos } from '../hooks/useVideos';

// チャンネル名表示用のコンポーネント
const ChannelNameDisplay: React.FC<{ userId: string; fallbackName?: string }> = ({ userId, fallbackName }) => {
  const { displayName, loading } = useUserName(userId);
  if (loading) return <span className="text-sm font-bold text-white">読み込み中...</span>;
  return <span className="text-sm font-bold text-white">{displayName || fallbackName || 'ユーザー'}</span>;
};

// チャンネル説明表示用のコンポーネント
const ChannelDescriptionDisplay: React.FC<{ userId: string; videoCount: number }> = ({ userId, videoCount }) => {
  const { displayName, loading } = useUserName(userId);
  if (loading) return <span className="text-xs text-gray-500 mt-1 line-clamp-2">読み込み中...</span>;
  const userName = displayName || 'ユーザー';
  return <span className="text-xs text-gray-500 mt-1 line-clamp-2">{userName}のチャンネル</span>;
};

// チャンネル登録者数表示用のコンポーネント
const ChannelSubscriberCountDisplay: React.FC<{ channelId: string; videoCount: number }> = ({ channelId, videoCount }) => {
  const { subscriberCount, loading } = useChannelSubscriberCount(channelId);
  if (loading) return <span className="text-xs text-gray-400 mt-1">読み込み中...</span>;
  return <span className="text-xs text-gray-400 mt-1">{subscriberCount.toLocaleString()}人登録 • {videoCount}本の動画</span>;
};

interface Channel {
  id: string;
  name: string;
  avatar: string;
  subscriberCount: number;
  description: string;
  isSubscribed: boolean;
  videoCount: number;
}

interface ChannelsPageProps {
  onBack?: () => void;
  onChannelClick?: (channelId: string) => void;
  onTabChange?: (tabId: string) => void;
  activeTab?: string;
  onUserClick?: (userId: string, displayName?: string) => void;
}

export const ChannelsPage: React.FC<ChannelsPageProps> = ({ onBack, onChannelClick, onTabChange, activeTab = 'videos', onUserClick }) => {
  const { user, userDoc } = useAuth();
  const { videos } = useVideos(user?.uid);
  const { subscribe, unsubscribe, isSubscribed } = useChannelSubscriptions(user?.uid);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  // 動画配信を許可されたユーザー（配信チャンネル）を取得
  useEffect(() => {
    if (videos.length > 0) {
      // 動画からチャンネル情報を生成
      const channelMap = new Map<string, Channel>();
      
      videos.forEach(video => {
        if (!channelMap.has(video.channelId)) {
          channelMap.set(video.channelId, {
            id: video.channelId,
            name: video.channelId, // 実際のユーザー名はChannelNameDisplayコンポーネントで取得
            avatar: video.thumbnailUrl || '',
            subscriberCount: Math.floor(Math.random() * 5000) + 100, // ダミーデータ
            description: `${video.channelId}のチャンネル`, // 実際の説明はChannelDescriptionDisplayコンポーネントで取得
            isSubscribed: isSubscribed(video.channelId),
            videoCount: videos.filter(v => v.channelId === video.channelId).length
          });
        } else {
          // 既存のチャンネルの動画数を更新
          const existingChannel = channelMap.get(video.channelId)!;
          existingChannel.videoCount = videos.filter(v => v.channelId === video.channelId).length;
        }
      });

      setChannels(Array.from(channelMap.values()));
    }
    setLoading(false);
  }, [videos, isSubscribed]);

  const handleSubscribeToggle = async (channelId: string) => {
    console.log('Subscribe toggle clicked for channel:', channelId);
    console.log('Current user:', user?.uid);
    console.log('Current subscription status:', isSubscribed(channelId));
    
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    try {
      if (isSubscribed(channelId)) {
        console.log('Unsubscribing from channel:', channelId);
        await unsubscribe(channelId);
        console.log('Successfully unsubscribed');
      } else {
        console.log('Subscribing to channel:', channelId);
        const channel = channels.find(ch => ch.id === channelId);
        await subscribe(channelId, channel?.name);
        console.log('Successfully subscribed');
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`登録状態の変更に失敗しました: ${errorMessage}`);
    }
  };

  const handleChannelClick = (channelId: string) => {
    onChannelClick?.(channelId);
  };

  const handleUserClick = (userId: string, displayName: string) => {
    onUserClick?.(userId, displayName);
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-24 pt-0 fade-in">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm mr-3"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">チャンネル一覧</h1>
        </div>

        {/* 説明 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Users size={20} />
            <h3 className="text-sm font-bold">配信チャンネル</h3>
          </div>
          <p className="text-xs opacity-90">動画配信を許可されたユーザーのチャンネル一覧です</p>
        </div>

        {/* チャンネル一覧 */}
        {loading ? (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-white mb-2">チャンネルを読み込み中...</div>
            <div className="text-sm text-gray-400">しばらくお待ちください</div>
          </div>
        ) : channels.length > 0 ? (
          <div className="space-y-3">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="bg-surface rounded-xl border border-surface-light p-4 cursor-pointer hover:scale-95 active:scale-95 transition-transform shadow-sm"
                onClick={() => handleChannelClick(channel.id)}
              >
                <div className="flex items-center space-x-3">
                  {/* チャンネルアバター */}
                  <div className="relative">
                    <img
                      src={channel.avatar || '/api/placeholder/48x48/666666/FFFFFF?text=CH'}
                      alt={channel.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {channel.isSubscribed && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>

                  {/* チャンネル情報 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      <ClickableUserName 
                        userId={channel.id} 
                        fallbackName="チャンネル"
                        size="sm"
                        showAvatar={false}
                        onClick={(userId, displayName) => {
                          handleUserClick(userId, displayName);
                        }}
                        className="hover:text-primary transition-colors"
                      />
                    </h3>
                    <ChannelSubscriberCountDisplay channelId={channel.id} videoCount={channel.videoCount} />
                    <ChannelDescriptionDisplay userId={channel.id} videoCount={channel.videoCount} />
                  </div>

                  {/* 登録ボタン */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubscribeToggle(channel.id);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                      channel.isSubscribed
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-primary text-white hover:bg-primary/80'
                    }`}
                  >
                    {channel.isSubscribed ? '登録済み' : '登録'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-white mb-2">配信チャンネルがありません</div>
            <div className="text-sm text-gray-400">動画配信を許可されたユーザーがいません</div>
          </div>
        )}

        {/* フッター情報 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            チャンネルを登録すると、新しい動画がアップロードされた際に通知を受け取ることができます
          </p>
        </div>
      </main>
      
      {/* タブバー */}
      <TabBar activeTab={activeTab} onTabChange={onTabChange || (() => {})} />
    </div>
  );
};

