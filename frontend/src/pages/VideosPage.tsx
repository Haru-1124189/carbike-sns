import { Play, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { SectionTitle } from '../components/ui/SectionTitle';
import { channels, currentUser, videos } from '../data/dummy';

interface VideosPageProps {
  onVideoClick?: (videoId: string) => void;
  onUserClick?: (author: string) => void;
  onDeleteVideo?: (videoId: string) => void;
}

export const VideosPage: React.FC<VideosPageProps> = ({ onVideoClick, onUserClick, onDeleteVideo }) => {
  const [showChannels, setShowChannels] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscribed' | 'all'>('subscribed');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const handleVideoClick = (videoId: string) => {
    onVideoClick?.(videoId);
  };

  const handleSubscribeToggle = (channelId: string) => {
    console.log('Subscribe toggle:', channelId);
  };

  const handleUserClick = (author: string) => {
    onUserClick?.(author);
  };

  const handleChannelClick = (channelId: string) => {
    setSelectedChannel(selectedChannel === channelId ? null : channelId);
  };

  // 登録チャンネルの動画を取得
  const subscribedChannelIds = channels.filter(ch => ch.isSubscribed).map(ch => ch.id);
  const subscribedVideos = videos.filter(video => subscribedChannelIds.includes(video.channelId));
  const allVideos = videos;

  // 選択されたチャンネルの動画を取得（最新順）
  const selectedChannelVideos = selectedChannel 
    ? videos
        .filter(video => video.channelId === selectedChannel)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // 動画を最新順にソート
  const sortedSubscribedVideos = subscribedVideos.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedAllVideos = allVideos.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const displayVideos = selectedChannel 
    ? selectedChannelVideos 
    : (activeTab === 'subscribed' ? sortedSubscribedVideos : sortedAllVideos);

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader
        user={{ id: "1", name: "RevLinkユーザー", avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U", cars: [], interestedCars: [] }}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-20 pt-0 fade-in">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title="動画一覧" />
          <button
            onClick={() => setShowChannels(!showChannels)}
            className="flex items-center space-x-2 px-3 py-2 bg-surface border border-surface-light rounded-xl text-sm font-medium hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <Users size={16} />
            <span>チャンネル一覧</span>
          </button>
        </div>

        {/* 登録チャンネルアイコン一覧（YouTube風） */}
        {!showChannels && (
          <div className="mb-6">
            <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {channels.filter(ch => ch.isSubscribed).map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelClick(channel.id)}
                  className={`flex flex-col items-center space-y-2 min-w-[60px] transition-transform hover:scale-105 ${
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
                  <span className="text-xs text-white text-center leading-tight">
                    {channel.name}
                  </span>
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
                  {channels.find(ch => ch.id === selectedChannel)?.name}
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
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'subscribed'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              登録チャンネル
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
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
          /* 動画グリッド - 横に2つずつ */
          <div key={`${activeTab}-${selectedChannel ?? 'none'}`} className="grid grid-cols-2 gap-3 fade-in">
            {displayVideos.map((video) => {
              const channel = channels.find(ch => ch.id === video.channelId);
              return (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video.id)}
                  className="cursor-pointer hover:scale-95 active:scale-95 transition-transform"
                >
                  {/* サムネイル */}
                  <div className="relative mb-2">
                    <div className="w-full h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <Play size={20} className="text-white relative z-10" />
                      {/* 背景装飾 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
                    </div>
                    {/* 再生時間 */}
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                      {video.duration}
                    </div>
                    {/* 登録チャンネルバッジ */}
                    {channel?.isSubscribed && (
                      <div className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">
                        登録済み
                      </div>
                    )}
                    {/* ホバー時の再生ボタン */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                        <Play size={12} className="text-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* 動画情報 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white line-clamp-2 leading-tight flex-1">{video.title}</h3>
                      {video.author === currentUser.name && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('この動画を削除しますか？')) {
                              onDeleteVideo?.(video.id);
                            }
                          }}
                          className="p-1 rounded-full hover:bg-red-500 hover:bg-opacity-20 transition-colors ml-1 flex-shrink-0"
                          title="削除"
                        >
                          <Trash2 size={12} className="text-red-400 hover:text-red-300" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(video.author);
                      }}
                      className="text-xs text-gray-400 hover:text-primary transition-colors"
                    >
                      {video.author}
                    </button>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>{video.views.toLocaleString()}回</span>
                      <span>•</span>
                      <span>{video.uploadedAt}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 無限スクロール用のプレースホルダー */}
        {!showChannels && (
          <div className="text-center py-8">
            <div className="text-sm text-gray-400">さらに読み込み中...</div>
          </div>
        )}
      </main>
    </div>
  );
};
