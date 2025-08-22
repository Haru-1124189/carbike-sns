import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { currentUser } from '../data/dummy';

interface BlockListPageProps {
  onBackClick?: () => void;
  blockedUsers?: string[];
  onUnblockUser?: (author: string) => void;
}

export const BlockListPage: React.FC<BlockListPageProps> = ({ onBackClick, blockedUsers = [], onUnblockUser }) => {

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader onNotificationClick={() => {}} onProfileClick={() => {}} />
      <BannerAd />
              <main className="p-4 pb-24">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={onBackClick} className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">ブロックしたユーザー</h1>
        </div>
        <div className="space-y-2">
          {blockedUsers.length === 0 && (
            <div className="text-sm text-gray-400">ブロック中のユーザーはいません</div>
          )}
          {blockedUsers.map(name => (
            <div key={name} className="flex items-center justify-between bg-surface rounded-xl border border-surface-light p-4 shadow-sm">
              <div className="text-sm text-white">{name}</div>
              <button onClick={() => onUnblockUser?.(name)} className="text-xs text-gray-300 hover:text-white">ブロック解除</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};


