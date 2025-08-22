import { useEffect, useState } from 'react';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { TabBar } from './components/ui/TabBar';
import { carModels, currentUser, videos } from './data/dummy';
import { useAuth } from './hooks/useAuth';
import { useMaintenancePosts } from './hooks/useMaintenancePosts';
import { useNotifications } from './hooks/useNotifications';
import { useThreads } from './hooks/useThreads';
import { deleteMaintenancePost } from './lib/threads';
import { AddVehiclePage } from './pages/AddVehiclePage';
import { AdminApplicationsPage } from './pages/AdminApplicationsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPage } from './pages/AuthPage';
import { BlockListPage } from './pages/BlockListPage';
import { CarListPage } from './pages/CarListPage';
import { ChannelsPage } from './pages/ChannelsPage';
import { ContactPage } from './pages/ContactPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CreatorApplicationPage } from './pages/CreatorApplicationPage';
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
import { ProfileEditPage } from './pages/ProfileEditPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisteredInterestedCarsPage } from './pages/RegisteredInterestedCarsPage';
import { ReportPage } from './pages/ReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThreadDetailPage } from './pages/ThreadDetailPage';
import { ThreadsPage } from './pages/ThreadsPage';
import { UploadVideoPage } from './pages/UploadVideoPage';
import { UserNameSetupPage } from './pages/UserNameSetupPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { VideoDetailPage } from './pages/VideoDetailPage';
import { VideosPage } from './pages/VideosPage';
import { AuthProvider } from './providers/AuthProvider';

function AppContent() {
  const { user, userDoc, loading } = useAuth();
  const { threads: allThreads } = useThreads();
  const { maintenancePosts: allMaintenancePosts } = useMaintenancePosts();
  const { unreadCount, fetchUnreadCount } = useNotifications();
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
  const [previousPage, setPreviousPage] = useState<string>('home');
  const [previousThreadTab, setPreviousThreadTab] = useState<'post' | 'question'>('post');
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [interestedCars, setInterestedCars] = useState<string[]>(currentUser.interestedCars || []);
  const [showAuth, setShowAuth] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [showNewMaintenance, setShowNewMaintenance] = useState(false);
  const [initialThreadTab, setInitialThreadTab] = useState<'post' | 'question'>('post');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showUserNameSetup, setShowUserNameSetup] = useState(false);
  const [showUploadVideo, setShowUploadVideo] = useState(false);
  const [showChannels, setShowChannels] = useState(false);

  // 初期ローディング状態を管理
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000); // 3秒間ローディング画面を表示

    return () => clearTimeout(timer);
  }, []);

  // 初期ローディング中はローディング画面を表示
  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  // 認証状態をチェック
  if (loading) {
    return <LoadingScreen />;
  }

  // 未認証の場合は認証ページを表示
  if (!user) {
    return <AuthPage onBackClick={() => {}} />;
  }

  // ユーザー名が設定されていない場合はユーザー名設定画面を表示
  if (user && userDoc && !userDoc.displayName && !showUserNameSetup) {
    return (
      <UserNameSetupPage
        onBackClick={() => {
          // ログアウトして認証画面に戻る
          // 実際のアプリでは、ここでログアウト処理を行う
          window.location.reload();
        }}
        onComplete={() => setShowUserNameSetup(true)}
      />
    );
  }

  const handleThreadClick = (threadId: string, currentThreadTab?: 'post' | 'question') => {
    console.log('handleThreadClick called with threadId:', threadId);
    console.log('handleThreadClick - Available threads:', allThreads.map(t => ({ id: t.id, title: t.title, type: t.type })));
    // 実際のスレッドデータを取得
    const thread = allThreads.find(t => t.id === threadId);
    if (thread) {
      console.log('handleThreadClick - Found thread:', thread);
      setPreviousPage(activeTab);
      if (currentThreadTab) {
        setPreviousThreadTab(currentThreadTab);
      }
      setSelectedThread(thread);
      setShowThreadDetail(true);
    } else {
      console.error('handleThreadClick - Thread not found:', threadId);
    }
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
    console.log('handleMaintenanceClick - Available maintenance posts:', allMaintenancePosts.map(p => ({ id: p.id, title: p.title })));
    // 実際のメンテナンスデータを取得
    const post = allMaintenancePosts.find((p: any) => p.id === postId);
    if (post) {
      console.log('handleMaintenanceClick - Found post:', post);
      setSelectedMaintenance(post);
      setShowMaintenanceDetail(true);
    } else {
      console.error('handleMaintenanceClick - Maintenance post not found:', postId);
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
        setSelectedPostType('general');
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
    setShowChannels(false); // チャンネルページを閉じる
    setShowUploadVideo(false); // 動画アップロードページも閉じる
    setPreviousPage(tabId);
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
        case 'creatorApplication':
          return <CreatorApplicationPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'adminApplications':
          return <AdminApplicationsPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'adminDashboard':
          return <AdminDashboardPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'profile':
          return <ProfileEditPage onBackClick={() => setSettingsSubPage(null)} />;
        default:
          setSettingsSubPage(null);
      }
    }

    if (showSettings) {
      return <SettingsPage onBackClick={() => setShowSettings(false)} onNavigate={(screen) => setSettingsSubPage(screen)} onLoginClick={() => setShowAuth(true)} />;
    }

    if (showNotifications) {
      return <NotificationsPage onBackClick={() => {
        setShowNotifications(false);
        // 通知ページから戻る際に未読カウントを再取得（複数回実行して確実に）
        setTimeout(() => fetchUnreadCount(), 100);
        setTimeout(() => fetchUnreadCount(), 500);
        setTimeout(() => fetchUnreadCount(), 1000);
      }} />;
    }

    if (showThreadDetail) {
      return (
        <ThreadDetailPage
          threadId={selectedThread?.id || ''}
          onBackClick={() => {
            setShowThreadDetail(false);
            setActiveTab(previousPage);
            if (previousPage === 'threads') {
              setInitialThreadTab(previousThreadTab);
            }
          }}
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
          postType={selectedPostType === 'general' ? 'post' : selectedPostType as 'post' | 'question'}
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

    if (showUploadVideo) {
      return (
        <UploadVideoPage onBack={() => setShowUploadVideo(false)} />
      );
    }

    if (showChannels) {
      return (
        <ChannelsPage
          onBack={() => setShowChannels(false)}
          onChannelClick={(channelId) => {
            // チャンネルを選択して動画ページに戻る
            setShowChannels(false);
            // TODO: 選択されたチャンネルの動画をフィルタリング
            console.log('Selected channel:', channelId);
          }}
          onTabChange={handleTabChange}
          activeTab="videos"
        />
      );
    }

    if (showCreatePost) {
      return (
        <CreatePostPage
          postType={selectedPostType === 'post' ? 'general' : selectedPostType}
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
            onVideoClick={handleVideoClick}
            onViewAllVideos={() => setActiveTab('videos')}
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
          if (postType === 'maintenance') {
            setShowNewMaintenance(true);
          } else {
            setSelectedPostType(postType);
            setShowNewThread(true);
          }
        }} />;
      case 'videos':
        return (
          <VideosPage
            onVideoClick={handleVideoClick}
            onUserClick={handleUserClick}
            onDeleteVideo={handleDeleteVideo}
            onUploadVideo={() => setShowUploadVideo(true)}
            onCreatorApplication={() => setSettingsSubPage('creatorApplication')}
            onShowChannels={() => setShowChannels(true)}
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
          onVideoClick={handleVideoClick}
          onViewAllVideos={() => setActiveTab('videos')}
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
         Auth: {user ? `Logged In (${user.uid?.substring(0, 8)}...)` : 'Not Logged In'} | Active Tab: {activeTab} | PostType: {selectedPostType} | ShowNewThread: {showNewThread.toString()} | ShowCreatePost: {showCreatePost.toString()}
       </div>
      {renderPage()}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
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
