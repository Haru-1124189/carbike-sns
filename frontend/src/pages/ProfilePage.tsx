import { Camera, MessageSquare, Wrench } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { SectionTitle } from '../components/ui/SectionTitle';
import { ThreadCard } from '../components/ui/ThreadCard';
import { VehicleCard } from '../components/ui/VehicleCard';
import { currentUser, myGarage, threadAds, threads } from '../data/dummy';
import { useAuth } from '../hooks/useAuth';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { uploadToStorage } from '../lib/upload';

type ProfileTab = 'posts' | 'questions' | 'maintenance';

interface ProfilePageProps {
  onSettingsClick?: () => void;
  onThreadClick?: (threadId: string) => void;
  onAddVehicleClick?: () => void;
  onVehicleClick?: (vehicleId: string) => void;
  onMaintenanceClick?: (maintenanceId: string) => void;
  onDeleteThread?: (threadId: string) => void;
  blockedUsers?: string[];
  onBlockUser?: (author: string) => void;
  onReportThread?: (threadId: string, author: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onSettingsClick,
  onThreadClick,
  onAddVehicleClick,
  onVehicleClick,
  onMaintenanceClick,
  onDeleteThread,
  blockedUsers = [],
  onBlockUser,
  onReportThread
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const { user, userDoc, updateUserDoc } = useAuth();

  // スワイプバック機能を有効化（プロフィールページでは無効）
  // useSwipeBack();

  // 自分の投稿と質問のみをフィルタリング
  const userPosts = threads.filter(thread => 
    thread.type === 'post' && thread.author === currentUser.name
  );
  const userQuestions = threads.filter(thread => 
    thread.type === 'question' && thread.author === currentUser.name
  );

  // スレッドと広告を組み合わせて表示
  const displayItems = useMemo(() => {
    let filteredThreads: any[] = [];
    
    switch (activeTab) {
      case 'posts':
        filteredThreads = userPosts;
        break;
      case 'questions':
        filteredThreads = userQuestions;
        break;
      default:
        return [];
    }
    
    // 7-15件のランダムな間隔で広告を挿入
    const items: any[] = [];
    let threadIndex = 0;
    let adIndex = 0;
    
    while (threadIndex < filteredThreads.length) {
      // スレッドを追加
      items.push(filteredThreads[threadIndex]);
      threadIndex++;
      
      // ランダムな間隔で広告を挿入（7-15件の間隔）
      const interval = Math.floor(Math.random() * 9) + 7; // 7-15
      if (threadIndex % interval === 0 && adIndex < threadAds.length) {
        items.push(threadAds[adIndex % threadAds.length]);
        adIndex++;
      }
    }
    
    return items;
  }, [activeTab, userPosts, userQuestions]);

  const handleThreadClick = (threadId: string) => {
    onThreadClick?.(threadId);
  };

  const handleAddVehicleClick = () => {
    onAddVehicleClick?.();
  };

  const handleVehicleClick = (vehicleId: string) => {
    onVehicleClick?.(vehicleId);
  };

  const handleMaintenanceClick = (maintenanceId: string) => {
    onMaintenanceClick?.(maintenanceId);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploadingAvatar(true);
    setAvatarError('');

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('画像ファイルのみアップロード可能です');
      }

      const url = await uploadToStorage(user.uid, file);
      await updateUserDoc({ photoURL: url });
    } catch (err: any) {
      setAvatarError(err.message || 'アバターのアップロードに失敗しました');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {displayItems.length > 0 ? (
              displayItems.map((item) => (
                <ThreadCard
                  key={item.id}
                  thread={item}
                  onClick={() => handleThreadClick(item.id)}
                  onDelete={onDeleteThread}
                  onBlockUser={onBlockUser}
                  onReportThread={onReportThread}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-sm text-gray-400">投稿がありません</div>
              </div>
            )}
          </div>
        );
      case 'questions':
        return (
          <div className="space-y-4">
            {displayItems.length > 0 ? (
              displayItems.map((item) => (
                <ThreadCard
                  key={item.id}
                  thread={item}
                  onClick={() => handleThreadClick(item.id)}
                  onDelete={onDeleteThread}
                  onBlockUser={onBlockUser}
                  onReportThread={onReportThread}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-sm text-gray-400">質問がありません</div>
              </div>
            )}
          </div>
        );
      case 'maintenance':
        return (
          <div className="space-y-4">
            {myGarage.map((record) => (
              <div
                key={record.id}
                onClick={() => handleMaintenanceClick(record.id)}
                className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm cursor-pointer hover:scale-95 active:scale-95 transition-transform"
              >
                <div className="flex items-start space-x-3">
                  {/* 整備写真 */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-surface-light">
                    <img 
                      src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200&h=200&fit=crop" 
                      alt="整備作業"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white truncate">{record.title}</h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">{record.date}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">{record.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">走行距離: {record.mileage}km</span>
                      <span className="text-xs text-gray-400">費用: ¥{record.cost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader
        user={currentUser}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={onSettingsClick}
        showLogo={true}
        showSettings={true}
      />

      <main className="p-4 pb-20 pt-0 fade-in">
        {/* プロフィール編集 */}
        {showProfileEdit && (
          <div className="mb-6 bg-surface rounded-xl border border-surface-light p-4">
            <h3 className="text-sm font-bold text-white mb-4">プロフィール編集</h3>
            
            {/* アバターアップロード */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                プロフィール画像
              </label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={userDoc?.photoURL || currentUser.avatar}
                    alt="プロフィール画像"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                    id="avatar-upload"
                    data-testid="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera size={12} />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">
                    {uploadingAvatar ? 'アップロード中...' : '画像をクリックして変更'}
                  </p>
                  {avatarError && (
                    <p className="text-xs text-red-400 mt-1">{avatarError}</p>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowProfileEdit(false)}
              className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              完了
            </button>
          </div>
        )}

        {/* プロフィール編集ボタン */}
        <div className="mb-4">
          <button
            onClick={() => setShowProfileEdit(!showProfileEdit)}
            className="w-full py-3 bg-surface border border-surface-light rounded-xl text-white font-medium hover:bg-surface-light transition-colors"
          >
            {showProfileEdit ? 'プロフィール編集を閉じる' : 'プロフィール編集'}
          </button>
        </div>

        {/* 登録車種 */}
        <div className="mb-8">
          <SectionTitle
            title="登録車種"
            action={{ label: "追加", onClick: handleAddVehicleClick }}
          />
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {currentUser.cars.map((car) => (
              <VehicleCard
                key={car}
                car={car}
                onClick={() => handleVehicleClick(car)}
              />
            ))}
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="flex space-x-1 mb-6 bg-surface rounded-xl p-0.5 shadow-sm">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'posts'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare size={14} />
            <span>投稿</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'questions'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare size={14} />
            <span>質問</span>
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'maintenance'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wrench size={14} />
            <span>整備記録</span>
          </button>
        </div>
        <div key={activeTab} className="fade-in">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};
