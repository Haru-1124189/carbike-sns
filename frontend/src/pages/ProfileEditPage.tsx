import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { SingleImageUpload } from '../components/ui/SingleImageUpload';
import { useAuth } from '../hooks/useAuth';

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

  const { user, userDoc, updateUserDoc } = useAuth();

  React.useEffect(() => {
    if (userDoc?.displayName || user?.displayName) {
      setEditingName(userDoc?.displayName || user?.displayName || '');
    }
    if (userDoc?.bio) {
      setEditingBio(userDoc.bio);
    }
  }, [userDoc?.displayName, user?.displayName, userDoc?.bio]);

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
        bio: editingBio.trim()
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
      <BannerAd />
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
