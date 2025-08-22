import { Edit, MessageSquare, Wrench, Users, UserCheck } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { PersistentImage } from '../components/ui/PersistentImage';
import { SectionTitle } from '../components/ui/SectionTitle';
import { SingleImageUpload } from '../components/ui/SingleImageUpload';
import { ThreadCard } from '../components/ui/ThreadCard';
import { VehicleCard } from '../components/ui/VehicleCard';
import { threadAds } from '../data/dummy';
import { useAuth } from '../hooks/useAuth';
import { useMaintenancePosts } from '../hooks/useMaintenancePosts';
import { useThreads } from '../hooks/useThreads';
import { useVehicles } from '../hooks/useVehicles';
import { useMyFollowData } from '../hooks/useFollow';

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
  onUserClick?: (userId: string, displayName: string) => void;
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
  onReportThread,
  onUserClick
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [adminEditingAvatar, setAdminEditingAvatar] = useState(false);
  const [adminAvatarError, setAdminAvatarError] = useState('');


  const { user, userDoc, updateUserDoc, loading: authLoading } = useAuth();
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { followersCount, followingCount } = useMyFollowData();
  
  // デバッグ用：認証状態をコンソールに出力
  console.log('ProfilePage - Auth state:', {
    user: user?.uid,
    userDoc: userDoc?.displayName,
    authLoading,
    isLoggedIn: !!user && !!userDoc,
    userEmail: user?.email,
    userDocExists: !!userDoc,
    vehiclesCount: vehicles.length,
    vehiclesLoading,
    vehiclesError
  });
  
  // 車両データの詳細ログ
  console.log('ProfilePage - Vehicles data:', {
    vehicles,
    vehiclesLoading,
    vehiclesError,
    vehiclesLength: vehicles.length
  });

  // 一時的なデバッグ表示
  if (user && !userDoc) {
    console.warn('User exists but userDoc is null - this might be the issue');
  }
  
  // 実際のユーザーの投稿と質問を取得
  console.log('ProfilePage - About to call useThreads');
  const { threads: allThreads, loading: threadsLoading } = useThreads();
  console.log('ProfilePage - useThreads called, allThreads length:', allThreads.length);
  
  console.log('ProfilePage - About to call useMaintenancePosts');
  const { maintenancePosts, loading: maintenanceLoading } = useMaintenancePosts();
  console.log('ProfilePage - useMaintenancePosts called, maintenancePosts length:', maintenancePosts.length);

  // 簡単なデバッグ情報を画面に表示
  const debugInfo = {
    userUid: user?.uid || 'null',
    userEmail: user?.email || 'null',
    userDocExists: !!userDoc,
    authLoading,
    totalThreads: allThreads.length,
    threadsLoading,
    userPostsCount: 0,
    userQuestionsCount: 0
  };

  // デバッグ用：Firebaseから直接データを取得してテスト
  React.useEffect(() => {
    const testFirebaseData = async () => {
      if (!user?.uid) return;
      
      try {
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const { db } = await import('../firebase/clients');
        
        const q = query(
          collection(db, 'threads'),
          where('isDeleted', '==', false)
        );
        
        const snapshot = await getDocs(q);
        console.log('ProfilePage - Direct Firebase test:', {
          userUid: user.uid,
          totalDocs: snapshot.docs.length,
          docs: snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }))
        });
      } catch (error) {
        console.error('ProfilePage - Direct Firebase test error:', error);
      }
    };
    
    testFirebaseData();
  }, [user?.uid]);

     // デバッグ用：スレッドデータの詳細を出力
   console.log('ProfilePage - Threads data:', {
     totalThreads: allThreads.length,
     threadsLoading,
     threads: allThreads.map(t => ({
       id: t.id,
       title: t.title,
       type: t.type,
       authorId: t.authorId,
       author: t.author,
       createdAt: t.createdAt
     }))
   });

  // デバッグ用：認証ユーザーの詳細情報
  console.log('ProfilePage - User details:', {
    userUid: user?.uid,
    userEmail: user?.email,
    userDisplayName: user?.displayName,
    userDocDisplayName: userDoc?.displayName
  });

  // スワイプバック機能を有効化（プロフィールページでは無効）
  // useSwipeBack();

  // 自分の投稿と質問のみをフィルタリング（実際のユーザーIDで）
  const userPosts = useMemo(() => {
    if (!user?.uid) return [];
    
    console.log('ProfilePage - Filtering posts for user:', user.uid);
    console.log('ProfilePage - All threads before filtering:', allThreads);
    
    const filtered = allThreads.filter(thread => {
      const isPost = thread.type === 'post';
      const isAuthor = thread.authorId === user.uid;
      
      console.log('ProfilePage - Thread filter check:', {
        threadId: thread.id,
        threadTitle: thread.title,
        threadType: thread.type,
        threadAuthorId: thread.authorId,
        userUid: user.uid,
        isPost,
        isAuthor,
        passes: isPost && isAuthor
      });
      
      return isPost && isAuthor;
    });
    
    console.log('ProfilePage - User posts filtering result:', {
      userUid: user.uid,
      totalThreads: allThreads.length,
      filteredPosts: filtered.length,
      filteredThreads: filtered.map(t => ({ 
        id: t.id, 
        title: t.title, 
        type: t.type, 
        authorId: t.authorId,
        author: t.author 
      }))
    });
    
    return filtered;
  }, [allThreads, user?.uid]);

  const userQuestions = useMemo(() => {
    if (!user?.uid) return [];
    
    console.log('ProfilePage - Filtering questions for user:', user.uid);
    
    const filtered = allThreads.filter(thread => {
      const isQuestion = thread.type === 'question';
      const isAuthor = thread.authorId === user.uid;
      
      console.log('ProfilePage - Question filter check:', {
        threadId: thread.id,
        threadTitle: thread.title,
        threadType: thread.type,
        threadAuthorId: thread.authorId,
        userUid: user.uid,
        isQuestion,
        isAuthor,
        passes: isQuestion && isAuthor
      });
      
      return isQuestion && isAuthor;
    });
    
    console.log('ProfilePage - User questions filtering result:', {
      userUid: user.uid,
      totalThreads: allThreads.length,
      filteredQuestions: filtered.length,
      filteredThreads: filtered.map(t => ({ 
        id: t.id, 
        title: t.title, 
        type: t.type, 
        authorId: t.authorId,
        author: t.author 
      }))
    });
    
    return filtered;
  }, [allThreads, user?.uid]);

  // 自分の整備記録のみをフィルタリング
  const userMaintenanceRecords = useMemo(() => {
    if (!user?.uid) return [];
    return maintenancePosts.filter(post => post.authorId === user.uid);
  }, [maintenancePosts, user?.uid]);

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

  // 管理者用のアバター変更機能
  const handleAdminAvatarChange = async (imageUrl: string | null) => {
    if (!user?.uid || !userDoc?.isAdmin) return;

    setAdminEditingAvatar(true);
    setAdminAvatarError('');

    try {
      await updateUserDoc({ photoURL: imageUrl || '' });
      console.log('管理者によってプロフィール画像が更新されました');
      setIsAdminEditing(false);
    } catch (err: any) {
      setAdminAvatarError(err.message || 'アバターの更新に失敗しました');
    } finally {
      setAdminEditingAvatar(false);
    }
  };



  const renderTabContent = () => {
    if (threadsLoading || maintenanceLoading) {
      return (
        <div className="text-center py-8">
          <div className="text-sm text-gray-400">読み込み中...</div>
        </div>
      );
    }

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
                  onUserClick={onUserClick}
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
                  onUserClick={onUserClick}
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
            {userMaintenanceRecords.length > 0 ? (
              userMaintenanceRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => handleMaintenanceClick(record.id)}
                className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm cursor-pointer hover:scale-95 active:scale-95 transition-transform"
              >
                <div className="flex items-start space-x-3">
                  {/* 整備写真 */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-surface-light">
                      {record.images && record.images.length > 0 ? (
                    <img 
                          src={record.images[0]} 
                      alt="整備作業"
                      className="w-full h-full object-cover"
                    />
                      ) : (
                        <div className="w-full h-full bg-surface-light flex items-center justify-center">
                          <Wrench size={20} className="text-gray-400" />
                        </div>
                      )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white truncate">{record.title}</h3>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {record.createdAt instanceof Date 
                            ? record.createdAt.toLocaleString('ja-JP', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : typeof record.createdAt === 'string'
                            ? new Date(record.createdAt).toLocaleString('ja-JP', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '日付不明'
                          }
                        </span>
                    </div>
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">{record.content}</p>
                    <div className="flex items-center space-x-2">
                        {record.mileage && (
                      <span className="text-xs text-gray-400">走行距離: {record.mileage}km</span>
                        )}
                        {record.cost && (
                      <span className="text-xs text-gray-400">費用: ¥{record.cost.toLocaleString()}</span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-sm text-gray-400">整備記録がありません</div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // 認証の初期化中の場合
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background container-mobile">
        <BannerAd />
        <AppHeader
          user={{
            id: '',
            name: '',
            avatar: '',
            cars: [],
            interestedCars: []
          }}
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={onSettingsClick}
          onSettingsClick={onSettingsClick}
          showTitle={true}
          showLogo={true}
          showSettings={true}
          showProfileButton={false}
        />
        <main className="p-4 pb-24 pt-0 fade-in">
          <div className="text-center py-8">
            <div className="text-sm text-gray-400">読み込み中...</div>
          </div>
        </main>
      </div>
    );
  }

  // ユーザーがログインしていない場合（userDocは後で作成される可能性があるため、userのみチェック）
  if (!user) {
    return (
      <div className="min-h-screen bg-background container-mobile">
        <BannerAd />
        <AppHeader
          user={{
            id: '',
            name: '',
            avatar: '',
            cars: [],
            interestedCars: []
          }}
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={onSettingsClick}
          onSettingsClick={onSettingsClick}
          showTitle={true}
          showLogo={true}
          showSettings={true}
          showProfileButton={false}
        />
        <main className="p-4 pb-24 pt-0 fade-in">
          <div className="text-center py-8">
            <div className="text-sm text-gray-400">ログインが必要です</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
              <AppHeader
          user={userDoc ? { 
            id: user.uid, 
            name: userDoc.displayName || user?.displayName || 'ユーザー', 
            avatar: userDoc.photoURL || user?.photoURL || '', 
            cars: userDoc.cars || [], 
            interestedCars: userDoc.interestedCars || [] 
          } : { 
            id: user.uid, 
            name: user?.displayName || 'ユーザー', 
            avatar: user?.photoURL || '', 
            cars: [], 
            interestedCars: [] 
          }}
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={onSettingsClick}
          onSettingsClick={onSettingsClick}
          showTitle={true}
          showLogo={true}
          showSettings={true}
          showProfileButton={false}
        />

      <main className="p-4 pb-24 pt-0 fade-in">
        {/* 現在のユーザー情報表示 */}
        <div className="mb-4 p-4">
          {/* 管理者用の編集機能 */}
          {userDoc?.isAdmin && isAdminEditing && (
            <div className="mb-6 bg-surface rounded-xl border border-surface-light p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-green-500">管理者編集モード</h3>
                <button
                  onClick={() => setIsAdminEditing(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  キャンセル
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  プロフィール画像（管理者権限）
                </label>
                <SingleImageUpload
                  image={userDoc?.photoURL || user?.photoURL || null}
                  onImageChange={handleAdminAvatarChange}
                  aspectRatio="square"
                  placeholder="プロフィール画像を変更"
                  isProfileImage={true}
                />
                {adminAvatarError && (
                  <p className="text-xs text-red-400 mt-2">{adminAvatarError}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-primary">
                {userDoc?.photoURL || user?.photoURL ? (
                  <PersistentImage
                    src={userDoc?.photoURL || user?.photoURL || ''}
                    alt="プロフィール画像"
                    className="w-full h-full object-cover"
                    loading="eager"
                    fallback={
                      <span className="text-white text-lg font-bold">
                        {(userDoc?.displayName || user?.displayName || 'U').charAt(0).toUpperCase()}
                      </span>
                    }
                  />
                ) : (
                  <span className="text-white text-lg font-bold">
                    {(userDoc?.displayName || user?.displayName || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* 管理者用編集ボタン */}
              {userDoc?.isAdmin && !isAdminEditing && (
                <button
                  onClick={() => setIsAdminEditing(true)}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm"
                  title="管理者権限でプロフィール画像を編集"
                >
                  <Edit size={12} />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">
                {userDoc?.displayName || user?.displayName || 'ユーザー'}
              </h2>
              <p className="text-sm text-gray-400">登録メール: {user?.email}</p>
              
              {/* フォロー統計 */}
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <UserCheck size={14} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">{followingCount}</span> フォロー中
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users size={14} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">{followersCount}</span> フォロワー
                  </span>
                </div>
              </div>
              
              {/* 自己紹介 */}
              {userDoc?.bio && userDoc.bio.trim() && (
                <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                  {userDoc.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 愛車 */}
        <div className="mb-8">
          <SectionTitle
            title="愛車"
            action={{ label: "追加", onClick: handleAddVehicleClick }}
          />
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {vehiclesLoading ? (
              <div className="text-center py-4 w-full">
                <div className="text-sm text-gray-400">読み込み中...</div>
              </div>
            ) : vehiclesError ? (
              <div className="text-center py-4 w-full">
                <div className="text-sm text-red-400">車両データの読み込みに失敗しました</div>
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
