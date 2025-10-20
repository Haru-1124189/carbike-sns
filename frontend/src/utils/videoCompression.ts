// FFmpeg圧縮機能は一時的に無効化
// バックエンドで圧縮処理を行う

// 動画のメタデータを取得
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  bitrate: number;
  framerate: number;
}

export const getVideoMetadata = (file: File): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const metadata: VideoMetadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        bitrate: 0, // 正確な値はFFmpegで取得
        framerate: 0, // 正確な値はFFmpegで取得
      };
      URL.revokeObjectURL(video.src);
      resolve(metadata);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

// フロントエンド圧縮機能は一時的に無効化
// バックエンドで圧縮処理を行うため、この関数は使用しない

// ファイルハッシュを計算（重複チェック用）
export const calculateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ファイルサイズをフォーマット
export const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 圧縮の必要性を判定
export const shouldCompress = (file: File, metadata: VideoMetadata): boolean => {
  // ファイルサイズが50MB以上の場合
  if (file.size > 50 * 1024 * 1024) return true;
  
  // 解像度が720p以上の場合
  if (metadata.width > 1280 || metadata.height > 720) return true;
  
  // 長さが10分以上の場合
  if (metadata.duration > 600) return true;
  
  return false;
};
