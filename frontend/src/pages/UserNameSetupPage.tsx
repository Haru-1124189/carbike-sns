import { ArrowLeft, User } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface UserNameSetupPageProps {
  onBackClick?: () => void;
  onComplete?: () => void;
}

export const UserNameSetupPage: React.FC<UserNameSetupPageProps> = ({ 
  onBackClick, 
  onComplete 
}) => {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { updateUserDoc } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ユーザー名のバリデーション
      if (!displayName.trim()) {
        setError('アプリで使用するユーザー名を入力してください');
        return;
      }
      if (displayName.trim().length > 20) {
        setError('ユーザー名は20文字以内で入力してください');
        return;
      }
      if (displayName.trim().length < 2) {
        setError('ユーザー名は2文字以上で入力してください');
        return;
      }

      // ユーザー名を更新
      await updateUserDoc({ displayName: displayName.trim() });
      
      // 完了コールバックを呼び出し
      onComplete?.();
    } catch (error: any) {
      setError(error.message || 'ユーザー名の設定に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        {/* ヘッダー */}
        <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-[420px] mx-auto w-full flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <span className="text-base text-text-primary font-medium">
                ユーザー名設定
              </span>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="px-4 py-8">
          <div className="bg-surface rounded-xl border border-surface-light p-6 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">
                ユーザー名を設定
              </h1>
              <p className="text-gray-400 text-sm">
                他のユーザーに表示される名前を設定してください
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ユーザー名 *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder="ユーザー名を入力"
                    maxLength={20}
                    required
                  />
                  <User size={20} className="absolute right-3 top-3 text-gray-400" />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {displayName.length}/20文字
                  </span>
                  <span className="text-xs text-gray-400">
                    2-20文字で入力
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !displayName.trim()}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '設定中...' : '設定完了'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onComplete}
                className="text-gray-400 hover:text-white text-sm"
              >
                後で設定する
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
