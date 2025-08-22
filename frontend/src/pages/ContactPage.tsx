import { ArrowLeft, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';

interface ContactPageProps {
  onBackClick?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackClick }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('お問い合わせを送信しました（ダミー）');
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader 
        onNotificationClick={() => {}}
        onProfileClick={() => {}}
      />
      <BannerAd />
              <main className="p-4 pb-24">
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">お問い合わせ</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm">
            <label className="block text-xs text-gray-400 mb-1">件名</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-transparent border border-surface-light rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="例: バグ報告 / 要望"
            />
          </div>
          <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm">
            <label className="block text-xs text-gray-400 mb-1">内容</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-40 bg-transparent border border-surface-light rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="できるだけ詳しくご記入ください"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition"
          >
            <Mail size={16} className="inline mr-2" />送信
          </button>
          <div className="text-center text-xs text-gray-500">返信は数日かかる場合があります</div>
        </form>
      </main>
    </div>
  );
};


