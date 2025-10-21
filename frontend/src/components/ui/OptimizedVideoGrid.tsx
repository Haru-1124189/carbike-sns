import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LazyVideoLoader, VideoPreloadManager } from '../../utils/videoStreaming';
import { OptimizedVideoCard } from './OptimizedVideoCard';

interface Channel {
  id: string;
  name: string;
  avatar: string;
  isSubscribed: boolean;
}

interface OptimizedVideoGridProps {
  videos: any[]; // 型の不一致を回避するため一時的にanyを使用
  channels: Channel[];
  currentUserId?: string;
  onVideoClick: (videoId: string) => void;
  onUserClick: (userId: string, displayName: string) => void;
  onVideoAnalytics?: (videoId: string) => void;
  onDeleteVideo?: (videoId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  enableVirtualScroll?: boolean;
  enableInfiniteScroll?: boolean;
  enablePreloading?: boolean;
}

export const OptimizedVideoGrid: React.FC<OptimizedVideoGridProps> = ({
  videos,
  channels,
  currentUserId,
  onVideoClick,
  onUserClick,
  onVideoAnalytics,
  onDeleteVideo,
  onLoadMore,
  hasMore = false,
  loading = false,
  enableVirtualScroll = false,
  enableInfiniteScroll = true,
  enablePreloading = true
}) => {
  const [containerHeight, setContainerHeight] = useState(600);
  const [itemHeight, setItemHeight] = useState(200);
  const containerRef = useRef<HTMLDivElement>(null);
  const lazyLoaderRef = useRef<LazyVideoLoader>();
  const preloadManagerRef = useRef<VideoPreloadManager>();

  // 遅延読み込みマネージャーの初期化
  useEffect(() => {
    lazyLoaderRef.current = new LazyVideoLoader({
      rootMargin: '200px',
      threshold: 0.1
    });

    if (enablePreloading) {
      preloadManagerRef.current = new VideoPreloadManager();
    }

    return () => {
      lazyLoaderRef.current?.destroy();
      preloadManagerRef.current?.clear();
    };
  }, [enablePreloading]);

  // コンテナサイズの監視
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height);
        setItemHeight(rect.width / 2 * 0.75); // アスペクト比16:9を想定
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  // 仮想スクロール設定（簡易版）
  const virtualScrollConfig = {
    startIndex: 0,
    endIndex: videos.length,
    totalHeight: videos.length * itemHeight,
    offsetY: 0
  };

  // 無限スクロール設定（簡易版）
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (!hasMore) return;
    
    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && onLoadMore) {
            onLoadMore();
          }
        },
        { threshold: 0.8 }
      );
      observer.observe(node);
    }
  }, [loading, hasMore, onLoadMore]);

  // 動画の前処理（メモ化）
  const processedVideos = useMemo(() => {
    return videos.map(video => {
      const channel = channels.find(ch => ch.id === video.channelId);
      const isOwnVideo = video.authorId === currentUserId;
      
      return {
        ...video,
        channel,
        isOwnVideo
      };
    });
  }, [videos, channels, currentUserId]);

  // 次の動画のプリロード
  useEffect(() => {
    if (!enablePreloading || !preloadManagerRef.current) return;

    const preloadNextVideos = async () => {
      const nextVideos = videos.slice(0, 3); // 最初の3つの動画をプリロード
      
      for (const video of nextVideos) {
        if (video.videoUrl) {
          try {
            await preloadManagerRef.current!.preloadVideo(video.videoUrl);
          } catch (error) {
            console.warn('Failed to preload video:', video.id, error);
          }
        }
      }
    };

    preloadNextVideos();
  }, [videos, enablePreloading]);

  // 仮想スクロール用の表示アイテム
  const visibleItems = useMemo(() => {
    if (!enableVirtualScroll) {
      return processedVideos;
    }

    const { startIndex, endIndex } = virtualScrollConfig;
    return processedVideos.slice(startIndex, endIndex + 1);
  }, [processedVideos, enableVirtualScroll, virtualScrollConfig]);

  // スクロール位置の更新
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // 仮想スクロールは簡易版のため、スクロール処理は省略
    // 必要に応じて後で実装
  }, []);

  // 動画カードのレンダリング
  const renderVideoCard = useCallback((video: typeof processedVideos[0], index: number) => {
    const isLastItem = index === processedVideos.length - 1;
    
    return (
      <div
        key={video.id}
        ref={isLastItem && enableInfiniteScroll ? lastElementRef : undefined}
        style={enableVirtualScroll ? {
          position: 'absolute',
          top: (virtualScrollConfig.startIndex + index) * itemHeight,
          width: '100%',
          height: itemHeight
        } : undefined}
      >
        <OptimizedVideoCard
          video={video}
          channel={video.channel}
          isOwnVideo={video.isOwnVideo}
          onVideoClick={onVideoClick}
          onUserClick={onUserClick}
          onVideoAnalytics={onVideoAnalytics}
          onDeleteVideo={onDeleteVideo}
          lazyLoader={lazyLoaderRef.current}
        />
      </div>
    );
  }, [
    processedVideos,
    enableInfiniteScroll,
    enableVirtualScroll,
    lastElementRef,
    virtualScrollConfig,
    itemHeight,
    onVideoClick,
    onUserClick,
    onVideoAnalytics,
    onDeleteVideo
  ]);

  if (videos.length === 0) {
    return (
      <div className="col-span-2 text-center py-8">
        <div className="text-sm text-gray-400">動画がありません</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`grid grid-cols-2 gap-3 fade-in ${
        enableVirtualScroll ? 'relative overflow-auto' : ''
      }`}
      style={enableVirtualScroll ? {
        height: containerHeight,
        overflowY: 'auto'
      } : undefined}
      onScroll={handleScroll}
    >
      {visibleItems.map((video, index) => renderVideoCard(video, index))}
      
      {/* ローディング表示 */}
      {loading && (
        <div className="col-span-2 text-center py-4">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>読み込み中...</span>
          </div>
        </div>
      )}
      
      {/* 無限スクロール用のトリガー */}
      {enableInfiniteScroll && hasMore && !loading && (
        <div ref={lastElementRef} className="col-span-2 h-4" />
      )}
    </div>
  );
};
