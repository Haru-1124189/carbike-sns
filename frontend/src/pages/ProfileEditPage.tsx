import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { SingleImageUpload } from '../components/ui/SingleImageUpload';
import { useAuth } from '../hooks/useAuth';

// 都道府県リスト
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

interface ProfileEditPageProps {
  onBackClick?: () => void;
}

export const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ onBackClick }) => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingBio, setEditingBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  // 住所関連の状態
  const [editingAddress, setEditingAddress] = useState({
    prefecture: '',
    city: '',
    postalCode: '',
    notificationRadius: 50, // デフォルト50km
    isNotificationEnabled: true,
    isPrivate: true // デフォルトで住所は非表示
  });

  const { user, userDoc, updateUserDoc } = useAuth();

  React.useEffect(() => {
    if (userDoc?.displayName || user?.displayName) {
      setEditingName(userDoc?.displayName || user?.displayName || '');
    }
    if (userDoc?.bio) {
      setEditingBio(userDoc.bio);
    }
    if (userDoc?.address) {
      setEditingAddress({
        prefecture: userDoc.address.prefecture || '',
        city: userDoc.address.city || '',
        postalCode: userDoc.address.postalCode || '',
        notificationRadius: userDoc.address.notificationRadius || 50,
        isNotificationEnabled: userDoc.address.isNotificationEnabled !== false,
        isPrivate: userDoc.address.isPrivate !== false // デフォルトで非表示
      });
    }
  }, [userDoc?.displayName, user?.displayName, userDoc?.bio, userDoc?.address]);

  const handleAvatarChange = async (imageUrl: string | null) => {
    if (!user?.uid) return;

    setUploadingAvatar(true);
    setAvatarError('');

    try {
      await updateUserDoc({ photoURL: imageUrl || '' });
      console.log('プロフィール画像が正常に更新されました');
    } catch (err: any) {
      setAvatarError(err.message || 'アバターの更新に失敗しました');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setSavingProfile(true);
    setProfileError('');

    try {
      // ユーザー名のバリデーション
      if (!editingName.trim()) {
        setProfileError('ユーザー名を入力してください');
        return;
      }

      if (editingName.trim().length > 20) {
        setProfileError('ユーザー名は20文字以内で入力してください');
        return;
      }

      if (editingBio.trim().length > 120) {
        setProfileError('自己紹介は120文字以内で入力してください');
        return;
      }

      await updateUserDoc({ 
        displayName: editingName.trim(),
        bio: editingBio.trim(),
        address: editingAddress.prefecture || editingAddress.city ? {
          prefecture: editingAddress.prefecture,
          city: editingAddress.city,
          postalCode: editingAddress.postalCode,
          notificationRadius: editingAddress.notificationRadius,
          isNotificationEnabled: editingAddress.isNotificationEnabled,
          isPrivate: editingAddress.isPrivate
        } : undefined
      });
      alert('プロフィールを更新しました');
      onBackClick?.();
    } catch (err: any) {
      setProfileError(err.message || 'プロフィールの更新に失敗しました');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-24 pt-0 fade-in">
        {/* 戻るボタン */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">プロフィール編集</h1>
        </div>

        {/* プロフィール編集フォーム */}
        <div className="bg-surface rounded-xl border border-surface-light p-4">
          {/* ユーザー名編集 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ユーザー名 *
            </label>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="ユーザー名を入力"
              maxLength={20}
              className="w-full p-3 bg-transparent border border-surface-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">
                {editingName.length}/20文字
              </span>
              {profileError && (
                <span className="text-xs text-red-400">{profileError}</span>
              )}
            </div>
          </div>

          {/* 自己紹介編集 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              自己紹介
            </label>
            <textarea
              value={editingBio}
              onChange={(e) => setEditingBio(e.target.value)}
              placeholder="自己紹介や趣味などを入力してください（例：車の整備が趣味です。週末は愛車のメンテナンスを楽しんでいます。）"
              maxLength={120}
              rows={3}
              className="w-full p-3 bg-transparent border border-surface-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">
                {editingBio.length}/120文字
              </span>
            </div>
          </div>
          
          {/* 住所情報 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              住所情報（近くのツーリング通知に使用）
            </label>
            
            <div className="space-y-4">
              {/* 都道府県 */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">都道府県</label>
                <select
                  value={editingAddress.prefecture}
                  onChange={(e) => setEditingAddress(prev => ({ ...prev, prefecture: e.target.value }))}
                  className="w-full p-3 bg-transparent border border-surface-light rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="">都道府県を選択してください</option>
                  {PREFECTURES.map(pref => (
                    <option key={pref} value={pref} className="bg-surface">{pref}</option>
                  ))}
                </select>
              </div>
              
              {/* 市区町村 */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">市区町村</label>
                <input
                  type="text"
                  value={editingAddress.city}
                  onChange={(e) => setEditingAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="市区町村を入力してください"
                  className="w-full p-3 bg-transparent border border-surface-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
              </div>
              
              {/* 郵便番号 */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">郵便番号（任意）</label>
                <input
                  type="text"
                  value={editingAddress.postalCode}
                  onChange={(e) => setEditingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="例：123-4567"
                  className="w-full p-3 bg-transparent border border-surface-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
              </div>
              
              {/* 通知設定 */}
              <div className="bg-surface-light p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white">近くのツーリング通知</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAddress.isNotificationEnabled}
                      onChange={(e) => setEditingAddress(prev => ({ ...prev, isNotificationEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                {editingAddress.isNotificationEnabled && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">通知範囲</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={editingAddress.notificationRadius}
                        onChange={(e) => setEditingAddress(prev => ({ ...prev, notificationRadius: parseInt(e.target.value) }))}
                        className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-white w-16">{editingAddress.notificationRadius}km</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      指定した範囲内でツーリング募集があった際に通知します
                    </p>
                  </div>
                )}
                
                {/* プライバシー設定 */}
                <div className="border-t border-gray-600 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-white">住所情報の表示</span>
                      <p className="text-xs text-gray-400 mt-1">
                        他のユーザーに住所情報を表示するかどうか
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!editingAddress.isPrivate} // isPrivateの逆（true=表示、false=非表示）
                        onChange={(e) => setEditingAddress(prev => ({ ...prev, isPrivate: !e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {editingAddress.isPrivate ? 
                      '🔒 住所情報は他のユーザーには表示されません（推奨）' : 
                      '🌍 住所情報が他のユーザーに表示されます'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* アバターアップロード */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              プロフィール画像
            </label>
            <div className="flex items-center space-x-3">
              <SingleImageUpload
                image={userDoc?.photoURL || user?.photoURL || null}
                onImageChange={handleAvatarChange}
                aspectRatio="square"
                placeholder="プロフィール画像を選択"
                isProfileImage={true}
              />
              {avatarError && (
                <p className="text-xs text-red-400 mt-1">{avatarError}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingProfile ? '保存中...' : '保存'}
            </button>
            <button
              onClick={onBackClick}
              className="flex-1 py-2 bg-surface-light text-white rounded-lg text-sm font-medium hover:bg-surface-light/90 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
