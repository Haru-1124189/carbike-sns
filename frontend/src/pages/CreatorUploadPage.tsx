import { ArrowLeft, Upload, Video, Image as ImageIcon, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';

interface CreatorUploadPageProps {
  onBackClick?: () => void;
}

export const CreatorUploadPage: React.FC<CreatorUploadPageProps> = ({ onBackClick }) => {
  const { userDoc } = useAuth();
  const [uploadType, setUploadType] = useState<'video' | 'image' | 'article'>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!title.trim() || !description.trim()) {
      alert('タイトルと説明を入力してください');
      return;
    }

    setUploading(true);
    
    // ダミー実装 - 実際にはファイルアップロード処理を実装
    setTimeout(() => {
      setUploading(false);
      alert('アップロードが完了しました（ダミー）');
      setTitle('');
      setDescription('');
    }, 2000);
  };

  // creator以外はアクセス不可
  if (userDoc?.role !== 'creator') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-4">アクセス権限がありません</h1>
          <p className="text-gray-400 mb-6">このページはクリエイター向けの機能です</p>
          <button
            onClick={onBackClick}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        <BannerAd />
        <AppHeader
          user={{ id: "1", name: "RevLinkユーザー", avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U", cars: [], interestedCars: [] }}
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={() => console.log('Profile clicked')}
        />

        <main className="px-4 py-6">
          {/* ヘッダー */}
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">コンテンツアップロード</h1>
          </div>

          {/* コンテンツタイプ選択 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-300 mb-3">コンテンツタイプ</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setUploadType('video')}
                className={`p-4 rounded-xl border transition-colors ${
                  uploadType === 'video'
                    ? 'bg-primary border-primary text-white'
                    : 'bg-surface border-surface-light text-gray-400 hover:text-white hover:bg-surface-light'
                }`}
              >
                <Video size={24} className="mx-auto mb-2" />
                <div className="text-xs font-medium">動画</div>
              </button>
              <button
                onClick={() => setUploadType('image')}
                className={`p-4 rounded-xl border transition-colors ${
                  uploadType === 'image'
                    ? 'bg-primary border-primary text-white'
                    : 'bg-surface border-surface-light text-gray-400 hover:text-white hover:bg-surface-light'
                }`}
              >
                <ImageIcon size={24} className="mx-auto mb-2" />
                <div className="text-xs font-medium">画像</div>
              </button>
              <button
                onClick={() => setUploadType('article')}
                className={`p-4 rounded-xl border transition-colors ${
                  uploadType === 'article'
                    ? 'bg-primary border-primary text-white'
                    : 'bg-surface border-surface-light text-gray-400 hover:text-white hover:bg-surface-light'
                }`}
              >
                <FileText size={24} className="mx-auto mb-2" />
                <div className="text-xs font-medium">記事</div>
              </button>
            </div>
          </div>

          {/* ファイル選択エリア */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-300 mb-3">
              {uploadType === 'video' ? '動画ファイル' : uploadType === 'image' ? '画像ファイル' : 'サムネイル画像'}
            </h2>
            <div className="border-2 border-dashed border-surface-light rounded-xl p-8 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400 text-sm mb-4">
                クリックまたはドラッグ&ドロップでファイルを選択
              </p>
              <input
                type="file"
                accept={uploadType === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                id="file-upload"
                data-testid="creator-file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
              >
                ファイルを選択
              </label>
            </div>
          </div>

          {/* タイトル入力 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              placeholder="コンテンツのタイトルを入力"
              maxLength={100}
              data-testid="creator-title-input"
            />
          </div>

          {/* 説明入力 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
              placeholder="コンテンツの説明を入力"
              rows={6}
              maxLength={1000}
              data-testid="creator-description-input"
            />
          </div>

          {/* アップロードボタン */}
          <button
            onClick={handleUpload}
            disabled={uploading || !title.trim() || !description.trim()}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="creator-upload-button"
          >
            {uploading ? 'アップロード中...' : 'アップロード'}
          </button>

          {/* 注意事項 */}
          <div className="mt-6 p-4 bg-surface rounded-xl border border-surface-light">
            <h3 className="text-sm font-medium text-white mb-2">アップロード時の注意</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• ファイルサイズの上限は100MBです</li>
              <li>• 著作権に違反するコンテンツはアップロードできません</li>
              <li>• 不適切なコンテンツは削除される場合があります</li>
              <li>• アップロード後の審査には最大24時間かかります</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};
