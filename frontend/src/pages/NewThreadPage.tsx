import { ArrowLeft, Hash, Image, Send, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { BannerAd } from '../components/ui/BannerAd';
import { MentionTextarea } from '../components/ui/MentionTextarea';
import { useAuth } from '../hooks/useAuth';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { createThread } from '../lib/threads';
import { uploadToStorage } from '../lib/upload';

interface NewThreadPageProps {
  postType: 'post' | 'question';
  onBackClick: () => void;
  onSuccess?: () => void;
}

export const NewThreadPage: React.FC<NewThreadPageProps> = ({ 
  postType, 
  onBackClick, 
  onSuccess 
}) => {
  const { user, userDoc } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // スワイプバック機能を有効化
  useSwipeBack({
    onSwipeBack: onBackClick
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Firebase認証が必要です');
      return;
    }

    // 質問の場合はタイトルが必要
    if (postType === 'question' && !title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    // 内容は必須
    if (!content.trim()) {
      setError('内容を入力してください');
      return;
    }

    // 字数制限チェック
    const maxLength = postType === 'post' ? 150 : 200;
    if (content.length > maxLength) {
      setError(`内容は${maxLength}文字以内で入力してください`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const threadData = {
        title: title.trim(),
        content: content.trim(),
        type: postType,
        tags,
        images: uploadedImages,
      };

      // デバッグ情報を追加
      console.log('NewThreadPage - Submit Debug:', {
        postType,
        threadData
      });

      // 最新のユーザー名を使用（userDocが優先）
      const displayName = userDoc?.displayName || user?.displayName || 'ユーザー';

      const threadId = await createThread(threadData, user.uid, displayName);
      console.log('Thread created successfully:', threadId);
      alert('投稿が完了しました！');
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || '投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user?.uid) return;

    setUploadingImages(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.type.startsWith('image/')) {
          return await uploadToStorage(user.uid, file);
        }
        throw new Error('画像ファイルのみアップロード可能です');
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
    } catch (err: any) {
      setError(err.message || '画像のアップロードに失敗しました');
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        {/* バナー広告 - 最上部に固定 */}
        <div className="sticky top-0 z-50 bg-background">
          <BannerAd />
        </div>

        {/* ヘッダー - バナー広告の下 */}
        <header className="bg-background/80 backdrop-blur-md sticky top-[50px] z-40">
          <div className="max-w-[420px] mx-auto w-full flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <span className="text-base text-text-primary font-medium">
                {postType === 'post' ? '投稿' : '質問'}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || (postType === 'question' && !title.trim()) || !content.trim() || content.length > (postType === 'post' ? 150 : 200)}
              className="p-2 rounded-xl bg-primary border border-primary hover:scale-95 active:scale-95 transition-transform shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="px-4 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* タイトル - 質問の場合のみ表示 */}
            {postType === 'question' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  タイトル *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  placeholder="タイトルを入力"
                  maxLength={100}
                />
              </div>
            )}

            {/* 内容 */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                内容 *
              </label>
              <MentionTextarea
                value={content}
                onChange={setContent}
                className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none pr-12"
                placeholder="内容を入力"
                rows={8}
                maxLength={postType === 'post' ? 150 : 200}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {content.length}/{postType === 'post' ? 150 : 200}
              </div>
            </div>

            {/* 画像アップロード */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                画像
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                  id="image-upload"
                  data-testid="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center space-x-2 px-4 py-2 bg-surface border border-surface-light rounded-lg cursor-pointer hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {uploadingImages ? 'アップロード中...' : '画像を選択'}
                  </span>
                </label>
              </div>
              
              {/* アップロード済み画像のプレビュー */}
              {uploadedImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`アップロード画像 ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        data-testid={`remove-image-${index}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* タグ */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                タグ
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent border border-surface-light rounded-lg p-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary text-sm"
                  placeholder="タグを入力"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                >
                  追加
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 bg-primary/20 border border-primary/30 rounded-lg px-2 py-1"
                    >
                      <Hash size={12} className="text-primary" />
                      <span className="text-xs text-primary">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-primary hover:text-red-400 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
