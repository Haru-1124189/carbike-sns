import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { currentUser } from '../data/dummy';

interface MutedWordsPageProps {
  onBackClick?: () => void;
}

export const MutedWordsPage: React.FC<MutedWordsPageProps> = ({ onBackClick }) => {
  const [words, setWords] = useState<string[]>(['売ります', '宣伝']);
  const [input, setInput] = useState('');

  const addWord = () => {
    if (!input.trim()) return;
    setWords(prev => Array.from(new Set([...prev, input.trim()])));
    setInput('');
  };

  const removeWord = (w: string) => setWords(prev => prev.filter(x => x !== w));

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader user={currentUser} onNotificationClick={() => {}} onProfileClick={() => {}} />
      <BannerAd />
      <main className="p-4 pb-20">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={onBackClick} className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">ミュートワード</h1>
        </div>
        <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm mb-4">
          <label className="block text-xs text-gray-400 mb-1">キーワードを追加</label>
          <div className="flex space-x-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-transparent border border-surface-light rounded-lg p-2 text-sm text-white focus:outline-none" placeholder="例: ネガティブ" />
            <button onClick={addWord} className="px-3 rounded-lg bg-primary text-white text-sm font-bold">追加</button>
          </div>
        </div>
        <div className="space-y-2">
          {words.map(w => (
            <div key={w} className="flex items-center justify-between bg-surface rounded-xl border border-surface-light p-3 shadow-sm">
              <span className="text-sm text-white">{w}</span>
              <button onClick={() => removeWord(w)} className="text-xs text-gray-300 hover:text-white">削除</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};


