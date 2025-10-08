import { ExternalLink, HelpCircle, MessageSquare, Play, Users, Wrench } from 'lucide-react';
import React, { useState } from 'react';
import { MotoIcon } from '../components/icons/MotoIcon';
import { AppHeader } from '../components/ui/AppHeader';
import { Card } from '../components/ui/Card';
import { InAppBrowser } from '../components/ui/InAppBrowser';
import { SearchBar } from '../components/ui/SearchBar';
import { Section } from '../components/ui/Section';
import { SectionTitle } from '../components/ui/SectionTitle';
import { VehicleCard } from '../components/ui/VehicleCard';
import { useAuth } from '../hooks/useAuth';
import { useNews } from '../hooks/useNews';
import { useSearch } from '../hooks/useSearch';
import { useThreads } from '../hooks/useThreads';
import { useVehicles } from '../hooks/useVehicles';
import { useVideos } from '../hooks/useVideos';
import { NewsItem } from '../types';

interface HomePageProps {
  onThreadClick?: (threadId: string) => void;
  onNotificationClick?: () => void;
  onAddVehicleClick?: () => void;
  onViewAllThreads?: () => void;
  onQuickAction?: (actionId: string) => void;
  onVehicleClick?: (vehicleId: string) => void;

  onShowRegisteredCars?: () => void;
  onDeleteThread?: (threadId: string) => void;
  onVideoClick?: (videoId: string) => void;
  onViewAllVideos?: () => void;
  onTouringChatClick?: () => void;
  blockedUsers?: string[];
  onBlockUser?: (author: string) => void;
  onReportThread?: (threadId: string, author: string) => void;
  interestedCars?: string[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onThreadClick,
  onNotificationClick,
  onAddVehicleClick,
  onViewAllThreads,
  onQuickAction,
  onVehicleClick,

  onShowRegisteredCars,
  onDeleteThread,
  onVideoClick,
  onViewAllVideos,
  onTouringChatClick,
  blockedUsers = [],
  onBlockUser,
  onReportThread,
  interestedCars = []
}) => {
  const { news, loading: newsLoading, error: newsError } = useNews(24);
  const { user, userDoc } = useAuth();
  const { threads } = useThreads();
  const { videos } = useVideos(user?.uid);
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  
  // アプリ内ブラウザの状態管理
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);


  const handleNewsClick = (newsItem: NewsItem) => {
    setSelectedNewsItem(newsItem);
  };

  const handleCloseBrowser = () => {
    setSelectedNewsItem(null);
  };
  
  // 検索機能を実装
  const { searchQuery, setSearchQuery, filteredItems: searchedThreads } = useSearch(threads, ['title', 'content', 'tags']);

  const handleThreadClick = (threadId: string) => {
    onThreadClick?.(threadId);
  };

  const handleNotificationClick = () => {
    onNotificationClick?.();
  };

  const handleAddVehicleClick = () => {
    onAddVehicleClick?.();
  };

  const handleViewAllThreads = () => {
    onViewAllThreads?.();
  };

  const handleVideoClick = (videoId: string) => {
    onVideoClick?.(videoId);
  };

  const handleViewAllVideos = () => {
    onViewAllVideos?.();
  };

  const handleTouringChatClick = () => {
    onTouringChatClick?.();
  };

  const handleQuickAction = (actionId: string) => {
    onQuickAction?.(actionId);
  };

  const handleVehicleClick = (vehicleId: string) => {
    onVehicleClick?.(vehicleId);
  };

  // interestedCarsの登録・削除は親(App)で管理

  return (
         <div className="min-h-screen bg-background">
       <div className="max-w-[420px] mx-auto">
                   <main className="p-4 pb-32 pt-4 fade-in">
                     {/* ユーザー情報 */}
          <AppHeader
            user={{
              id: user?.uid || '', 
              name: userDoc?.displayName || user?.displayName || 'ユーザー', 
              avatar: userDoc?.photoURL || user?.photoURL || '', 
              cars: userDoc?.cars || [], 
              interestedCars: userDoc?.interestedCars || [] 
            }}
            onNotificationClick={handleNotificationClick}
            onProfileClick={() => console.log('Profile clicked')}
            showLogo={true}
            showNotification={true}
            showUserName={true}
            showProfileButton={false}
          />

          {/* 検索バー */}
          <div className="px-4 pb-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="投稿を検索..."
            />
          </div>

           {/* 愛車セクション */}
           <Section spacing="md" className="mb-6">
            <SectionTitle
              title="愛車"
              action={{ label: "追加", onClick: handleAddVehicleClick }}
            />
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {vehiclesLoading ? (
                <div className="text-center py-4 w-full">
                  <div className="text-sm text-gray-400">読み込み中...</div>
                </div>
              ) : vehicles && vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    car={{
                      id: vehicle.id,
                      name: vehicle.name,
                      image: vehicle.image,
                      type: vehicle.type
                    }}
                    onClick={() => handleVehicleClick(vehicle.id)}
                  />
                ))
              ) : (
                <div className="text-center py-4 w-full">
                  <div className="text-sm text-gray-400">愛車がありません</div>
                </div>
              )}
            </div>
          </Section>

            {/* クイックアクション */}
            <Section spacing="md" className="mb-6">
              {/* 横線 */}
              <div className="flex items-center mb-8">
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <div className="flex justify-center space-x-6">
                <Card className="p-4 rounded-full hover:bg-surface-light transition-colors">
                  <button
                    onClick={() => handleQuickAction('post')}
                    className="text-text-primary"
                  >
                    <MessageSquare size={24} />
                  </button>
                </Card>
                <Card className="p-4 rounded-full hover:bg-surface-light transition-colors">
                  <button
                    onClick={() => handleQuickAction('question')}
                    className="text-text-primary"
                  >
                    <HelpCircle size={24} />
                  </button>
                </Card>
                <Card className="p-4 rounded-full hover:bg-surface-light transition-colors">
                  <button
                    onClick={() => handleQuickAction('maintenance')}
                    className="text-text-primary"
                  >
                    <Wrench size={24} />
                  </button>
                </Card>
                <Card className="p-4 rounded-full hover:bg-surface-light transition-colors">
                  <button
                    onClick={handleTouringChatClick}
                    className="text-text-primary"
                  >
                    <Users size={24} />
                  </button>
                </Card>
              </div>
            </Section>

          {/* お気に入り車種ボタン */}
          <Section spacing="md" className="mb-6">
            <Card 
              onClick={() => onShowRegisteredCars?.()}
              className="cursor-pointer hover:bg-surface-light transition-colors"
            >
              <div className="flex items-center justify-center space-x-2">
                <MotoIcon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-text-primary">お気に入り車種</span>
              </div>
              <p className="text-xs text-text-secondary mt-1 text-center">車種を検索・登録・管理</p>
            </Card>
          </Section>

          {/* 最新動画 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">最新動画</h2>
              <button
                onClick={handleViewAllVideos}
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                すべて見る
              </button>
            </div>
            {(() => {
              // 最大12個まで表示
              const videosToShow = videos.slice(0, 12);
              
              if (videosToShow.length === 0) {
                return (
                  <div className="text-center py-8">
                    <Play size={48} className="text-text-secondary mx-auto mb-4" />
                    <div className="text-sm font-medium text-text-primary mb-2">動画がありません</div>
                    <div className="text-xs text-text-secondary">動画配信者による動画をお待ちください</div>
                  </div>
                );
              }
              
              return (
                <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
                  {Array.from({ length: Math.ceil(videosToShow.length / 4) }, (_, groupIndex) => {
                    const startIndex = groupIndex * 4;
                    const endIndex = Math.min(startIndex + 4, videosToShow.length);
                    const groupVideos = videosToShow.slice(startIndex, endIndex);
                    
                    return (
                      <div key={groupIndex} className="flex-shrink-0 w-80">
                        <div className="grid grid-cols-2 gap-3">
                          {groupVideos.map((video) => (
                            <div
                              key={video.id}
                              onClick={() => handleVideoClick(video.id)}
                              className="p-2 hover:bg-surface-light rounded-lg transition-colors cursor-pointer"
                            >
                              <div className="space-y-2">
                                {/* サムネイル */}
                                <div className="w-full h-20 rounded-lg overflow-hidden bg-surface-light relative">
                                  <img
                                    src={video.thumbnailUrl || 'https://via.placeholder.com/96x64/666666/FFFFFF?text=Video'}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                    <Play size={12} className="text-white" />
                                  </div>
                                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-[8px] px-1 rounded">
                                    {video.duration || '0:00'}
                                  </div>
                                </div>
                                
                                {/* テキストコンテンツ */}
                                <div className="space-y-1">
                                  <h3 className="text-[10px] font-semibold text-text-primary line-clamp-2 leading-tight">
                                    {video.title}
                                  </h3>
                                  <p className="text-[8px] text-text-secondary line-clamp-1 leading-tight">
                                    {video.author} • {video.views?.toLocaleString() || '0'}回視聴
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* ニュース */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-text-primary mb-6">車・バイクニュース</h2>
            {newsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-text-secondary">ニュースを読み込み中...</p>
              </div>
            ) : newsError ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-400 mb-4">ニュースの読み込みに失敗しました</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
                >
                  再読み込み
                </button>
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-text-secondary">ニュースがありません</p>
              </div>
            ) : (() => {
              // サムネイルがある記事のみをフィルタリング
              const allNewsWithThumbnails = news.filter(item => item.thumbnailUrl);
              
              // 4の倍数になるように調整（各グループ4個ずつにするため）
              const groupCount = Math.floor(allNewsWithThumbnails.length / 4) * 4;
              const newsWithThumbnails = allNewsWithThumbnails.slice(0, groupCount);
              
              // デバッグ: フィルタリング結果を確認
              console.log('全記事数:', news.length);
              console.log('サムネイル付き記事数:', allNewsWithThumbnails.length);
              console.log('4の倍数調整後の記事数:', newsWithThumbnails.length);
              
              if (newsWithThumbnails.length === 0) {
                return (
                  <div className="text-center py-8">
                    <p className="text-sm text-text-secondary">サムネイル付きニュースがありません</p>
                  </div>
                );
              }
              
              return (
                <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
                  {Array.from({ length: Math.ceil(newsWithThumbnails.length / 4) }, (_, groupIndex) => {
                    const startIndex = groupIndex * 4;
                    const endIndex = Math.min(startIndex + 4, newsWithThumbnails.length);
                    const groupItems = newsWithThumbnails.slice(startIndex, endIndex);
                    
                    return (
                      <div key={groupIndex} className="flex-shrink-0 w-80">
                        <div className="grid grid-cols-2 gap-3">
                          {groupItems.map((newsItem) => (
                          <div
                            key={newsItem.id}
                            onClick={() => handleNewsClick(newsItem)}
                            className="p-2 hover:bg-surface-light rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="space-y-2">
                              {/* サムネイル */}
                              <div className="w-full h-20 rounded-lg overflow-hidden bg-surface-light relative">
                                <img
                                  src={newsItem.thumbnailUrl}
                                  alt={newsItem.title}
                                  className="w-full h-full object-cover"
                                  onLoad={() => {
                                    // デバッグログはコンソールのみに出力
                                    console.log('画像読み込み成功:', newsItem.thumbnailUrl);
                                  }}
                                  onError={(e) => {
                                    console.log('画像読み込みエラー:', {
                                      title: newsItem.title,
                                      thumbnailUrl: newsItem.thumbnailUrl,
                                      error: e
                                    });
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-image');
                                    if (fallback) {
                                      fallback.classList.remove('hidden');
                                    }
                                  }}
                                />
                                {/* エラー時のフォールバック（初期は非表示） */}
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center absolute inset-0 hidden fallback-image">
                                  <div className="text-center">
                                    <ExternalLink size={20} className="text-white mb-1 mx-auto" />
                                    <div className="text-[8px] text-white font-medium">ニュース</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* テキストコンテンツ */}
                              <div className="space-y-1">
                                <h3 className="text-[10px] font-semibold text-text-primary line-clamp-2 leading-tight">
                                  {newsItem.title}
                                </h3>
                                <p className="text-[8px] text-text-secondary line-clamp-1 leading-tight">
                                  {newsItem.summary}
                                </p>
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>





        </main>
      </div>
      
      {/* アプリ内ブラウザ */}
      {selectedNewsItem && (
        <InAppBrowser
          url={selectedNewsItem.link}
          title={selectedNewsItem.title}
          onClose={handleCloseBrowser}
        />
      )}
    </div>
  );
};
