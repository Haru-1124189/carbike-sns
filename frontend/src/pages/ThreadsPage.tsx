import { Plus, RefreshCw } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { SearchBar } from '../components/ui/SearchBar';
import { ThreadCard } from '../components/ui/ThreadCard';
import { currentUser, threadAds } from '../data/dummy';
import { useAuth } from '../hooks/useAuth';
import { useSearch } from '../hooks/useSearch';
import { useThreads } from '../hooks/useThreads';
import { deleteThread } from '../lib/threads';

type TabType = 'post' | 'question';
type CarTabType = 'all' | 'my-cars' | 'interested-cars';

interface ThreadsPageProps {
  onThreadClick?: (threadId: string, currentTab?: 'post' | 'question') => void;
  onUserClick?: (author: string) => void;
  onDeleteThread?: (threadId: string) => void;
  blockedUsers?: string[];
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
  onBlockUser, 
  onReportThread, 
  onNewThread,
  initialTab = 'post'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [activeCarTab, setActiveCarTab] = useState<CarTabType>('all');
  const { user } = useAuth();

  // useThreadsフックを使用してFirestoreからデータを取得
  const { threads, loading, error, refresh } = useThreads({ type: activeTab });

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
      const myCarModels = currentUser.cars;
      // 車種名のマッピング（フルネーム → 短縮名）
      const carNameMapping: { [key: string]: string[] } = {
        "Nissan S13": ["S13", "Nissan S13"],
        "Civic EK9": ["EK9", "Civic EK9"],
        "Swift Sport ZC32S": ["Swift Sport", "ZC32S"],
        "Skyline R34": ["R34", "Skyline R34"]
      };
      
      allThreads = allThreads.filter((thread: any) => {
        // carModelフィールドがある場合は直接比較
        if ('carModel' in thread && typeof thread.carModel === 'string') {
          return myCarModels.includes(thread.carModel);
        }
        // ない場合はタイトル、コンテンツ、タグで検索
        return myCarModels.some(carModel => {
          const shortNames = carNameMapping[carModel] || [carModel];
          return shortNames.some(shortName => 
            thread.title.includes(shortName) || 
            thread.content.includes(shortName) ||
            thread.tags.some((tag: any) => tag.includes(shortName))
          );
        });
      });
    } else if (activeCarTab === 'interested-cars') {
      const interestedCarModels = currentUser.interestedCars;
      // お気に入り車種名のマッピング
      const interestedCarNameMapping: { [key: string]: string[] } = {
        "RX-7 FD3S": ["RX-7", "FD3S"],
        "Trueno AE86": ["AE86", "Trueno"],
        "S2000 AP1": ["S2000", "AP1"],
        "Supra A80": ["Supra", "A80"]
      };
      
      allThreads = allThreads.filter((thread: any) => {
        // carModelフィールドがある場合は直接比較
        if ('carModel' in thread && typeof thread.carModel === 'string') {
          return interestedCarModels.includes(thread.carModel);
        }
        // ない場合はタイトル、コンテンツ、タグで検索
        return interestedCarModels.some(carModel => {
          const shortNames = interestedCarNameMapping[carModel] || [carModel];
          return shortNames.some(shortName => 
            thread.title.includes(shortName) || 
            thread.content.includes(shortName) ||
            thread.tags.some((tag: any) => tag.includes(shortName))
          );
        });
      });
    }
    
    // タイプフィルタリングを再度有効化
    return allThreads.filter((thread: any) => thread.type === activeTab);
  }, [searchedThreads, activeTab, activeCarTab, blockedUsers]);

  // スレッドと広告を組み合わせて表示
  const displayItems = useMemo(() => {
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
  }, [filteredThreads]);

  const handleThreadClick = (threadId: string) => {
    onThreadClick?.(threadId, activeTab);
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader
        onNotificationClick={() => {}}
        onProfileClick={() => {}}
      />
       
      <main className="px-4 pb-24 pt-0">
          {/* ヘッダー */}
          <div className="bg-background z-10 border-b border-surface-light fade-in">
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

            {/* 検索バー */}
            <div className="px-4 pb-3">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="投稿を検索..."
              />
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

          {/* スレッド一覧（広告含む） */}
          <div key={`${activeTab}-${activeCarTab}`} className="fade-in">
            {displayItems.map((item) => (
              <ThreadCard
                key={item.id}
                thread={item}
                onClick={() => handleThreadClick(item.id)}
                onDelete={handleDeleteThread}
                onBlockUser={onBlockUser}
                onReportThread={onReportThread}
              />
            ))}
          </div>
        </main>
    </div>
  );
};
