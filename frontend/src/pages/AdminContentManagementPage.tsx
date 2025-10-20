import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { ArrowLeft, MessageSquare, Users, Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/init';

interface AdminContentManagementPageProps {
  onBackClick: () => void;
}

interface ContentItem {
  id: string;
  type: 'thread' | 'maintenance' | 'touring';
  title: string;
  content?: string;
  description?: string;
  author: string;
  authorId: string;
  createdAt: any;
  isDeleted?: boolean;
  likes?: number;
  replies?: number;
  views?: number;
}

const AdminContentManagementPage: React.FC<AdminContentManagementPageProps> = ({ onBackClick }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'thread' | 'maintenance' | 'touring'>('all');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // 各コレクションから投稿を取得
        const [threadsSnapshot, maintenanceSnapshot, touringSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'threads'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'maintenance_posts'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'touringThreads'), orderBy('createdAt', 'desc')))
        ]);

        const allContent: ContentItem[] = [];

        // Link
        threadsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          allContent.push({
            id: doc.id,
            type: 'thread',
            title: data.title || 'タイトルなし',
            content: data.content,
            author: data.authorName || 'ユーザー',
            authorId: data.authorId,
            createdAt: data.createdAt,
            isDeleted: data.isDeleted,
            likes: data.likes || 0,
            replies: data.replies || 0
          });
        });

        // 整備記録
        maintenanceSnapshot.docs.forEach(doc => {
          const data = doc.data();
          allContent.push({
            id: doc.id,
            type: 'maintenance',
            title: data.title || '整備記録',
            description: data.description,
            author: data.authorName || 'ユーザー',
            authorId: data.authorId,
            createdAt: data.createdAt,
            isDeleted: data.isDeleted,
            likes: data.likes || 0
          });
        });

        // ツーリング
        touringSnapshot.docs.forEach(doc => {
          const data = doc.data();
          allContent.push({
            id: doc.id,
            type: 'touring',
            title: data.description || 'ツーリング募集',
            author: data.authorName || 'ユーザー',
            authorId: data.authorId,
            createdAt: data.createdAt,
            isDeleted: data.isDeleted,
            likes: data.likes || 0,
            replies: data.replies || 0
          });
        });

        // 作成日時でソート
        allContent.sort((a, b) => {
          const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setContent(allContent);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getTimeAgo = (date: any) => {
    if (!date) return '不明';
    
    const now = new Date();
    const itemDate = date.toDate ? date.toDate() : new Date(date);
    const diffMs = now.getTime() - itemDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return '今日';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'thread':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'maintenance':
        return <Wrench size={16} className="text-green-500" />;
      case 'touring':
        return <Users size={16} className="text-purple-500" />;
      default:
        return <MessageSquare size={16} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'thread':
        return 'Link';
      case 'maintenance':
        return '整備記録';
      case 'touring':
        return 'ツーリング';
      default:
        return '不明';
    }
  };

  const handleContentAction = (contentId: string, type: string, action: 'delete' | 'restore') => {
    console.log(`${action} content:`, contentId, type);
    // TODO: 実装予定
    alert(`${action} 機能は実装予定です`);
  };

  const stats = {
    total: content.length,
    threads: content.filter(c => c.type === 'thread').length,
    maintenance: content.filter(c => c.type === 'maintenance').length,
    touring: content.filter(c => c.type === 'touring').length,
    deleted: content.filter(c => c.isDeleted).length
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <header className="flex items-center p-4 border-b border-border">
        <button onClick={onBackClick} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">コンテンツ管理</h1>
      </header>
      
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* 検索・フィルター */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="タイトル、内容、投稿者で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border-b border-border bg-transparent text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary"
              />
            </div>
            
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'すべて' },
                { value: 'thread', label: 'Link' },
                { value: 'maintenance', label: '整備記録' },
                { value: 'touring', label: 'ツーリング' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value as any)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    filterType === filter.value
                      ? 'bg-primary text-white'
                      : 'bg-surface-light text-text-secondary hover:bg-surface'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="text-sm text-gray-400">総数</div>
              <div className="text-xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="text-sm text-gray-400">Link</div>
              <div className="text-xl font-bold">{stats.threads}</div>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="text-sm text-gray-400">整備記録</div>
              <div className="text-xl font-bold">{stats.maintenance}</div>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="text-sm text-gray-400">ツーリング</div>
              <div className="text-xl font-bold">{stats.touring}</div>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="text-sm text-gray-400">削除済み</div>
              <div className="text-xl font-bold text-red-500">{stats.deleted}</div>
            </div>
          </div>

          {/* コンテンツ一覧 */}
          <div className="bg-surface rounded-xl p-4 border border-surface-light">
            <h2 className="text-lg font-bold mb-4">コンテンツ一覧</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">読み込み中...</div>
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400">コンテンツが見つかりません</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContent.map((item) => (
                  <div key={`${item.type}-${item.id}`} className={`p-4 rounded-lg ${item.isDeleted ? 'bg-red-50 border border-red-200' : 'bg-surface-light'}`}>
                    <div className="flex items-start space-x-4">
                      {/* タイプアイコン */}
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(item.type)}
                      </div>
                      
                      {/* コンテンツ情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-text-primary truncate">
                            {item.title}
                          </h3>
                          <span className="px-2 py-1 text-xs bg-gray-500 text-white rounded-full">
                            {getTypeLabel(item.type)}
                          </span>
                          {item.isDeleted && (
                            <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                              削除済み
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {item.content || item.description || '内容なし'}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>投稿者: {item.author}</span>
                          <span>投稿日: {getTimeAgo(item.createdAt)}</span>
                          {item.likes !== undefined && (
                            <span>いいね: {item.likes}</span>
                          )}
                          {item.replies !== undefined && (
                            <span>返信: {item.replies}</span>
                          )}
                          {item.views !== undefined && (
                            <span>閲覧: {item.views}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* アクションボタン */}
                      <div className="flex space-x-2">
                        {item.isDeleted ? (
                          <button
                            onClick={() => handleContentAction(item.id, item.type, 'restore')}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            復元
                          </button>
                        ) : (
                          <button
                            onClick={() => handleContentAction(item.id, item.type, 'delete')}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminContentManagementPage;
