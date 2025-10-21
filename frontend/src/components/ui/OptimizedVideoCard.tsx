import { BarChart3, Play, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LazyVideoLoader } from '../../utils/videoStreaming';
import { ClickableUserName } from './ClickableUserName';
import { OptimizedImage } from './OptimizedImage';

interface OptimizedVideoCardProps {
  video: any; // 型の不一致を回避するため一時的にanyを使用
  channel?: {
    id: string;
    name: string;
    avatar: string;
    isSubscribed: boolean;
  };
  isOwnVideo: boolean;
  onVideoClick: (videoId: string) => void;
  onUserClick: (userId: string, displayName: string) => void;
  onVideoAnalytics?: (videoId: string) => void;
  onDeleteVideo?: (videoId: string) => void;
  lazyLoader?: LazyVideoLoader;
}

export const OptimizedVideoCard: React.FC<OptimizedVideoCardProps> = ({
  video,
  channel,
  isOwnVideo,
  onVideoClick,
  onUserClick,
  onVideoAnalytics,
  onDeleteVideo,
  lazyLoader
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!cardRef.current || !lazyLoader) return;

    // LazyVideoLoaderはHTMLVideoElementを期待しているが、ここではHTMLDivElementを使用
    // 代わりに直接Intersection Observerを使用
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(cardRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Visibility detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleVideoClick = useCallback(() => {
    onVideoClick(video.id);
  }, [onVideoClick, video.id]);

  const handleUserClick = useCallback((userId: string, displayName: string) => {
    onUserClick(userId, displayName);
  }, [onUserClick]);

  const handleAnalyticsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onVideoAnalytics?.(video.id);
  }, [onVideoAnalytics, video.id]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteVideo?.(video.id);
  }, [onDeleteVideo, video.id]);

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M回`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K回`;
    }
    return `${views}回`;
  };

  return (
    <div
      ref={cardRef}
      onClick={handleVideoClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer hover:scale-95 active:scale-95 transition-transform"
    >
      {/* サムネイル */}
      <div className="relative mb-2">
        <div className="w-full h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center relative overflow-hidden">
          {isVisible && video.thumbnailUrl ? (
            <OptimizedImage
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-700 animate-pulse flex items-center justify-center">
              <Play size={20} className="text-gray-400" />
            </div>
          )}
          
          {/* 背景装飾 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
        </div>
        
        {/* 再生時間 */}
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
          {typeof video.duration === 'number' ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : video.duration}
        </div>
        
        {/* 登録チャンネルバッジ */}
        {channel?.isSubscribed && (
          <div className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">
            登録済み
          </div>
        )}
        
        {/* ホバー時の再生ボタン */}
        <div className={`absolute inset-0 bg-black transition-all duration-200 flex items-center justify-center ${
          isHovered ? 'bg-opacity-30 opacity-100' : 'bg-opacity-0 opacity-0'
        }`}>
          <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
            <Play size={12} className="text-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* 動画情報 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white line-clamp-2 leading-tight flex-1">
            {video.title}
          </h3>
          {isOwnVideo && (
            <div className="flex space-x-1 ml-1 flex-shrink-0">
              <button
                onClick={handleAnalyticsClick}
                className="p-1 rounded-full hover:bg-blue-500 hover:bg-opacity-20 transition-colors"
                title="分析"
              >
                <BarChart3 size={12} className="text-blue-400 hover:text-blue-300" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-1 rounded-full hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                title="削除"
              >
                <Trash2 size={12} className="text-red-400 hover:text-red-300" />
              </button>
            </div>
          )}
        </div>
        
        <ClickableUserName 
          key={`${video.id}-${video.authorId}`}
          userId={video.authorId || ''} 
          fallbackName={video.author}
          size="sm"
          showAvatar={false}
          onClick={handleUserClick}
          className="text-xs text-gray-400 hover:text-primary transition-colors"
        />
        
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <span>{formatViews(video.views)}</span>
          <span>•</span>
          <span>{video.uploadedAt}</span>
        </div>
      </div>
    </div>
  );
};
