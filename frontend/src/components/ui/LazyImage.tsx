import React, { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = React.memo(({
  src,
  alt,
  className = '',
  fallback = '/placeholder-image.png',
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observerを使用して遅延読み込み
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // 画像の読み込み状態を管理
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  };

  // 画像が画面に入ったときに読み込み開始
  useEffect(() => {
    if (isIntersecting && !isLoaded && !hasError) {
      setImageSrc(src);
    }
  }, [isIntersecting, src, isLoaded, hasError]);

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden ${className}`}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      
      {/* ローディング状態 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* エラー状態 */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">画像を読み込めませんでした</p>
          </div>
        </div>
      )}
    </div>
  );
});
