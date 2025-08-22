import { ArrowLeft, MessageSquare, User, Wrench } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { ThreadCard } from '../components/ui/ThreadCard';
import { VehicleCard } from '../components/ui/VehicleCard';
import { Thread, User as UserType } from '../types';

type ProfileTab = 'posts' | 'questions' | 'maintenance';

interface UserProfilePageProps {
  user: UserType;
  onBackClick?: () => void;
  onThreadClick?: (threadId: string) => void;
  onVehicleClick?: (vehicleId: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  user,
  onBackClick,
  onThreadClick,
  onVehicleClick
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  // ダミーデータとして、このユーザーの投稿を生成
  const userPosts: Thread[] = [
    {
      id: "user1",
      title: `${user.name}の投稿`,
      content: "これは他のユーザーの投稿です。",
      author: user.name,
      replies: 5,
      likes: 12,
      tags: ["カスタム", "メンテナンス"],
      createdAt: "2日前",
      type: "post"
    },
    {
      id: "user2",
      title: `${user.name}の質問`,
      content: "これは他のユーザーの質問です。",
      author: user.name,
      replies: 8,
      likes: 3,
      tags: ["質問", "初心者"],
      createdAt: "1日前",
      type: "question"
    }
  ];

  const userQuestions = userPosts.filter(thread => thread.type === 'question');
  const userPostThreads = userPosts.filter(thread => thread.type === 'post');

  const handleThreadClick = (threadId: string) => {
    onThreadClick?.(threadId);
  };

  const handleVehicleClick = (vehicleId: string) => {
    onVehicleClick?.(vehicleId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {userPostThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => handleThreadClick(thread.id)}
              />
            ))}
          </div>
        );
      case 'questions':
        return (
          <div className="space-y-4">
            {userQuestions.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => handleThreadClick(thread.id)}
              />
            ))}
          </div>
        );
      case 'maintenance':
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-sm text-gray-400">メンテナンス記録は非公開です</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        <AppHeader
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={() => console.log('Profile clicked')}
        />
        
        <main className="px-4 pb-24 pt-0">
          <BannerAd />
          
          {/* 戻るボタン */}
          <div className="flex items-center space-x-3 mb-4 mt-4">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <span className="text-base text-text-primary font-medium">{user.name}のプロフィール</span>
          </div>

          {/* プロフィール情報 */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user.name}</h2>
              <p className="text-sm text-gray-400">車・バイク愛好家</p>
            </div>
          </div>

          {/* 愛車 */}
          {user.cars.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-white mb-3">愛車</h3>
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {user.cars.map((car) => (
                  <VehicleCard
                    key={car}
                    car={car}
                    onClick={() => handleVehicleClick(car)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* タブ切り替え */}
          <div className="flex space-x-1 mb-6 bg-surface rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'posts'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare size={16} />
              <span>投稿</span>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'questions'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare size={16} />
              <span>質問</span>
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'maintenance'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wrench size={16} />
              <span>整備記録</span>
            </button>
          </div>

          <div key={activeTab} className="fade-in">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
