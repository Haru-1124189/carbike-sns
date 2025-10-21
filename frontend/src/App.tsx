import { useEffect, useState } from 'react';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { PWAInstallPrompt } from './components/ui/PWAInstallPrompt';
import { TabBar } from './components/ui/TabBar';
import { ThemeProvider } from './contexts/ThemeContext';
import { currentUser, videos } from './data/dummy';
import { useAuth } from './hooks/useAuth';
import { useMaintenancePosts } from './hooks/useMaintenancePosts';
import { useNotifications } from './hooks/useNotifications';
import { usePWAInstallPrompt } from './hooks/usePWAInstallPrompt';
import { useThreads } from './hooks/useThreads';
import { useTouringThreads } from './hooks/useTouringThreads';
import { useVehicles } from './hooks/useVehicles';
import { deleteMaintenancePost } from './lib/threads';
import { AddVehiclePage } from './pages/AddVehiclePage';
import { AdminApplicationsPage } from './pages/AdminApplicationsPage';
import AdminContactManagementPage from './pages/AdminContactManagementPage';
import AdminContentManagementPage from './pages/AdminContentManagementPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminReportManagementPage from './pages/AdminReportManagementPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import { AuthPage } from './pages/AuthPage';
import { BlockListPage } from './pages/BlockListPage';
import { initializeMemoryOptimization } from './utils/memoryOptimization';
import { initializeNetworkOptimization } from './utils/networkOptimization';
import { serviceWorkerManager } from './utils/serviceWorker';
import { initializeUIOptimization } from './utils/uiOptimization';

import { ChannelsPage } from './pages/ChannelsPage';
import { ContactPage } from './pages/ContactPage';
import ContactReplyDetailPage from './pages/ContactReplyDetailPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CreateTouringThreadPage } from './pages/CreateTouringThreadPage';
import { CreatorAnalyticsPage } from './pages/CreatorAnalyticsPage';
import { CreatorApplicationPage } from './pages/CreatorApplicationPage';
import { CreatorUploadPage } from './pages/CreatorUploadPage';
import { EditItemPage } from './pages/EditItemPage';
import { EditMaintenancePage } from './pages/EditMaintenancePage';
import { EditMarketplaceItemPage } from './pages/EditMarketplaceItemPage';
import { EditVehiclePage } from './pages/EditVehiclePage';
import { FollowersListPage } from './pages/FollowersListPage';
import { FollowingListPage } from './pages/FollowingListPage';
import { HelpPage } from './pages/HelpPage';
import { HomePage } from './pages/HomePage';
import { LegalPage } from './pages/LegalPage';
import { MaintenanceDetailPage } from './pages/MaintenanceDetailPage';
import { MaintenancePage } from './pages/MaintenancePage';
import MarketplaceCancelPage from './pages/MarketplaceCancelPage';
import { MarketplaceCheckoutPage } from './pages/MarketplaceCheckoutPage';
import { MarketplaceHomePage } from './pages/MarketplaceHomePage';
import { MarketplaceItemDetailPage } from './pages/MarketplaceItemDetailPage';
import { MarketplaceReviewsPage } from './pages/MarketplaceReviewsPage';
import MarketplaceSuccessPage from './pages/MarketplaceSuccessPage';
import { MessagesPage } from './pages/MessagesPage';
import { MutedWordsPage } from './pages/MutedWordsPage';
import { NewMaintenancePage } from './pages/NewMaintenancePage';
import { NewThreadPage } from './pages/NewThreadPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { PrivacySettingsPage } from './pages/PrivacySettingsPage';
import { ProfileEditPage } from './pages/ProfileEditPage';
import { ProfilePage } from './pages/ProfilePage';
import { RatingPage } from './pages/RatingPage';
import { RegisteredInterestedCarsPage } from './pages/RegisteredInterestedCarsPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ReportPage } from './pages/ReportPage';
import { SellItemPage } from './pages/SellItemPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShopApplicationPage } from './pages/ShopApplicationPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { ThemeSettingsPage } from './pages/ThemeSettingsPage';
import { ThreadDetailPage } from './pages/ThreadDetailPage';
import { ThreadsPage } from './pages/ThreadsPage';
import { TouringChatPage } from './pages/TouringChatPage';
import { TouringChatRoomPage } from './pages/TouringChatRoomPage';
import { TouringThreadDetailPage } from './pages/TouringThreadDetailPage';
import { UploadVideoPage } from './pages/UploadVideoPage';
import { UsernameSetupPage } from './pages/UserNameSetupPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { VehicleRequestDetailPage } from './pages/VehicleRequestDetailPage';
import { VideoAnalyticsPage } from './pages/VideoAnalyticsPage';
import { VideoDetailPage } from './pages/VideoDetailPage';
import { VideosPage } from './pages/VideosPage';
import { AuthProvider } from './providers/AuthProvider';
import { ErrorBoundary } from './utils/errorBoundary';
import { cleanupExpiredCache } from './utils/imageCache';

function AppContent() {
  const { user, userDoc, loading } = useAuth();
  const { threads: allThreads } = useThreads();
  const { maintenancePosts: allMaintenancePosts } = useMaintenancePosts();
  const { threads: touringThreads } = useTouringThreads();
  const { unreadCount, fetchUnreadCount } = useNotifications();
  const { vehicles, deleteVehicle, loading: vehiclesLoading } = useVehicles();
  const { showPrompt, handleClose } = usePWAInstallPrompt();
  

  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSubPage, setSettingsSubPage] = useState<string | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThreadDetail, setShowThreadDetail] = useState(false);
  const [showVideoDetail, setShowVideoDetail] = useState(false);
  const [showCreatorAnalytics, setShowCreatorAnalytics] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showVehicleDetail, setShowVehicleDetail] = useState(false);
  const [showEditVehicle, setShowEditVehicle] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMaintenanceDetail, setShowMaintenanceDetail] = useState(false);

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
  const [mutedWords, setMutedWords] = useState<string[]>([]);
  const [interestedCars, setInterestedCars] = useState<string[]>(currentUser.interestedCars || []);
  const [showAuth, setShowAuth] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [showNewMaintenance, setShowNewMaintenance] = useState(false);
  const [showEditMaintenance, setShowEditMaintenance] = useState(false);
  const [initialThreadTab, setInitialThreadTab] = useState<'post' | 'question'>('post');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showUserNameSetup, setShowUserNameSetup] = useState(false);
  const [showUploadVideo, setShowUploadVideo] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [showTouringChat, setShowTouringChat] = useState(false);
  const [showTouringChatDetail, setShowTouringChatDetail] = useState(false);
  const [showCreateTouringThread, setShowCreateTouringThread] = useState(false);
  const [showTouringThreadDetail, setShowTouringThreadDetail] = useState(false);
  const [selectedTouringThread, setSelectedTouringThread] = useState<any>(null);
  const [showTouringChatRoom, setShowTouringChatRoom] = useState(false);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [showVehicleRequestDetail, setShowVehicleRequestDetail] = useState(false);
  const [selectedVehicleRequest, setSelectedVehicleRequest] = useState<any>(null);
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showVideoAnalytics, setShowVideoAnalytics] = useState(false);
  const [selectedVideoForAnalytics, setSelectedVideoForAnalytics] = useState<any>(null);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showAdminContactManagement, setShowAdminContactManagement] = useState(false);
  const [showAdminReportManagement, setShowAdminReportManagement] = useState(false);
  const [showAdminUserManagement, setShowAdminUserManagement] = useState(false);
  const [showAdminContentManagement, setShowAdminContentManagement] = useState(false);
  const [showContactReplyDetail, setShowContactReplyDetail] = useState(false);
  const [selectedContactInquiryId, setSelectedContactInquiryId] = useState<string | null>(null);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showMarketplaceItemDetail, setShowMarketplaceItemDetail] = useState(false);
  const [showEditMarketplaceItem, setShowEditMarketplaceItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [messagesItemId, setMessagesItemId] = useState<string | null>(null);
  const [messagesSellerId, setMessagesSellerId] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [ratingItemId, setRatingItemId] = useState<string | null>(null);
  const [ratingSellerId, setRatingSellerId] = useState<string | null>(null);
  const [ratingBuyerId, setRatingBuyerId] = useState<string | null>(null);
  const [showSellItem, setShowSellItem] = useState(false);
  const [showMarketplaceCheckout, setShowMarketplaceCheckout] = useState(false);
  const [showMarketplaceSuccess, setShowMarketplaceSuccess] = useState(false);
  const [showMarketplaceCancel, setShowMarketplaceCancel] = useState(false);
  const [showMarketplaceReviews, setShowMarketplaceReviews] = useState(false);
  const [showShopApplication, setShowShopApplication] = useState(false);
  const [showCreatorApplication, setShowCreatorApplication] = useState(false);
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState<any>(null);

  // 初期ローディング状態を管理
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000); // 3秒間ローディング画面を表示

    return () => clearTimeout(timer);
  }, []);

  // アプリ起動時にキャッシュのクリーンアップを実行
  useEffect(() => {
    cleanupExpiredCache();
  }, []);

  // Service Workerの初期化
  useEffect(() => {
    serviceWorkerManager.register();
  }, []);

  // パフォーマンス最適化システムの初期化
  useEffect(() => {
    initializeMemoryOptimization();
    initializeNetworkOptimization();
    initializeUIOptimization();
  }, []);

  // ユーザーデータからブロックリストとミュートワードを取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase/init');
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBlockedUsers(userData.blockedUsers || []);
          setMutedWords(userData.mutedWords || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  // カスタムイベントでタブ変更を処理
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const tabId = event.detail;
      setActiveTab(tabId);
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('changeTab', handleTabChange as EventListener);
    };
  }, []);

  // 募集締切の監視（5分ごと）
  useEffect(() => {
    const processExpiredThreads = async () => {
      try {
        const { processExpiredTouringThreads } = await import('./lib/touring');
        await processExpiredTouringThreads();
      } catch (error) {
        console.error('Error processing expired touring threads:', error);
      }
    };

    // 初回実行
    processExpiredThreads();

    // 5分ごとに実行
    const interval = setInterval(processExpiredThreads, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 期限切れチャットルームの自動解散（5分ごと）
  useEffect(() => {
    const processExpiredChatRooms = async () => {
      try {
        const { processExpiredChatRooms } = await import('./lib/touring');
        await processExpiredChatRooms();
      } catch (error) {
        console.error('Error processing expired chat rooms:', error);
      }
    };

    // 初回実行
    processExpiredChatRooms();

    // 5分ごとに実行
    const interval = setInterval(processExpiredChatRooms, 5 * 60 * 1000);

    return () => clearInterval(interval);
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
      <UsernameSetupPage
        onBack={() => {
          // ログアウトして認証画面に戻る
          // 実際のアプリでは、ここでログアウト処理を行う
          window.location.reload();
        }}
        onComplete={() => setShowUserNameSetup(true)}
      />
    );
  }

  // ユーザー名（@username）が設定されていない場合はユーザー名設定画面を表示
  if (user && userDoc && !userDoc.username && !showUserNameSetup) {
    return (
      <UsernameSetupPage
        onBack={() => {
          // ログアウトして認証画面に戻る
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

  const handleVideoAnalytics = (videoId: string) => {
    console.log('Video analytics clicked:', videoId);
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideoForAnalytics(video);
      setShowVideoAnalytics(true);
    }
  };

  const handleCreatorAnalytics = () => {
    console.log('Creator analytics clicked');
    setShowCreatorAnalytics(true);
  };

  const handleVehicleClick = async (vehicleId: string) => {
    // まずローカルのvehicles配列から検索
    let vehicle = vehicles.find(v => v.id === vehicleId);
    
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setShowVehicleDetail(true);
    } else {
      // ローカルにない場合はFirestoreから直接取得
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase/init');
        
        const vehicleDoc = await getDoc(doc(db, 'vehicles', vehicleId));
        
        if (vehicleDoc.exists()) {
          const vehicleData = vehicleDoc.data();
          vehicle = {
            id: vehicleDoc.id,
            ...vehicleData
          } as any;
          
          setSelectedVehicle(vehicle);
          setShowVehicleDetail(true);
        } else {
          alert('車両が見つかりませんでした');
        }
      } catch (error) {
        alert('車両データの取得に失敗しました');
      }
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await deleteVehicle(vehicleId);
      setShowVehicleDetail(false);
      alert('車両を削除しました');
    } catch (error) {
      console.error('車両の削除に失敗しました:', error);
      alert('車両の削除に失敗しました');
    }
  };

  const handleEditVehicle = () => {
    setShowVehicleDetail(false);
    setShowEditVehicle(true);
  };

  const handleUserClick = (userId: string, displayName?: string) => {
    console.log('App.tsx - handleUserClick called:', { userId, displayName });
    console.log('App.tsx - Current state - showUserProfile:', showUserProfile, 'selectedUser:', selectedUser);
    
    // 全ての他のページを閉じる
    setShowMarketplaceItemDetail(false);
    setShowMarketplace(false);
    setShowThreadDetail(false);
    setShowMaintenanceDetail(false);
    setShowVideoDetail(false);
    
    // 即座にユーザー情報を設定してページを表示
    const user = {
      id: userId,
      name: displayName || 'Unknown User',
      avatar: '',
      cars: [],
      interestedCars: []
    };
    
    console.log('App.tsx - Setting user immediately:', user);
    setSelectedUser(user);
    setShowUserProfile(true);
    console.log('App.tsx - State updated - showUserProfile set to true');
    
    // バックグラウンドでFirestoreから詳細情報を取得
    const fetchUserDetails = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase/init');
        
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedUser = {
            id: userId,
            name: userData.displayName || displayName || 'Unknown User',
            avatar: userData.photoURL || '',
            cars: userData.cars || [],
            interestedCars: userData.interestedCars || []
          };
          
          console.log('User data retrieved from Firestore:', updatedUser);
          setSelectedUser(updatedUser);
        } else {
          console.warn('User not found in Firestore:', userId);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserDetails();
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

  const handleVehicleRequestClick = (requestId: string, requestData: any, fromUserId: string, fromUserName: string, createdAt: Date) => {
    console.log('handleVehicleRequestClick called:', { requestId, requestData, fromUserId, fromUserName, createdAt });
    setSelectedVehicleRequest({
      id: requestId,
      data: requestData,
      fromUserId,
      fromUserName,
      createdAt
    });
    setShowVehicleRequestDetail(true);
    console.log('Vehicle request detail page should be shown');
  };

  const handleReportClick = (reportId: string, reportData: any, createdAt: Date) => {
    console.log('handleReportClick called:', { reportId, reportData, createdAt });
    setSelectedReport({
      id: reportId,
      data: reportData,
      createdAt
    });
    setShowReportDetail(true);
    console.log('Report detail page should be shown');
  };

  const handleAddVehicleClick = () => {
    setShowAddVehicle(true);
  };

  const handleItemClick = (item: any) => {
    console.log('handleItemClick called with item:', item);
    setSelectedMarketplaceItem(item);
    setShowMarketplaceItemDetail(true);
  };

  const handleEditItemClick = (itemId: string) => {
    console.log('handleEditItemClick called with itemId:', itemId);
    setEditingItemId(itemId);
    setShowEditItem(true);
  };

  const handleNavigateToMessages = (itemId: string, sellerId: string) => {
    console.log('handleNavigateToMessages called:', { itemId, sellerId });
    setMessagesItemId(itemId);
    setMessagesSellerId(sellerId);
    setShowMessages(true);
  };

  const handleNavigateToRating = (itemId: string, sellerId: string, buyerId: string) => {
    console.log('handleNavigateToRating called:', { itemId, sellerId, buyerId });
    setRatingItemId(itemId);
    setRatingSellerId(sellerId);
    setRatingBuyerId(buyerId);
    setShowRating(true);
  };

  const handleAddMaintenance = () => {
    setSelectedPostType('maintenance');
    setShowCreatePost(true);
  };

  const handleEditMaintenance = (postId: string) => {
    const maintenance = allMaintenancePosts.find(post => post.id === postId);
    if (maintenance) {
      setSelectedMaintenance(maintenance);
      setShowEditMaintenance(true);
    }
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
      case 'marketplace':
        setActiveTab('marketplace');
        break;
      case 'creator-analytics':
        setShowCreatorAnalytics(true);
        break;
      default:
        console.log(`${actionId} clicked`);
    }
  };

  const handleViewAllThreads = () => {
    setActiveTab('threads');
  };

  const handleNavigateToAdminDashboard = () => {
    setShowAdminDashboard(true);
    // 他のページを閉じる
    setShowNotifications(false);
    setShowSettings(false);
    setShowThreadDetail(false);
    setShowVideoDetail(false);
    setShowTouringChat(false);
    setShowCreateTouringThread(false);
    setShowTouringThreadDetail(false);
    setShowTouringChatRoom(false);
    setShowVideoAnalytics(false);
    setShowPrivacySettings(false);
  };

  const handleNavigateToAdminContactManagement = () => {
    setShowAdminContactManagement(true);
    setShowAdminDashboard(false);
  };

  const handleNavigateToAdminReportManagement = () => {
    setShowAdminReportManagement(true);
    setShowAdminDashboard(false);
  };

  const handleNavigateToAdminUserManagement = () => {
    setShowAdminUserManagement(true);
    setShowAdminDashboard(false);
  };

  const handleNavigateToAdminContentManagement = () => {
    setShowAdminContentManagement(true);
    setShowAdminDashboard(false);
  };

  const handleNavigateToContactReplyDetail = (inquiryId: string) => {
    setSelectedContactInquiryId(inquiryId);
    setShowContactReplyDetail(true);
    setShowNotifications(false);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setShowSettings(false);
    setSettingsSubPage(null);
    setShowPrivacyPolicy(false);
    setShowTermsOfService(false);
    setShowNotifications(false);
    setShowThreadDetail(false);
    setShowVideoDetail(false);
    setShowAddVehicle(false);
    setShowVehicleDetail(false);
    setShowEditVehicle(false);
    setShowThemeSettings(false);
    setShowUserProfile(false);
    setShowMaintenanceDetail(false);
    
    setShowRegisteredCars(false);
    setShowCreatePost(false);
    setShowNewThread(false);
    setShowNewMaintenance(false);
    setShowEditMaintenance(false);
    setShowChannels(false); // チャンネルページを閉じる
    setShowUploadVideo(false); // 動画アップロードページも閉じる
    setShowMarketplace(false);
    setShowMarketplaceItemDetail(false);
    setShowEditMarketplaceItem(false);
    setShowSellItem(false);
    setShowMarketplaceCheckout(false);
    setShowMarketplaceSuccess(false);
    setShowMarketplaceCancel(false);
    setShowMarketplaceReviews(false);
    
    // ツーリングチャット関連のページを閉じる
    setShowTouringChat(false);
    setShowCreateTouringThread(false);
    setShowTouringThreadDetail(false);
    setSelectedTouringThread(null);
    setShowTouringChatRoom(false);
    setSelectedChatRoomId(null);
    
    // 動画分析ページを閉じる
    setShowVideoAnalytics(false);
    setSelectedVideoForAnalytics(null);
    
    // プライバシー設定ページを閉じる
    setShowPrivacySettings(false);
    
    // 管理者ダッシュボードを閉じる
    setShowAdminDashboard(false);
    setShowAdminContactManagement(false);
    setShowAdminReportManagement(false);
    setShowContactReplyDetail(false);
    setSelectedContactInquiryId(null);
    
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
    
    // ユーザープロフィールページの表示（最優先）
    if (showUserProfile) {
      return <UserProfilePage 
        user={selectedUser} 
        onBackClick={() => setShowUserProfile(false)}
        onUserClick={handleUserClick}
      />;
    }
    
    // 管理者ダッシュボードページの表示
    if (showAdminDashboard) {
      return (
        <AdminDashboardPage
          onBackClick={() => {
            setShowAdminDashboard(false);
          }}
          onNavigateToContactManagement={handleNavigateToAdminContactManagement}
          onNavigateToReportManagement={handleNavigateToAdminReportManagement}
          onNavigateToUserManagement={handleNavigateToAdminUserManagement}
          onNavigateToContentManagement={handleNavigateToAdminContentManagement}
        />
      );
    }

    // 管理者お問い合わせ管理ページの表示
    if (showAdminContactManagement) {
      return (
        <AdminContactManagementPage
          onBackClick={() => {
            setShowAdminContactManagement(false);
            setShowAdminDashboard(true);
          }}
        />
      );
    }

    // 管理者通報管理ページの表示
    if (showAdminReportManagement) {
      return (
        <AdminReportManagementPage
          onBackClick={() => {
            setShowAdminReportManagement(false);
            setShowAdminDashboard(true);
          }}
        />
      );
    }

    // 管理者ユーザー管理ページの表示
    if (showAdminUserManagement) {
      return (
        <AdminUserManagementPage
          onBackClick={() => {
            setShowAdminUserManagement(false);
            setShowAdminDashboard(true);
          }}
        />
      );
    }

    // 管理者コンテンツ管理ページの表示
    if (showAdminContentManagement) {
      return (
        <AdminContentManagementPage
          onBackClick={() => {
            setShowAdminContentManagement(false);
            setShowAdminDashboard(true);
          }}
        />
      );
    }

    // お問い合わせ返信詳細ページの表示
    if (showContactReplyDetail && selectedContactInquiryId) {
      return (
        <ContactReplyDetailPage
          inquiryId={selectedContactInquiryId}
          onBack={() => {
            setShowContactReplyDetail(false);
            setSelectedContactInquiryId(null);
            setShowNotifications(true);
          }}
        />
      );
    }
    
    // プライバシー設定ページの表示（最優先）
    if (showPrivacySettings) {
      return (
        <PrivacySettingsPage
          onBackClick={() => {
            setShowPrivacySettings(false);
          }}
        />
      );
    }

    // プライバシーポリシーページの表示
    if (showPrivacyPolicy) {
      return (
        <PrivacyPolicyPage
          onBackClick={() => {
            setShowPrivacyPolicy(false);
          }}
        />
      );
    }

    // 利用規約ページの表示
    if (showTermsOfService) {
      return (
        <TermsOfServicePage
          onBackClick={() => {
            setShowTermsOfService(false);
          }}
        />
      );
    }
    
    // 動画分析ページの表示（最優先）
    if (showVideoAnalytics && selectedVideoForAnalytics) {
      return (
        <VideoAnalyticsPage
          video={selectedVideoForAnalytics}
          onBackClick={() => {
            setShowVideoAnalytics(false);
            setSelectedVideoForAnalytics(null);
          }}
        />
      );
    }
    
    // クリエイター分析ページの表示（最優先）
    if (showCreatorAnalytics) {
      return (
        <CreatorAnalyticsPage
          onBackClick={() => {
            setShowCreatorAnalytics(false);
          }}
        />
      );
    }
    
    // ツーリングチャットルームページの表示（最優先）
    if (showTouringChatRoom && selectedTouringThread && selectedChatRoomId) {
      return (
        <TouringChatRoomPage
          thread={selectedTouringThread}
          onBackClick={() => {
            setShowTouringChatRoom(false);
            setSelectedTouringThread(null);
            setSelectedChatRoomId(null);
          }}
        />
      );
    }

    // ツーリングスレッド詳細ページの表示
    if (showTouringThreadDetail && selectedTouringThread) {
      return (
        <TouringThreadDetailPage
          thread={selectedTouringThread}
          onBackClick={() => {
            setShowTouringThreadDetail(false);
            setSelectedTouringThread(null);
          }}
          onUserClick={(userId, userName) => {
            // ユーザープロフィールページに遷移
            console.log('User clicked:', userId, userName);
          }}
          onDeleteClick={(threadId) => {
            // ツーリングスレッドを削除
            console.log('Delete touring thread:', threadId);
            setShowTouringThreadDetail(false);
            setSelectedTouringThread(null);
          }}
        />
      );
    }

    // ツーリング募集作成ページの表示
    if (showCreateTouringThread) {
      return (
        <CreateTouringThreadPage
          onBack={() => setShowCreateTouringThread(false)}
          onSubmit={(data) => {
            console.log('Touring thread created:', data);
            // 実際の実装ではFirestoreに保存
            setShowCreateTouringThread(false);
            setShowTouringChat(true);
          }}
        />
      );
    }

    // ツーリングチャットページの表示
    if (showTouringChat) {
      return (
        <TouringChatPage
          onBack={() => {
            setShowTouringChat(false);
            setActiveTab('home'); // ホームに戻る
          }}
          onCreateThread={() => {
            console.log('onCreateThread called, setting showCreateTouringThread to true');
            setShowCreateTouringThread(true);
          }}
          onThreadClick={(threadId) => {
            // ツーリング詳細ページに遷移
            console.log('Touring thread clicked:', threadId);
            // 選択されたスレッドを取得
            const thread = touringThreads.find(t => t.id === threadId);
            if (thread) {
              setSelectedTouringThread(thread);
              setShowTouringThreadDetail(true);
            } else {
              console.error('Touring thread not found:', threadId);
            }
          }}
          onChatRoomClick={(chatRoomId, threadId) => {
            // チャットルームページに遷移
            console.log('Chat room clicked:', chatRoomId, threadId);
            const thread = touringThreads.find(t => t.id === threadId);
            if (thread) {
              setSelectedTouringThread(thread);
              setSelectedChatRoomId(chatRoomId);
              setShowTouringChatRoom(true);
            } else {
              console.error('Touring thread not found for chat room:', threadId);
            }
          }}
        />
      );
    }
    
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
        case 'creatorUpload':
          return <CreatorUploadPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'creatorApplication':
          return <CreatorApplicationPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'adminApplications':
          return <AdminApplicationsPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'adminDashboard':
          return <AdminDashboardPage 
            onBackClick={() => setSettingsSubPage(null)}
            onNavigateToContactManagement={handleNavigateToAdminContactManagement}
            onNavigateToReportManagement={handleNavigateToAdminReportManagement}
            onNavigateToUserManagement={handleNavigateToAdminUserManagement}
            onNavigateToContentManagement={handleNavigateToAdminContentManagement}
          />;
        case 'profile':
          return <ProfileEditPage onBackClick={() => setSettingsSubPage(null)} />;
        case 'theme':
          return <ThemeSettingsPage onBackClick={() => setSettingsSubPage(null)} />;
        default:
          setSettingsSubPage(null);
      }
    }

    if (showSettings) {
      return <SettingsPage 
        onBackClick={() => setShowSettings(false)} 
        onNavigate={(screen) => {
          if (screen === 'privacySettings') {
            setShowPrivacySettings(true);
          } else if (screen === 'privacyPolicy') {
            setShowPrivacyPolicy(true);
          } else if (screen === 'termsOfService') {
            setShowTermsOfService(true);
          } else {
            setSettingsSubPage(screen);
          }
        }} 
        onLoginClick={() => setShowAuth(true)}
        onNavigateToShopApplication={() => setShowShopApplication(true)}
        onNavigateToCreatorApplication={() => setShowCreatorApplication(true)}
      />;
    }

    // App render state ログを削除

    if (showReportDetail && selectedReport) {
      console.log('Rendering ReportDetailPage with:', selectedReport);
      return <ReportDetailPage
        onBackClick={() => {
          setShowReportDetail(false);
          setSelectedReport(null);
        }}
        reportId={selectedReport.id}
        reportData={selectedReport.data}
        createdAt={selectedReport.createdAt}
      />;
    }

    if (showVehicleRequestDetail && selectedVehicleRequest) {
      console.log('Rendering VehicleRequestDetailPage with:', selectedVehicleRequest);
      return <VehicleRequestDetailPage
        onBackClick={() => {
          setShowVehicleRequestDetail(false);
          setSelectedVehicleRequest(null);
        }}
        requestId={selectedVehicleRequest.id}
        requestData={selectedVehicleRequest.data}
        fromUserId={selectedVehicleRequest.fromUserId}
        fromUserName={selectedVehicleRequest.fromUserName}
        createdAt={selectedVehicleRequest.createdAt}
      />;
    }

    if (showNotifications) {
      return <NotificationsPage 
        onBackClick={() => {
          setShowNotifications(false);
          // 通知ページから戻る際に未読カウントを再取得（複数回実行して確実に）
          setTimeout(() => fetchUnreadCount(), 100);
          setTimeout(() => fetchUnreadCount(), 500);
          setTimeout(() => fetchUnreadCount(), 1000);
        }}
        onVehicleRequestClick={handleVehicleRequestClick}
        onReportClick={handleReportClick}
        onNavigateToAdminDashboard={handleNavigateToAdminDashboard}
        onNavigateToContactReplyDetail={handleNavigateToContactReplyDetail}
      />;
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
        onEditClick={handleEditVehicle}
        onDeleteClick={() => handleDeleteVehicle(selectedVehicle?.id)}
      />;
    }


    if (showFollowingList) {
      return (
        <FollowingListPage
          onBackClick={() => setShowFollowingList(false)}
          onUserClick={handleUserClick}
        />
      );
    }

    if (showFollowersList) {
      return (
        <FollowersListPage
          onBackClick={() => setShowFollowersList(false)}
          onUserClick={handleUserClick}
        />
      );
    }

    if (showEditVehicle) {
      return <EditVehiclePage 
        vehicle={selectedVehicle} 
        onBackClick={() => {
          setShowEditVehicle(false);
          setShowVehicleDetail(true);
        }}
      />;
    }

    if (showThemeSettings) {
      return <ThemeSettingsPage onBackClick={() => setShowThemeSettings(false)} />;
    }

    if (showMaintenanceDetail) {
      return (
        <MaintenanceDetailPage
          post={selectedMaintenance}
          onBackClick={() => setShowMaintenanceDetail(false)}
          onUserClick={handleUserClick}
          onEditClick={handleEditMaintenance}
        />
      );
    }

    if (showEditMaintenance) {
      return (
        <EditMaintenancePage
          post={selectedMaintenance}
          onBackClick={() => setShowEditMaintenance(false)}
          onSuccess={() => {
            setShowEditMaintenance(false);
            setShowMaintenanceDetail(true);
          }}
        />
      );
    }



    if (showRegisteredCars) {
      return (
        <RegisteredInterestedCarsPage
          onBackClick={() => setShowRegisteredCars(false)}
          onRemoveCar={handleRemoveInterestedCar}
          onAddCar={handleAddInterestedCar}
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
          onUserClick={handleUserClick}
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

            onShowRegisteredCars={() => setShowRegisteredCars(true)}
            onDeleteThread={handleDeleteThread}
            onVideoClick={handleVideoClick}
            onViewAllVideos={() => setActiveTab('videos')}
            onTouringChatClick={() => {
              setShowTouringChat(true);
              setActiveTab('threads'); // ツーリングチャットはスレッド関連として扱う
            }}
            blockedUsers={blockedUsers}
            mutedWords={mutedWords}
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
            mutedWords={mutedWords}
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
            onEditMaintenance={handleEditMaintenance}
            blockedUsers={blockedUsers}
            mutedWords={mutedWords}
          />
        );
      case 'marketplace':
        return (
          <MarketplaceHomePage
            onBackClick={() => setShowMarketplace(false)}
            onItemClick={(item) => {
              setSelectedMarketplaceItem(item);
              setShowMarketplaceItemDetail(true);
            }}
            onNavigateToItemDetail={(itemId) => {
              // itemIdを直接設定
              setSelectedMarketplaceItem({ id: itemId } as any);
              setShowMarketplaceItemDetail(true);
            }}
            onNavigateToSell={() => setShowSellItem(true)}
            onSellClick={() => setShowSellItem(true)}
          />
        );
      case 'videos':
        return (
          <VideosPage
            onUserClick={handleUserClick}
            onDeleteVideo={handleDeleteVideo}
            onUploadVideo={() => setShowUploadVideo(true)}
            onCreatorApplication={() => setSettingsSubPage('creatorApplication')}
            onShowChannels={() => setShowChannels(true)}
            onVideoAnalytics={handleVideoAnalytics}
            onCreatorAnalytics={handleCreatorAnalytics}
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
            onUserClick={handleUserClick}
            onFollowingClick={() => setShowFollowingList(true)}
            onFollowersClick={() => setShowFollowersList(true)}
            onItemClick={handleItemClick}
            onSellItemClick={() => setShowSellItem(true)}
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

  // マーケットプレイス関連のページレンダリング（編集を優先）
  if (showEditMarketplaceItem) {
    return (
      <EditMarketplaceItemPage
        itemId={selectedMarketplaceItem?.id}
        item={selectedMarketplaceItem}
        onBackClick={() => setShowEditMarketplaceItem(false)}
        onSave={() => {
          setShowEditMarketplaceItem(false);
          setShowMarketplaceItemDetail(false);
        }}
      />
    );
  }

  if (showMarketplaceItemDetail) {
    return (
      <MarketplaceItemDetailPage
        itemId={selectedMarketplaceItem?.id}
        item={selectedMarketplaceItem}
        onBackClick={() => setShowMarketplaceItemDetail(false)}
        onNavigateToEdit={handleEditItemClick}
        onNavigateToMarketplace={() => {
          setShowMarketplaceItemDetail(false);
          setShowMarketplace(true);
        }}
        onNavigateToMessages={handleNavigateToMessages}
        onNavigateToRating={handleNavigateToRating}
        onEditClick={() => setShowEditMarketplaceItem(true)}
        onCheckoutClick={() => setShowMarketplaceCheckout(true)}
        onReviewsClick={() => setShowMarketplaceReviews(true)}
        onUserClick={handleUserClick}
      />
    );
  }

  if (showEditItem && editingItemId) {
    return (
      <EditItemPage
        itemId={editingItemId}
        onBack={() => {
          setShowEditItem(false);
          setEditingItemId(null);
        }}
        onSave={() => {
          setShowEditItem(false);
          setEditingItemId(null);
          setShowMarketplaceItemDetail(false);
        }}
      />
    );
  }

  if (showMessages) {
    return (
      <MessagesPage
        itemId={messagesItemId || undefined}
        sellerId={messagesSellerId || undefined}
        onBackClick={() => {
          setShowMessages(false);
          setMessagesItemId(null);
          setMessagesSellerId(null);
        }}
      />
    );
  }

  if (showRating && ratingItemId && ratingSellerId && ratingBuyerId) {
    return (
      <RatingPage
        orderId="temp-order-id" // 実際の注文IDが必要
        itemId={ratingItemId}
        sellerId={ratingSellerId}
        buyerId={ratingBuyerId}
        itemTitle={selectedMarketplaceItem?.title || '商品'}
        isSeller={user?.uid === ratingSellerId}
        onBackClick={() => {
          setShowRating(false);
          setRatingItemId(null);
          setRatingSellerId(null);
          setRatingBuyerId(null);
        }}
      />
    );
  }

  if (showSellItem) {
    return (
      <SellItemPage
        onBackClick={() => setShowSellItem(false)}
        onSave={() => setShowSellItem(false)}
      />
    );
  }

  if (showShopApplication) {
    return (
      <ShopApplicationPage
        onBackClick={() => setShowShopApplication(false)}
      />
    );
  }

  if (showCreatorApplication) {
    return (
      <CreatorApplicationPage
        onBackClick={() => setShowCreatorApplication(false)}
      />
    );
  }

  if (showMarketplaceCheckout) {
    return (
      <MarketplaceCheckoutPage
        item={selectedMarketplaceItem}
        onBackClick={() => setShowMarketplaceCheckout(false)}
        onSuccess={() => setShowMarketplaceSuccess(true)}
        onCancel={() => setShowMarketplaceCancel(true)}
      />
    );
  }

  if (showMarketplaceSuccess) {
    return (
      <MarketplaceSuccessPage
        onBackClick={() => {
          setShowMarketplaceSuccess(false);
          setShowMarketplaceCheckout(false);
          setShowMarketplaceItemDetail(false);
        }}
      />
    );
  }

  if (showMarketplaceCancel) {
    return (
      <MarketplaceCancelPage
        onBackClick={() => {
          setShowMarketplaceCancel(false);
          setShowMarketplaceCheckout(false);
          setShowMarketplaceItemDetail(false);
        }}
      />
    );
  }

  if (showMarketplaceReviews) {
    return (
      <MarketplaceReviewsPage
        item={selectedMarketplaceItem}
        onBackClick={() => setShowMarketplaceReviews(false)}
      />
    );
  }

    return (
    <div className="App">
       {renderPage()}
       <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
       {showPrompt && <PWAInstallPrompt onClose={handleClose} />}
     </div>
   );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
