import { ArrowLeft, Eye, Globe, Lock, Tag, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { ThumbnailGenerator } from '../components/ui/ThumbnailGenerator';
import { VideoAdPlacement } from '../components/ui/VideoAdPlacement';
import { VideoUploader } from '../components/ui/VideoUploader';
import { useAuth } from '../hooks/useAuth';
import { useVideos } from '../hooks/useVideos';
import { uploadToStorage } from '../lib/upload';
import { OptimizedVideoResult } from '../utils/videoOptimization';

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

  const [videoFile, setVideoFile] = useState<OptimizedVideoResult | null>(null);
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
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);
  const thumbnailSectionRef = useRef<HTMLDivElement>(null);
  
  // 広告挿入位置の管理
  const [adPlacements, setAdPlacements] = useState<Array<{
    id: string;
    timestamp: number;
    type: 'midroll' | 'preroll' | 'postroll';
    duration?: number;
  }>>([]);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    return `${minutes}:${String(secs).padStart(2,'0')}`;
  };

  const handleVideoSelect = (result: OptimizedVideoResult) => {
    setVideoFile(result);
    // 長さを取得
    setDurationSec(result.metadata.duration);
  };

  const handleVideoRemove = () => {
    setVideoFile(null);
    setSelectedThumbnail(null);
    setDurationSec(null);
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
      setUiError('サムネイルを選択してください');
      // サムネイル欄へスクロール
      thumbnailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 動画をStorageにアップロードして実URLを取得
      setUploadProgress(5);
      const storageVideoUrl = await uploadToStorage(user.uid, videoFile.file, false, false, (p)=>{
        // p: 0-100
        // サムネ処理やメタデータ保存の余地を残して最大を70%に制限
        const capped = Math.min(70, Math.max(5, Math.round(p * 0.7)));
        setUploadProgress(capped);
      });

      // 動画データを作成
      const videoData = {
        title: formData.title,
        description: formData.description,
        thumbnailUrl: selectedThumbnail,
        videoUrl: storageVideoUrl,
        duration: '0:00', // 実際のアプリでは動画の長さを取得
        tags: formData.tags,
        category: formData.category as 'car' | 'bike' | 'maintenance' | 'review' | 'other',
        visibility: formData.visibility,
        ageRestriction: formData.ageRestriction
      };

      setUploadProgress(90);
      await uploadVideo(videoData, userDoc?.displayName || user?.displayName || user?.email?.split('@')[0] || 'ユーザー');
      setUploadProgress(100);
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
    <div className="min-h-screen bg-background">
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-24 pt-0 fade-in max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm mr-3"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className={`text-xl font-bold ${permissionColor}`}>動画をアップロード</h1>
        </div>

        {/* PC向け2カラムレイアウト */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 左カラム（動画アップロード + ファイル情報 + 基本情報） */}
          <div className="md:col-span-7 space-y-6">
          {/* 動画アップロード */}
          <div>
            <label className="block text-sm font-medium text-white mb-4">
              動画ファイル *
            </label>
            <VideoUploader
              onVideoSelect={handleVideoSelect}
              onRemove={handleVideoRemove}
              selectedResult={videoFile}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </div>

            {/* ファイル情報（動画の直下） */}
            <div className="p-4 bg-surface rounded-xl border border-surface-light">
              <h3 className="text-sm font-medium text-white mb-3">ファイル情報</h3>
              {!videoFile ? (
                <p className="text-xs text-gray-400">動画を選択するとここに情報が表示されます。</p>
              ) : (
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>ファイル名: <span className="text-gray-200">{videoFile.file.name}</span></li>
                  <li>サイズ: <span className="text-gray-200">{formatFileSize(videoFile.metadata.size)}</span></li>
                  {durationSec !== null && (
                    <li>再生時間: <span className="text-gray-200">{formatDuration(durationSec)}</span></li>
                  )}
                  <li>解像度: <span className="text-gray-200">{videoFile.metadata.width}×{videoFile.metadata.height}</span></li>
                  <li>形式: <span className="text-gray-200">{videoFile.metadata.format || '不明'}</span></li>
                  {videoFile.compressed && videoFile.compressionRatio && (
                    <li>圧縮率: <span className="text-green-400">{videoFile.compressionRatio.toFixed(1)}%削減</span></li>
                  )}
                </ul>
              )}
            </div>

          {/* サムネイル生成は右カラムへ移動 */}

          {/* 基本情報（動画の下） */}
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
          </div>

          {/* 詳細設定 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">詳細設定</h3>
            
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
          </div>

          {/* 右カラム サムネイル選択と公開設定 */}
          <aside className="md:col-span-5 md:sticky md:top-4 space-y-4">
            <div ref={thumbnailSectionRef}>
              <ThumbnailGenerator
                videoFile={videoFile?.file || null}
                onThumbnailSelect={setSelectedThumbnail}
                selectedThumbnail={selectedThumbnail}
              />
              {uiError && !selectedThumbnail && (
                <p className="mt-2 text-sm text-red-400">{uiError}</p>
              )}
            </div>

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
          </aside>

          {/* 広告挿入設定（クリエイターのみ） */}
          {(userDoc?.role === 'creator' || userDoc?.isAdmin) && durationSec && (
            <div className="mt-6">
              <VideoAdPlacement
                videoDuration={durationSec}
                adPlacements={adPlacements}
                onAdPlacementsChange={setAdPlacements}
                onPreview={(timestamp) => {
                  // 動画プレビュー機能（実装は後で）
                  console.log('Preview at:', timestamp);
                }}
                disabled={isUploading}
              />
            </div>
          )}
        </form>
      </main>
    </div>
  );
};
