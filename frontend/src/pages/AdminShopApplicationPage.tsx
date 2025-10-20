import { ArrowLeft, Building2, CheckCircle, Clock, Eye, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAdminShopApplication } from '../hooks/useShopApplication';

interface AdminShopApplicationPageProps {
  onBackClick?: () => void;
}

interface ShopApplication {
  id: string;
  userId: string;
  shopName: string;
  contactEmail: string;
  businessDescription: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
  rejectionReason?: string;
}

export const AdminShopApplicationPage: React.FC<AdminShopApplicationPageProps> = ({ onBackClick }) => {
  const { getApplications, reviewApplication, loading, error } = useAdminShopApplication();
  const [applications, setApplications] = useState<ShopApplication[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<ShopApplication | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus]);

  const fetchApplications = async () => {
    try {
      const result = await getApplications(selectedStatus);
      if (result && result.applications) {
        setApplications(result.applications);
      }
    } catch (err) {
      console.error('申請一覧取得エラー:', err);
    }
  };

  const handleReview = async () => {
    if (!selectedApplication) return;

    try {
      await reviewApplication(
        selectedApplication.id,
        reviewStatus,
        reviewStatus === 'rejected' ? rejectionReason : undefined
      );
      
      setShowReviewModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
      fetchApplications(); // 一覧を更新
    } catch (err) {
      console.error('審査エラー:', err);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '審査中';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '却下';
      default:
        return status;
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[420px] mx-auto">
          <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-[420px] mx-auto w-full flex items-center justify-between p-4">
              <button
                onClick={onBackClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <span className="text-base text-text-primary font-medium">Shop申請管理</span>
              <div className="w-10" />
            </div>
          </header>

          <main className="px-4 py-8">
            <div className="bg-surface rounded-xl border border-surface-light p-6 shadow-sm text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">申請一覧を読み込み中...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-[420px] mx-auto w-full flex items-center justify-between p-4">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <span className="text-base text-text-primary font-medium">Shop申請管理</span>
            <div className="w-10" />
          </div>
        </header>

        <main className="px-4 py-8">
          {/* ステータスフィルター */}
          <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {status === 'all' ? '全て' : getStatusText(status)}
              </button>
            ))}
          </div>

          {/* 申請一覧 */}
          <div className="space-y-3">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(application.status)}
                      <h3 className="font-semibold text-white">{application.shopName}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{application.contactEmail}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    application.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    application.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {getStatusText(application.status)}
                  </span>
                </div>

                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                  {application.businessDescription}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>申請日: {formatDate(application.submittedAt)}</span>
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowReviewModal(true);
                    }}
                    className="flex items-center space-x-1 text-primary hover:text-primary/80"
                  >
                    <Eye size={14} />
                    <span>詳細</span>
                  </button>
                </div>
              </div>
            ))}

            {applications.length === 0 && (
              <div className="bg-surface rounded-xl border border-surface-light p-6 shadow-sm text-center">
                <Building2 size={48} className="text-gray-500 mx-auto mb-4" />
                <p className="text-text-secondary">
                  {selectedStatus === 'all' ? '申請はありません' : 
                   `${getStatusText(selectedStatus)}の申請はありません`}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 審査モーダル */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl border border-surface-light p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">申請を審査</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">店舗名:</p>
              <p className="text-white font-medium">{selectedApplication.shopName}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">事業内容:</p>
              <p className="text-white text-sm">{selectedApplication.businessDescription}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">申請日時:</p>
              <p className="text-white text-sm">{formatDate(selectedApplication.submittedAt)}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">審査結果</label>
              <div className="flex space-x-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="approved"
                    checked={reviewStatus === 'approved'}
                    onChange={(e) => setReviewStatus(e.target.value as 'approved')}
                    className="w-4 h-4 text-green-500 bg-transparent border-surface-light focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-white">承認</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="rejected"
                    checked={reviewStatus === 'rejected'}
                    onChange={(e) => setReviewStatus(e.target.value as 'rejected')}
                    className="w-4 h-4 text-red-500 bg-transparent border-surface-light focus:ring-red-500 focus:ring-2"
                  />
                  <span className="text-white">却下</span>
                </label>
              </div>
            </div>

            {reviewStatus === 'rejected' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">却下理由</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                  placeholder="却下理由を入力してください"
                  rows={3}
                />
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedApplication(null);
                  setRejectionReason('');
                }}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleReview}
                disabled={loading || (reviewStatus === 'rejected' && !rejectionReason.trim())}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors font-medium ${
                  reviewStatus === 'approved'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? '処理中...' : (reviewStatus === 'approved' ? '承認' : '却下')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
