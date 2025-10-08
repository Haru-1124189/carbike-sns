import { Camera, Image, Video, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { uploadToStorage } from '../../lib/upload';

interface SingleImageUploadProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
  video?: string | null;
  onVideoChange?: (video: string | null) => void;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  className?: string;
  placeholder?: string;
  isProfileImage?: boolean; // プロフィール画像かどうかのフラグ
  variant?: 'frame' | 'toolbar'; // 表示バリアント
  // 複数画像対応（ツールバー用）
  allowMultipleImages?: boolean;
  onImagesAppend?: (images: string[]) => void;
  maxImages?: number;
  currentImageCount?: number;
}

export const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  image,
  onImageChange,
  video = null,
  onVideoChange,
  aspectRatio = 'landscape',
  className = '',
  placeholder = '画像/動画をタップして選択',
  isProfileImage = false
  , variant = 'frame'
  , allowMultipleImages = false
  , onImagesAppend
  , maxImages = 5
  , currentImageCount = 0
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]';
      default:
        return 'aspect-video';
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user?.uid) return;

    // 複数画像アップロード（ツールバー専用）
    if (allowMultipleImages && onImagesAppend) {
      const remaining = Math.max(0, maxImages - currentImageCount);
      const selectedFiles = Array.from(files).slice(0, remaining);
      if (selectedFiles.length === 0) {
        alert(`画像は最大${maxImages}枚までです。`);
        return;
      }
      setUploading(true);
      setUploadProgress(0);
      const uploadedUrls: string[] = [];
      try {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const maxSize = 10 * 1024 * 1024;
          if (!file.type.startsWith('image/')) continue;
          if (file.size > maxSize) continue;
          setUploadProgress(Math.min(90, Math.round(((i) / selectedFiles.length) * 90)));
          const imageUrl = await uploadToStorage(user.uid, file, false);
          uploadedUrls.push(imageUrl);
        }
        setUploadProgress(100);
        if (uploadedUrls.length > 0) onImagesAppend(uploadedUrls);
      } catch (error) {
        console.error('Error uploading images:', error);
        alert('画像のアップロードに失敗しました。');
      } finally {
        setTimeout(() => { setUploading(false); setUploadProgress(0); }, 300);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

    const file = files[0];
    
    // ファイルサイズチェック (プロフィール画像は5MB、その他は10MB制限)
    const maxSize = isProfileImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`ファイルサイズが大きすぎます。${isProfileImage ? '5MB' : '10MB'}以下のファイルを選択してください。`);
      return;
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // プロフィール画像の場合は高速モード
      if (isProfileImage) {
        // 即座に50%まで進める
        setUploadProgress(50);
        
        // 短い遅延で100%に
        setTimeout(() => setUploadProgress(100), 100);
        
        const imageUrl = await uploadToStorage(user.uid, file, true);
        onImageChange(imageUrl);
        
        console.log('プロフィール画像が高速でアップロードされました');
      } else {
        // 通常の画像は段階的にプログレス
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 15;
          });
        }, 50);

        const imageUrl = await uploadToStorage(user.uid, file, false);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        onImageChange(imageUrl);
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // より詳細なエラーメッセージ
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          alert('ネットワークエラーが発生しました。画像は一時的に保存されました。');
        } else {
          alert(`画像のアップロードに失敗しました: ${error.message}`);
        }
      } else {
        alert('画像のアップロードに失敗しました。');
      }
    } finally {
      // 少し遅延してからアップロード状態をリセット
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
      
      // ファイル入力の値をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user?.uid || !onVideoChange) return;
    const file = files[0];
    // スマホ動画向けにサイズ上限は大きめに（例: 100MB）
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('動画ファイルが大きすぎます。100MB以下の動画を選択してください。');
      return;
    }
    if (!file.type.startsWith('video/')) {
      alert('動画ファイルを選択してください。');
      return;
    }
    // 30秒以内チェック（メタデータ読み込み）
    const url = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.src = url;
    const duration = await new Promise<number>((resolve, reject) => {
      videoEl.onloadedmetadata = () => {
        resolve(videoEl.duration || 0);
      };
      videoEl.onerror = () => reject(new Error('動画のメタデータを読み込めませんでした'));
    }).catch(() => 0);
    URL.revokeObjectURL(url);
    if (!duration || duration > 30.5) {
      alert('30秒以内の動画のみアップロード可能です。');
      return;
    }
    // ここでスマホ互換の基本コーデック(mp4/h264/aac)は多くの端末が標準出力
    // ブラウザ再生に委ねるため、コーデック変換は行わずにそのまま保存
    setUploading(true);
    setUploadProgress(0);
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) { clearInterval(progressInterval); return 90; }
          return prev + 10;
        });
      }, 80);
      const videoUrl = await uploadToStorage(user.uid, file, false);
      clearInterval(progressInterval);
      setUploadProgress(100);
      onVideoChange(videoUrl);
    } catch (e: any) {
      alert(e?.message || '動画のアップロードに失敗しました');
    } finally {
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // 単一ボタンから画像(複数)・動画(1本)を選択
  const handleMixedSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user?.uid) return;

    const fileArray = Array.from(files);
    const firstVideo = fileArray.find(f => f.type.startsWith('video/'));
    const imageFiles = fileArray.filter(f => f.type.startsWith('image/'));

    // 画像（複数）
    if (allowMultipleImages && onImagesAppend && imageFiles.length > 0) {
      const remaining = Math.max(0, maxImages - currentImageCount);
      const selected = imageFiles.slice(0, remaining);
      if (selected.length === 0 && imageFiles.length > 0) {
        alert(`画像は最大${maxImages}枚までです。`);
      }
      if (selected.length > 0) {
        setUploading(true);
        setUploadProgress(0);
        const urls: string[] = [];
        try {
          for (let i = 0; i < selected.length; i++) {
            const img = selected[i];
            const maxSize = 10 * 1024 * 1024;
            if (img.size > maxSize) continue;
            setUploadProgress(Math.min(90, Math.round(((i) / selected.length) * 90)));
            const url = await uploadToStorage(user.uid, img, false);
            urls.push(url);
          }
          setUploadProgress(100);
          if (urls.length > 0) onImagesAppend(urls);
        } catch {
          alert('画像のアップロードに失敗しました。');
        } finally {
          setTimeout(() => { setUploading(false); setUploadProgress(0); }, 300);
        }
      }
    }

    // 動画（1本・30秒）
    if (firstVideo && onVideoChange) {
      const fakeEvent = { target: { files: [firstVideo] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleVideoSelect(fakeEvent);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    onImageChange(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // ツールバー表示（本文下に小さなアイコンのみ）
  if (variant === 'toolbar') {
    return (
      <div className={className}>
        {/* 隠しファイル入力（画像/動画共用） */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleMixedSelect}
          className="hidden"
        />

        <div className="flex items-center gap-2 text-gray-300">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-8 h-8 rounded-md border border-surface-light/60 bg-background/40 hover:bg-background/60 disabled:opacity-50 flex items-center justify-center transition-colors"
            title="画像を選択"
          >
            <Image size={16} />
          </button>
          {uploading && (
            <span className="text-xs text-gray-400 ml-1">{uploadProgress}%</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        className="hidden"
      />

      {/* 画像アップロードエリア */}
      <div
        onClick={handleUploadClick}
        className={`w-full ${getAspectRatioClass()} rounded-lg border border-dashed border-surface-light/60 bg-surface-light/5 hover:bg-surface-light/10 cursor-pointer transition-colors duration-200 relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ${
          uploading
            ? 'border-gray-500/60'
            : image
            ? 'border-surface-light/60'
            : 'hover:border-primary/60'
        }`}
      >
        {image || video ? (
          <>
            {image ? (
              <img src={image} alt="アップロード画像" className="w-full h-full object-cover" />
            ) : (
              <video src={video || ''} className="w-full h-full object-cover" controls muted />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="bg-white bg-opacity-90 rounded-full p-2 flex items-center gap-2">
                <Camera size={18} className="text-black" />
                <Video size={18} className="text-black" />
              </div>
            </div>
            {/* 削除ボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (image) handleRemoveImage();
                if (video && onVideoChange) onVideoChange(null);
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/70 border border-white/10 transition-colors duration-200"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {uploading ? (
              <div className="text-center">
                <div className="relative mb-2">
                  <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>
                  <div 
                    className="absolute top-0 left-0 w-8 h-8 border-2 border-primary rounded-full transition-all duration-300"
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                      transform: `rotate(${uploadProgress * 3.6}deg)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{uploadProgress}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {isProfileImage ? '高速処理中...' : 'アップロード中...'}
                </p>
                {isProfileImage && uploadProgress < 100 && (
                  <p className="text-xs text-gray-500 mt-1">画質を最適化中</p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <button onClick={handleUploadClick} className="w-10 h-10 rounded-full border border-surface-light/60 bg-background/40 hover:bg-background/60 transition-colors flex items-center justify-center">
                    <Image size={20} className="text-gray-300" />
                  </button>
                  {onVideoChange && (
                    <button onClick={()=>videoInputRef.current?.click()} className="w-10 h-10 rounded-full border border-surface-light/60 bg-background/40 hover:bg-background/60 transition-colors flex items-center justify-center">
                      <Video size={20} className="text-gray-300" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-400">{placeholder}</p>
                {isProfileImage && (
                  <p className="text-xs text-gray-500 mt-1">推奨: 150x150px, 5MB以下</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
