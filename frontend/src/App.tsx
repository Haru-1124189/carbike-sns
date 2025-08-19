import { useState } from 'react';
import { TabBar } from './components/ui/TabBar';
import { carModels, currentUser, interestedCarMaintenancePosts, maintenancePosts, myGarage, videos } from './data/dummy';
import { useAuth } from './hooks/useAuth';
import { deleteMaintenancePost } from './lib/threads';
import { AddVehiclePage } from './pages/AddVehiclePage';
import { AuthPage } from './pages/AuthPage';
import { BlockListPage } from './pages/BlockListPage';
import { CarListPage } from './pages/CarListPage';
import { ContactPage } from './pages/ContactPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CreatorUploadPage } from './pages/CreatorUploadPage';
import { HelpPage } from './pages/HelpPage';
import { HomePage } from './pages/HomePage';
import { LegalPage } from './pages/LegalPage';
import { MaintenanceDetailPage } from './pages/MaintenanceDetailPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { MutedWordsPage } from './pages/MutedWordsPage';
import { NewMaintenancePage } from './pages/NewMaintenancePage';
import { NewThreadPage } from './pages/NewThreadPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PostPage } from './pages/PostPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisteredInterestedCarsPage } from './pages/RegisteredInterestedCarsPage';
import { ReportPage } from './pages/ReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThreadDetailPage } from './pages/ThreadDetailPage';
import { ThreadsPage } from './pages/ThreadsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { VideoDetailPage } from './pages/VideoDetailPage';
import { VideosPage } from './pages/VideosPage';
import { AuthProvider } from './providers/AuthProvider';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSubPage, setSettingsSubPage] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThreadDetail, setShowThreadDetail] = useState(false);
  const [showVideoDetail, setShowVideoDetail] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showVehicleDetail, setShowVehicleDetail] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMaintenanceDetail, setShowMaintenanceDetail] = useState(false);
  const [showCarList, setShowCarList] = useState(false);
  const [showRegisteredCars, setShowRegisteredCars] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<string>('general');
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [interestedCars, setInterestedCars] = useState<string[]>(currentUser.interestedCars || []);
  const [showAuth, setShowAuth] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [showNewMaintenance, setShowNewMaintenance] = useState(false);
  const [initialThreadTab, setInitialThreadTab] = useState<'post' | 'question'>('post');

  // 認証状態をチェック
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  // 未認証の場合は認証ページを表示
  if (!user) {
    return <AuthPage onBackClick={() => {}} />;
  }

  const handleThreadClick = (threadId: string) => {
    console.log('handleThreadClick called with threadId:', threadId);
    setSelectedThread({ id: threadId }); // 最小限のオブジェクトを設定
    setShowThreadDetail(true);
  };

  const handleVideoClick = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
      setShowVideoDetail(true);
    }
  };

  const handleVehicleClick = (vehicleId: string) => {
    const vehicle = carModels.find(v => v === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setShowVehicleDetail(true);
    }
  };

  const handleUserClick = (author: string) => {
    // ダミーユーザーデータを作成
    const user = {
      id: author,
      name: author,
      avatar: `https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=${author.charAt(0)}`,
      cars: carModels.slice(0, 2) // 最初の2台の車を割り当て
    };
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleMaintenanceClick = (postId: string) => {
    console.log('handleMaintenanceClick called with postId:', postId);
    try {
      console.log('myGarage data:', myGarage);
      console.log('maintenancePosts data:', maintenancePosts);
      console.log('interestedCarMaintenancePosts data:', interestedCarMaintenancePosts);
      
      const allPosts = [...maintenancePosts, ...interestedCarMaintenancePosts];
      
      // myGarageのデータをMaintenancePost形式に変換
      const myGaragePosts = myGarage.map((record: any) => {
        console.log('Processing record:', record);
        return {
          id: record.id,
          title: record.title,
          content: record.description,
          author: "RevLinkユーザー",
          authorAvatar: currentUser.avatar,
          carModel: "Nissan S13", // デフォルトの車種
          mileage: record.mileage,
          cost: record.cost,
          workDate: record.date,
          category: "other",
          difficulty: "medium",
          totalTime: "2時間",
          tools: ["レンチ", "ドライバー"],
          parts: ["マフラー", "ガスケット"],
          steps: [
            {
              id: `${record.id}-s1`,
              order: 1,
              title: "準備",
              description: "工具とパーツを準備する",
              image: undefined
            },
            {
              id: `${record.id}-s2`,
              order: 2,
              title: "作業",
              description: record.description,
              image: undefined
            }
          ],
          likes: 15,
          comments: 3,
          createdAt: record.date,
          tags: ["整備", "メンテナンス"]
        };
      });
      
      console.log('Converted myGaragePosts:', myGaragePosts);
      
      const allMaintenancePosts = [...allPosts, ...myGaragePosts];
      console.log('All maintenance posts:', allMaintenancePosts);
      
      const post = allMaintenancePosts.find((p: any) => p.id === postId);
      console.log('Found post:', post);
      
      if (post) {
        console.log('Setting selectedMaintenance and showing detail page');
        setSelectedMaintenance(post);
        setShowMaintenanceDetail(true);
      } else {
        console.error('Maintenance post not found:', postId);
        console.error('Available post IDs:', allMaintenancePosts.map(p => p.id));
      }
    } catch (error) {
      console.error('Error in handleMaintenanceClick:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleAddVehicleClick = () => {
    setShowAddVehicle(true);
  };

  const handleAddMaintenance = () => {
    setSelectedPostType('maintenance');
    setShowCreatePost(true);
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'post':
        setSelectedPostType('post');
        setShowNewThread(true);
        break;
      case 'question':
        setSelectedPostType('question');
        setShowNewThread(true);
        break;
      case 'maintenance':
        setShowNewMaintenance(true);
        break;
      default:
        console.log(`${actionId} clicked`);
    }
  };

  const handleViewAllThreads = () => {
    setActiveTab('threads');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setShowSettings(false);
    setSettingsSubPage(null);
    setShowNotifications(false);
    setShowThreadDetail(false);
    setShowVideoDetail(false);
    setShowAddVehicle(false);
    setShowVehicleDetail(false);
    setShowUserProfile(false);
    setShowMaintenanceDetail(false);
    setShowCarList(false);
    setShowRegisteredCars(false);
    setShowCreatePost(false);
    setShowNewThread(false);
    setShowNewMaintenance(false);
  };

  const handleAddInterestedCar = (carName: string) => {
    setInterestedCars((prev) => (prev.includes(carName) ? prev : [...prev, carName]));
  };

  const handleRemoveInterestedCar = (carName: string) => {
    setInterestedCars((prev) => prev.filter((x) => x !== carName));
  };

  const handleDeleteThread = (threadId: string) => {
    // 実際のアプリでは、ここでAPIを呼び出してスレッドを削除
    console.log('Deleting thread:', threadId);
  };

  const handleDeleteMaintenance = async (postId: string) => {
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    if (window.confirm('このメンテナンス記録を削除しますか？この操作は取り消せません。')) {
      try {
        await deleteMaintenancePost(postId, user.uid);
        alert('メンテナンス記録を削除しました');
      } catch (error: any) {
        console.error('Error deleting maintenance post:', error);
        alert(error.message || 'メンテナンス記録の削除に失敗しました');
      }
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    // 実際のアプリでは、ここでAPIを呼び出して動画を削除
    console.log('Deleting video:', videoId);
  };

  const handleBlockUser = (author: string) => {
    setBlockedUsers((prev) => Array.from(new Set([...prev, author])));
  };

  const handleUnblockUser = (author: string) => {
    setBlockedUsers((prev) => prev.filter((x) => x !== author));
  };

  const handleReportThread = (threadId: string, author: string) => {
    // 実際のアプリでは、ここでAPIを呼び出して通報を送信
    console.log('Reporting thread:', threadId, 'by author:', author);
    alert('通報を送信しました（ダミー）');
  };

  const renderPage = () => {
    if (settingsSubPage) {
      switch (settingsSubPage) {
        case 'contact':
          return <ContactPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'help':
          return <HelpPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'report':
          return <ReportPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'blocklist':
          return <BlockListPage blockedUsers={blockedUsers} onUnblockUser={handleUnblockUser} onBackClick={() => setSettingsSubPage(null)} />;
        case 'mutedWords':
          return <MutedWordsPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'terms':
          return <LegalPage type="terms" onBackClick={() => setSettingsSubPage(null)} />;
        case 'privacy':
          return <LegalPage type="privacy" onBackClick={() => setSettingsSubPage(null)} />;
        case 'about':
          return <LegalPage type="about" onBackClick={() => setSettingsSubPage(null)} />;
        case 'creatorUpload':
          return <CreatorUploadPage onBackClick={() => setSettingsSubPage(null)} />;
        default:
          setSettingsSubPage(null);
      }
    }

    if (showSettings) {
      return <SettingsPage onBackClick={() => setShowSettings(false)} onNavigate={(screen) => setSettingsSubPage(screen)} onLoginClick={() => setShowAuth(true)} />;
    }

    if (showNotifications) {
      return <NotificationsPage onBackClick={() => setShowNotifications(false)} />;
    }

    if (showThreadDetail) {
      return (
        <ThreadDetailPage
          threadId={selectedThread?.id || ''}
          onBackClick={() => setShowThreadDetail(false)}
          onUserClick={handleUserClick}
        />
      );
    }

    if (showVideoDetail) {
      return (
        <VideoDetailPage
          video={selectedVideo}
          onBackClick={() => setShowVideoDetail(false)}
          onUserClick={handleUserClick}
        />
      );
    }

    if (showAddVehicle) {
      return <AddVehiclePage onBackClick={() => setShowAddVehicle(false)} />;
    }

    if (showVehicleDetail) {
      return <VehicleDetailPage 
        vehicle={selectedVehicle} 
        onBackClick={() => setShowVehicleDetail(false)} 
      />;
    }

    if (showUserProfile) {
      return <UserProfilePage 
        user={selectedUser} 
        onBackClick={() => setShowUserProfile(false)} 
      />;
    }

    if (showMaintenanceDetail) {
      return (
        <MaintenanceDetailPage
          post={selectedMaintenance}
          onBackClick={() => setShowMaintenanceDetail(false)}
          onUserClick={handleUserClick}
        />
      );
    }

    if (showCarList) {
      return (
        <CarListPage
          onBackClick={() => setShowCarList(false)}
          onAddCar={handleAddInterestedCar}
          interestedCars={interestedCars}
        />
      );
    }

    if (showRegisteredCars) {
      return (
        <RegisteredInterestedCarsPage
          onBackClick={() => setShowRegisteredCars(false)}
          onRemoveCar={handleRemoveInterestedCar}
          interestedCars={interestedCars}
        />
      );
    }

    if (showAuth) {
      return (
        <AuthPage
          onBackClick={() => setShowAuth(false)}
        />
      );
    }

    if (showNewThread) {
      return (
        <NewThreadPage
          postType={selectedPostType === 'thread' ? 'post' : selectedPostType as 'post' | 'question'}
          onBackClick={() => setShowNewThread(false)}
          onSuccess={() => setShowNewThread(false)}
        />
      );
    }

    if (showNewMaintenance) {
      return (
        <NewMaintenancePage
          onBackClick={() => setShowNewMaintenance(false)}
        />
      );
    }

    if (showCreatePost) {
      return (
        <CreatePostPage
          postType={selectedPostType}
          onBackClick={() => setShowCreatePost(false)}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onThreadClick={handleThreadClick}
            onNotificationClick={handleNotificationClick}
            onAddVehicleClick={handleAddVehicleClick}
            onViewAllThreads={handleViewAllThreads}
            onQuickAction={handleQuickAction}
            onVehicleClick={handleVehicleClick}
            onShowCarList={() => setShowCarList(true)}
            onShowRegisteredCars={() => setShowRegisteredCars(true)}
            onDeleteThread={handleDeleteThread}
            blockedUsers={blockedUsers}
            onBlockUser={handleBlockUser}
            onReportThread={handleReportThread}
            interestedCars={interestedCars}
          />
        );
      case 'threads':
        return (
          <ThreadsPage
            onThreadClick={handleThreadClick}
            onUserClick={handleUserClick}
            onDeleteThread={handleDeleteThread}
            blockedUsers={blockedUsers}
            onBlockUser={handleBlockUser}
            onReportThread={handleReportThread}
            onNewThread={(type) => {
              setSelectedPostType(type);
              setShowNewThread(true);
            }}
            initialTab={initialThreadTab}
          />
        );
      case 'maintenance':
        return (
          <MaintenancePage
            onMaintenanceClick={handleMaintenanceClick}
            onUserClick={handleUserClick}
            onAddMaintenance={() => setShowNewMaintenance(true)}
            onDeleteMaintenance={handleDeleteMaintenance}
          />
        );
      case 'post':
        return <PostPage onCreatePost={(postType) => {
          setSelectedPostType(postType);
          setShowNewThread(true);
        }} />;
      case 'videos':
        return (
          <VideosPage
            onVideoClick={handleVideoClick}
            onUserClick={handleUserClick}
            onDeleteVideo={handleDeleteVideo}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            onSettingsClick={() => setShowSettings(true)}
            onThreadClick={handleThreadClick}
            onAddVehicleClick={handleAddVehicleClick}
            onVehicleClick={handleVehicleClick}
            onMaintenanceClick={handleMaintenanceClick}
            onDeleteThread={handleDeleteThread}
            blockedUsers={blockedUsers}
            onBlockUser={handleBlockUser}
            onReportThread={handleReportThread}
          />
        );
      default:
        return <HomePage
          onThreadClick={handleThreadClick}
          onNotificationClick={handleNotificationClick}
          onAddVehicleClick={handleAddVehicleClick}
          onViewAllThreads={handleViewAllThreads}
          onQuickAction={handleQuickAction}
          onVehicleClick={handleVehicleClick}
          onShowCarList={() => setShowCarList(true)}
          onShowRegisteredCars={() => setShowRegisteredCars(true)}
          onDeleteThread={handleDeleteThread}
          blockedUsers={blockedUsers}
          onBlockUser={handleBlockUser}
          onReportThread={handleReportThread}
        />;
    }
  };

  return (
    <div className="App">
      {/* 認証状態のデバッグ表示 */}
      <div style={{ position: 'fixed', top: 0, right: 0, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '4px 8px', fontSize: '12px', zIndex: 9999 }}>
        Auth: {user ? `Logged In (${user.email})` : 'Not Logged In'}
      </div>
      {renderPage()}
      {!showSettings && !showNotifications && !showThreadDetail && !showVideoDetail && !showAddVehicle && !showVehicleDetail && !showUserProfile && !showMaintenanceDetail && !showCarList && !showRegisteredCars && !showCreatePost && !showAuth && !showNewThread && !showNewMaintenance && (
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
