import { ArrowLeft, Car, Hash, Send } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { MentionTextarea } from '../components/ui/MentionTextarea';
import { SingleImageUpload } from '../components/ui/SingleImageUpload';
import { useAuth } from '../hooks/useAuth';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { useVehicles } from '../hooks/useVehicles';
import { createThread } from '../lib/threads';

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
  const { vehicles } = useVehicles();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
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

  const addVehicleTag = (vehicleName: string) => {
    if (!tags.includes(vehicleName) && tags.length < 5) {
      setTags([...tags, vehicleName]);
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

  const handleImageChange = (url: string | null) => {
    setUploadedImages(url ? [url] : []);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">

        {/* ヘッダー */}
        <header className="bg-background/80 backdrop-blur-md sticky top-0 z-40">
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

            {/* 画像/動画アイコンツールバー（画像は最大5枚、動画は30秒） */}
            <div className="-mt-2">
              <SingleImageUpload
                image={null}
                onImageChange={() => {}}
                onImagesAppend={(urls)=>setUploadedImages(prev=>{
                  const next = [...prev, ...urls];
                  return next.slice(0,5);
                })}
                allowMultipleImages
                maxImages={5}
                currentImageCount={uploadedImages.length}
                video={uploadedVideo}
                onVideoChange={(url)=>setUploadedVideo(url)}
                variant="toolbar"
              />
            </div>

            {/* 画像サムネイル一覧と削除 */}
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((img, idx)=> (
                  <div key={idx} className="relative">
                    <img src={img} alt={`選択画像${idx+1}`} className="w-20 h-20 object-cover rounded-md border border-surface-light/60" />
                    <button
                      type="button"
                      onClick={()=> setUploadedImages(uploadedImages.filter((_,i)=> i!==idx))}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

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

              {/* 愛車タグ */}
              {vehicles && vehicles.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Car size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-400">愛車から選択</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {vehicles.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => addVehicleTag(vehicle.name)}
                        disabled={tags.includes(vehicle.name) || tags.length >= 5}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          tags.includes(vehicle.name)
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : tags.length >= 5
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : 'bg-surface-light border border-surface-light text-gray-300 hover:bg-primary/20 hover:border-primary/30 hover:text-primary'
                        }`}
                      >
                        {vehicle.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
