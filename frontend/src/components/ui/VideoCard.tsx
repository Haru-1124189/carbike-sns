import { Eye, Play, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Video } from '../../types';
import { currentUser } from '../../data/dummy';
import { Chip } from './Chip';

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
  onDelete?: (videoId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, onDelete }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('この動画を削除しますか？')) {
      onDelete?.(video.id);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer transition-all duration-300 fade-in hover:scale-105 active:scale-95"
    >
      <div className="relative mb-3">
        {/* スケルトンプレースホルダー */}
        {!imageLoaded && (
          <div className="w-full h-32 bg-surface-light animate-pulse rounded-lg" />
        )}
        
        {/* 画像 */}
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className={`w-full h-32 object-cover rounded-lg transition-all duration-300 hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* エラー時のプレースホルダー */}
        {imageError && (
          <div className="absolute inset-0 bg-surface-light rounded-lg flex items-center justify-center">
            <Play size={24} className="text-text-secondary" />
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300">
          <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
            <Play size={20} className="text-white ml-1 transition-all duration-300" />
          </div>
        </div>
        
        {/* 再生時間チップ */}
        <div className="absolute bottom-2 right-2">
          <Chip variant="default" size="sm">
            {video.duration}
          </Chip>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white line-clamp-2 flex-1 transition-all duration-300">{video.title}</h3>
          {video.author === currentUser.name && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full hover:bg-red-500 hover:bg-opacity-20 transition-all duration-300 ml-2 flex-shrink-0 hover:scale-110 icon-button"
              title="削除"
            >
              <Trash2 size={14} className="text-red-400 hover:text-red-300 transition-all duration-300" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="transition-all duration-300">{video.author}</span>
          <div className="flex items-center transition-all duration-300">
            <Eye size={12} className="mr-1 transition-all duration-300" />
            {video.views.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
