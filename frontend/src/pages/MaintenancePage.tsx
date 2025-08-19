import { Plus, Search, Wrench } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { MaintenanceThumbnail } from '../components/ui/MaintenanceThumbnail';
import { currentUser } from '../data/dummy';
import { useMaintenancePosts } from '../hooks/useMaintenancePosts';
import { useAuth } from '../hooks/useAuth';
import { deleteMaintenancePost } from '../lib/threads';

type TabType = 'all' | 'my-cars' | 'interested-cars';

interface MaintenancePageProps {
  onMaintenanceClick?: (postId: string) => void;
  onUserClick?: (author: string) => void;
  onAddMaintenance?: () => void;
  onDeleteMaintenance?: (postId: string) => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ 
  onMaintenanceClick, 
  onUserClick,
  onAddMaintenance,
  onDeleteMaintenance
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // useMaintenancePostsフックを使用してFirestoreからデータを取得
  const { maintenancePosts, loading, error, refresh } = useMaintenancePosts();

  // タブ別にフィルタリング
  const filteredPosts = useMemo(() => {
    let allPosts = maintenancePosts;
    
    // タブでフィルタリング
    if (activeTab === 'my-cars') {
      const myCarModels = currentUser.cars;
      // 車種名のマッピング（フルネーム → 短縮名）
      const carNameMapping: { [key: string]: string[] } = {
        "Nissan S13": ["S13", "Nissan S13"],
        "Civic EK9": ["EK9", "Civic EK9"],
        "Swift Sport ZC32S": ["Swift Sport", "ZC32S"],
        "Skyline R34": ["R34", "Skyline R34"]
      };
      
      allPosts = allPosts.filter(post => {
        // carModelフィールドがある場合は直接比較
        if (post.carModel) {
          return myCarModels.includes(post.carModel);
        }
        // ない場合はタイトル、コンテンツ、タグで検索
        return myCarModels.some(carModel => {
          const shortNames = carNameMapping[carModel] || [carModel];
          return shortNames.some(shortName => 
            post.title.includes(shortName) || 
            post.content.includes(shortName) ||
            post.tags.some(tag => tag.includes(shortName))
          );
        });
      });
    } else if (activeTab === 'interested-cars') {
      const interestedCarModels = currentUser.interestedCars;
      // お気に入り車種名のマッピング
      const interestedCarNameMapping: { [key: string]: string[] } = {
        "RX-7 FD3S": ["RX-7", "FD3S"],
        "Trueno AE86": ["AE86", "Trueno"],
        "S2000 AP1": ["S2000", "AP1"],
        "Supra A80": ["Supra", "A80"]
      };
      
      allPosts = allPosts.filter(post => {
        // carModelフィールドがある場合は直接比較
        if (post.carModel) {
          return interestedCarModels.includes(post.carModel);
        }
        // ない場合はタイトル、コンテンツ、タグで検索
        return interestedCarModels.some(carModel => {
          const shortNames = interestedCarNameMapping[carModel] || [carModel];
          return shortNames.some(shortName => 
            post.title.includes(shortName) || 
            post.content.includes(shortName) ||
            post.tags.some(tag => tag.includes(shortName))
          );
        });
      });
    }
    
    // 検索クエリでフィルタリング
    if (searchQuery) {
      allPosts = allPosts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.carModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return allPosts;
  }, [activeTab, searchQuery, maintenancePosts]);

  const handleMaintenanceClick = (postId: string) => {
    onMaintenanceClick?.(postId);
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
        // リストを更新
        refresh();
      } catch (error: any) {
        console.error('Error deleting maintenance post:', error);
        alert(error.message || 'メンテナンス記録の削除に失敗しました');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader
        user={{ id: "1", name: "RevLinkユーザー", avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U", cars: [], interestedCars: [] }}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />
 
      <main className="p-4 pb-20 pt-0 fade-in">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-background z-10 border-b border-surface-light">
          {/* タブ切り替え */}
          <div className="px-4 pb-2">
            <div className="flex space-x-1 bg-surface rounded-xl p-0.5">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setActiveTab('my-cars')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'my-cars'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                愛車
              </button>
              <button
                onClick={() => setActiveTab('interested-cars')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'interested-cars'
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
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="整備記録を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                />
              </div>
              <button
                onClick={onAddMaintenance}
                className="px-4 py-3 text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 整備記録一覧 */}
        <div key={activeTab} className="px-4 fade-in">
          {loading ? (
            <div className="text-center py-12">
              <Wrench size={48} className="text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-white mb-2">データを読み込み中...</div>
              <div className="text-sm text-gray-400">しばらくお待ちください</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Wrench size={48} className="text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-white mb-2">データの読み込み中にエラーが発生しました</div>
              <div className="text-sm text-gray-400">しばらくお待ちください</div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredPosts.map((post) => {
                // MaintenancePostDocをMaintenancePostにマッピング
                const mappedPost = {
                  ...post,
                  author: post.authorName,
                  authorAvatar: post.authorAvatar || '',
                  createdAt: post.createdAt?.toDate?.()?.toLocaleDateString() || new Date().toLocaleDateString(),
                  steps: post.steps || []
                };
                
                return (
                  <MaintenanceThumbnail
                    key={post.id}
                    post={mappedPost}
                    onClick={() => handleMaintenanceClick(post.id)}
                    onDelete={handleDeleteMaintenance}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wrench size={48} className="text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-white mb-2">整備記録が見つかりません</div>
              <div className="text-sm text-gray-400">検索条件を変更するか、新しい記録を投稿してみてください</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
