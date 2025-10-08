import { ArrowLeft, Check, Shield, X } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { useAuth } from '../hooks/useAuth';

interface ReportDetailPageProps {
  onBackClick?: () => void;
  reportId?: string;
  reportData?: {
    type: string;
    targetType: string;
    targetId: string;
    targetTitle?: string;
    reporterName: string;
    content: string;
  };
  createdAt?: Date;
}

export const ReportDetailPage: React.FC<ReportDetailPageProps> = ({
  onBackClick,
  reportId,
  reportData,
  createdAt
}) => {
  const { userDoc } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!reportId) return;
    
    setIsProcessing(true);
    try {
      // TODO: 通報を承認する処理を実装
      console.log('Approving report:', reportId);
      alert('通報を承認しました。該当コンテンツを処理します。');
      onBackClick?.();
    } catch (error) {
      console.error('Error approving report:', error);
      alert('承認処理中にエラーが発生しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reportId) return;
    
    setIsProcessing(true);
    try {
      // TODO: 通報を却下する処理を実装
      console.log('Rejecting report:', reportId);
      alert('通報を却下しました。');
      onBackClick?.();
    } catch (error) {
      console.error('Error rejecting report:', error);
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
            <Shield size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">アクセス拒否</h2>
            <p className="text-gray-400">管理者権限が必要です</p>
          </div>
        </main>
      </div>
    );
  }

  console.log('Admin access granted, rendering report detail page');

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
            <h1 className="text-lg font-bold text-white">通報詳細</h1>
            <p className="text-sm text-gray-400">通報内容の確認と処理</p>
          </div>
        </div>

        {/* 通報情報 */}
        <div className="bg-surface border border-surface-light rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield size={24} className="text-red-500" />
            <h2 className="text-lg font-bold text-white">通報内容</h2>
          </div>

          <div className="space-y-4">
            {/* 通報者情報 */}
            <div className="bg-surface-light rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">通報者情報</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">通報者名:</span>
                  <span className="text-sm text-white">{reportData?.reporterName || '不明'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">通報日時:</span>
                  <span className="text-sm text-white">
                    {createdAt ? createdAt.toLocaleString('ja-JP') : '不明'}
                  </span>
                </div>
              </div>
            </div>

            {/* 通報対象情報 */}
            <div className="bg-surface-light rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">通報対象</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">通報タイプ:</span>
                  <span className="text-sm text-white">{reportData?.type || '未入力'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">対象タイプ:</span>
                  <span className="text-sm text-white">{reportData?.targetType || '未入力'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">対象タイトル:</span>
                  <span className="text-sm text-white">{reportData?.targetTitle || '無題'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">対象ID:</span>
                  <span className="text-sm text-white font-mono">{reportData?.targetId || '未入力'}</span>
                </div>
              </div>
            </div>

            {/* 通報理由 */}
            {reportData?.content && (
              <div className="bg-surface-light rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-2">通報理由</h3>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-sm text-white whitespace-pre-wrap">
                    {reportData.content}
                  </p>
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
            <li>• 承認すると、該当コンテンツが非表示または削除されます</li>
            <li>• 却下すると、通報は破棄され、コンテンツはそのまま残ります</li>
            <li>• 通報の内容を慎重に確認してから処理してください</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
