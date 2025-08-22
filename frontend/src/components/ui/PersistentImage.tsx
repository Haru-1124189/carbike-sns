import React, { useState, useEffect } from 'react';
import { cacheImage, getCachedImage } from '../../utils/imageCache';

interface PersistentImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
}

export const PersistentImage: React.FC<PersistentImageProps> = ({
  src,
  alt,
  className = '',
  fallback,
  onLoad,
  onError,
  loading = 'lazy'
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!src) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);
        setShowFallback(false);

        // まずキャッシュから取得を試行
        const cached = getCachedImage(src);
        if (cached && isMounted) {
          setImageSrc(cached);
          setIsLoading(false);
          onLoad?.();
          return;
        }

        // キャッシュにない場合はキャッシュに保存
        const cachedSrc = await cacheImage(src);
        if (isMounted) {
          setImageSrc(cachedSrc);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        console.error('Error loading persistent image:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src, onLoad, onError]);

  const handleImageError = () => {
    setHasError(true);
    setShowFallback(true);
    onError?.();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setShowFallback(false);
    onLoad?.();
  };

  // エラー時はフォールバックを表示
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // ローディング中はスケルトン表示
  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-300 rounded ${className}`}>
        <div className="w-full h-full bg-gray-400 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <img
        src={imageSrc || src}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: showFallback ? 'none' : 'block' }}
      />
      {showFallback && fallback && (
        <div style={{ display: 'block' }}>
          {fallback}
        </div>
      )}
    </>
  );
};
