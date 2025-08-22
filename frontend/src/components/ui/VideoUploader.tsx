import { AlertCircle, CheckCircle, Play, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  onRemove: () => void;
  selectedFile: File | null;
  isUploading?: boolean;
  uploadProgress?: number;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoSelect,
  onRemove,
  selectedFile,
  isUploading = false,
  uploadProgress = 0
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('video/')) {
      onVideoSelect(file);
      // プレビュー用のURLを作成
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      alert('動画ファイルを選択してください');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  if (selectedFile) {
    return (
      <div className="bg-surface rounded-xl border-2 border-dashed border-primary p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Play size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">{selectedFile.name}</h3>
              <p className="text-xs text-gray-400">
                {formatFileSize(selectedFile.size)} • {selectedFile.type}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {previewUrl && (
          <div className="relative mb-4">
            <video
              src={previewUrl}
              className="w-full h-48 object-cover rounded-lg"
              controls
            />
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">アップロード中...</span>
              <span className="text-primary">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <CheckCircle size={16} />
          <span>動画が選択されました</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-surface rounded-xl border-2 border-dashed transition-colors ${
        dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-600'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload size={32} className="text-white" />
        </div>
        
        <h3 className="text-lg font-medium text-white mb-2">
          動画をアップロード
        </h3>
        
        <p className="text-sm text-gray-400 mb-6">
          動画ファイルをドラッグ&ドロップするか、クリックして選択してください
        </p>

        <div className="space-y-3 text-xs text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle size={14} />
            <span>対応形式: MP4, AVI, MOV, WMV</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle size={14} />
            <span>最大ファイルサイズ: 2GB</span>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          動画を選択
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
};
