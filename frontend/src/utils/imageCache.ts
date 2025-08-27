// 画像キャッシュと永続化のためのユーティリティ

// ローカルストレージのキー
const IMAGE_CACHE_PREFIX = 'image_cache_';
const CACHE_EXPIRY_DAYS = 7; // 7日間キャッシュ
const MAX_CACHE_SIZE = 50; // 最大キャッシュ数

interface CachedImage {
  url: string;
  dataUrl: string;
  timestamp: number;
  expiresAt: number;
  size: number; // データサイズ（バイト）
}

// キャッシュサイズを管理
const getCacheSize = (): number => {
  try {
    const keys = Object.keys(localStorage);
    return keys.filter(key => key.startsWith(IMAGE_CACHE_PREFIX)).length;
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
};

// 古いキャッシュを削除
const cleanupOldCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(IMAGE_CACHE_PREFIX));
    
    if (cacheKeys.length <= MAX_CACHE_SIZE) return;
    
    // タイムスタンプでソートして古いものを削除
    const cacheEntries = cacheKeys
      .map(key => {
        try {
          const data = localStorage.getItem(key);
          if (!data) return null;
          const parsed = JSON.parse(data) as CachedImage;
          return { key, timestamp: parsed.timestamp };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => a!.timestamp - b!.timestamp);
    
    // 古いものから削除
    const toDelete = cacheEntries.slice(0, cacheKeys.length - MAX_CACHE_SIZE);
    toDelete.forEach(entry => {
      if (entry) {
        localStorage.removeItem(entry.key);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old cache:', error);
  }
};

// 画像をBase64に変換してキャッシュに保存
export const cacheImage = async (url: string): Promise<string> => {
  try {
    // 既にキャッシュされているかチェック
    const cached = getCachedImage(url);
    if (cached) {
      return cached;
    }

    // キャッシュサイズをチェック
    cleanupOldCache();

    // 画像をフェッチしてBase64に変換
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト
    
    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          saveImageToCache(url, dataUrl, blob.size);
          resolve(dataUrl);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Error fetching image:', fetchError);
      return url; // エラーの場合は元のURLを返す
    }
  } catch (error) {
    console.error('Error caching image:', error);
    return url; // エラーの場合は元のURLを返す
  }
};

// キャッシュから画像を取得
export const getCachedImage = (url: string): string | null => {
  try {
    const key = IMAGE_CACHE_PREFIX + btoa(url);
    const cached = localStorage.getItem(key);
    
    if (!cached) return null;
    
    const imageData: CachedImage = JSON.parse(cached);
    
    // キャッシュの有効期限をチェック
    if (Date.now() > imageData.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    
    return imageData.dataUrl;
  } catch (error) {
    console.error('Error getting cached image:', error);
    return null;
  }
};

// 画像をキャッシュに保存
const saveImageToCache = (url: string, dataUrl: string, size: number) => {
  try {
    const key = IMAGE_CACHE_PREFIX + btoa(url);
    const imageData: CachedImage = {
      url,
      dataUrl,
      timestamp: Date.now(),
      expiresAt: Date.now() + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      size: size
    };
    
    localStorage.setItem(key, JSON.stringify(imageData));
  } catch (error) {
    console.error('Error saving image to cache:', error);
  }
};

// キャッシュをクリア
export const clearImageCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(IMAGE_CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
};

// 特定の画像URLのキャッシュをクリア
export const clearImageCacheForUrl = (url: string) => {
  try {
    const key = IMAGE_CACHE_PREFIX + btoa(url);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing image cache for URL:', error);
  }
};

// 古いキャッシュを削除
export const cleanupExpiredCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(IMAGE_CACHE_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const imageData: CachedImage = JSON.parse(cached);
          if (Date.now() > imageData.expiresAt) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired cache:', error);
  }
};

// 画像のプリロード
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cacheImage(url).then(() => resolve()).catch(reject);
    };
    img.onerror = reject;
    img.src = url;
  });
};

// 複数画像のプリロード
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(url).catch(() => {}));
  await Promise.all(promises);
};
