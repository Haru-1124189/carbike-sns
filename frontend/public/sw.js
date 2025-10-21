// Service Worker for PWA caching and performance optimization

const CACHE_NAME = 'carbike-sns-v1';
const STATIC_CACHE = 'carbike-sns-static-v1';
const DYNAMIC_CACHE = 'carbike-sns-dynamic-v1';
const IMAGE_CACHE = 'carbike-sns-images-v1';

// キャッシュするリソース
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/revlink-192.png',
  '/revlink-512.png'
];

// キャッシュしないリソース
const EXCLUDE_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /\/admin\//,
  /\.(?:json|xml)$/
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Service Worker アクティベート
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// ネットワークリクエストのインターセプト
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 除外パターンのチェック
  if (EXCLUDE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return;
  }

  // 画像リクエストの処理
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // HTMLページの処理
  if (request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request));
    return;
  }

  // その他のリクエスト
  event.respondWith(handleOtherRequest(request));
});

// 画像リクエストの処理
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('🖼️ Service Worker: Serving cached image', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 画像をキャッシュに保存
      cache.put(request, networkResponse.clone());
      console.log('📸 Service Worker: Cached new image', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Image fetch failed', error);
    return new Response('Image not available', { status: 404 });
  }
}

// HTMLドキュメントリクエストの処理
async function handleDocumentRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // ネットワークファースト戦略
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 成功したレスポンスをキャッシュ
      cache.put(request, networkResponse.clone());
      console.log('📄 Service Worker: Cached document', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Network failed, trying cache', request.url);
    
    // ネットワークが失敗した場合はキャッシュから取得
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // キャッシュにもない場合はオフラインページを返す
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>オフライン - RevLink</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #0f172a;
              color: white;
              text-align: center;
            }
            .container { max-width: 400px; padding: 2rem; }
            h1 { color: #3b82f6; margin-bottom: 1rem; }
            p { color: #94a3b8; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📡 オフライン</h1>
            <p>インターネット接続を確認して、再度お試しください。</p>
            <p>一部の機能はオフラインでもご利用いただけます。</p>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// その他のリクエストの処理
async function handleOtherRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('💾 Service Worker: Serving cached resource', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 静的リソースをキャッシュ
      if (request.destination === 'script' || 
          request.destination === 'style' ||
          request.destination === 'font') {
        cache.put(request, networkResponse.clone());
        console.log('📦 Service Worker: Cached static resource', request.url);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Fetch failed', error);
    throw error;
  }
}

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// バックグラウンド同期の処理
async function doBackgroundSync() {
  try {
    // オフライン中の投稿やアクションを同期
    console.log('🔄 Service Worker: Performing background sync');
    
    // ここでオフライン中のデータを同期する処理を実装
    // 例: IndexedDBからデータを取得してFirestoreに送信
    
  } catch (error) {
    console.error('❌ Service Worker: Background sync failed', error);
  }
}

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || '新しい通知があります',
      icon: '/revlink-192.png',
      badge: '/revlink-192.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'RevLink', options)
    );
  }
});

// 通知クリックの処理
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 既に開いているウィンドウがあるかチェック
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            if (urlToOpen !== '/') {
              client.navigate(urlToOpen);
            }
            return;
          }
        }
        
        // 新しいウィンドウを開く
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// メッセージの処理
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

// キャッシュのクリア
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('🗑️ Service Worker: All caches cleared');
}
