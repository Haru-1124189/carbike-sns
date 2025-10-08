import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, MessageSquare, User, UserCheck, Users, Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { FollowButton } from '../components/ui/FollowButton';
import { ThreadCard } from '../components/ui/ThreadCard';
import { db } from '../firebase/init';
import { useAuth } from '../hooks/useAuth';
import { useFollow } from '../hooks/useFollow';
import { useMaintenancePosts } from '../hooks/useMaintenancePosts';
import { useThreads } from '../hooks/useThreads';
import { User as UserType } from '../types';

type ProfileTab = 'posts' | 'questions' | 'maintenance';

interface UserProfilePageProps {
  user: UserType;
  onBackClick?: () => void;
  onThreadClick?: (threadId: string) => void;
  onVehicleClick?: (vehicleId: string) => void;
  onUserClick?: (userId: string, displayName: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  user,
  onBackClick,
  onThreadClick,
  onVehicleClick,
  onUserClick
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { followersCount, followingCount, error: followError } = useFollow(user.id);

  // 実際のスレッドデータを取得（プライバシーフィルタリング付き）
  const { threads: allThreads, loading: threadsLoading } = useThreads({ 
    currentUserId: currentUser?.uid 
  });

  // 実際のメンテナンスデータを取得（プライバシーフィルタリング付き）
  const { maintenancePosts, loading: maintenanceLoading } = useMaintenancePosts({ 
    currentUserId: currentUser?.uid 
  });

  console.log('UserProfilePage - User data:', {
    userId: user.id,
    userName: user.name,
    currentUserId: currentUser?.uid,
    followError
  });

  // ユーザーデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user.id) return;
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.id));
        
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.warn('User document not found:', user.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user.id]);

  // このユーザーの投稿と質問をフィルタリング
  const userPosts = allThreads.filter(thread => 
    thread.authorId === user.id && thread.type === 'post'
  );
  
  const userQuestions = allThreads.filter(thread => 
    thread.authorId === user.id && thread.type === 'question'
  );

  // このユーザーのメンテナンス記録をフィルタリング
  const userMaintenanceRecords = maintenancePosts.filter(post => 
    post.authorId === user.id
  );

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
            {threadsLoading ? (
              <div className="text-center py-8">
                <div className="text-sm text-gray-400">読み込み中...</div>
              </div>
            ) : userPosts.length > 0 ? (
              userPosts.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  onClick={() => handleThreadClick(thread.id)}
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
            {threadsLoading ? (
              <div className="text-center py-8">
                <div className="text-sm text-gray-400">読み込み中...</div>
              </div>
            ) : userQuestions.length > 0 ? (
              userQuestions.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  onClick={() => handleThreadClick(thread.id)}
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
            {maintenanceLoading ? (
              <div className="text-center py-8">
                <div className="text-sm text-gray-400">読み込み中...</div>
              </div>
            ) : userMaintenanceRecords.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {userMaintenanceRecords.map((post) => (
                  <div
                    key={post.id}
                    className="bg-surface rounded-lg p-3 cursor-pointer hover:bg-surface-light transition-colors"
                    onClick={() => onThreadClick?.(post.id)}
                  >
                    <div className="aspect-[4/3] w-full rounded-lg overflow-hidden mb-2">
                      {post.carImage ? (
                        <img
                          src={post.carImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : post.images && post.images.length > 0 ? (
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-600 font-bold">車</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white truncate mb-1">{post.title}</h3>
                    <p className="text-xs text-gray-300 line-clamp-2">{post.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{post.carModel}</span>
                      <span className="text-xs text-gray-400">¥{post.cost.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-sm text-gray-400">メンテナンス記録がありません</div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background container-mobile">
        <AppHeader
          user={{
            id: user.id,
            name: user.name,
            avatar: user.avatar || '',
            cars: user.cars || [],
            interestedCars: user.interestedCars || []
          }}
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={() => console.log('Profile clicked')}
          showTitle={true}
          showLogo={true}
          showSettings={false}
          showProfileButton={false}
        />
        
        
        <main className="p-4 pb-24">
          <div className="text-center py-8">
            <div className="text-sm text-gray-400">読み込み中...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader
        user={{
          id: user.id,
          name: user.name,
          avatar: user.avatar || '',
          cars: user.cars || [],
          interestedCars: user.interestedCars || []
        }}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
        showTitle={true}
        showLogo={true}
        showSettings={false}
        showProfileButton={false}
      />
      
      
      <main className="p-4 pb-24">
        
        {/* 戻るボタン */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">{user.name}のプロフィール</h1>
        </div>

        {/* ユーザー情報 */}
        <div className="bg-surface rounded-xl p-4 mb-6 border border-surface-light">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-primary">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">{user.name}</h2>
              {userData?.bio && (
                <p className="text-sm text-gray-300">{userData.bio}</p>
              )}
            </div>
            <FollowButton targetUserId={user.id} />
          </div>
          
          {/* フォロー統計 */}
          <div className="flex items-center space-x-4">
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

        {/* タブコンテンツ */}
        <div key={activeTab} className="fade-in">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};
