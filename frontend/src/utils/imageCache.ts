// 画像キャッシュと永続化のためのユーティリティ

// ローカルストレージのキー
const IMAGE_CACHE_PREFIX = 'image_cache_';
const CACHE_EXPIRY_DAYS = 7; // 7日間キャッシュ

interface CachedImage {
  url: string;
  dataUrl: string;
  timestamp: number;
  expiresAt: number;
}

// 画像をBase64に変換してキャッシュに保存
export const cacheImage = async (url: string): Promise<string> => {
  try {
    // 既にキャッシュされているかチェック
    const cached = getCachedImage(url);
    if (cached) {
      return cached;
    }

    // 画像をフェッチしてBase64に変換
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        saveImageToCache(url, dataUrl);
        resolve(dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
const saveImageToCache = (url: string, dataUrl: string) => {
  try {
    const key = IMAGE_CACHE_PREFIX + btoa(url);
    const imageData: CachedImage = {
      url,
      dataUrl,
      timestamp: Date.now(),
      expiresAt: Date.now() + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
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
