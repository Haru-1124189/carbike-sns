import { ArrowLeft, Eye, Globe, Lock, Tag, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { ThumbnailGenerator } from '../components/ui/ThumbnailGenerator';
import { VideoUploader } from '../components/ui/VideoUploader';
import { useAuth } from '../hooks/useAuth';
import { useVideos } from '../hooks/useVideos';

interface UploadVideoPageProps {
  onBack?: () => void;
}

export const UploadVideoPage: React.FC<UploadVideoPageProps> = ({ onBack }) => {
  const { user, userDoc } = useAuth();
  const { uploadVideo, loading, error } = useVideos(user?.uid);
  
  // 権限に応じた色分けのロジック
  const getPermissionColor = () => {
    if (userDoc?.isAdmin === true) {
      return 'text-green-500'; // 管理者のみ：緑色
    } else if (userDoc?.role === 'creator' || userDoc?.role === 'admin') {
      return 'text-blue-500'; // クリエイターと管理者：青色
    }
    return 'text-gray-500'; // その他：グレー
  };

  const permissionColor = getPermissionColor();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'car',
    tags: [] as string[],
    visibility: 'public' as 'public' | 'unlisted' | 'private',
    ageRestriction: false
  });
  
  const [tagInput, setTagInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
  };

  const handleVideoRemove = () => {
    setVideoFile(null);
    setSelectedThumbnail(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid || !videoFile) {
      alert('ログインが必要です');
      return;
    }

    if (!formData.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    if (!selectedThumbnail) {
      alert('サムネイルを選択してください');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 実際のアップロード処理をシミュレート
      const uploadSteps = [
        { progress: 20, message: 'ファイルをアップロード中...' },
        { progress: 40, message: '動画を処理中...' },
        { progress: 60, message: 'サムネイルを生成中...' },
        { progress: 80, message: 'メタデータを保存中...' },
        { progress: 100, message: '完了！' }
      ];

      for (const step of uploadSteps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUploadProgress(step.progress);
      }

      // 動画データを作成
      const videoData = {
        title: formData.title,
        description: formData.description,
        thumbnailUrl: selectedThumbnail,
        videoUrl: URL.createObjectURL(videoFile), // 実際のアプリではアップロードされたURL
        duration: '0:00', // 実際のアプリでは動画の長さを取得
        tags: formData.tags,
        category: formData.category as 'car' | 'bike' | 'maintenance' | 'review' | 'other',
        visibility: formData.visibility,
        ageRestriction: formData.ageRestriction
      };

      await uploadVideo(videoData, user.displayName || 'ユーザー');
      alert('動画がアップロードされました！');
      onBack?.();
    } catch (err) {
      console.error('Upload error:', err);
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const categories = [
    { value: 'car', label: '車' },
    { value: 'bike', label: 'バイク' },
    { value: 'maintenance', label: '整備' },
    { value: 'review', label: 'レビュー' },
    { value: 'other', label: 'その他' }
  ];

  const visibilityOptions = [
    { value: 'public', label: '公開', icon: Globe, description: '誰でも見ることができます' },
    { value: 'unlisted', label: '限定公開', icon: Eye, description: 'リンクを知っている人のみ' },
    { value: 'private', label: '非公開', icon: Lock, description: 'あなたのみ' }
  ];

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-24 pt-0 fade-in">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm mr-3"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className={`text-xl font-bold ${permissionColor}`}>動画をアップロード</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 動画アップロード */}
          <div>
            <label className="block text-sm font-medium text-white mb-4">
              動画ファイル *
            </label>
            <VideoUploader
              onVideoSelect={handleVideoSelect}
              onRemove={handleVideoRemove}
              selectedFile={videoFile}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </div>

          {/* サムネイル生成 */}
          {videoFile && (
            <div>
              <ThumbnailGenerator
                videoFile={videoFile}
                onThumbnailSelect={setSelectedThumbnail}
                selectedThumbnail={selectedThumbnail}
              />
            </div>
          )}

          {/* 基本情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">基本情報</h3>
            
            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                タイトル *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="動画のタイトルを入力してください"
                className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.title.length}/100文字
              </p>
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                説明
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="動画の説明を入力してください"
                rows={4}
                className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                maxLength={5000}
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.description.length}/5000文字
              </p>
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                カテゴリ *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white focus:outline-none focus:border-primary"
                required
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* タグ */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                タグ (最大10個)
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="タグを入力"
                  className="flex-1 px-4 py-3 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={formData.tags.length >= 10}
                  className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <Tag size={16} />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-primary text-white text-sm rounded-full"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 詳細設定 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">詳細設定</h3>
            
            {/* 公開設定 */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                公開設定
              </label>
              <div className="space-y-2">
                {visibilityOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.visibility === option.value
                          ? 'border-primary bg-primary bg-opacity-10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={option.value}
                        checked={formData.visibility === option.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <Icon size={20} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{option.label}</p>
                        <p className="text-xs text-gray-400">{option.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 年齢制限 */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="ageRestriction"
                checked={formData.ageRestriction}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary bg-surface border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <label className="text-sm text-white">
                年齢制限付きコンテンツとして設定
              </label>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-xl text-red-300">
              {error}
            </div>
          )}

          {/* アップロードボタン */}
          <button
            type="submit"
            disabled={loading || isUploading || !videoFile || !selectedThumbnail || !formData.title.trim()}
            className="w-full py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading || isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isUploading ? 'アップロード中...' : '処理中...'}</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>動画をアップロード</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};
