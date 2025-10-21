// 画像最適化ユーティリティ

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  enableWebP?: boolean;
}

export interface OptimizedImageResult {
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

/**
 * 画像をWebP形式に変換（ブラウザ対応チェック付き）
 */
export const convertToWebP = async (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    enableWebP = true
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // アスペクト比を保持してリサイズ
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // 画像を描画
      ctx?.drawImage(img, 0, 0, width, height);

      // WebP対応チェック
      const supportsWebP = enableWebP && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      const format = supportsWebP ? 'webp' : 'jpeg';
      const mimeType = supportsWebP ? 'image/webp' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('画像変換に失敗しました'));
            return;
          }

          const url = URL.createObjectURL(blob);
          resolve({
            url,
            width,
            height,
            size: blob.size,
            format
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 画像の遅延読み込み用のIntersection Observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver;
  private imageCache = new Map<string, string>();

  constructor(
    private options: {
      rootMargin?: string;
      threshold?: number;
      enableCache?: boolean;
    } = {}
  ) {
    const { rootMargin = '50px', threshold = 0.1, enableCache = true } = options;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer.unobserve(img);
          }
        });
      },
      { rootMargin, threshold }
    );
  }

  observe(img: HTMLImageElement) {
    this.observer.observe(img);
  }

  unobserve(img: HTMLImageElement) {
    this.observer.unobserve(img);
  }

  disconnect() {
    this.observer.disconnect();
  }

  private async loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (!src) return;

    // キャッシュチェック
    if (this.options.enableCache && this.imageCache.has(src)) {
      img.src = this.imageCache.get(src)!;
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      return;
    }

    try {
      // プレースホルダー表示
      img.classList.add('lazy-loading');
      
      // 画像読み込み
      await new Promise((resolve, reject) => {
        const tempImg = new Image();
        tempImg.onload = () => {
          img.src = src;
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          
          // キャッシュに保存
          if (this.options.enableCache) {
            this.imageCache.set(src, src);
          }
          
          resolve(src);
        };
        tempImg.onerror = reject;
        tempImg.src = src;
      });
    } catch (error) {
      console.error('画像読み込みエラー:', error);
      img.classList.add('lazy-error');
      img.classList.remove('lazy-loading');
    }
  }
}

/**
 * 画像のプリロード
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * 複数画像のプリロード
 */
export const preloadImages = async (srcs: string[]): Promise<HTMLImageElement[]> => {
  const promises = srcs.map(preloadImage);
  return Promise.allSettled(promises).then((results) => {
    return results
      .filter((result): result is PromiseFulfilledResult<HTMLImageElement> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  });
};

/**
 * 画像サイズの最適化（レスポンシブ対応）
 */
export const getOptimalImageSize = (
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): { width: number; height: number } => {
  const aspectRatio = imageWidth / imageHeight;
  const containerAspectRatio = containerWidth / containerHeight;

  let width, height;

  if (aspectRatio > containerAspectRatio) {
    // 画像が横長の場合
    width = Math.min(containerWidth, imageWidth);
    height = width / aspectRatio;
  } else {
    // 画像が縦長の場合
    height = Math.min(containerHeight, imageHeight);
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * 画像の圧縮（クライアントサイド）
 */
export const compressImage = async (
  file: File,
  maxSizeKB: number = 500
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      let quality = 0.9;

      // サイズが大きすぎる場合はリサイズ
      const maxDimension = 1920;
      if (width > maxDimension || height > maxDimension) {
        const ratio = maxDimension / Math.max(width, height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const compress = () => {
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const sizeKB = blob.size / 1024;
            
            if (sizeKB <= maxSizeKB || quality <= 0.1) {
              const compressedFile = new File([blob], file.name, {
                type: blob.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              quality -= 0.1;
              compress();
            }
          },
          'image/jpeg',
          quality
        );
      };

      compress();
    };

    img.src = URL.createObjectURL(file);
  });
};
