import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { ArrowLeft, Mail, Shield, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/init';

interface AdminUserManagementPageProps {
  onBackClick: () => void;
}

interface UserData {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: any;
  role?: string;
  isActive: boolean;
  lastLoginAt?: any;
  bio?: string;
  cars?: any[];
  interestedCars?: string[];
}

const AdminUserManagementPage: React.FC<AdminUserManagementPageProps> = ({ onBackClick }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), orderBy('createdAt', 'desc'))
        );
        
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserData[];

        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTimeAgo = (date: any) => {
    if (!date) return '不明';
    
    const now = new Date();
    const userDate = date.toDate ? date.toDate() : new Date(date);
    const diffMs = now.getTime() - userDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return '今日';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    console.log(`${action} user:`, userId);
    // TODO: 実装予定
    alert(`${action} 機能は実装予定です`);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <header className="flex items-center p-4 border-b border-border">
        <button onClick={onBackClick} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">ユーザー管理</h1>
      </header>
      
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* 検索バー */}
          <div className="relative">
            <input
              type="text"
              placeholder="ユーザー名またはメールアドレスで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-b border-border bg-transparent text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary"
            />
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="flex items-center space-x-3">
                <Users className="text-blue-500" size={24} />
                <div>
                  <div className="text-sm text-gray-400">総ユーザー数</div>
                  <div className="text-2xl font-bold">{users.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="flex items-center space-x-3">
                <User className="text-green-500" size={24} />
                <div>
                  <div className="text-sm text-gray-400">アクティブユーザー</div>
                  <div className="text-2xl font-bold">{users.filter(u => u.isActive !== false).length}</div>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="flex items-center space-x-3">
                <Shield className="text-purple-500" size={24} />
                <div>
                  <div className="text-sm text-gray-400">管理者</div>
                  <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ユーザー一覧 */}
          <div className="bg-surface rounded-xl p-4 border border-surface-light">
            <h2 className="text-lg font-bold mb-4">ユーザー一覧</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">読み込み中...</div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400">ユーザーが見つかりません</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 bg-surface-light rounded-lg">
                    <div className="flex items-center space-x-4">
                      {/* アバター */}
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-white" />
                        )}
                      </div>
                      
                      {/* ユーザー情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-text-primary truncate">
                            {user.displayName || '名前なし'}
                          </h3>
                          {user.role === 'admin' && (
                            <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded-full">
                              管理者
                            </span>
                          )}
                          {user.isActive === false && (
                            <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                              停止中
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Mail size={14} />
                            <span className="truncate">{user.email || 'メールなし'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span>登録: {getTimeAgo(user.createdAt)}</span>
                          </div>
                        </div>
                        
                        {user.bio && (
                          <p className="text-sm text-gray-300 mt-2 line-clamp-2">{user.bio}</p>
                        )}
                      </div>
                      
                      {/* アクションボタン */}
                      <div className="flex space-x-2">
                        {user.isActive !== false ? (
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            停止
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, 'activate')}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            復活
                          </button>
                        )}
                        <button
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                          削除
                        </button>
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

export default AdminUserManagementPage;
