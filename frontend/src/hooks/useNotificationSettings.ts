import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/clients';
import { useAuth } from './useAuth';

export interface NotificationSettings {
  likeNotifications: boolean;
  replyNotifications: boolean;
  maintenanceReminders: boolean;
  followNotifications: boolean;
}

const defaultSettings: NotificationSettings = {
  likeNotifications: true,
  replyNotifications: true,
  maintenanceReminders: false,
  followNotifications: true,
};

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // 設定をFirestoreから読み込み
  const loadSettings = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const settingsDoc = await getDoc(doc(db, 'notificationSettings', user.uid));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as NotificationSettings;
        setSettings(data);
      } else {
        // 設定が存在しない場合はデフォルト設定を作成
        await setDoc(doc(db, 'notificationSettings', user.uid), defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  // 設定を更新
  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user?.uid) return;

    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      await updateDoc(doc(db, 'notificationSettings', user.uid), {
        [key]: value
      });
      
      console.log(`Notification setting updated: ${key} = ${value}`);
    } catch (error) {
      console.error('Error updating notification setting:', error);
      // エラーの場合は元の設定に戻す
      setSettings(settings);
    }
  };

  // 設定をリセット
  const resetSettings = async () => {
    if (!user?.uid) return;

    try {
      await setDoc(doc(db, 'notificationSettings', user.uid), defaultSettings);
      setSettings(defaultSettings);
      console.log('Notification settings reset to default');
    } catch (error) {
      console.error('Error resetting notification settings:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user?.uid]);

  return {
    settings,
    loading,
    updateSetting,
    resetSettings,
  };
};
