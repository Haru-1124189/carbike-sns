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
}

export const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  image,
  onImageChange,
  aspectRatio = 'landscape',
  className = '',
  placeholder = '画像をタップして選択'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
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
    
    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。');
      return;
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadToStorage(user.uid, file);
      onImageChange(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('画像のアップロードに失敗しました。');
    } finally {
      setUploading(false);
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm text-gray-400">アップロード中...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-surface-light rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Image size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">{placeholder}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
