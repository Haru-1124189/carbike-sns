// UI/UXパフォーマンス最適化ユーティリティ

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 仮想スクロール用のフック
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex
  };
};

// デバウンス付き検索フック
export const useDebouncedSearch = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// スロットル付きスクロールフック
export const useThrottledScroll = (callback: () => void, delay: number = 100) => {
  const timeoutRef = useRef<number | null>(null);
  const lastExecuted = useRef<number>(0);

  return useCallback(() => {
    const now = Date.now();
    
    if (now - lastExecuted.current > delay) {
      callback();
      lastExecuted.current = now;
    } else if (!timeoutRef.current) {
      timeoutRef.current = window.setTimeout(() => {
        callback();
        lastExecuted.current = Date.now();
        timeoutRef.current = null;
      }, delay - (now - lastExecuted.current));
    }
  }, [callback, delay]);
};

// 無限スクロールフック
export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  threshold: number = 100
) => {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      await callback();
    } finally {
      setIsLoading(false);
    }
  }, [callback, isLoading, hasMore]);

  useEffect(() => {
    if (!hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, threshold]);

  return { lastElementRef, isLoading };
};

// アニメーション最適化フック
export const useOptimizedAnimation = (duration: number = 300) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isAnimating, startAnimation };
};

// レスポンシブ画像フック
export const useResponsiveImage = (src: string, sizes: number[]) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const updateImageSrc = () => {
      const width = window.innerWidth;
      let optimalSize = sizes[0];

      for (const size of sizes) {
        if (width >= size) {
          optimalSize = size;
        }
      }

      // Firebase Storage URLの場合、サイズパラメータを追加
      if (src.includes('firebasestorage.googleapis.com')) {
        const url = new URL(src);
        url.searchParams.set('w', optimalSize.toString());
        setCurrentSrc(url.toString());
      } else {
        setCurrentSrc(src);
      }
    };

    updateImageSrc();
    window.addEventListener('resize', updateImageSrc);

    return () => {
      window.removeEventListener('resize', updateImageSrc);
    };
  }, [src, sizes]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return {
    src: currentSrc,
    isLoading,
    hasError,
    onLoad: handleLoad,
    onError: handleError
  };
};

// パフォーマンス監視フック
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      if (renderTime > 16) { // 16ms = 60fps
        console.warn(`🐌 ${componentName} のレンダリングが遅い: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  return {
    renderCount: renderCount.current
  };
};

// バッチ更新フック
export const useBatchedUpdates = () => {
  const [updates, setUpdates] = useState<(() => void)[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const batchUpdate = useCallback((update: () => void) => {
    setUpdates(prev => [...prev, update]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      updates.forEach(update => update());
      setUpdates([]);
      timeoutRef.current = null;
    }, 0);
  }, [updates]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

// スケルトンローダー用のフック
export const useSkeletonLoader = (isLoading: boolean, delay: number = 200) => {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
    } else {
      // 最小表示時間を確保
      timeoutRef.current = window.setTimeout(() => {
        setShowSkeleton(false);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, delay]);

  return showSkeleton;
};

// 初期化
export const initializeUIOptimization = () => {
  // CSS最適化
  const style = document.createElement('style');
  style.textContent = `
    .will-change-transform { will-change: transform; }
    .will-change-opacity { will-change: opacity; }
    .gpu-accelerated { transform: translateZ(0); }
    .smooth-scroll { scroll-behavior: smooth; }
  `;
  document.head.appendChild(style);

  console.log('🎨 UI最適化システム初期化完了');
};
