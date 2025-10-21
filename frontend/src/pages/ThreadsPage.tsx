import { Plus, RefreshCw } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { NativeAd, insertNativeAds } from '../components/ui/NativeAd';
import { SearchBar } from '../components/ui/SearchBar';
import { ThreadCard } from '../components/ui/ThreadCard';
import { useAuth } from '../hooks/useAuth';
import { useFavoriteCars } from '../hooks/useFavoriteCars';
import { useSearch } from '../hooks/useSearch';
import { useThreads } from '../hooks/useThreads';
import { useVehicles } from '../hooks/useVehicles';
import { deleteThread } from '../lib/threads';
import { filterThreadsByUserVehicles } from '../utils/yearRangeFilter';

type TabType = 'post' | 'question';
type CarTabType = 'all' | 'my-cars' | 'interested-cars';

interface ThreadsPageProps {
  onThreadClick?: (threadId: string, currentTab?: 'post' | 'question') => void;
  onUserClick?: (author: string) => void;
  onDeleteThread?: (threadId: string) => void;
  blockedUsers?: string[];
  mutedWords?: string[];
  onBlockUser?: (author: string) => void;
  onReportThread?: (threadId: string, author: string) => void;
  onNewThread?: (type: 'post' | 'question') => void;
  initialTab?: TabType;
}

export const ThreadsPage: React.FC<ThreadsPageProps> = ({ 
  onThreadClick, 
  onUserClick, 
  onDeleteThread, 
  blockedUsers = [], 
  mutedWords = [],
  onBlockUser, 
  onReportThread, 
  onNewThread, 
  initialTab = 'post' 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [activeCarTab, setActiveCarTab] = useState<CarTabType>('all');
  const { user } = useAuth();

  // useThreadsフックを使用してFirestoreからデータを取得（プライバシーフィルタリング付き）
  const { threads, loading, error, refresh } = useThreads({ 
    type: activeTab,
    currentUserId: user?.uid,
    blockedUsers,
    mutedWords
  });

  // ユーザーの愛車とお気に入り車種を取得
  const { vehicles } = useVehicles();
  const { favoriteCars } = useFavoriteCars();

  // 検索機能を実装
  const { searchQuery, setSearchQuery, filteredItems: searchedThreads } = useSearch(threads, ['title', 'content', 'tags']);

  // 削除機能を実装
  const handleDeleteThread = async (threadId: string) => {
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    if (window.confirm('この投稿を削除しますか？この操作は取り消せません。')) {
      try {
        await deleteThread(threadId, user.uid);
        alert('投稿を削除しました');
        // リストを更新
        refresh();
      } catch (error: any) {
        console.error('Error deleting thread:', error);
        alert(error.message || '投稿の削除に失敗しました');
      }
    }
  };

  // 車種別にフィルタリング
  const filteredThreads = useMemo(() => {
    let allThreads = searchedThreads.filter((t: any) => !blockedUsers.includes(t.author));
    
    if (activeCarTab === 'my-cars') {
      // 年式レンジフィルタリングを使用
      return filterThreadsByUserVehicles(allThreads, vehicles);
    } else if (activeCarTab === 'interested-cars') {
      // お気に入り車種の年式レンジフィルタリングを使用
      return filterThreadsByUserVehicles(allThreads, favoriteCars);
    }
    
    // タイプフィルタリングを再度有効化
    return allThreads.filter((thread: any) => thread.type === activeTab);
  }, [searchedThreads, activeTab, activeCarTab, blockedUsers, vehicles, favoriteCars]);

  // スレッドのみを表示（ネイティブ広告は別途挿入）
  const displayItems = useMemo(() => {
    return filteredThreads;
  }, [filteredThreads]);

  const handleThreadClick = (threadId: string) => {
    onThreadClick?.(threadId, activeTab);
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader
        onNotificationClick={() => {}}
        onProfileClick={() => {}}
      />
       
      <main className="px-4 pb-32 pt-0">
          {/* ヘッダー */}
          <div className="bg-background z-10 border-b border-surface-light fade-in">
            {/* 検索バー */}
            <div className="px-4 pb-3 pt-2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="投稿を検索..."
              />
            </div>

            {/* 車種タブ */}
            <div className="px-4 pb-2">
              <div className="flex space-x-1 bg-surface rounded-xl p-0.5">
                <button
                  onClick={() => setActiveCarTab('all')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                    activeCarTab === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => setActiveCarTab('my-cars')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                    activeCarTab === 'my-cars'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  愛車
                </button>
                <button
                  onClick={() => setActiveCarTab('interested-cars')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                    activeCarTab === 'interested-cars'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  お気に入り
                </button>
              </div>
            </div>

            {/* 投稿タイプタブ */}
            <div className="flex">
              {[
                { id: 'post', label: '投稿' },
                { id: 'question', label: '質問' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                  )}
                </button>
              ))}
              <button
                onClick={() => onNewThread?.(activeTab)}
                className="px-4 py-3 text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={refresh}
                className="px-4 py-3 text-primary hover:text-primary/80 transition-colors"
                title="リフレッシュ"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          {/* スレッド一覧（ネイティブ広告含む） */}
          <div key={`${activeTab}-${activeCarTab}`} className="fade-in">
            {useMemo(() => insertNativeAds(displayItems, 4), [displayItems.length, activeTab, activeCarTab]).map((item) => {
              if ('type' in item && item.type === 'ad') {
                return <NativeAd key={item.id} ad={(item as any).ad} />;
              }
              return (
                <ThreadCard
                  key={item.id}
                  thread={item as any}
                  onClick={() => handleThreadClick(item.id)}
                  onDelete={handleDeleteThread}
                  onBlockUser={onBlockUser}
                  onReportThread={onReportThread}
                  onUserClick={onUserClick}
                  blockedUsers={blockedUsers}
                />
              );
            })}
          </div>
        </main>
    </div>
  );
};
