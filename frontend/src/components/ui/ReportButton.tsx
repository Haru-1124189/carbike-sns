import React, { useState } from 'react';
import { Flag, AlertTriangle, MessageSquare, User, X } from 'lucide-react';
import { createReport } from '../../lib/reports';
import { useAuth } from '../../hooks/useAuth';

interface ReportButtonProps {
  targetId: string;
  targetType: 'thread' | 'maintenance' | 'user';
  targetTitle?: string;
  targetAuthorId?: string;
  targetAuthorName?: string;
  className?: string;
}

export const ReportButton: React.FC<ReportButtonProps> = ({
  targetId,
  targetType,
  targetTitle,
  targetAuthorId,
  targetAuthorName,
  className = ''
}) => {
  const { user, userDoc } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState<'spam' | 'inappropriate' | 'harassment' | 'other'>('spam');
  const [reportContent, setReportContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async () => {
    if (!user || !userDoc || !reportContent.trim()) {
      alert('通報内容を入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport({
        type: reportType,
        content: reportContent,
        reporterId: user.uid,
        reporterName: userDoc.displayName || user.displayName || '匿名ユーザー',
        targetId,
        targetType,
        targetTitle,
        targetAuthorId,
        targetAuthorName,
      });

      alert('通報を受け付けました。ご協力ありがとうございます。');
      setShowModal(false);
      setReportContent('');
      setReportType('spam');
    } catch (error: any) {
      alert(error.message || '通報の送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportTypes = [
    { value: 'spam', label: 'スパム', icon: AlertTriangle },
    { value: 'inappropriate', label: '不適切なコンテンツ', icon: MessageSquare },
    { value: 'harassment', label: 'ハラスメント', icon: User },
    { value: 'other', label: 'その他', icon: Flag },
  ];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center space-x-1 text-xs text-gray-400 hover:text-red-400 transition-colors ${className}`}
      >
        <Flag size={14} />
        <span>通報</span>
      </button>

      {/* 通報モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-surface-light w-full max-w-md">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-surface-light">
              <h3 className="text-lg font-bold text-white">投稿を通報</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-surface-light rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="p-4 space-y-4">
              {/* 通報タイプ選択 */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  通報の種類
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setReportType(type.value as any)}
                        className={`p-3 rounded-lg border transition-colors flex items-center space-x-2 ${
                          reportType === type.value
                            ? 'border-red-500 bg-red-500 bg-opacity-10 text-red-400'
                            : 'border-surface-light text-gray-400 hover:border-gray-300 hover:text-gray-300'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 通報内容 */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  詳細な理由
                </label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="通報の理由を具体的に記入してください..."
                  className="w-full h-24 px-3 py-2 bg-surface-light border border-surface-light rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-primary"
                />
              </div>

              {/* 注意事項 */}
              <div className="text-xs text-gray-400 bg-surface-light p-3 rounded-lg">
                <p>• 虚偽の通報は禁止されています</p>
                <p>• 管理者が内容を確認し、適切な対応を行います</p>
                <p>• 通報者の情報は管理者のみに表示されます</p>
              </div>
            </div>

            {/* フッター */}
            <div className="flex space-x-2 p-4 border-t border-surface-light">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleReport}
                disabled={isSubmitting || !reportContent.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '送信中...' : '通報する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
