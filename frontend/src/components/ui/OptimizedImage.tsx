import React, { useEffect, useRef, useState } from 'react';
import { LazyImageLoader } from '../../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  enableLazy?: boolean;
  enableWebP?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  enableLazy = true,
  enableWebP = true,
  quality = 0.8,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const loaderRef = useRef<LazyImageLoader | null>(null);

  useEffect(() => {
    // WebP対応チェック
    const supportsWebP = enableWebP && 
      document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;

    // 画像URLの最適化
    const optimizeImageUrl = (url: string): string => {
      // Firebase Storage URLの場合、最適化パラメータを追加
      if (url.includes('firebasestorage.googleapis.com')) {
        const params = new URLSearchParams();
        if (width) params.set('w', width.toString());
        if (height) params.set('h', height.toString());
        if (quality) params.set('q', Math.round(quality * 100).toString());
        if (supportsWebP) params.set('f', 'webp');
        
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${params.toString()}`;
      }
      
      return url;
    };

    setOptimizedSrc(optimizeImageUrl(src));
  }, [src, width, height, quality, enableWebP]);

  useEffect(() => {
    if (!enableLazy || !imgRef.current) {
      // 遅延読み込み無効の場合は即座に読み込み
      setIsLoaded(true);
      return;
    }

    // 遅延読み込み設定
    loaderRef.current = new LazyImageLoader({
      rootMargin: '50px',
      threshold: 0.1,
      enableCache: true
    });

    loaderRef.current.observe(imgRef.current);

    return () => {
      if (loaderRef.current && imgRef.current) {
        loaderRef.current.unobserve(imgRef.current);
      }
    };
  }, [enableLazy, optimizedSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageStyle: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0
  };

  const placeholderStyle: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '200px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    fontSize: '14px'
  };

  if (hasError) {
    return (
      <div style={placeholderStyle} className={className}>
        <span>画像を読み込めません</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* プレースホルダー */}
      {!isLoaded && (
        <div style={placeholderStyle} className="absolute inset-0">
          <div className="animate-pulse bg-gray-200 rounded w-full h-full"></div>
        </div>
      )}
      
      {/* 最適化された画像 */}
      <img
        ref={imgRef}
        src={enableLazy ? undefined : optimizedSrc}
        data-src={enableLazy ? optimizedSrc : undefined}
        alt={alt}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        loading={enableLazy ? 'lazy' : 'eager'}
        decoding="async"
        className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
    </div>
  );
};

// 商品カード用の最適化された画像コンポーネント
export const ProductImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      width={300}
      height={300}
      enableLazy={true}
      enableWebP={true}
      quality={0.8}
    />
  );
};

// プロフィール画像用の最適化された画像コンポーネント
export const ProfileImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  size?: number;
}> = ({ src, alt, className = '', size = 48 }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      width={size}
      height={size}
      enableLazy={false} // プロフィール画像は即座に読み込み
      enableWebP={true}
      quality={0.9}
    />
  );
};

// サムネイル用の最適化された画像コンポーネント
export const ThumbnailImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      width={150}
      height={150}
      enableLazy={true}
      enableWebP={true}
      quality={0.7}
    />
  );
};
