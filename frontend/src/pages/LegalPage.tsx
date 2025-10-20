import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { AppHeader } from '../components/ui/AppHeader';

interface LegalPageProps {
  type: 'terms' | 'privacy';
  onBackClick?: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBackClick }) => {
  const titleMap = {
    terms: '利用規約',
    privacy: 'プライバシーポリシー'
  } as const;

  const content = `これはダミーの${titleMap[type]}です。実際の文面は本番で差し替えます。`;

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader onNotificationClick={() => {}} onProfileClick={() => {}} />
              <main className="p-4 pb-24">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={onBackClick} className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">{titleMap[type]}</h1>
        </div>
        <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm text-sm text-gray-200 leading-6 whitespace-pre-wrap">
          {content}
        </div>
      </main>
    </div>
  );
};


