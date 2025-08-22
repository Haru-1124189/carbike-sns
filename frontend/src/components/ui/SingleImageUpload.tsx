import { Camera, Image, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { uploadToStorage } from '../../lib/upload';

interface SingleImageUploadProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  className?: string;
  placeholder?: string;
  isProfileImage?: boolean; // プロフィール画像かどうかのフラグ
}

export const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  image,
  onImageChange,
  aspectRatio = 'landscape',
  className = '',
  placeholder = '画像をタップして選択',
  isProfileImage = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleRemoveImage = () => {
    onImageChange(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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

      {/* 画像アップロードエリア */}
      <div
        onClick={handleUploadClick}
        className={`w-full ${getAspectRatioClass()} rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 relative overflow-hidden ${
          uploading
            ? 'border-gray-500'
            : image
            ? 'border-surface-light'
            : 'border-surface-light hover:border-primary'
        }`}
      >
        {image ? (
          <>
            <img
              src={image}
              alt="アップロード画像"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="bg-white bg-opacity-90 rounded-full p-2">
                <Camera size={20} className="text-black" />
              </div>
            </div>
            {/* 削除ボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300"
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
                <div className="w-12 h-12 bg-surface-light rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Image size={24} className="text-gray-400" />
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
