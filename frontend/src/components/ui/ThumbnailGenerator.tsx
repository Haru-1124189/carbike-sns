import { Camera, Download, Upload } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

interface ThumbnailGeneratorProps {
  videoFile: File | null;
  onThumbnailSelect: (thumbnailUrl: string) => void;
  selectedThumbnail: string | null;
}

export const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({
  videoFile,
  onThumbnailSelect,
  selectedThumbnail
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateThumbnails = useCallback(async () => {
    if (!videoFile || !videoRef.current) return;

    setIsGenerating(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const thumbnails: string[] = [];
    const timePoints = [0, 0.25, 0.5, 0.75]; // 動画の25%, 50%, 75%の位置

    try {
      for (let i = 0; i < timePoints.length; i++) {
        const time = video.duration * timePoints[i];
        video.currentTime = time;

        await new Promise<void>((resolve) => {
          video.onseeked = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
            thumbnails.push(thumbnailUrl);
            resolve();
          };
        });
      }

      setThumbnails(thumbnails);
    } catch (error) {
      console.error('サムネイル生成エラー:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [videoFile]);

  const handleCustomThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomThumbnail(result);
        onThumbnailSelect(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailClick = (thumbnailUrl: string) => {
    onThumbnailSelect(thumbnailUrl);
  };

  if (!videoFile) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">サムネイル</h3>
        <button
          onClick={generateThumbnails}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <Camera size={16} />
          <span>{isGenerating ? '生成中...' : '自動生成'}</span>
        </button>
      </div>

      {/* 隠しビデオ要素 */}
      <video
        ref={videoRef}
        src={videoFile ? URL.createObjectURL(videoFile) : ''}
        className="hidden"
        preload="metadata"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* カスタムサムネイルアップロード */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">カスタムサムネイル</label>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-600 rounded-lg hover:bg-surface-light transition-colors"
          >
            <Upload size={16} />
            <span>画像をアップロード</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomThumbnailUpload}
            className="hidden"
          />
          {customThumbnail && (
            <div className="flex items-center space-x-2">
              <img
                src={customThumbnail}
                alt="カスタムサムネイル"
                className="w-16 h-16 object-cover rounded-lg border-2 border-primary"
              />
              <span className="text-xs text-gray-400">カスタム</span>
            </div>
          )}
        </div>
      </div>

      {/* 自動生成されたサムネイル */}
      {thumbnails.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">自動生成されたサムネイル</label>
          <div className="grid grid-cols-2 gap-4">
            {thumbnails.map((thumbnail, index) => (
              <div
                key={index}
                onClick={() => handleThumbnailClick(thumbnail)}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedThumbnail === thumbnail ? 'border-primary' : 'border-gray-600'
                }`}
              >
                <img
                  src={thumbnail}
                  alt={`サムネイル ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                {selectedThumbnail === thumbnail && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Download size={12} className="text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
                  <p className="text-xs text-white text-center">
                    {Math.round((index / (thumbnails.length - 1)) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 選択されたサムネイルのプレビュー */}
      {selectedThumbnail && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">選択されたサムネイル</label>
          <div className="relative">
            <img
              src={selectedThumbnail}
              alt="選択されたサムネイル"
              className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
