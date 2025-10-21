import { Maximize, MoreHorizontal, Pause, Play, Settings, Share, ThumbsDown, ThumbsUp, Volume2, VolumeX } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OptimizedVideoPlayer as VideoPlayer, generateQualityLevels } from '../../utils/videoStreaming';

interface VideoData {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: string;
  views: number;
  likes: number;
  authorId?: string;
  author: string;
  uploadedAt: string;
  tags?: string[];
  category?: string;
}

interface OptimizedVideoPlayerProps {
  video: VideoData;
  onLike?: (videoId: string) => void;
  onDislike?: (videoId: string) => void;
  onShare?: (videoId: string) => void;
  onSubscribe?: (authorId: string) => void;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSubscribed?: boolean;
  enableAdaptiveStreaming?: boolean;
  enableAutoPlay?: boolean;
  enablePreloading?: boolean;
}

export const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  video,
  onLike,
  onDislike,
  onShare,
  onSubscribe,
  isLiked = false,
  isDisliked = false,
  isSubscribed = false,
  enableAdaptiveStreaming = true,
  enableAutoPlay = false,
  enablePreloading = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VideoPlayer>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 動画プレーヤーの初期化
  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    
    // 適応的ストリーミングの設定
    if (enableAdaptiveStreaming) {
      const qualityLevels = generateQualityLevels('/api/videos', video.id);
      playerRef.current = new VideoPlayer(videoElement);
      playerRef.current.setAdaptiveStreaming(qualityLevels);
    }

    // イベントリスナーの設定
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setError('動画の読み込みに失敗しました');
      setIsLoading(false);
    };

    const handleVolumeChange = () => {
      setVolume(videoElement.volume);
      setIsMuted(videoElement.muted);
    };

    // イベントリスナーの追加
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('volumechange', handleVolumeChange);

    // 自動再生の設定
    if (enableAutoPlay) {
      videoElement.autoplay = true;
    }

    // プリロードの設定
    if (enablePreloading) {
      videoElement.preload = 'metadata';
    }

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
      
      playerRef.current?.destroy();
    };
  }, [video.id, enableAdaptiveStreaming, enableAutoPlay, enablePreloading]);

  // コントロールの表示/非表示
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying]);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (!videoRef.current) return;

    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const handleQualityChange = useCallback((quality: string) => {
    setCurrentQuality(quality);
    setShowSettings(false);
  }, []);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M回`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K回`;
    }
    return `${views}回`;
  };

  if (error) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <div className="text-white text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 動画プレーヤー */}
      <div 
        className="relative w-full bg-black rounded-lg overflow-hidden"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onMouseMove={() => setShowControls(true)}
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          className="w-full h-auto"
          onClick={handlePlayPause}
        />
        
        {/* ローディング表示 */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* コントロール */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* プログレスバー */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          {/* コントロールボタン */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMuteToggle}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
          
          {/* 設定メニュー */}
          {showSettings && (
            <div className="absolute bottom-16 right-4 bg-gray-800 rounded-lg p-3 min-w-[200px]">
              <div className="space-y-2">
                <div className="text-white text-sm font-medium mb-2">再生速度</div>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                      playbackRate === rate ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
                
                <div className="text-white text-sm font-medium mb-2 mt-4">画質</div>
                {['auto', '360p', '720p', '1080p'].map(quality => (
                  <button
                    key={quality}
                    onClick={() => handleQualityChange(quality)}
                    className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                      currentQuality === quality ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 動画情報 */}
      <div className="mt-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-white mb-2">{video.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{video.uploadedAt}</span>
          </div>
        </div>
        
        {/* アクションボタン */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike?.(video.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                isLiked ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ThumbsUp size={16} />
              <span>{video.likes}</span>
            </button>
            
            <button
              onClick={() => onDislike?.(video.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                isDisliked ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ThumbsDown size={16} />
            </button>
            
            <button
              onClick={() => onShare?.(video.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
            >
              <Share size={16} />
              <span>共有</span>
            </button>
          </div>
          
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        {/* 説明文 */}
        {video.description && (
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-white text-sm leading-relaxed">{video.description}</p>
          </div>
        )}
        
        {/* タグ */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {video.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
