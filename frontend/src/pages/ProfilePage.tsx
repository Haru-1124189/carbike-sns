import { doc, getDoc } from 'firebase/firestore';
import { Edit, MessageSquare, Package, Star, UserCheck, Users, Wrench } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { RatingList } from '../components/RatingList';
import { AppHeader } from '../components/ui/AppHeader';
import { MarketplaceItemCard } from '../components/ui/MarketplaceItemCard';
import { NativeAd, insertNativeAds } from '../components/ui/NativeAd';
import { PersistentImage } from '../components/ui/PersistentImage';
import { PrivacyToggle } from '../components/ui/PrivacyToggle';
import { SectionTitle } from '../components/ui/SectionTitle';
import { SingleImageUpload } from '../components/ui/SingleImageUpload';
import { ThreadCard } from '../components/ui/ThreadCard';
import { VehicleCard } from '../components/ui/VehicleCard';
import { db } from '../firebase/init';
import { useAuth } from '../hooks/useAuth';
import { useMyFollowData } from '../hooks/useFollow';
import { useMaintenancePosts } from '../hooks/useMaintenancePosts';
import { useItemSearch } from '../hooks/useMarketplace';
import { usePrivacy } from '../hooks/usePrivacy';
import { useRatings } from '../hooks/useRatings';
import { useThreads } from '../hooks/useThreads';
import { useVehicles } from '../hooks/useVehicles';

type ProfileTab = 'posts' | 'questions' | 'maintenance' | 'items' | 'ratings';

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
  onFollowingClick?: () => void;
  onFollowersClick?: () => void;
  onItemClick?: (item: any) => void;
  onSellItemClick?: () => void;
  onNavigateToRating?: (itemId: string, sellerId: string, buyerId: string) => void;
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
  onUserClick,
  onFollowingClick,
  onFollowersClick,
  onItemClick,
  onSellItemClick,
  onNavigateToRating
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [adminEditingAvatar, setAdminEditingAvatar] = useState(false);
  const [adminAvatarError, setAdminAvatarError] = useState('');
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  const { user, userDoc, updateUserDoc, loading: authLoading } = useAuth();
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { followersCount, followingCount } = useMyFollowData();
  const { isPrivate } = usePrivacy();
  const { getUserRatings, calculateUserAverageRating, getPendingRatingReminders } = useRatings();
  const [pendingRateCount, setPendingRateCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  
  const { threads: allThreads, loading: threadsLoading } = useThreads({ 
    currentUserId: user?.uid 
  });
  
  const { maintenancePosts, loading: maintenanceLoading } = useMaintenancePosts({ 
    currentUserId: user?.uid 
  });

  // 自分の商品を取得
  const { items: myItems, loading: itemsLoading } = useItemSearch(
    { sellerId: user?.uid, status: 'active' },
    'newest'
  );

  // 評価データを読み込み
  const loadUserRatingsInternal = async (type: 'seller'|'buyer'|'all' = 'all') => {
    if (!user?.uid) return;
    const ratingsData = await getUserRatings(user.uid);
    const filtered = type === 'all' ? ratingsData : ratingsData.filter((r: any) => r.type === type);
    setUserRatings(filtered);
    const ratingStats = await calculateUserAverageRating(user.uid);
    setAverageRating(ratingStats.averageRating);
    setTotalRatings(ratingStats.totalRatings);
  };

  useEffect(() => {
    loadUserRatingsInternal('all');
    // 未評価件数の取得（アプリ内リマインダー）
    (async () => {
      if (user?.uid) {
        const res = await getPendingRatingReminders(user.uid);
        setPendingRateCount(res.count);
        // 注文の詳細（商品タイトル/画像、相手の表示名）を取得
        const detailed = await Promise.all(
          res.orders.map(async (o: any) => {
            try {
              const itemSnap = await getDoc(doc(db, 'items', o.itemId));
              const itemData: any = itemSnap.exists() ? itemSnap.data() : {};
              const itemTitle = itemData.title || '商品';
              const itemThumb = itemData.thumbnail || (itemData.images && itemData.images[0]) || '';

              const counterpartId = user.uid === o.sellerId ? o.buyerId : o.sellerId;
              let counterpartName = `ユーザー${(counterpartId || '').slice(-4)}`;
              if (counterpartId) {
                const userSnap = await getDoc(doc(db, 'users', counterpartId));
                if (userSnap.exists()) {
                  const u = userSnap.data() as any;
                  counterpartName = u.displayName || counterpartName;
                }
              }

              return { ...o, itemTitle, itemThumb, counterpartName };
            } catch {
              return { ...o, itemTitle: '商品', itemThumb: '', counterpartName: 'ユーザー' };
            }
          })
        );
        setPendingOrders(detailed);
      }
    })();

    // 評価作成イベントで未評価リストを更新
    const handler = (e: any) => {
      const { orderId, raterId } = e.detail || {};
      if (!orderId || !raterId || raterId !== user?.uid) return;
      setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
      setPendingRateCount((c) => Math.max(0, c - 1));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('rating:created' as any, handler as any);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('rating:created' as any, handler as any);
      }
    };
  }, [user?.uid]);

  // 自分の投稿と質問のみをフィルタリング
  const userPosts = useMemo(() => {
    if (!user?.uid) return [];
    
    return allThreads.filter(thread => {
      const isPost = thread.type === 'post';
      const isAuthor = thread.authorId === user.uid;
      return isPost && isAuthor;
    });
  }, [allThreads, user?.uid]);

  const userQuestions = useMemo(() => {
    if (!user?.uid) return [];
    
    return allThreads.filter(thread => {
      const isQuestion = thread.type === 'question';
      const isAuthor = thread.authorId === user.uid;
      return isQuestion && isAuthor;
    });
  }, [allThreads, user?.uid]);

  // 自分の整備記録のみをフィルタリング
  const userMaintenanceRecords = useMemo(() => {
    if (!user?.uid) return [];
    return maintenancePosts.filter(post => post.authorId === user.uid);
  }, [maintenancePosts, user?.uid]);

  // スレッドのみを表示（ネイティブ広告は別途挿入）
  const displayItems = useMemo(() => {
    switch (activeTab) {
      case 'posts':
        return userPosts;
      case 'questions':
        return userQuestions;
      default:
        return [];
    }
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
      // imageUrlがnullの場合はundefinedを渡す（フィールドを更新しない）
      await updateUserDoc({ photoURL: imageUrl || undefined });
      setIsAdminEditing(false);
    } catch (err: any) {
      setAdminAvatarError(err.message || 'アバターの更新に失敗しました');
    } finally {
      setAdminEditingAvatar(false);
    }
  };

  // ネイティブ広告付きの表示アイテムを生成（完全固定）
  const displayItemsWithAds = useMemo(() => {
    return insertNativeAds(displayItems, 4);
  }, [displayItems.length, activeTab]); // displayItemsの内容ではなく長さとタブのみで判定

  const renderTabContent = () => {
    if (threadsLoading || maintenanceLoading || itemsLoading) {
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
            {displayItemsWithAds.length > 0 ? (
              displayItemsWithAds.map((item) => {
                if ('type' in item && item.type === 'ad') {
                  return <NativeAd key={item.id} ad={(item as any).ad} />;
                }
                return (
                  <ThreadCard
                    key={item.id}
                    thread={item as any}
                    onClick={() => handleThreadClick(item.id)}
                    onDelete={onDeleteThread}
                    onBlockUser={onBlockUser}
                    onReportThread={onReportThread}
                    onUserClick={onUserClick}
                  />
                );
              })
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
            {displayItemsWithAds.length > 0 ? (
              displayItemsWithAds.map((item) => {
                if ('type' in item && item.type === 'ad') {
                  return <NativeAd key={item.id} ad={(item as any).ad} />;
                }
                return (
                  <ThreadCard
                    key={item.id}
                    thread={item as any}
                    onClick={() => handleThreadClick(item.id)}
                    onDelete={onDeleteThread}
                    onBlockUser={onBlockUser}
                    onReportThread={onReportThread}
                    onUserClick={onUserClick}
                  />
                );
              })
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
                  className="cursor-pointer hover:bg-surface-light rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-start space-x-4">
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
                          <Wrench size={20} className="text-text-secondary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-medium text-text-primary truncate">{record.title}</h3>
                        <span className="text-sm text-text-secondary flex-shrink-0">
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
                            : record.createdAt && typeof record.createdAt === 'object' && 'toDate' in (record.createdAt as any)
                            ? (record.createdAt as any).toDate().toLocaleString('ja-JP', {
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
      case 'items':
        return (
          <div className="space-y-4">
            {myItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {myItems.map((item) => (
                  <MarketplaceItemCard
                    key={item.id}
                    item={item}
                    viewMode="grid"
                    onClick={() => onItemClick?.(item)}
                    showSellerType={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-sm text-gray-400 mb-4">出品した商品がありません</div>
                <button
                  onClick={onSellItemClick}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  商品を出品する
                </button>
              </div>
            )}
          </div>
        );
      case 'ratings':
        return (
          <div className="space-y-4">
            {/* 評価サマリー */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  取引評価
                  {pendingRateCount > 0 && (
                    <button
                      onClick={() => setShowPendingModal(true)}
                      className="inline-flex items-center px-2 py-0.5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      title="未評価の取引を確認"
                    >
                      未評価 {pendingRateCount}
                    </button>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={`${
                          star <= Math.round(averageRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-text-primary">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span>{totalRatings}件の評価</span>
                {/* 並び替え */}
                <label className="ml-auto flex items-center gap-2">
                  <span className="text-xs">並び替え</span>
                  <select
                    onChange={(e) => {
                      const v = e.target.value;
                      setUserRatings(prev => {
                        const arr = [...prev];
                        if (v === 'new') arr.sort((a: any,b: any)=> (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0));
                        if (v === 'old') arr.sort((a: any,b: any)=> (a.createdAt?.toMillis?.()||0) - (b.createdAt?.toMillis?.()||0));
                        if (v === 'high') arr.sort((a: any,b: any)=> b.rating - a.rating);
                        if (v === 'low') arr.sort((a: any,b: any)=> a.rating - b.rating);
                        return arr;
                      });
                    }}
                    className="bg-surface-light border border-border rounded px-2 py-1"
                  >
                    <option value="new">新しい順</option>
                    <option value="old">古い順</option>
                    <option value="high">評価高い順</option>
                    <option value="low">評価低い順</option>
                  </select>
                </label>
                {/* フィルタ */}
                <label className="flex items-center gap-2">
                  <span className="text-xs">種別</span>
                  <select
                    onChange={(e) => {
                      const v = e.target.value as 'all'|'seller'|'buyer';
                      if (v === 'all') {
                        loadUserRatingsInternal();
                      } else {
                        loadUserRatingsInternal(v);
                      }
                    }}
                    className="bg-surface-light border border-border rounded px-2 py-1"
                  >
                    <option value="all">すべて</option>
                    <option value="seller">出品者への評価</option>
                    <option value="buyer">購入者への評価</option>
                  </select>
                </label>
              </div>
            </div>

            {/* 評価一覧 */}
            <RatingList
              ratings={userRatings}
              title="評価履歴"
              showItemInfo={true}
            />

            {/* 未評価モーダル */}
            {showPendingModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-surface border border-border rounded-lg w-full max-w-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-text-primary">未評価の取引</h4>
                    <button
                      onClick={() => setShowPendingModal(false)}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      閉じる
                    </button>
                  </div>
                  {pendingOrders.length === 0 ? (
                    <div className="text-center text-text-secondary py-6">未評価の取引はありません</div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-auto">
                      {pendingOrders.map((o, idx) => (
                        <div key={o.id || idx} className="bg-surface-light border border-border rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-surface rounded overflow-hidden flex-shrink-0">
                              {o.itemThumb ? (
                                <img src={o.itemThumb} alt={o.itemTitle} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">No Image</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-text-primary font-medium truncate">{o.itemTitle}</div>
                              <div className="text-xs text-text-secondary">相手: {o.counterpartName}</div>
                              <div className="text-[11px] text-text-secondary/80">注文ID: {o.id}</div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                // 評価ページへ遷移（App側のハンドラが必要な場合はここでイベントを発火）
                                setShowPendingModal(false);
                                if (onNavigateToRating) {
                                  const sellerId = o.sellerId;
                                  const buyerId = o.buyerId;
                                  onNavigateToRating(o.itemId, sellerId, buyerId);
                                }
                              }}
                              className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-xs"
                            >
                              評価する
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

  // ユーザーがログインしていない場合
  if (!user) {
    return (
      <div className="min-h-screen bg-background container-mobile">
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
      <AppHeader
        user={userDoc ? { 
          id: user.uid, 
          name: userDoc.displayName || user?.displayName || user?.email?.split('@')[0] || 'ユーザー', 
          avatar: userDoc.photoURL || user?.photoURL || '', 
          cars: userDoc.cars || [], 
          interestedCars: userDoc.interestedCars || []
        } : { 
          id: user.uid, 
          name: user?.displayName || user?.email?.split('@')[0] || 'ユーザー', 
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
        showUserName={false}
        showProfileButton={false}
      />

      <main className="p-4 pb-32 pt-0 fade-in">
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
                {userDoc?.displayName || user?.displayName || user?.email?.split('@')[0] || 'ユーザー'}
              </h2>
              
              {/* フォロー統計 */}
              <div className="flex items-center space-x-4 mt-2">
                <div 
                  className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={onFollowingClick}
                >
                  <UserCheck size={14} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">{followingCount}</span> フォロー中
                  </span>
                </div>
                <div 
                  className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={onFollowersClick}
                >
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
              
              {/* プライバシー設定 */}
              <div className="mt-3">
                <PrivacyToggle size="sm" showLabel={false} />
              </div>
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
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'posts'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare size={16} />
            <span className="text-xs leading-tight">投稿</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'questions'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare size={16} />
            <span className="text-xs leading-tight">質問</span>
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'maintenance'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wrench size={16} />
            <span className="text-xs leading-tight">整備</span>
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'items'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package size={16} />
            <span className="text-xs leading-tight">商品</span>
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'ratings'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Star size={16} />
            <span className="text-xs leading-tight">評価</span>
          </button>
        </div>
        <div key={activeTab} className="fade-in">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};
