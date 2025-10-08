import { ArrowLeft, Car, Check, X } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { upsertVehicleCatalogEntry } from '../lib/catalog';

interface VehicleRequestDetailPageProps {
  onBackClick?: () => void;
  requestId?: string;
  requestData?: {
    maker: string;
    model: string;
    year: string;
    notes: string;
  };
  fromUserId?: string;
  fromUserName?: string;
  createdAt?: Date;
}

export const VehicleRequestDetailPage: React.FC<VehicleRequestDetailPageProps> = ({
  onBackClick,
  requestId,
  requestData,
  fromUserId,
  fromUserName,
  createdAt
}) => {
  const { userDoc } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  console.log('VehicleRequestDetailPage rendered with:', { userDoc, requestData, fromUserName });

  const handleApprove = async () => {
    if (!requestId) return;
    
    setIsProcessing(true);
    try {
      // カタログへ反映
      if (requestData) {
        await upsertVehicleCatalogEntry(requestData.maker, requestData.model, requestData.year || '');
      }
      console.log('Approving vehicle request:', requestId);
      alert('車種申請を承認しました。カタログに反映しました。');
      onBackClick?.();
    } catch (error) {
      console.error('Error approving vehicle request:', error);
      alert('承認処理中にエラーが発生しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!requestId) return;
    
    setIsProcessing(true);
    try {
      // TODO: 車種申請を却下する処理を実装
      console.log('Rejecting vehicle request:', requestId);
      alert('車種申請を却下しました。');
      onBackClick?.();
    } catch (error) {
      console.error('Error rejecting vehicle request:', error);
      alert('却下処理中にエラーが発生しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  // 管理者権限チェック
  if (!userDoc?.isAdmin) {
    console.log('Access denied - user is not admin:', userDoc);
    return (
      <div className="min-h-screen bg-background container-mobile">
        <AppHeader />
        <main className="px-4 pb-24 pt-0">
          <div className="text-center py-8">
            <Car size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">アクセス拒否</h2>
            <p className="text-gray-400">管理者権限が必要です</p>
          </div>
        </main>
      </div>
    );
  }

  console.log('Admin access granted, rendering vehicle request detail page');

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-24 pt-0">
        {/* ヘッダー */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">車種申請詳細</h1>
            <p className="text-sm text-gray-400">申請内容の確認と処理</p>
          </div>
        </div>

        {/* 申請情報 */}
        <div className="bg-surface border border-surface-light rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Car size={24} className="text-primary" />
            <h2 className="text-lg font-bold text-white">申請内容</h2>
          </div>

          <div className="space-y-4">
            {/* 申請者情報 */}
            <div className="bg-surface-light rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">申請者情報</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">申請者名:</span>
                  <span className="text-sm text-white">{fromUserName || '不明'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">申請日時:</span>
                  <span className="text-sm text-white">
                    {createdAt ? createdAt.toLocaleString('ja-JP') : '不明'}
                  </span>
                </div>
              </div>
            </div>

            {/* 車種情報 */}
            <div className="bg-surface-light rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">車種情報</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">メーカー:</span>
                  <span className="text-sm text-white">{requestData?.maker || '未入力'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">モデル名:</span>
                  <span className="text-sm text-white">{requestData?.model || '未入力'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">年式期間:</span>
                  <span className="text-sm text-white">{requestData?.year || '未入力'}</span>
                </div>
              </div>
            </div>

            {/* 年式期間の詳細表示 */}
            {requestData?.year && (
              <div className="bg-surface-light rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-2">年式期間詳細</h3>
                <div className="bg-background rounded-lg p-3">
                  <pre className="text-sm text-white whitespace-pre-wrap">
                    {requestData.year}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 処理ボタン */}
        <div className="flex space-x-3">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
          >
            <Check size={20} />
            <span>{isProcessing ? '処理中...' : '承認'}</span>
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
          >
            <X size={20} />
            <span>{isProcessing ? '処理中...' : '却下'}</span>
          </button>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-400 mb-2">注意事項</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• 承認すると、申請された車種がデータベースに追加されます</li>
            <li>• 却下すると、申請は破棄され、申請者に通知されます</li>
            <li>• 年式期間は複数の期間が含まれる場合があります</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
