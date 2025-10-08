import { collection, getCountFromServer, getDocs, limit, orderBy, query, Timestamp } from 'firebase/firestore';
import { AlertTriangle, ArrowLeft, BarChart3, Mail, MessageSquare, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/init';

interface AdminDashboardPageProps {
  onBackClick: () => void;
  onNavigateToContactManagement?: () => void;
  onNavigateToReportManagement?: () => void;
  onNavigateToUserManagement?: () => void;
  onNavigateToContentManagement?: () => void;
}

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  unreadReports: number;
  unreadInquiries: number;
}

interface RecentActivity {
  type: 'inquiry' | 'report' | 'user';
  title: string;
  time: string;
  icon: React.ReactNode;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ 
  onBackClick, 
  onNavigateToContactManagement, 
  onNavigateToReportManagement,
  onNavigateToUserManagement,
  onNavigateToContentManagement
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    unreadReports: 0,
    unreadInquiries: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ユーザー数
        const usersSnapshot = await getCountFromServer(collection(db, 'users'));
        const totalUsers = usersSnapshot.data().count;

        // 総投稿数（スレッド + 整備記録 + ツーリング）
        const [threadsSnapshot, maintenanceSnapshot, touringSnapshot] = await Promise.all([
          getCountFromServer(collection(db, 'threads')),
          getCountFromServer(collection(db, 'maintenance_posts')),
          getCountFromServer(collection(db, 'touringThreads'))
        ]);
        const totalPosts = threadsSnapshot.data().count + 
                          maintenanceSnapshot.data().count + 
                          touringSnapshot.data().count;

        // 未読通報数
        const reportsSnapshot = await getDocs(query(collection(db, 'reports')));
        const unreadReports = reportsSnapshot.docs.filter(doc => !doc.data().isRead).length;

        // 未読お問い合わせ数
        const inquiriesSnapshot = await getDocs(query(collection(db, 'contactInquiries')));
        const unreadInquiries = inquiriesSnapshot.docs.filter(doc => !doc.data().isRead).length;

        setStats({
          totalUsers,
          totalPosts,
          unreadReports,
          unreadInquiries
        });

        // 最近のアクティビティを取得
        const activities: RecentActivity[] = [];

        // 最近のお問い合わせ
        const recentInquiriesSnapshot = await getDocs(
          query(collection(db, 'contactInquiries'), orderBy('createdAt', 'desc'), limit(2))
        );
        recentInquiriesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt as Timestamp;
          const date = createdAt.toDate ? createdAt.toDate() : new Date();
          const timeAgo = getTimeAgo(date);
          activities.push({
            type: 'inquiry',
            title: `新しいお問い合わせ: ${data.subject}`,
            time: timeAgo,
            icon: <Mail className="text-orange-500" size={16} />
          });
        });

        // 最近の通報
        const recentReportsSnapshot = await getDocs(
          query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(2))
        );
        recentReportsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt as Timestamp;
          const date = createdAt.toDate ? createdAt.toDate() : new Date();
          const timeAgo = getTimeAgo(date);
          activities.push({
            type: 'report',
            title: `新しい通報: ${data.type}`,
            time: timeAgo,
            icon: <AlertTriangle className="text-red-500" size={16} />
          });
        });

        // 最近のユーザー登録
        const recentUsersSnapshot = await getDocs(
          query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(1))
        );
        recentUsersSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt as Timestamp;
          const date = createdAt.toDate ? createdAt.toDate() : new Date();
          const timeAgo = getTimeAgo(date);
          activities.push({
            type: 'user',
            title: `新規ユーザー登録: ${data.displayName || 'ユーザー'}`,
            time: timeAgo,
            icon: <Users className="text-blue-500" size={16} />
          });
        });

        // 時間順でソート
        activities.sort((a, b) => {
          const timeA = parseTimeAgo(a.time);
          const timeB = parseTimeAgo(b.time);
          return timeA - timeB;
        });

        setRecentActivities(activities.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    };

    const getTimeAgo = (date: Date) => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'たった今';
      if (diffMins < 60) return `${diffMins}分前`;
      if (diffHours < 24) return `${diffHours}時間前`;
      return `${diffDays}日前`;
    };

    const parseTimeAgo = (timeStr: string) => {
      if (timeStr === 'たった今') return 0;
      if (timeStr.includes('分前')) return parseInt(timeStr.replace('分前', '')) * 60000;
      if (timeStr.includes('時間前')) return parseInt(timeStr.replace('時間前', '')) * 3600000;
      if (timeStr.includes('日前')) return parseInt(timeStr.replace('日前', '')) * 86400000;
      return 0;
    };

    fetchStats();
  }, []);
    return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <header className="flex items-center p-4 border-b border-border">
        <button onClick={onBackClick} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">管理者ダッシュボード</h1>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
    <div className="space-y-6">
      {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="flex items-center space-x-3">
                <Users className="text-blue-500" size={24} />
            <div>
                  <div className="text-sm text-gray-400">総ユーザー数</div>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stats.totalUsers.toLocaleString()}
                  </div>
            </div>
          </div>
        </div>
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="flex items-center space-x-3">
                <MessageSquare className="text-green-500" size={24} />
            <div>
                  <div className="text-sm text-gray-400">総投稿数</div>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stats.totalPosts.toLocaleString()}
                  </div>
            </div>
          </div>
        </div>
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-red-500" size={24} />
            <div>
                  <div className="text-sm text-gray-400">未処理通報</div>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stats.unreadReports}
                  </div>
            </div>
          </div>
        </div>
            <div className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="flex items-center space-x-3">
                <Mail className="text-orange-500" size={24} />
            <div>
                  <div className="text-sm text-gray-400">お問い合わせ</div>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stats.unreadInquiries}
                  </div>
            </div>
          </div>
        </div>
      </div>

          {/* 管理機能 */}
          <div className="bg-surface rounded-xl p-4 border border-surface-light">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <BarChart3 className="mr-2" size={20} />
              管理機能
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="p-3 bg-surface-light rounded-lg cursor-pointer hover:bg-surface-light/80 transition-colors"
                onClick={onNavigateToContactManagement}
              >
                <h3 className="font-semibold mb-2">お問い合わせ管理</h3>
                <p className="text-sm text-gray-400 mb-3">ユーザーからのお問い合わせを確認・回答</p>
                <div className="text-xs text-blue-400">
                  未読: {loading ? '...' : stats.unreadInquiries}件
                </div>
              </div>
              <div 
                className="p-3 bg-surface-light rounded-lg cursor-pointer hover:bg-surface-light/80 transition-colors"
                onClick={onNavigateToReportManagement}
              >
                <h3 className="font-semibold mb-2">通報管理</h3>
                <p className="text-sm text-gray-400 mb-3">不適切なコンテンツの通報を処理</p>
                <div className="text-xs text-red-400">
                  未処理: {loading ? '...' : stats.unreadReports}件
          </div>
        </div>
              <div 
                className="p-3 bg-surface-light rounded-lg cursor-pointer hover:bg-surface-light/80 transition-colors"
                onClick={onNavigateToUserManagement}
              >
                <h3 className="font-semibold mb-2">ユーザー管理</h3>
                <p className="text-sm text-gray-400 mb-3">ユーザーアカウントの管理・サポート</p>
                <div className="text-xs text-blue-400">
                  アクティブ: {loading ? '...' : stats.totalUsers.toLocaleString()}人
        </div>
          </div>
              <div 
                className="p-3 bg-surface-light rounded-lg cursor-pointer hover:bg-surface-light/80 transition-colors"
                onClick={onNavigateToContentManagement}
              >
                <h3 className="font-semibold mb-2">コンテンツ管理</h3>
                <p className="text-sm text-gray-400 mb-3">投稿・動画・スレッドの管理</p>
                <div className="text-xs text-blue-400">
                  総数: {loading ? '...' : stats.totalPosts.toLocaleString()}件
                  </div>
                </div>
              </div>
      </div>
      
          {/* 最近のアクティビティ */}
          <div className="bg-surface rounded-xl p-4 border border-surface-light">
            <h2 className="text-lg font-bold mb-4">最近のアクティビティ</h2>
            {loading ? (
              <div className="text-center py-4">
                <div className="text-gray-400">読み込み中...</div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-400">アクティビティがありません</div>
        </div>
      ) : (
        <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-surface-light rounded-lg">
                    {activity.icon}
                <div className="flex-1">
                      <div className="text-sm">{activity.title}</div>
                      <div className="text-xs text-gray-400">{activity.time}</div>
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

export default AdminDashboardPage;