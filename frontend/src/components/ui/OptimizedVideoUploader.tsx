import { AlertCircle, CheckCircle, Clock, FileVideo, Play, Upload, X, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    generateVideoThumbnail,
    OptimizedVideoResult,
    optimizeVideo,
    validateVideoFormat,
    VideoUploadProgress
} from '../../utils/videoOptimization';

interface OptimizedVideoUploaderProps {
  onVideoSelect: (result: OptimizedVideoResult) => void;
  onRemove: () => void;
  selectedResult: OptimizedVideoResult | null;
  isUploading?: boolean;
  uploadProgress?: number;
  maxFileSize?: number; // MB
  enableCompression?: boolean;
  enablePreview?: boolean;
  enableThumbnail?: boolean;
}

export const OptimizedVideoUploader: React.FC<OptimizedVideoUploaderProps> = ({
  onVideoSelect,
  onRemove,
  selectedResult,
  isUploading = false,
  uploadProgress = 0,
  maxFileSize = 500, // 500MB
  enableCompression = true,
  enablePreview = true,
  enableThumbnail = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadProgressManager = useRef(new VideoUploadProgress());

  // 進捗監視
  useEffect(() => {
    const unsubscribe = uploadProgressManager.current.addListener(setOptimizationProgress);
    return unsubscribe;
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setError(null);
      setIsOptimizing(true);
      uploadProgressManager.current.reset();

      // ファイル形式の検証
      const validation = validateVideoFormat(file);
      if (!validation.valid) {
        setError(validation.message || '無効なファイルです');
        setIsOptimizing(false);
        return;
      }

      console.log('🎬 動画ファイル選択:', file.name, `${(file.size / 1024 / 1024).toFixed(2)}MB`);

      // 動画最適化
      const result = await optimizeVideo(file, {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.8,
        maxFileSize: maxFileSize,
        enableCompression,
        enablePreview
      });

      // サムネイル生成
      if (enableThumbnail) {
        try {
          const thumbnail = await generateVideoThumbnail(file, 1);
          setThumbnailUrl(thumbnail);
        } catch (thumbError) {
          console.warn('サムネイル生成に失敗:', thumbError);
        }
      }

      onVideoSelect(result);
      setIsOptimizing(false);
      console.log('✅ 動画最適化完了');

    } catch (error) {
      console.error('❌ 動画最適化エラー:', error);
      setError(error instanceof Error ? error.message : '動画の処理に失敗しました');
      setIsOptimizing(false);
    }
  }, [onVideoSelect, maxFileSize, enableCompression, enablePreview, enableThumbnail]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // エラー表示
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle size={24} className="text-red-400" />
          <h3 className="text-lg font-medium text-red-400">エラーが発生しました</h3>
        </div>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fileInputRef.current?.click();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  // 最適化中
  if (isOptimizing) {
    return (
      <div className="bg-surface rounded-xl border-2 border-primary p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Zap size={24} className="text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">動画を最適化中...</h3>
            <p className="text-sm text-gray-400">しばらくお待ちください</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">最適化進捗</span>
            <span className="text-primary">{optimizationProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${optimizationProgress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2 text-xs text-gray-400">
          <Clock size={14} />
          <span>通常30秒〜2分程度かかります</span>
        </div>
      </div>
    );
  }

  // 動画選択済み
  if (selectedResult) {
    return (
      <div className="bg-surface rounded-xl border-2 border-primary p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Play size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">{selectedResult.file.name}</h3>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>{formatFileSize(selectedResult.metadata.size)}</span>
                <span>{formatDuration(selectedResult.metadata.duration)}</span>
                <span>{selectedResult.metadata.width}×{selectedResult.metadata.height}</span>
                {selectedResult.compressed && selectedResult.compressionRatio && (
                  <span className="text-green-400">
                    {selectedResult.compressionRatio.toFixed(1)}%削減
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* サムネイル表示 */}
        {thumbnailUrl && (
          <div className="relative mb-4">
            <img
              src={thumbnailUrl}
              alt="動画サムネイル"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                <Play size={24} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* プレビュー表示 */}
        {enablePreview && selectedResult.previewUrl && (
          <div className="relative mb-4">
            <video
              src={selectedResult.previewUrl}
              className="w-full h-48 object-cover rounded-lg"
              controls
              preload="metadata"
            />
          </div>
        )}

        {/* アップロード進捗 */}
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

        {/* 最適化情報 */}
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <CheckCircle size={16} />
          <span>
            {selectedResult.compressed ? '最適化済み' : '最適化不要'} • 
            {selectedResult.metadata.format}
          </span>
        </div>
      </div>
    );
  }

  // アップロードエリア
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

        <div className="space-y-3 text-xs text-gray-500 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <FileVideo size={14} />
            <span>対応形式: MP4, WebM, OGG, AVI, MOV, WMV</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle size={14} />
            <span>最大ファイルサイズ: {maxFileSize}MB</span>
          </div>
          {enableCompression && (
            <div className="flex items-center justify-center space-x-2">
              <Zap size={14} />
              <span>自動最適化: 1280×720, 高品質圧縮</span>
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
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
