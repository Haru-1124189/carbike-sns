import { AlertTriangle, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';

interface ReportPageProps {
  onBackClick?: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ onBackClick }) => {
  const [category, setCategory] = useState('spam');
  const [detail, setDetail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('報告を送信しました（ダミー）');
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader onNotificationClick={() => {}} onProfileClick={() => {}} />
              <main className="p-4 pb-24">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={onBackClick} className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">問題を報告</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm">
            <label className="block text-xs text-gray-400 mb-1">カテゴリー</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface border border-surface-light rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 8px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px'
              }}
            >
              <option value="spam" className="bg-surface text-white">スパム / 不適切</option>
              <option value="harassment" className="bg-surface text-white">迷惑行為</option>
              <option value="bug" className="bg-surface text-white">バグ報告</option>
              <option value="other" className="bg-surface text-white">その他</option>
            </select>
          </div>
          <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm">
            <label className="block text-xs text-gray-400 mb-1">詳細</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full h-40 bg-transparent border border-surface-light rounded-lg p-2 text-sm text-white focus:outline-none"
              placeholder="詳細を記入してください"
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition">
            <AlertTriangle size={16} className="inline mr-2" />送信
          </button>
        </form>
      </main>
    </div>
  );
};


