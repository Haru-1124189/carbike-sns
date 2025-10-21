// Service Worker管理ユーティリティ

export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'CLEAR_CACHE' | 'UPDATE_AVAILABLE';
  payload?: any;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered:', this.registration);

      // 更新の検知
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      // メッセージの処理
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleMessage(event.data);
      });

      return this.registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      console.log('🗑️ Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
      return false;
    }
  }

  async update(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('🔄 Service Worker update requested');
    } catch (error) {
      console.error('❌ Service Worker update failed:', error);
    }
  }

  async skipWaiting(): Promise<void> {
    if (!navigator.serviceWorker.controller) return;

    try {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      console.log('⏭️ Service Worker skip waiting requested');
    } catch (error) {
      console.error('❌ Service Worker skip waiting failed:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      }
      console.log('🗑️ Cache clear requested');
    } catch (error) {
      console.error('❌ Cache clear failed:', error);
    }
  }

  private handleMessage(message: ServiceWorkerMessage) {
    switch (message.type) {
      case 'UPDATE_AVAILABLE':
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
        break;
      default:
        console.log('📨 Service Worker message:', message);
    }
  }

  private notifyUpdateAvailable() {
    // カスタムイベントを発火
    window.dispatchEvent(new CustomEvent('sw-update-available', {
      detail: { registration: this.registration }
    }));
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  async getCacheSize(): Promise<{ [key: string]: number }> {
    if (!this.registration) return {};

    try {
      const cacheNames = await caches.keys();
      const sizes: { [key: string]: number } = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        let totalSize = 0;

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }

        sizes[cacheName] = totalSize;
      }

      return sizes;
    } catch (error) {
      console.error('❌ Cache size calculation failed:', error);
      return {};
    }
  }

  async clearSpecificCache(cacheName: string): Promise<boolean> {
    try {
      const deleted = await caches.delete(cacheName);
      console.log(`🗑️ Cache cleared: ${cacheName}`, deleted);
      return deleted;
    } catch (error) {
      console.error(`❌ Cache clear failed: ${cacheName}`, error);
      return false;
    }
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();

// 自動登録
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    serviceWorkerManager.register();
  });
}

// 更新通知の処理
if (typeof window !== 'undefined') {
  window.addEventListener('sw-update-available', (event: any) => {
    const { registration } = event.detail;
    
    // ユーザーに更新を通知
    if (window.confirm('新しいバージョンが利用可能です。更新しますか？')) {
      serviceWorkerManager.skipWaiting();
      
      // 更新後にページをリロード
      registration.waiting?.addEventListener('statechange', (e: any) => {
        if (e.target.state === 'activated') {
          window.location.reload();
        }
      });
    }
  });
}
