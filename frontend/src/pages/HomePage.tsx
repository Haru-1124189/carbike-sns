import { Car, HelpCircle, MessageSquare, TrendingUp, Wrench } from 'lucide-react';
import React from 'react';
import { MotoIcon } from '../components/icons/MotoIcon';
import { AppHeader } from '../components/ui/AppHeader';
import { Card } from '../components/ui/Card';
import { Section } from '../components/ui/Section';
import { SectionTitle } from '../components/ui/SectionTitle';
import { ThreadCard } from '../components/ui/ThreadCard';
import { VehicleCard } from '../components/ui/VehicleCard';
import { currentUser, notifications, threads } from '../data/dummy';

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
  blockedUsers = [],
  onBlockUser,
  onReportThread,
  interestedCars = []
}) => {
  // interestedCars is controlled by parent via props now

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

         <main className="px-4 pb-20 pt-0 fade-in">
           {/* ユーザー情報 */}
                       <AppHeader
              user={currentUser}
              onNotificationClick={handleNotificationClick}
              onProfileClick={() => console.log('Profile clicked')}
              showLogo={true}
              showActions={true}
              unreadNotifications={notifications.filter(n => !n.isRead).length}
            />

           {/* 愛車セクション */}
           <Section spacing="md">
            <SectionTitle
              title="愛車"
              action={{ label: "追加", onClick: handleAddVehicleClick }}
            />
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
              {currentUser.cars.map((car) => (
                <div key={car} className="flex-shrink-0 snap-start">
                  <VehicleCard
                    car={car}
                    onClick={() => handleVehicleClick(car)}
                  />
                </div>
              ))}
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
          <Section spacing="md">
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



          {/* 最新スレッド */}
          <Section spacing="md">
            <SectionTitle
              title="最新スレッド"
              action={{ label: "すべて見る", onClick: handleViewAllThreads }}
            />
            <div className="space-y-2">
              {threads
                .filter(thread => !blockedUsers.includes(thread.author))
                .slice(0, 3)
                .map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    onClick={() => handleThreadClick(thread.id)}
                    onDelete={onDeleteThread}
                    onBlockUser={onBlockUser}
                    onReportThread={onReportThread}
                  />
                ))}
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
