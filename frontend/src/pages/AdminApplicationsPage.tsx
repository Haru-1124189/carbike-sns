import { ArrowLeft, Check, CheckCircle, Clock, Eye, X, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { useCreatorApplication } from '../hooks/useCreatorApplication';
import { CreatorApplication } from '../types';

interface AdminApplicationsPageProps {
  onBackClick?: () => void;
}

export const AdminApplicationsPage: React.FC<AdminApplicationsPageProps> = ({ 
  onBackClick 
}) => {
  const { user } = useAuth();
  const { getAllApplications, reviewApplication, loading, error } = useCreatorApplication();
  
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<CreatorApplication | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const apps = await getAllApplications();
      setApplications(apps);
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-400" />;
      case 'approved':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '審査中';
      case 'approved': return '承認済み';
      case 'rejected': return '却下';
      default: return '不明';
    }
  };

  const handleReview = async (applicationId: string, status: 'approved' | 'rejected') => {
    if (!user?.uid) return;
    
    setIsReviewing(true);
    try {
      await reviewApplication(applicationId, status, reviewNotes);
      setReviewNotes('');
      setShowDetail(false);
      setSelectedApplication(null);
      await loadApplications();
    } catch (err: any) {
      alert(err.message || '審査の更新に失敗しました');
    } finally {
      setIsReviewing(false);
    }
  };

  const contentCategories: { [key: string]: string } = {
    car_review: '車両レビュー',
    maintenance: '整備・メンテナンス',
    racing: 'レーシング・走行',
    custom: 'カスタム・改造',
    news: 'ニュース・情報',
    other: 'その他',
  };

  if (showDetail && selectedApplication) {
    return (
      <div className="min-h-screen bg-background container-mobile">
        <AppHeader 
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={() => console.log('Profile clicked')}
        />
        
        
        <main className="p-4 pb-24">
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={() => setShowDetail(false)}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">申請詳細</h1>
          </div>

          <div className="space-y-6">
            {/* 申請者情報 */}
            <div className="bg-surface rounded-xl border border-surface-light p-6">
              <h2 className="text-lg font-bold text-white mb-4">申請者情報</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    {selectedApplication.userAvatar ? (
                      <img 
                        src={selectedApplication.userAvatar} 
                        alt="avatar" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {selectedApplication.userName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedApplication.userName}</p>
                    <p className="text-gray-400 text-sm">{selectedApplication.userEmail}</p>
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    {getStatusIcon(selectedApplication.status)}
                    <span className="text-sm text-gray-300">
                      {getStatusText(selectedApplication.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* チャンネル情報 */}
            <div className="bg-surface rounded-xl border border-surface-light p-6">
              <h2 className="text-lg font-bold text-white mb-4">チャンネル情報</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">チャンネル名</label>
                  <p className="text-white">{selectedApplication.channelName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">チャンネル説明</label>
                  <p className="text-white whitespace-pre-wrap">{selectedApplication.channelDescription}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">コンテンツカテゴリ</label>
                  <p className="text-white">{contentCategories[selectedApplication.contentCategory]}</p>
                </div>
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="bg-surface rounded-xl border border-surface-light p-6">
              <h2 className="text-lg font-bold text-white mb-4">詳細情報</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">経験・実績</label>
                  <p className="text-white whitespace-pre-wrap">{selectedApplication.experience}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">動機</label>
                  <p className="text-white whitespace-pre-wrap">{selectedApplication.motivation}</p>
                </div>
                {selectedApplication.socialMediaLinks && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">ソーシャルメディア</label>
                    <div className="space-y-2">
                      {selectedApplication.socialMediaLinks.youtube && (
                        <div className="flex items-center space-x-2">
                          <span className="text-red-400 text-sm">YouTube:</span>
                          <a 
                            href={selectedApplication.socialMediaLinks.youtube} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm hover:underline"
                          >
                            {selectedApplication.socialMediaLinks.youtube}
                          </a>
                        </div>
                      )}
                      {selectedApplication.socialMediaLinks.instagram && (
                        <div className="flex items-center space-x-2">
                          <span className="text-pink-400 text-sm">Instagram:</span>
                          <a 
                            href={selectedApplication.socialMediaLinks.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm hover:underline"
                          >
                            {selectedApplication.socialMediaLinks.instagram}
                          </a>
                        </div>
                      )}
                      {selectedApplication.socialMediaLinks.twitter && (
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-400 text-sm">Twitter:</span>
                          <a 
                            href={selectedApplication.socialMediaLinks.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm hover:underline"
                          >
                            {selectedApplication.socialMediaLinks.twitter}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedApplication.status === 'pending' && (
              <div className="bg-surface rounded-xl border border-surface-light p-6">
                <h2 className="text-lg font-bold text-white mb-4">審査</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      審査コメント（任意）
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="申請者への連絡事項があれば入力してください"
                      rows={3}
                      className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleReview(selectedApplication.id, 'approved')}
                      disabled={isReviewing}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Check size={20} />
                      <span>{isReviewing ? '承認中...' : '承認'}</span>
                    </button>
                    <button
                      onClick={() => handleReview(selectedApplication.id, 'rejected')}
                      disabled={isReviewing}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <X size={20} />
                      <span>{isReviewing ? '却下中...' : '却下'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedApplication.adminNotes && (
              <div className="bg-surface rounded-xl border border-surface-light p-6">
                <h2 className="text-lg font-bold text-white mb-4">管理者コメント</h2>
                <p className="text-white whitespace-pre-wrap">{selectedApplication.adminNotes}</p>
                <div className="mt-3 text-xs text-gray-400">
                  審査日: {selectedApplication.reviewedAt?.toDate?.()?.toLocaleDateString('ja-JP') || '不明'}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader 
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />
      
      
              <main className="p-4 pb-24">
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">動画配信申請管理</h1>
        </div>

        {/* フィルター */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { key: 'all', label: 'すべて' },
              { key: 'pending', label: '審査中' },
              { key: 'approved', label: '承認済み' },
              { key: 'rejected', label: '却下' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === filter.key
                    ? 'bg-primary text-white'
                    : 'bg-surface text-gray-300 hover:bg-surface-light'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-400">読み込み中...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-sm text-red-400">{error}</div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-400">
              {filterStatus === 'all' ? '申請はありません' : `${filterStatus === 'pending' ? '審査中' : filterStatus === 'approved' ? '承認済み' : '却下'}の申請はありません`}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                onClick={() => {
                  setSelectedApplication(application);
                  setShowDetail(true);
                }}
                className="bg-surface rounded-xl border border-surface-light p-4 cursor-pointer hover:scale-95 active:scale-95 transition-transform"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    {application.userAvatar ? (
                      <img 
                        src={application.userAvatar} 
                        alt="avatar" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {application.userName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-white truncate">
                        {application.channelName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        <span className="text-xs text-gray-400">
                          {getStatusText(application.status)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{application.userName}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {contentCategories[application.contentCategory]}
                    </p>
                  </div>
                  <Eye size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
