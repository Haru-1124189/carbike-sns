import React, { useRef, useState } from 'react';
import { Camera, Image, X } from 'lucide-react';
import { uploadToStorage } from '../../lib/upload';
import { useAuth } from '../../hooks/useAuth';

interface StepImageUploadProps {
  image: string;
  onImageChange: (image: string) => void;
  stepNumber: number;
  className?: string;
}

export const StepImageUpload: React.FC<StepImageUploadProps> = ({
  image,
  onImageChange,
  stepNumber,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

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
    onImageChange('');
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
      <div className="flex items-center space-x-2">
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
            uploading
              ? 'bg-gray-500 text-gray-400 cursor-not-allowed'
              : 'bg-primary bg-opacity-20 text-primary hover:bg-primary hover:bg-opacity-30'
          }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">アップロード中...</span>
            </>
          ) : (
            <>
              <Image size={16} />
              <span className="text-sm">画像追加</span>
            </>
          )}
        </button>

        {/* 画像プレビュー */}
        {image && (
          <div className="relative group">
            <img
              src={image}
              alt={`Step ${stepNumber}`}
              className="w-16 h-12 object-cover rounded-lg transition-all duration-300 hover:scale-110"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
