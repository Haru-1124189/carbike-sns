// メモリ最適化ユーティリティ

// メモリ情報の型定義
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// メモリ使用量監視
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private observers: Set<(info: MemoryInfo) => void> = new Set();
  private intervalId: number | null = null;

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  startMonitoring(intervalMs: number = 30000) {
    if (this.intervalId) return;

    this.intervalId = window.setInterval(() => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        this.notifyObservers(memoryInfo);
      }
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  addObserver(callback: (info: MemoryInfo) => void) {
    this.observers.add(callback);
  }

  removeObserver(callback: (info: MemoryInfo) => void) {
    this.observers.delete(callback);
  }

  private notifyObservers(info: MemoryInfo) {
    this.observers.forEach(callback => callback(info));
  }

  getMemoryInfo(): MemoryInfo | null {
    if ('memory' in performance) {
      return (performance as any).memory as MemoryInfo;
    }
    return null;
  }
}

// メモリリーク防止用のクリーンアップ
export class MemoryCleanup {
  private static cleanupTasks: Set<() => void> = new Set();

  static register(task: () => void) {
    this.cleanupTasks.add(task);
  }

  static unregister(task: () => void) {
    this.cleanupTasks.delete(task);
  }

  static executeAll() {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks.clear();
  }
}

// オブジェクトプール
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    // 初期オブジェクトを作成
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T) {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  get size() {
    return this.pool.length;
  }
}

// デバウンス付きメモリクリーンアップ
export class DebouncedMemoryCleanup {
  private timeoutId: number | null = null;
  private delay: number;

  constructor(delay: number = 5000) {
    this.delay = delay;
  }

  schedule() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      this.cleanup();
      this.timeoutId = null;
    }, this.delay);
  }

  private cleanup() {
    // ガベージコレクションを促す
    if (window.gc) {
      window.gc();
    }

    // メモリクリーンアップを実行
    MemoryCleanup.executeAll();

    console.log('🧹 メモリクリーンアップ実行');
  }
}

// 画像キャッシュ管理
export class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cache = new Map<string, HTMLImageElement>();
  private maxSize: number = 100;

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  get(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null;
  }

  set(src: string, img: HTMLImageElement) {
    if (this.cache.size >= this.maxSize) {
      // LRU方式で古い画像を削除
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(src, img);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

// メモリ使用量の警告システム
export class MemoryWarningSystem {
  private static instance: MemoryWarningSystem;
  private warningThreshold: number = 0.8; // 80%
  private criticalThreshold: number = 0.9; // 90%
  private hasWarned: boolean = false;

  static getInstance(): MemoryWarningSystem {
    if (!MemoryWarningSystem.instance) {
      MemoryWarningSystem.instance = new MemoryWarningSystem();
    }
    return MemoryWarningSystem.instance;
  }

  checkMemoryUsage() {
    const memoryInfo = MemoryMonitor.getInstance().getMemoryInfo();
    if (!memoryInfo) return;

    const usageRatio = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;

    if (usageRatio >= this.criticalThreshold && !this.hasWarned) {
      console.warn('🚨 メモリ使用量が危険レベルです:', {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024),
        ratio: Math.round(usageRatio * 100) + '%'
      });
      
      // 緊急クリーンアップ
      MemoryCleanup.executeAll();
      ImageCacheManager.getInstance().clear();
      
      this.hasWarned = true;
    } else if (usageRatio < this.warningThreshold) {
      this.hasWarned = false;
    }
  }
}

// 初期化
export const initializeMemoryOptimization = () => {
  const monitor = MemoryMonitor.getInstance();
  const warningSystem = MemoryWarningSystem.getInstance();
  
  monitor.startMonitoring(10000); // 10秒間隔
  
  monitor.addObserver(() => {
    warningSystem.checkMemoryUsage();
  });

  // ページ離脱時のクリーンアップ
  window.addEventListener('beforeunload', () => {
    MemoryCleanup.executeAll();
    monitor.stopMonitoring();
  });

  console.log('🧠 メモリ最適化システム初期化完了');
};
