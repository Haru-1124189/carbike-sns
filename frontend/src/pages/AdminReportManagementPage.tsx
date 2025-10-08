import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { AlertTriangle, ArrowLeft, Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/init';

interface Report {
  id: string;
  type: string;
  targetType: string;
  targetId: string;
  targetTitle?: string;
  reporterName: string;
  reporterEmail: string;
  content: string;
  createdAt: Timestamp;
  isRead?: boolean;
}

interface AdminReportManagementPageProps {
  onBackClick: () => void;
}

const AdminReportManagementPage: React.FC<AdminReportManagementPageProps> = ({ onBackClick }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const reportList: Report[] = [];
        snapshot.forEach((doc) => {
          reportList.push({
            id: doc.id,
            ...doc.data()
          } as Report);
        });
        setReports(reportList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTargetTypeLabel = (targetType: string) => {
    switch (targetType) {
      case 'thread': return 'スレッド';
      case 'maintenance': return '整備記録';
      case 'touring': return 'ツーリング投稿';
      case 'video': return '動画';
      default: return targetType;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <header className="flex items-center p-4 border-b border-border">
          <button onClick={onBackClick} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">通報管理</h1>
        </header>
        <main className="flex-1 p-4 flex items-center justify-center">
          <div className="text-gray-400">読み込み中...</div>
        </main>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <header className="flex items-center p-4 border-b border-border">
          <button onClick={() => setSelectedReport(null)} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">通報詳細</h1>
        </header>
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-surface rounded-xl p-6 border border-surface-light">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="text-red-500" size={24} />
                <div>
                  <h2 className="text-lg font-bold">{selectedReport.type}</h2>
                  <div className="text-sm text-gray-400">
                    {selectedReport.reporterName} ({selectedReport.reporterEmail})
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(selectedReport.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-surface-light rounded-lg p-3">
                  <h3 className="font-semibold mb-2">通報対象</h3>
                  <p className="text-sm">{getTargetTypeLabel(selectedReport.targetType)}</p>
                  {selectedReport.targetTitle && (
                    <p className="text-sm text-gray-400 mt-1">{selectedReport.targetTitle}</p>
                  )}
                </div>
                <div className="bg-surface-light rounded-lg p-3">
                  <h3 className="font-semibold mb-2">通報理由</h3>
                  <p className="text-sm">{selectedReport.type}</p>
                </div>
              </div>

              <div className="bg-surface-light rounded-lg p-4">
                <h3 className="font-semibold mb-2">詳細内容</h3>
                <p className="text-sm whitespace-pre-wrap">{selectedReport.content}</p>
              </div>

              <div className="flex space-x-3 mt-4">
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                  対象を削除
                </button>
                <button className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors">
                  通報を却下
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                  既読にする
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <header className="flex items-center p-4 border-b border-border">
        <button onClick={onBackClick} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">通報管理</h1>
        <div className="ml-auto text-sm text-gray-400">
          全{reports.length}件
        </div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {reports.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
              <div className="text-gray-400">通報はありません</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="bg-surface rounded-xl p-4 border border-surface-light cursor-pointer hover:bg-surface-light transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-red-500 mt-1" size={20} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{report.type}</h3>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {getTargetTypeLabel(report.targetType)}: {report.targetTitle || 'タイトルなし'}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      通報者: {report.reporterName}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDate(report.createdAt)}
                    </div>
                  </div>
                  <Eye className="text-gray-400" size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReportManagementPage;
