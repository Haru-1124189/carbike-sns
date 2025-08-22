import { ArrowLeft, HelpCircle } from 'lucide-react';
import React from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { currentUser } from '../data/dummy';

interface HelpPageProps {
  onBackClick?: () => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onBackClick }) => {
  const faqs = [
    { q: '投稿はどうやって作成しますか？', a: 'ホームのクイックアクション、または下部のPostタブから作成できます。' },
    { q: '整備記録はどこにありますか？', a: '下部タブのMaintから一覧、詳細、投稿が可能です。' },
    { q: '通知設定はどこですか？', a: '設定ページの通知設定セクションから個別に切り替えできます。' },
  ];

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader onNotificationClick={() => {}} onProfileClick={() => {}} />
      <BannerAd />
              <main className="p-4 pb-24">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={onBackClick} className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">ヘルプ / FAQ</h1>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm">
              <div className="flex items-start space-x-2">
                <HelpCircle size={18} className="text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-white mb-1">{f.q}</div>
                  <div className="text-sm text-gray-300">{f.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};


