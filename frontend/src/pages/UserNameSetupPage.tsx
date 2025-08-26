import { ArrowLeft, Check, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { useAuth } from '../hooks/useAuth';
import { checkUsernameAvailability, validateUsername } from '../utils/mentions';

interface UsernameSetupPageProps {
  onComplete: () => void;
  onBack: () => void;
}

export const UsernameSetupPage: React.FC<UsernameSetupPageProps> = ({
  onComplete,
  onBack
}) => {
  const { user, userDoc, updateUserDoc } = useAuth();
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 既存のユーザー名があれば設定
  useEffect(() => {
    if (userDoc?.username) {
      setUsername(userDoc.username);
    }
  }, [userDoc]);

  // ユーザー名のバリデーション
  const validateAndCheck = async (value: string) => {
    setUsername(value);
    setError(null);
    setIsAvailable(null);

    if (!value) {
      return;
    }

    // バリデーション
    const validation = validateUsername(value);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    // 重複チェック
    setIsChecking(true);
    try {
      const available = await checkUsernameAvailability(value);
      setIsAvailable(available);
      if (!available) {
        setError('このユーザー名は既に使用されています');
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
      setError('ユーザー名の確認中にエラーが発生しました');
    } finally {
      setIsChecking(false);
    }
  };

  // ユーザー名の保存
  const handleSubmit = async () => {
    if (!user || !username || !isAvailable) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserDoc({ username });
      onComplete();
    } catch (error) {
      console.error('Error updating username:', error);
      setError('ユーザー名の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = username && isAvailable && !isChecking && !error;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        <AppHeader
          onNotificationClick={() => {}}
          onProfileClick={() => {}}
        />
        
        <main className="px-4 pb-24 pt-0">
          <BannerAd />
          
          {/* 戻るボタン */}
          <div className="flex items-center space-x-3 mb-6 mt-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <span className="text-base text-text-primary font-medium">ユーザー名の設定</span>
          </div>

          {/* 説明 */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-text-primary mb-2">
              ユーザー名を設定しましょう
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              ユーザー名は他のユーザーがあなたをメンション（@username）する際に使用されます。
              一度設定すると変更はできませんので、慎重に選んでください。
            </p>
          </div>

          {/* ユーザー名入力 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              ユーザー名
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                @
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => validateAndCheck(e.target.value)}
                placeholder="username"
                className="w-full pl-8 pr-12 py-3 bg-surface border border-surface-light rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={20}
                disabled={isSubmitting}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isChecking && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                {!isChecking && isAvailable === true && (
                  <Check size={20} className="text-green-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <X size={20} className="text-red-500" />
                )}
              </div>
            </div>
            
            {/* エラーメッセージ */}
            {error && (
              <div className="mt-2 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* 利用可能メッセージ */}
            {!error && isAvailable && (
              <div className="mt-2 text-sm text-green-500">
                このユーザー名は利用可能です
              </div>
            )}
          </div>

          {/* ルール */}
          <div className="mb-6 p-4 bg-surface border border-surface-light rounded-lg">
            <h3 className="text-sm font-medium text-text-primary mb-2">
              ユーザー名のルール
            </h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• 3文字以上20文字以下</li>
              <li>• 英数字とアンダースコア（_）のみ使用可能</li>
              <li>• 一度設定すると変更できません</li>
              <li>• 他のユーザーと重複できません</li>
            </ul>
          </div>

          {/* サブミットボタン */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              canSubmit && !isSubmitting
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-surface-light text-text-secondary cursor-not-allowed'
            }`}
          >
            {isSubmitting ? '保存中...' : 'ユーザー名を設定'}
          </button>

          {/* スキップボタン */}
          <button
            onClick={onComplete}
            className="w-full mt-3 py-2 px-4 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            後で設定する
          </button>
        </main>
      </div>
    </div>
  );
};
