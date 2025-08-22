import { Image, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { uploadToStorage } from '../../lib/upload';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user?.uid) return;

    setUploading(true);
    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
        const file = files[i];
        
        // ファイルサイズチェック (10MB制限)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} のサイズが大きすぎます。10MB以下のファイルを選択してください。`);
          continue;
        }

        // ファイル形式チェック
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} は画像ファイルではありません。`);
          continue;
        }

        try {
          const imageUrl = await uploadToStorage(user.uid, file);
          newImages.push(imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert(`${file.name} のアップロードに失敗しました。`);
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Error in image upload:', error);
      alert('画像のアップロードに失敗しました。');
    } finally {
      setUploading(false);
      // ファイル入力の値をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleUploadClick = () => {
    if (images.length >= maxImages) {
      alert(`画像は最大${maxImages}枚までアップロードできます。`);
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* 画像プレビュー */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg transition-all duration-300 hover:scale-110"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* アップロードボタン */}
      {images.length < maxImages && (
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className={`w-full py-3 border-2 border-dashed rounded-xl transition-all duration-300 hover:scale-105 ${
            uploading
              ? 'border-gray-500 text-gray-500 cursor-not-allowed'
              : 'border-surface-light text-gray-400 hover:text-white hover:border-primary'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              アップロード中...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Image size={20} className="mr-2" />
              画像を追加 ({images.length}/{maxImages})
            </div>
          )}
        </button>
      )}

      {/* アップロード制限メッセージ */}
      {images.length >= maxImages && (
        <p className="text-xs text-gray-400 text-center mt-2">
          画像は最大{maxImages}枚までアップロードできます
        </p>
      )}
    </div>
  );
};
