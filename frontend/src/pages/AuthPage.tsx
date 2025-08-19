import { ArrowLeft, Eye, EyeOff, Mail, User } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthPageProps {
  onBackClick?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackClick }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError('表示名を入力してください');
          return;
        }
        await register(email, password, displayName);
      }
      onBackClick?.();
    } catch (error: any) {
      setError(error.message || '認証に失敗しました');
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
                {isLogin ? 'ログイン' : 'アカウント作成'}
              </span>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="px-4 py-8">
          <div className="bg-surface rounded-xl border border-surface-light p-6 shadow-sm">
            <h1 className="text-xl font-bold text-white mb-6 text-center">
              {isLogin ? 'アカウントにログイン' : '新しいアカウントを作成'}
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    表示名
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                      placeholder="表示名を入力"
                      data-testid="display-name-input"
                    />
                    <User size={20} className="absolute right-3 top-3 text-gray-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  メールアドレス
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder="example@email.com"
                    required
                    data-testid="email-input"
                  />
                  <Mail size={20} className="absolute right-3 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder="パスワードを入力"
                    required
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="submit-button"
              >
                {loading ? '処理中...' : (isLogin ? 'ログイン' : 'アカウント作成')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-primary hover:text-primary/80 text-sm"
                data-testid="toggle-auth-mode"
              >
                {isLogin ? 'アカウントをお持ちでない方はこちら' : '既にアカウントをお持ちの方はこちら'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
