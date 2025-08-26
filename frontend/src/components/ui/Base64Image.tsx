import React, { useState } from 'react';

interface Base64ImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
}

export const Base64Image: React.FC<Base64ImageProps> = ({
  src,
  alt,
  className = '',
  fallback,
  onLoad,
  onError,
  loading = 'lazy'
}) => {
  const [hasError, setHasError] = useState(false);

  // srcが空またはBase64でない場合はフォールバックを表示
  if (!src || !src.startsWith('data:image')) {
    return fallback ? <>{fallback}</> : null;
  }

  const handleImageError = () => {
    console.error('Base64画像の読み込みに失敗:', src.substring(0, 100) + '...');
    setHasError(true);
    onError?.();
  };

  const handleImageLoad = () => {
    setHasError(false);
    onLoad?.();
  };

  // エラー時はフォールバックを表示
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
};
