// パフォーマンス監視と最適化のためのユーティリティ

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();

  // パフォーマンス測定開始
  startMeasure(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now()
    });
  }

  // パフォーマンス測定終了
  endMeasure(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // オブザーバーに通知
    this.observers.forEach(observer => observer(metric));

    // 開発環境でのみログ出力
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} took ${metric.duration.toFixed(2)}ms`);
    }

    return metric.duration;
  }

  // オブザーバーを追加
  addObserver(observer: (metric: PerformanceMetric) => void): void {
    this.observers.add(observer);
  }

  // オブザーバーを削除
  removeObserver(observer: (metric: PerformanceMetric) => void): void {
    this.observers.delete(observer);
  }

  // 全メトリクスを取得
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  // メトリクスをクリア
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// グローバルなパフォーマンスモニターインスタンス
export const performanceMonitor = new PerformanceMonitor();

// パフォーマンス測定用のデコレーター関数
export function measurePerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      performanceMonitor.startMeasure(name);
      const result = originalMethod.apply(this, args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          performanceMonitor.endMeasure(name);
        });
      } else {
        performanceMonitor.endMeasure(name);
        return result;
      }
    };

    return descriptor;
  };
}

// React コンポーネントのパフォーマンス測定用フック
export function usePerformanceMeasure(name: string) {
  const startMeasure = () => performanceMonitor.startMeasure(name);
  const endMeasure = () => performanceMonitor.endMeasure(name);

  return { startMeasure, endMeasure };
}

// メモリ使用量の監視
export function getMemoryUsage(): { used: number; total: number; percentage: number } | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  return null;
}

// ネットワーク情報の取得
export function getNetworkInfo(): { effectiveType: string; downlink: number } | null {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0
    };
  }
  return null;
}

// パフォーマンス警告の設定
export function setupPerformanceWarnings() {
  // メモリ使用量の監視
  setInterval(() => {
    const memory = getMemoryUsage();
    if (memory && memory.percentage > 80) {
      console.warn(`High memory usage: ${memory.percentage.toFixed(1)}%`);
    }
  }, 30000); // 30秒ごとにチェック

  // 長時間のタスクの監視
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // 50ms以上のタスクを警告
          console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
}

// 初期化
if (typeof window !== 'undefined') {
  setupPerformanceWarnings();
}
