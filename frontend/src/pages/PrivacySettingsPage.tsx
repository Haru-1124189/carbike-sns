import { ArrowLeft, Bell, Heart, MapPin, MessageSquare, Shield, Users } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { useNotificationSettings } from '../hooks/useNotificationSettings';

interface PrivacySettingsPageProps {
  onBackClick?: () => void;
}

export const PrivacySettingsPage: React.FC<PrivacySettingsPageProps> = ({ onBackClick }) => {
  const { userDoc, updateUserDoc } = useAuth();
  const { settings, updateSetting } = useNotificationSettings();
  const [saving, setSaving] = useState(false);

  // 住所の表示設定
  const [addressVisibility, setAddressVisibility] = useState(
    userDoc?.address?.isPrivate !== false // デフォルトで非表示
  );

  // プロフィールの公開設定
  const [profileVisibility, setProfileVisibility] = useState(
    userDoc?.isPrivate !== true // デフォルトで公開
  );

  // 近くのツーリング通知設定
  const [locationNotifications, setLocationNotifications] = useState(
    userDoc?.address?.isNotificationEnabled !== false // デフォルトで有効
  );

  const handleSave = async () => {
    if (!userDoc) return;

    setSaving(true);
    try {
      await updateUserDoc({
        isPrivate: profileVisibility,
        address: userDoc.address ? {
          ...userDoc.address,
          isPrivate: addressVisibility,
          isNotificationEnabled: locationNotifications
        } : undefined
      });
      alert('プライバシー設定を保存しました');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="p-4 pb-24 pt-0 fade-in max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm mr-4"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">プライバシー設定</h1>
            <p className="text-sm text-gray-400">個人情報の表示と通知を管理</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* プロフィール公開設定 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <div className="flex items-center mb-4">
              <Users size={20} className="text-primary mr-3" />
              <h2 className="text-lg font-semibold text-white">プロフィール公開設定</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">プロフィールの公開</p>
                  <p className="text-sm text-gray-400">他のユーザーがプロフィールを閲覧できるかどうか</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!profileVisibility}
                    onChange={(e) => setProfileVisibility(!e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="bg-surface-light p-3 rounded-lg">
                <p className="text-xs text-gray-400">
                  {profileVisibility ? 
                    '🔒 プロフィールは非公開です。他のユーザーからは見えません。' : 
                    '🌍 プロフィールは公開されています。他のユーザーから閲覧可能です。'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 住所情報設定 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <div className="flex items-center mb-4">
              <MapPin size={20} className="text-orange-400 mr-3" />
              <h2 className="text-lg font-semibold text-white">住所情報の表示</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">住所情報の表示</p>
                  <p className="text-sm text-gray-400">他のユーザーに住所情報を表示するかどうか</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!addressVisibility}
                    onChange={(e) => setAddressVisibility(!e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="bg-surface-light p-3 rounded-lg">
                <p className="text-xs text-gray-400">
                  {addressVisibility ? 
                    '🔒 住所情報は非表示です。他のユーザーには都道府県のみ表示されます。' : 
                    '🌍 住所情報が表示されます。他のユーザーに詳細な住所が表示される可能性があります。'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 通知設定 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <div className="flex items-center mb-4">
              <Bell size={20} className="text-green-400 mr-3" />
              <h2 className="text-lg font-semibold text-white">通知設定</h2>
            </div>
            <div className="space-y-4">
              {/* いいね通知 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Heart size={16} className="text-red-400" />
                  <div>
                    <p className="text-white font-medium">いいね通知</p>
                    <p className="text-sm text-gray-400">投稿へのいいねを通知</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.likeNotifications}
                    onChange={(e) => updateSetting('likeNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* 返信通知 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare size={16} className="text-blue-400" />
                  <div>
                    <p className="text-white font-medium">返信通知</p>
                    <p className="text-sm text-gray-400">質問への返信を通知</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.replyNotifications}
                    onChange={(e) => updateSetting('replyNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>


              {/* フォロー通知 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users size={16} className="text-purple-400" />
                  <div>
                    <p className="text-white font-medium">フォロー通知</p>
                    <p className="text-sm text-gray-400">新しいフォロワーを通知</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.followNotifications}
                    onChange={(e) => updateSetting('followNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* 位置情報通知 */}
              {userDoc?.address && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin size={16} className="text-blue-400" />
                    <div>
                      <p className="text-white font-medium">近くのツーリング通知</p>
                      <p className="text-sm text-gray-400">近くでツーリング募集があった際の通知</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locationNotifications}
                      onChange={(e) => setLocationNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* プライバシー情報 */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Shield size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-2">プライバシーについて</h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• 住所情報は通知機能でのみ使用され、他の用途では利用されません</p>
                  <p>• 位置情報はリアルタイムで追跡されることはありません</p>
                  <p>• 設定はいつでも変更可能です</p>
                  <p>• 詳細なプライバシーポリシーは<a href="/privacy-policy" className="text-primary underline">こちら</a></p>
                </div>
              </div>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '設定を保存'}
            </button>
            <button
              onClick={onBackClick}
              className="flex-1 py-3 bg-surface-light text-white rounded-lg font-medium hover:bg-surface-light/80 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
