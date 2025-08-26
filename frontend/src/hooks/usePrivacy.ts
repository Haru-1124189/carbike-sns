import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { updatePrivacySettings, getUserPrivacySettings } from '../lib/privacy';

export const usePrivacy = () => {
  const { user } = useAuth();
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 現在のユーザーのプライバシー設定を取得
  const fetchPrivacySettings = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const privacySettings = await getUserPrivacySettings(user.uid);
      setIsPrivate(privacySettings);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching privacy settings:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // プライバシー設定を更新
  const updatePrivacy = useCallback(async (newIsPrivate: boolean) => {
    if (!user?.uid) {
      setError('ログインが必要です');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await updatePrivacySettings(user.uid, newIsPrivate);
      setIsPrivate(newIsPrivate);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating privacy settings:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // コンポーネントマウント時に設定を取得
  useEffect(() => {
    fetchPrivacySettings();
  }, [fetchPrivacySettings]);

  return {
    isPrivate,
    loading,
    error,
    updatePrivacy,
    refetch: fetchPrivacySettings
  };
};
