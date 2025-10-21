// ネットワーク最適化ユーティリティ

// 接続品質監視
export class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private connection: any = null;
  private listeners: Set<(connection: any) => void> = new Set();

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  init() {
    if ('connection' in navigator) {
      this.connection = (navigator as any).connection;
      this.connection.addEventListener('change', () => {
        this.notifyListeners();
      });
    }
  }

  addListener(callback: (connection: any) => void) {
    this.listeners.add(callback);
  }

  removeListener(callback: (connection: any) => void) {
    this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.connection));
  }

  getConnectionInfo() {
    if (!this.connection) return null;

    return {
      effectiveType: this.connection.effectiveType,
      downlink: this.connection.downlink,
      rtt: this.connection.rtt,
      saveData: this.connection.saveData
    };
  }

  isSlowConnection(): boolean {
    if (!this.connection) return false;
    return this.connection.effectiveType === 'slow-2g' || 
           this.connection.effectiveType === '2g' ||
           this.connection.downlink < 1;
  }

  isDataSaverEnabled(): boolean {
    return this.connection?.saveData || false;
  }
}

// 適応的画像品質
export class AdaptiveImageQuality {
  private static instance: AdaptiveImageQuality;
  private connectionMonitor: ConnectionMonitor;

  static getInstance(): AdaptiveImageQuality {
    if (!AdaptiveImageQuality.instance) {
      AdaptiveImageQuality.instance = new AdaptiveImageQuality();
    }
    return AdaptiveImageQuality.instance;
  }

  constructor() {
    this.connectionMonitor = ConnectionMonitor.getInstance();
  }

  getOptimalImageParams(src: string, baseWidth?: number, baseHeight?: number) {
    const connectionInfo = this.connectionMonitor.getConnectionInfo();
    
    if (!connectionInfo) {
      return { src, width: baseWidth, height: baseHeight, quality: 0.8 };
    }

    let quality = 0.8;
    let width = baseWidth;
    let height = baseHeight;

    // 接続品質に応じて品質を調整
    switch (connectionInfo.effectiveType) {
      case 'slow-2g':
        quality = 0.5;
        if (width) width = Math.round(width * 0.5);
        if (height) height = Math.round(height * 0.5);
        break;
      case '2g':
        quality = 0.6;
        if (width) width = Math.round(width * 0.7);
        if (height) height = Math.round(height * 0.7);
        break;
      case '3g':
        quality = 0.7;
        if (width) width = Math.round(width * 0.8);
        if (height) height = Math.round(height * 0.8);
        break;
      case '4g':
        quality = 0.8;
        break;
    }

    // データセーバーモード
    if (connectionInfo.saveData) {
      quality *= 0.7;
      if (width) width = Math.round(width * 0.8);
      if (height) height = Math.round(height * 0.8);
    }

    return { src, width, height, quality };
  }
}

// プリフェッチ管理
export class PrefetchManager {
  private static instance: PrefetchManager;
  private prefetchedUrls = new Set<string>();
  private maxPrefetchSize = 5;

  static getInstance(): PrefetchManager {
    if (!PrefetchManager.instance) {
      PrefetchManager.instance = new PrefetchManager();
    }
    return PrefetchManager.instance;
  }

  prefetch(url: string, priority: 'high' | 'low' = 'low') {
    if (this.prefetchedUrls.has(url)) return;
    if (this.prefetchedUrls.size >= this.maxPrefetchSize) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    if (priority === 'high') {
      link.rel = 'preload';
    }
    
    document.head.appendChild(link);
    this.prefetchedUrls.add(url);

    console.log(`🔗 プリフェッチ: ${url}`);
  }

  prefetchImage(src: string) {
    if (this.prefetchedUrls.has(src)) return;

    const img = new Image();
    img.src = src;
    this.prefetchedUrls.add(src);

    console.log(`🖼️ 画像プリフェッチ: ${src}`);
  }

  clear() {
    this.prefetchedUrls.clear();
  }
}

// リクエストキュー管理
export class RequestQueue {
  private static instance: RequestQueue;
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private currentRequests = 0;

  static getInstance(): RequestQueue {
    if (!RequestQueue.instance) {
      RequestQueue.instance = new RequestQueue();
    }
    return RequestQueue.instance;
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.currentRequests >= this.maxConcurrent) return;

    this.isProcessing = true;

    while (this.queue.length > 0 && this.currentRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      if (request) {
        this.currentRequests++;
        request().finally(() => {
          this.currentRequests--;
          this.processQueue();
        });
      }
    }

    this.isProcessing = false;
  }
}

// オフライン対応
export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline = navigator.onLine;
  private offlineQueue: Array<() => Promise<any>> = [];

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
      console.log('🌐 オンライン復帰');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 オフライン');
    });
  }

  addToOfflineQueue(request: () => Promise<any>) {
    this.offlineQueue.push(request);
  }

  private async processOfflineQueue() {
    while (this.offlineQueue.length > 0 && this.isOnline) {
      const request = this.offlineQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('オフラインキュー処理エラー:', error);
        }
      }
    }
  }

  isConnected(): boolean {
    return this.isOnline;
  }
}

// 初期化
export const initializeNetworkOptimization = () => {
  const connectionMonitor = ConnectionMonitor.getInstance();
  const offlineManager = OfflineManager.getInstance();
  
  connectionMonitor.init();
  offlineManager.init();

  console.log('🌐 ネットワーク最適化システム初期化完了');
};