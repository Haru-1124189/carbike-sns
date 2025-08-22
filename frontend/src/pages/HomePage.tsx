import { Car, HelpCircle, MessageSquare, Play, TrendingUp, Wrench } from 'lucide-react';
import React from 'react';
import { MotoIcon } from '../components/icons/MotoIcon';
import { AppHeader } from '../components/ui/AppHeader';
import { Card } from '../components/ui/Card';
import { SearchBar } from '../components/ui/SearchBar';
import { Section } from '../components/ui/Section';
import { SectionTitle } from '../components/ui/SectionTitle';
import { VehicleCard } from '../components/ui/VehicleCard';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useSearch } from '../hooks/useSearch';
import { useThreads } from '../hooks/useThreads';
import { useVehicles } from '../hooks/useVehicles';
import { useVideos } from '../hooks/useVideos';

interface HomePageProps {
  onThreadClick?: (threadId: string) => void;
  onNotificationClick?: () => void;
  onAddVehicleClick?: () => void;
  onViewAllThreads?: () => void;
  onQuickAction?: (actionId: string) => void;
  onVehicleClick?: (vehicleId: string) => void;
  onShowCarList?: () => void;
  onShowRegisteredCars?: () => void;
  onDeleteThread?: (threadId: string) => void;
  onVideoClick?: (videoId: string) => void;
  onViewAllVideos?: () => void;
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
  onShowCarList,
  onShowRegisteredCars,
  onDeleteThread,
  onVideoClick,
  onViewAllVideos,
  blockedUsers = [],
  onBlockUser,
  onReportThread,
  interestedCars = []
}) => {
  const { user, userDoc } = useAuth();
  const { threads } = useThreads();
  const { videos } = useVideos(user?.uid);
  const { unreadCount } = useNotifications();
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles();
  
  // 車両データのデバッグログ
  console.log('HomePage - Vehicles data:', {
    vehicles,
    vehiclesLoading,
    vehiclesError,
    vehiclesLength: vehicles.length
  });
  
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
                          {/* 広告カード */}
         <div className="rounded-2xl bg-orange-500/20 border border-orange-400/30 text-orange-200 p-4 m-4">
           <div className="flex items-center justify-between">
             <div>
               <div className="text-sm font-medium">おすすめ車種</div>
               <div className="text-xs opacity-80">あなたにおすすめの車種をご紹介</div>
             </div>
             <div className="text-xs opacity-60">AD</div>
           </div>
         </div>

                   <main className="px-4 pb-32 pt-0 fade-in">
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
           <Section spacing="md" className="mb-4">
             <SectionTitle title="クイックアクション" />
                           <div className="flex justify-center space-x-6 mb-6">
                                                               <button
                   onClick={() => handleQuickAction('post')}
                   className="p-4 rounded-full bg-surface border border-surface-light text-text-primary hover:scale-105 transition-all duration-300"
                 >
                   <MessageSquare size={20} />
                 </button>
               <button
                 onClick={() => handleQuickAction('question')}
                 className="p-4 rounded-full bg-surface border border-surface-light text-text-primary hover:scale-105 transition-all duration-300"
               >
                 <HelpCircle size={20} />
               </button>
               <button
                 onClick={() => handleQuickAction('maintenance')}
                 className="p-4 rounded-full bg-surface border border-surface-light text-text-primary hover:scale-105 transition-all duration-300"
               >
                 <Wrench size={20} />
               </button>
             </div>
           </Section>

          {/* 車種関連ボタン */}
          <Section spacing="md" className="mb-6">
            <div className="grid grid-cols-2 gap-3">
              <Card onClick={() => onShowCarList?.()}>
                <div className="flex items-center justify-center space-x-2">
                  <Car size={20} className="text-primary" />
                  <span className="text-sm font-medium text-text-primary">車種一覧</span>
                </div>
                <p className="text-xs text-text-secondary mt-1 text-center">すべての車種を確認</p>
              </Card>
              <Card onClick={() => onShowRegisteredCars?.()}>
                <div className="flex items-center justify-center space-x-2">
                  <MotoIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-text-primary">お気に入り車種</span>
                </div>
                <p className="text-xs text-text-secondary mt-1 text-center">登録済み車種を管理</p>
              </Card>
            </div>
          </Section>



          {/* 最新動画 */}
          <Section spacing="md" className="mb-6">
            <SectionTitle
              title="最新動画"
              action={{ label: "すべて見る", onClick: handleViewAllVideos }}
            />
            <div className="space-y-3">
              {videos
                .slice(0, 2)
                .map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video.id)}
                    className="bg-surface rounded-xl border border-surface-light p-3 cursor-pointer hover:scale-95 active:scale-95 transition-transform shadow-sm"
                  >
                    <div className="flex space-x-3">
                      {/* サムネイル */}
                      <div className="relative w-24 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={video.thumbnailUrl || 'https://via.placeholder.com/96x64/666666/FFFFFF?text=Video'}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <Play size={16} className="text-white" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                          {video.duration || '0:00'}
                        </div>
                      </div>
                      
                      {/* 動画情報 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate mb-1">
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-400 mb-1">
                          {video.author}
                        </p>
                        <p className="text-xs text-gray-500">
                          {video.views?.toLocaleString() || '0'} 回視聴 • {video.uploadedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              
              {videos.length === 0 && (
                <div className="text-center py-8">
                  <Play size={48} className="text-gray-400 mx-auto mb-4" />
                  <div className="text-sm font-medium text-white mb-2">動画がありません</div>
                  <div className="text-xs text-gray-400">動画配信者による動画をお待ちください</div>
                </div>
              )}
            </div>
          </Section>

          {/* トレンド */}
          <Section spacing="md">
            <SectionTitle title="トレンド" />
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp size={16} className="text-primary" />
                  <span className="text-sm font-medium text-text-primary">人気の車種</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-text-secondary">1. Nissan S13</div>
                  <div className="text-xs text-text-secondary">2. Toyota AE86</div>
                  <div className="text-xs text-text-secondary">3. Honda S2000</div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center space-x-2 mb-2">
                  <Car size={16} className="text-primary" />
                  <span className="text-sm font-medium text-text-primary">新着情報</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-text-secondary">• 新車種リリース</div>
                  <div className="text-xs text-text-secondary">• イベント情報</div>
                  <div className="text-xs text-text-secondary">• メンテナンス</div>
                </div>
              </Card>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
};
