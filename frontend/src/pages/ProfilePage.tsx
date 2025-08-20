import { Camera, MessageSquare, Wrench } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { SectionTitle } from '../components/ui/SectionTitle';
import { ThreadCard } from '../components/ui/ThreadCard';
import { VehicleCard } from '../components/ui/VehicleCard';
import { SingleImageUpload } from '../components/ui/SingleImageUpload';
import { threadAds } from '../data/dummy';
import { useAuth } from '../hooks/useAuth';
import { useMaintenancePosts } from '../hooks/useMaintenancePosts';
import { useThreads } from '../hooks/useThreads';

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

  const { user, userDoc, updateUserDoc, loading: authLoading } = useAuth();
  
  // デバッグ用：認証状態をコンソールに出力
  console.log('ProfilePage - Auth state:', {
    user: user?.uid,
    userDoc: userDoc?.displayName,
    authLoading,
    isLoggedIn: !!user && !!userDoc,
    userEmail: user?.email,
    userDocExists: !!userDoc
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

  const handleAvatarChange = async (imageUrl: string | null) => {
    if (!user?.uid) return;

    setUploadingAvatar(true);
    setAvatarError('');

    try {
      await updateUserDoc({ photoURL: imageUrl || '' });
    } catch (err: any) {
      setAvatarError(err.message || 'アバターの更新に失敗しました');
    } finally {
      setUploadingAvatar(false);
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
          user={null}
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={onSettingsClick}
          showLogo={true}
          showSettings={true}
        />
        <main className="p-4 pb-20 pt-0 fade-in">
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
          user={null}
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={onSettingsClick}
          showLogo={true}
          showSettings={true}
        />
        <main className="p-4 pb-20 pt-0 fade-in">
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
         user={userDoc || { id: user.uid, name: user.displayName || user.email || 'ユーザー', avatar: user.photoURL || '', cars: [], interestedCars: [] }}
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
                                <SingleImageUpload
                  image={userDoc?.photoURL || user.photoURL || null}
                  onImageChange={handleAvatarChange}
                  aspectRatio="square"
                  placeholder="プロフィール画像を選択"
                />
                {avatarError && (
                  <p className="text-xs text-red-400 mt-1">{avatarError}</p>
                )}
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
             {userDoc?.cars && userDoc.cars.length > 0 ? (
               userDoc.cars.map((car, index) => (
                 <VehicleCard
                   key={index}
                   car={car}
                   onClick={() => handleVehicleClick(car)}
                 />
               ))
             ) : (
               <div className="text-center py-4 w-full">
                 <div className="text-sm text-gray-400">登録車種がありません</div>
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
