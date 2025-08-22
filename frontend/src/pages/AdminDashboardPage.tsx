import { BarChart3, FileText, Settings, Shield, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { useAdmin } from '../hooks/useAdmin';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import { useAuth } from '../hooks/useAuth';
import { SystemSettings } from '../types/admin';

interface AdminDashboardPageProps {
  onBackClick?: () => void;
  onNavigate?: (page: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBackClick, onNavigate }) => {
  const { user, userDoc } = useAuth();
  const { 
    isAdmin, 
    stats, 
    reports, 
    users, 
    content, 
    systemSettings, 
    loading, 
    error,
    updateReportStatus,
    updateUserStatus,
    updateContentStatus,
    updateSystemSettings,
    refreshData
  } = useAdmin();
  const { notifications: adminNotifications, unreadCount } = useAdminNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'reports' | 'analytics' | 'settings' | 'notifications'>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 管理者権限チェック
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background container-mobile">
        <AppHeader />
        <main className="px-4 pb-24 pt-0">
          <BannerAd />
          <div className="text-center py-8">
            <Shield size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">アクセス拒否</h2>
            <p className="text-gray-400">管理者権限が必要です</p>
          </div>
        </main>
      </div>
    );
  }

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject') => {
    setActionLoading(reportId);
    try {
      // 承認の場合は'resolved'、却下の場合は'reviewed'に設定
      const status = action === 'approve' ? 'resolved' : 'reviewed';
      await updateReportStatus(reportId, status);
      alert(`通報を${action === 'approve' ? '承認' : '却下'}しました`);
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate') => {
    setActionLoading(userId);
    try {
      // suspendの場合は'suspended'、activateの場合は'active'に設定
      const status = action === 'suspend' ? 'suspended' : 'active';
      await updateUserStatus(userId, status);
      alert(`ユーザーを${action === 'suspend' ? '停止' : '復活'}しました`);
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleContentAction = async (contentId: string, action: 'hide' | 'show') => {
    setActionLoading(contentId);
    try {
      // hideの場合は'hidden'、showの場合は'active'に設定
      const status = action === 'hide' ? 'hidden' : 'active';
      // コンテンツタイプは'thread'として仮定（実際のアプリでは動的に判定する必要があります）
      await updateContentStatus(contentId, 'thread', status);
      alert(`コンテンツを${action === 'hide' ? '非表示' : '表示'}しました`);
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSystemSettingToggle = async (setting: keyof SystemSettings) => {
    if (!systemSettings) return;
    
    try {
      const newValue = !systemSettings[setting];
      await updateSystemSettings({ [setting]: newValue });
      alert(`${setting}を${newValue ? '有効' : '無効'}にしました`);
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">総ユーザー数</p>
              <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
            </div>
            <Users className="text-white" size={24} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">総投稿数</p>
              <p className="text-2xl font-bold text-white">{stats?.totalPosts || 0}</p>
            </div>
            <FileText className="text-white" size={24} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-100">未処理通報</p>
              <p className="text-2xl font-bold text-white">{stats?.totalReports || 0}</p>
            </div>
            <Shield className="text-white" size={24} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">今日のアクティブ</p>
              <p className="text-2xl font-bold text-white">{stats?.dailyActiveUsers || 0}</p>
            </div>
            <TrendingUp className="text-white" size={24} />
          </div>
        </div>
      </div>

      {/* 通報通知セクション */}
      {unreadCount > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Shield size={20} className="mr-2" />
              新しい通報通知 ({unreadCount})
            </h3>
            <button
              onClick={() => setActiveTab('notifications')}
              className="text-sm text-white hover:text-red-100 transition-colors bg-white bg-opacity-20 px-3 py-1 rounded-lg"
            >
              すべて見る →
            </button>
          </div>
          <div className="space-y-3">
            {adminNotifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{notification.title}</p>
                    <p className="text-xs text-red-100 mt-1">{notification.content}</p>
                    <p className="text-xs text-red-200 mt-2">
                      {notification.createdAt.toDate().toLocaleString('ja-JP')}
                    </p>
                  </div>
                  {notification.reportId && (
                    <button
                      onClick={() => {
                        setActiveTab('reports');
                      }}
                      className="text-xs bg-white text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors font-medium"
                    >
                      詳細
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">管理者通知</h3>
        <button
          onClick={refreshData}
          className="text-sm text-primary hover:text-primary-light transition-colors"
        >
          更新
        </button>
      </div>
      
      {adminNotifications.length === 0 ? (
        <div className="text-center py-8">
          <Shield size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">通知はありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {adminNotifications.map((notification) => (
            <div key={notification.id} className="bg-surface p-4 rounded-lg border border-surface-light">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-white">{notification.title}</span>
                    {!notification.isRead && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">新着</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{notification.content}</p>
                  
                  {notification.reportData && (
                    <div className="bg-surface-light p-3 rounded-lg mt-3">
                      <h4 className="text-sm font-medium text-white mb-2">通報詳細</h4>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p><span className="text-gray-400">通報タイプ:</span> {notification.reportData.type}</p>
                        <p><span className="text-gray-400">対象:</span> {notification.reportData.targetType}</p>
                        <p><span className="text-gray-400">タイトル:</span> {notification.reportData.targetTitle || '無題'}</p>
                        <p><span className="text-gray-400">通報者:</span> {notification.reportData.reporterName}</p>
                        <p><span className="text-gray-400">理由:</span> {notification.reportData.content}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('reports')}
                        className="mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                      >
                        通報管理で確認
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {notification.createdAt.toDate().toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">ユーザー管理</h3>
        <button
          onClick={refreshData}
          className="text-sm text-primary hover:text-primary-light transition-colors bg-primary bg-opacity-10 px-3 py-1 rounded-lg"
        >
          更新
        </button>
      </div>
      
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.uid} className="bg-surface p-4 rounded-xl border border-surface-light hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.displayName}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-500">登録日: {user.createdAt.toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {user.status === 'active' ? (
                  <button
                    onClick={() => handleUserAction(user.uid, 'suspend')}
                    disabled={actionLoading === user.uid}
                    className="text-xs bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {actionLoading === user.uid ? '処理中...' : '停止'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUserAction(user.uid, 'activate')}
                    disabled={actionLoading === user.uid}
                    className="text-xs bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {actionLoading === user.uid ? '処理中...' : '復活'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">コンテンツ管理</h3>
        <button
          onClick={refreshData}
          className="text-sm text-primary hover:text-primary-light transition-colors"
        >
          更新
        </button>
      </div>
      
      <div className="space-y-3">
        {content.map((item) => (
          <div key={item.id} className="bg-surface p-4 rounded-lg border border-surface-light">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-sm text-gray-400">{item.authorName}</p>
                <p className="text-xs text-gray-500">投稿日: {item.createdAt.toLocaleDateString('ja-JP')}</p>
              </div>
              <div className="flex space-x-2">
                {item.status === 'active' ? (
                  <button
                    onClick={() => handleContentAction(item.id, 'hide')}
                    disabled={actionLoading === item.id}
                    className="text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === item.id ? '処理中...' : '非表示'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleContentAction(item.id, 'show')}
                    disabled={actionLoading === item.id}
                    className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === item.id ? '処理中...' : '表示'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">通報管理</h3>
        <button
          onClick={refreshData}
          className="text-sm text-primary hover:text-primary-light transition-colors bg-primary bg-opacity-10 px-3 py-1 rounded-lg"
        >
          更新
        </button>
      </div>
      
      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="bg-surface p-4 rounded-xl border border-surface-light hover:shadow-lg transition-all duration-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white">{report.targetTitle || '無題'}</p>
                  <p className="text-sm text-gray-400">通報者: {report.reporterName}</p>
                  <p className="text-xs text-gray-500">通報日: {report.createdAt.toLocaleDateString('ja-JP')}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  report.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500 border-opacity-30' :
                  report.status === 'resolved' ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30' :
                  'bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30'
                }`}>
                  {report.status === 'pending' ? '未処理' : report.status === 'resolved' ? '承認済み' : '却下済み'}
                </span>
              </div>
              
              <div className="bg-surface-light p-3 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">
                  <span className="text-gray-400">通報理由:</span> {report.content}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="text-gray-400">通報タイプ:</span> {report.type}
                </p>
              </div>
              
              {report.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleReportAction(report.id, 'approve')}
                    disabled={actionLoading === report.id}
                    className="flex-1 text-xs bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {actionLoading === report.id ? '処理中...' : '承認'}
                  </button>
                  <button
                    onClick={() => handleReportAction(report.id, 'reject')}
                    disabled={actionLoading === report.id}
                    className="flex-1 text-xs bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {actionLoading === report.id ? '処理中...' : '却下'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">分析データ</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-100">月間アクティブユーザー</p>
              <p className="text-2xl font-bold text-white">{stats?.activeUsers || 0}</p>
            </div>
            <BarChart3 className="text-white" size={24} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-100">週次投稿数</p>
              <p className="text-2xl font-bold text-white">{stats?.weeklyPosts || 0}</p>
            </div>
            <TrendingUp className="text-white" size={24} />
          </div>
        </div>
      </div>
      
      <div className="bg-surface p-6 rounded-xl border border-surface-light">
        <h4 className="text-lg font-semibold text-white mb-4">通報統計</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-yellow-500 bg-opacity-10 rounded-lg border border-yellow-500 border-opacity-30">
            <span className="text-gray-300">未処理通報</span>
            <span className="text-yellow-400 font-bold">{stats?.totalReports || 0}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-500 bg-opacity-10 rounded-lg border border-green-500 border-opacity-30">
            <span className="text-gray-300">承認済み通報</span>
            <span className="text-green-400 font-bold">{reports.filter(r => r.status === 'resolved').length}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-500 bg-opacity-10 rounded-lg border border-red-500 border-opacity-30">
            <span className="text-gray-300">却下済み通報</span>
            <span className="text-red-400 font-bold">{reports.filter(r => r.status === 'reviewed').length}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">システム設定</h3>
      
      <div className="space-y-4">
        {systemSettings && Object.entries(systemSettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between bg-surface p-4 rounded-xl border border-surface-light hover:shadow-lg transition-all duration-200">
            <div>
              <p className="font-medium text-white">{key}</p>
              <p className="text-sm text-gray-400">システム全体の設定</p>
            </div>
            <button
              onClick={() => handleSystemSettingToggle(key as keyof SystemSettings)}
              className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
                value 
                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg' 
                  : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg'
              }`}
            >
              {value ? '有効' : '無効'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: '概要', icon: BarChart3 },
    { id: 'notifications', label: `通知${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: Shield },
    { id: 'users', label: 'ユーザー', icon: Users },
    { id: 'content', label: 'コンテンツ', icon: FileText },
    { id: 'reports', label: '通報', icon: Shield },
    { id: 'analytics', label: '分析', icon: TrendingUp },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader />
      
      <main className="px-4 pb-24 pt-0">
        <BannerAd />
        
        {/* ヘッダー */}
        <div className="flex items-center space-x-3 mb-6 mt-4">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <Shield size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-green-500">管理者ダッシュボード</h1>
            <p className="text-sm text-gray-400">システム管理とユーザー管理</p>
          </div>
        </div>

        {/* タブ */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-surface-light'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* コンテンツ */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-400 mt-2">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
              <button
                onClick={refreshData}
                className="mt-2 text-sm text-primary hover:text-primary-light transition-colors"
              >
                再試行
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'notifications' && renderNotifications()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'content' && renderContentManagement()}
              {activeTab === 'reports' && renderReports()}
              {activeTab === 'analytics' && renderAnalytics()}
              {activeTab === 'settings' && renderSettings()}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
