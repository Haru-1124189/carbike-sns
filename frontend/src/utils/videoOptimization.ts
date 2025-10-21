// 動画最適化ユーティリティ

export interface VideoOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSize?: number; // MB
  enableCompression?: boolean;
  enablePreview?: boolean;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  bitrate: number;
  framerate: string;
  size: number;
  format: string;
}

export interface OptimizedVideoResult {
  file: File;
  metadata: VideoMetadata;
  previewUrl: string;
  compressed: boolean;
  compressionRatio?: number;
}

/**
 * 動画メタデータを取得
 */
export const getVideoMetadata = (file: File): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const metadata: VideoMetadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        bitrate: 0, // ブラウザでは取得困難
        framerate: 'unknown',
        size: file.size,
        format: file.type
      };
      
      URL.revokeObjectURL(video.src);
      resolve(metadata);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('動画メタデータの取得に失敗しました'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

/**
 * 動画の圧縮の必要性を判定
 */
export const shouldCompressVideo = (metadata: VideoMetadata, options: VideoOptimizationOptions = {}): boolean => {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    maxFileSize = 50 // MB
  } = options;

  // ファイルサイズチェック
  if (metadata.size > maxFileSize * 1024 * 1024) return true;
  
  // 解像度チェック
  if (metadata.width > maxWidth || metadata.height > maxHeight) return true;
  
  // 長さチェック（10分以上）
  if (metadata.duration > 600) return true;
  
  return false;
};

/**
 * 動画をCanvasで圧縮（クライアントサイド）
 */
export const compressVideoClientSide = async (
  file: File,
  options: VideoOptimizationOptions = {}
): Promise<OptimizedVideoResult> => {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    quality = 0.8
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.onloadedmetadata = () => {
      // アスペクト比を保持してリサイズ
      let { videoWidth, videoHeight } = video;
      
      if (videoWidth > maxWidth || videoHeight > maxHeight) {
        const ratio = Math.min(maxWidth / videoWidth, maxHeight / videoHeight);
        videoWidth *= ratio;
        videoHeight *= ratio;
      }

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // 動画を描画
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      
      // CanvasをBlobに変換
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('動画の圧縮に失敗しました'));
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: 'video/webm',
            lastModified: Date.now()
          });

          const metadata: VideoMetadata = {
            duration: video.duration,
            width: videoWidth,
            height: videoHeight,
            bitrate: 0,
            framerate: 'unknown',
            size: compressedFile.size,
            format: compressedFile.type
          };

          const compressionRatio = (1 - compressedFile.size / file.size) * 100;
          const previewUrl = URL.createObjectURL(compressedFile);

          resolve({
            file: compressedFile,
            metadata,
            previewUrl,
            compressed: true,
            compressionRatio
          });
        },
        'video/webm',
        quality
      );
    };

    video.onerror = () => {
      reject(new Error('動画の読み込みに失敗しました'));
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * 動画の最適化処理（メイン関数）
 */
export const optimizeVideo = async (
  file: File,
  options: VideoOptimizationOptions = {}
): Promise<OptimizedVideoResult> => {
  try {
    console.log('🎬 動画最適化開始:', file.name);
    
    // メタデータ取得
    const metadata = await getVideoMetadata(file);
    console.log('📊 動画メタデータ:', metadata);
    
    // 圧縮の必要性を判定
    const needsCompression = shouldCompressVideo(metadata, options);
    
    if (!needsCompression) {
      console.log('✅ 圧縮不要、元ファイルを使用');
      const previewUrl = URL.createObjectURL(file);
      
      return {
        file,
        metadata,
        previewUrl,
        compressed: false
      };
    }
    
    // クライアントサイド圧縮
    console.log('🗜️ 動画圧縮中...');
    const result = await compressVideoClientSide(file, options);
    
    console.log(`✅ 圧縮完了: ${(metadata.size / 1024 / 1024).toFixed(2)}MB → ${(result.metadata.size / 1024 / 1024).toFixed(2)}MB (${result.compressionRatio?.toFixed(1)}%削減)`);
    
    return result;
    
  } catch (error) {
    console.error('❌ 動画最適化エラー:', error);
    throw error;
  }
};

/**
 * 動画サムネイル生成
 */
export const generateVideoThumbnail = (
  file: File,
  timeOffset: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.onloadedmetadata = () => {
      // サムネイルサイズを設定
      const thumbnailWidth = 320;
      const thumbnailHeight = 180;
      
      canvas.width = thumbnailWidth;
      canvas.height = thumbnailHeight;
      
      // 指定時間にシーク
      video.currentTime = Math.min(timeOffset, video.duration - 0.1);
    };

    video.onseeked = () => {
      // 動画を描画
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // サムネイルURLを生成
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(video.src);
      resolve(thumbnailUrl);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('サムネイル生成に失敗しました'));
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * 動画の形式をチェック
 */
export const validateVideoFormat = (file: File): { valid: boolean; message?: string } => {
  const allowedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: '対応していない動画形式です。MP4, WebM, OGG, AVI, MOV, WMVが利用可能です。'
    };
  }

  const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'ファイルサイズが大きすぎます。2GB以下のファイルを選択してください。'
    };
  }

  return { valid: true };
};

/**
 * 動画アップロードの進捗管理
 */
export class VideoUploadProgress {
  private progress: number = 0;
  private listeners: ((progress: number) => void)[] = [];

  addListener(callback: (progress: number) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  updateProgress(progress: number) {
    this.progress = Math.min(100, Math.max(0, progress));
    this.listeners.forEach(callback => callback(this.progress));
  }

  getProgress(): number {
    return this.progress;
  }

  reset() {
    this.progress = 0;
    this.listeners.forEach(callback => callback(this.progress));
  }
}

/**
 * 動画のストリーミング最適化
 */
export const optimizeVideoForStreaming = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.onloadedmetadata = () => {
      // ストリーミング用の最適化設定
      const targetWidth = Math.min(1280, video.videoWidth);
      const targetHeight = Math.min(720, video.videoHeight);
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 動画を描画
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      
      // ストリーミング用のBlobを生成
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('ストリーミング用動画の生成に失敗しました'));
            return;
          }

          const optimizedFile = new File([blob], file.name, {
            type: 'video/webm',
            lastModified: Date.now()
          });

          resolve(optimizedFile);
        },
        'video/webm',
        0.7 // ストリーミング用の品質
      );
    };

    video.onerror = () => {
      reject(new Error('動画の読み込みに失敗しました'));
    };

    video.src = URL.createObjectURL(file);
  });
};
