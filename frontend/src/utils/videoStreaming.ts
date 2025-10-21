// 動画ストリーミング最適化ユーティリティ

export interface StreamingOptions {
  enableAdaptiveBitrate?: boolean;
  enablePreload?: boolean;
  enableLazyLoading?: boolean;
  qualityLevels?: number[];
  bufferSize?: number;
}

export interface VideoQualityLevel {
  label: string;
  width: number;
  height: number;
  bitrate: number;
  url: string;
}

/**
 * 適応的ビットレートストリーミング
 */
export class AdaptiveBitrateStreaming {
  private video: HTMLVideoElement;
  private qualityLevels: VideoQualityLevel[];
  private currentQuality: number = 0;
  private networkMonitor: NetworkMonitor;
  private bufferMonitor: BufferMonitor;

  constructor(video: HTMLVideoElement, qualityLevels: VideoQualityLevel[]) {
    this.video = video;
    this.qualityLevels = qualityLevels;
    this.networkMonitor = new NetworkMonitor();
    this.bufferMonitor = new BufferMonitor(video);
    
    this.initializeStreaming();
  }

  private initializeStreaming() {
    // ネットワーク状態の監視
    this.networkMonitor.addListener((isOnline) => {
      if (isOnline) {
        this.adaptToNetworkConditions();
      }
    });

    // バッファ状態の監視
    this.bufferMonitor.addListener((bufferHealth) => {
      this.adaptToBufferHealth(bufferHealth);
    });

    // 初期品質設定
    this.setQuality(this.getOptimalQuality());
  }

  private getOptimalQuality(): number {
    const connectionType = this.networkMonitor.getConnectionType();
    
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return 0; // 最低品質
      case '3g':
        return Math.min(1, this.qualityLevels.length - 1);
      case '4g':
        return Math.min(2, this.qualityLevels.length - 1);
      default:
        return this.qualityLevels.length - 1; // 最高品質
    }
  }

  private adaptToNetworkConditions() {
    const connectionType = this.networkMonitor.getConnectionType();
    const isSlowConnection = connectionType === 'slow-2g' || connectionType === '2g';
    
    if (isSlowConnection && this.currentQuality > 0) {
      this.setQuality(this.currentQuality - 1);
    } else if (!isSlowConnection && this.currentQuality < this.qualityLevels.length - 1) {
      this.setQuality(this.currentQuality + 1);
    }
  }

  private adaptToBufferHealth(bufferHealth: number) {
    if (bufferHealth < 0.2 && this.currentQuality > 0) {
      // バッファが少ない場合は品質を下げる
      this.setQuality(this.currentQuality - 1);
    } else if (bufferHealth > 0.8 && this.currentQuality < this.qualityLevels.length - 1) {
      // バッファが十分な場合は品質を上げる
      this.setQuality(this.currentQuality + 1);
    }
  }

  private setQuality(qualityIndex: number) {
    if (qualityIndex >= 0 && qualityIndex < this.qualityLevels.length) {
      this.currentQuality = qualityIndex;
      const quality = this.qualityLevels[qualityIndex];
      
      // 動画ソースを変更
      this.video.src = quality.url;
      this.video.load();
      
      console.log(`🎬 品質変更: ${quality.label} (${quality.width}×${quality.height})`);
    }
  }

  getCurrentQuality(): VideoQualityLevel {
    return this.qualityLevels[this.currentQuality];
  }

  destroy() {
    this.networkMonitor.destroy();
    this.bufferMonitor.destroy();
  }
}

/**
 * ネットワーク状態監視
 */
class NetworkMonitor {
  private listeners: ((isOnline: boolean) => void)[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.isOnline));
  }

  getConnectionType(): string {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  destroy() {
    this.listeners = [];
  }
}

/**
 * バッファ状態監視
 */
class BufferMonitor {
  private video: HTMLVideoElement;
  private listeners: ((bufferHealth: number) => void)[] = [];
  private checkInterval: number | null = null;

  constructor(video: HTMLVideoElement) {
    this.video = video;
    this.startMonitoring();
  }

  private startMonitoring() {
    this.checkInterval = window.setInterval(() => {
      const bufferHealth = this.getBufferHealth();
      this.notifyListeners(bufferHealth);
    }, 1000);
  }

  private getBufferHealth(): number {
    if (!this.video.buffered.length) return 0;
    
    const currentTime = this.video.currentTime;
    const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
    const duration = this.video.duration;
    
    if (duration === 0) return 0;
    
    const bufferedAhead = bufferedEnd - currentTime;
    const totalDuration = duration - currentTime;
    
    return Math.min(1, bufferedAhead / totalDuration);
  }

  addListener(callback: (bufferHealth: number) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(bufferHealth: number) {
    this.listeners.forEach(callback => callback(bufferHealth));
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners = [];
  }
}

/**
 * 動画の遅延読み込み
 */
export class LazyVideoLoader {
  private observer: IntersectionObserver;
  private loadedVideos = new Set<string>();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadVideo(entry.target as HTMLVideoElement);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );
  }

  observe(video: HTMLVideoElement) {
    this.observer.observe(video);
  }

  unobserve(video: HTMLVideoElement) {
    this.observer.unobserve(video);
  }

  private loadVideo(video: HTMLVideoElement) {
    const src = video.dataset.src;
    if (!src || this.loadedVideos.has(src)) return;

    video.src = src;
    video.load();
    this.loadedVideos.add(src);
    this.observer.unobserve(video);
  }

  destroy() {
    this.observer.disconnect();
    this.loadedVideos.clear();
  }
}

/**
 * 動画のプリロード管理
 */
export class VideoPreloadManager {
  private preloadedVideos = new Map<string, HTMLVideoElement>();
  private maxPreloadCount = 3;

  preloadVideo(src: string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      if (this.preloadedVideos.has(src)) {
        resolve(this.preloadedVideos.get(src)!);
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = src;

      video.onloadedmetadata = () => {
        this.preloadedVideos.set(src, video);
        this.cleanupOldPreloads();
        resolve(video);
      };

      video.onerror = () => {
        reject(new Error(`Failed to preload video: ${src}`));
      };
    });
  }

  private cleanupOldPreloads() {
    if (this.preloadedVideos.size > this.maxPreloadCount) {
      const firstKey = this.preloadedVideos.keys().next().value;
      const video = this.preloadedVideos.get(firstKey);
      if (video) {
        video.src = '';
        video.load();
      }
      this.preloadedVideos.delete(firstKey);
    }
  }

  getPreloadedVideo(src: string): HTMLVideoElement | null {
    return this.preloadedVideos.get(src) || null;
  }

  clear() {
    this.preloadedVideos.forEach((video) => {
      video.src = '';
      video.load();
    });
    this.preloadedVideos.clear();
  }
}

/**
 * 動画の最適化されたプレーヤー
 */
export class OptimizedVideoPlayer {
  private video: HTMLVideoElement;
  private adaptiveStreaming: AdaptiveBitrateStreaming | null = null;
  private lazyLoader: LazyVideoLoader | null = null;
  private preloadManager: VideoPreloadManager;

  constructor(video: HTMLVideoElement) {
    this.video = video;
    this.preloadManager = new VideoPreloadManager();
    this.initializePlayer();
  }

  private initializePlayer() {
    // 動画の最適化設定
    this.video.preload = 'metadata';
    this.video.playsInline = true;
    this.video.controls = true;

    // 遅延読み込みの設定
    this.lazyLoader = new LazyVideoLoader();
    this.lazyLoader.observe(this.video);
  }

  setAdaptiveStreaming(qualityLevels: VideoQualityLevel[]) {
    if (this.adaptiveStreaming) {
      this.adaptiveStreaming.destroy();
    }
    this.adaptiveStreaming = new AdaptiveBitrateStreaming(this.video, qualityLevels);
  }

  async preloadNextVideo(src: string) {
    try {
      await this.preloadManager.preloadVideo(src);
    } catch (error) {
      console.warn('Failed to preload next video:', error);
    }
  }

  getCurrentQuality(): VideoQualityLevel | null {
    return this.adaptiveStreaming?.getCurrentQuality() || null;
  }

  destroy() {
    if (this.adaptiveStreaming) {
      this.adaptiveStreaming.destroy();
    }
    if (this.lazyLoader) {
      this.lazyLoader.destroy();
    }
    this.preloadManager.clear();
  }
}

/**
 * 動画の品質レベルを生成
 */
export const generateQualityLevels = (baseUrl: string, videoId: string): VideoQualityLevel[] => {
  return [
    {
      label: '360p',
      width: 640,
      height: 360,
      bitrate: 500,
      url: `${baseUrl}/${videoId}/360p.mp4`
    },
    {
      label: '720p',
      width: 1280,
      height: 720,
      bitrate: 1500,
      url: `${baseUrl}/${videoId}/720p.mp4`
    },
    {
      label: '1080p',
      width: 1920,
      height: 1080,
      bitrate: 3000,
      url: `${baseUrl}/${videoId}/1080p.mp4`
    }
  ];
};
