import { ArrowLeft, Building2, CheckCircle, Clock, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useShopApplication } from '../hooks/useShopApplication';

interface ShopApplicationStatusPageProps {
  onBackClick?: () => void;
}

export const ShopApplicationStatusPage: React.FC<ShopApplicationStatusPageProps> = ({ onBackClick }) => {
  const { getApplicationStatus, loading, error } = useShopApplication();
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await getApplicationStatus();
        setStatus(result);
      } catch (err) {
        console.error('申請状況取得エラー:', err);
      }
    };

    fetchStatus();
  }, []);

  const getStatusIcon = () => {
    if (!status) return null;

    switch (status.applicationStatus) {
      case 'pending':
        return <Clock size={32} className="text-yellow-500" />;
      case 'approved':
        return <CheckCircle size={32} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={32} className="text-red-500" />;
      default:
        return <Building2 size={32} className="text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    if (!status) return '申請状況を確認中...';

    switch (status.applicationStatus) {
      case 'pending':
        return '審査中です。審査には数営業日かかる場合があります。';
      case 'approved':
        return '申請が承認されました！Shopとして出品できます。';
      case 'rejected':
        return '申請が却下されました。詳細は下記をご確認ください。';
      default:
        return 'まだ申請していません。';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
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
              <span className="text-base text-text-primary font-medium">申請状況</span>
              <div className="w-10" />
            </div>
          </header>

          <main className="px-4 py-8">
            <div className="bg-surface rounded-xl border border-surface-light p-6 shadow-sm text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">申請状況を確認中...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
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
              <span className="text-base text-text-primary font-medium">申請状況</span>
              <div className="w-10" />
            </div>
          </header>

          <main className="px-4 py-8">
            <div className="bg-surface rounded-xl border border-surface-light p-6 shadow-sm">
              <div className="text-center">
                <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-white mb-2">エラーが発生しました</h2>
                <p className="text-text-secondary mb-4">{error}</p>
                <button
                  onClick={onBackClick}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  戻る
                </button>
              </div>
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
            <span className="text-base text-text-primary font-medium">申請状況</span>
            <div className="w-10" />
          </div>
        </header>

        <main className="px-4 py-8">
          {/* 申請状況 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6 shadow-sm mb-6">
            <div className="text-center">
              {getStatusIcon()}
              <h1 className="text-xl font-bold text-white mt-4 mb-2">
                {status?.applicationStatus === 'none' ? '未申請' : 
                 status?.applicationStatus === 'pending' ? '審査中' :
                 status?.applicationStatus === 'approved' ? '承認済み' : '却下'}
              </h1>
              <p className="text-text-secondary">{getStatusMessage()}</p>
            </div>
          </div>

          {/* 申請詳細 */}
          {status && status.applicationStatus !== 'none' && (
            <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">申請詳細</h2>
              
              {status.submittedAt && (
                <div className="mb-3">
                  <span className="text-sm text-gray-400">申請日時:</span>
                  <p className="text-white">{formatDate(status.submittedAt)}</p>
                </div>
              )}

              {status.reviewedAt && (
                <div className="mb-3">
                  <span className="text-sm text-gray-400">審査日時:</span>
                  <p className="text-white">{formatDate(status.reviewedAt)}</p>
                </div>
              )}

              {status.shopInfo && (
                <div className="mb-3">
                  <span className="text-sm text-gray-400">店舗名:</span>
                  <p className="text-white">{status.shopInfo.shopName}</p>
                </div>
              )}

              {status.rejectionReason && (
                <div className="mb-3">
                  <span className="text-sm text-gray-400">却下理由:</span>
                  <p className="text-red-300">{status.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="space-y-3">
            {status?.applicationStatus === 'none' && (
              <button
                onClick={() => {
                  // TODO: Shop申請ページに遷移
                  console.log('Shop申請ページに遷移');
                }}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Shop申請をする
              </button>
            )}

            {status?.applicationStatus === 'rejected' && (
              <button
                onClick={() => {
                  // TODO: 再申請ページに遷移
                  console.log('再申請ページに遷移');
                }}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                再申請する
              </button>
            )}

            <button
              onClick={onBackClick}
              className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              戻る
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
