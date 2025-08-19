import { Calendar, Car, Clock, DollarSign, Heart, MapPin, MessageCircle, Package, Trash2, Wrench } from 'lucide-react';
import React, { useState } from 'react';
import { MaintenancePost } from '../../types';
import { currentUser } from '../../data/dummy';

interface MaintenanceCardProps {
  post: MaintenancePost;
  onClick?: () => void;
  onUserClick?: (author: string) => void;
  onDelete?: (postId: string) => void;
}

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ post, onClick, onUserClick, onDelete }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Comment clicked');
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUserClick?.(post.author);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('この整備記録を削除しますか？')) {
      onDelete?.(post.id);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      engine: 'bg-red-500 bg-opacity-20 text-red-400',
      suspension: 'bg-blue-500 bg-opacity-20 text-blue-400',
      brake: 'bg-orange-500 bg-opacity-20 text-orange-400',
      electrical: 'bg-yellow-500 bg-opacity-20 text-yellow-400',
      body: 'bg-purple-500 bg-opacity-20 text-purple-400',
      tire: 'bg-green-500 bg-opacity-20 text-green-400',
      oil: 'bg-indigo-500 bg-opacity-20 text-indigo-400',
      custom: 'bg-pink-500 bg-opacity-20 text-pink-400',
      other: 'bg-gray-500 bg-opacity-20 text-gray-400'
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      engine: 'エンジン',
      suspension: 'サスペンション',
      brake: 'ブレーキ',
      electrical: '電気',
      body: 'ボディ',
      tire: 'タイヤ',
      oil: 'オイル',
      custom: 'カスタム',
      other: 'その他'
    };
    return labels[category] || 'その他';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-500 bg-opacity-20 text-green-400',
      medium: 'bg-yellow-500 bg-opacity-20 text-yellow-400',
      hard: 'bg-red-500 bg-opacity-20 text-red-400'
    };
    return colors[difficulty] || colors.easy;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      easy: '初級',
      medium: '中級',
      hard: '上級'
    };
    return labels[difficulty] || '初級';
  };

  return (
    <div
      onClick={onClick}
      className="p-4 border-b border-surface-light transition-all duration-300 cursor-pointer fade-in hover:bg-surface/30"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleUserClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-all duration-300"
          >
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="w-8 h-8 rounded-full transition-all duration-300 hover:scale-110"
            />
            <span className="text-sm font-medium text-text-primary transition-all duration-300">{post.author}</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${getCategoryColor(post.category)}`}>
            {getCategoryLabel(post.category)}
          </span>
          <span className="text-xs text-text-secondary transition-all duration-300">{post.createdAt}</span>
          {post.author === currentUser.name && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full hover:bg-red-500 hover:bg-opacity-20 transition-all duration-300 hover:scale-110 icon-button"
              title="削除"
            >
              <Trash2 size={16} className="text-red-400 hover:text-red-300 transition-all duration-300" />
            </button>
          )}
        </div>
      </div>

      {/* 車種情報 */}
      <div className="flex items-center space-x-2 mb-3">
        <Car size={16} className="text-primary transition-all duration-300" />
        <span className="text-sm text-text-secondary transition-all duration-300">{post.carModel}</span>
      </div>

      {/* メイン画像 */}
      {post.carImage && (
        <div className="mb-3">
          <img
            src={post.carImage}
            alt={post.carModel}
            className="w-full h-48 object-cover rounded-lg transition-all duration-300 hover:scale-105"
          />
        </div>
      )}

      {/* 手順の写真プレビュー */}
      {post.steps.length > 0 && (
        <div className="mb-3">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {post.steps.slice(0, 3).map((step, index) => (
              step.image && (
                <div key={step.id} className="flex-shrink-0">
                  <img
                    src={step.image}
                    alt={`Step ${step.order}`}
                    className="w-20 h-16 object-cover rounded-lg transition-all duration-300 hover:scale-110"
                  />
                </div>
              )
            ))}
          </div>
          {post.steps.filter(step => step.image).length > 3 && (
            <div className="text-xs text-gray-400 mt-1">
              +{post.steps.filter(step => step.image).length - 3}枚の写真
            </div>
          )}
        </div>
      )}

      {/* タイトルとコンテンツ */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-text-primary mb-2 transition-all duration-300">{post.title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 transition-all duration-300">{post.content}</p>
      </div>

      {/* 作業情報 */}
      <div className="flex items-center justify-between mb-3 text-xs text-text-secondary">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 transition-all duration-300">
            <Calendar size={14} />
            <span>{post.workDate}</span>
          </div>
          <div className="flex items-center space-x-1 transition-all duration-300">
            <MapPin size={14} />
            <span>{post.mileage.toLocaleString()}km</span>
          </div>
          <div className="flex items-center space-x-1 transition-all duration-300">
            <DollarSign size={14} />
            <span>¥{post.cost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 手順・時間・難易度情報 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-xs text-text-secondary transition-all duration-300">
            <Wrench size={14} />
            <span>{post.steps.length}手順</span>
          </div>
          {post.totalTime && (
            <div className="flex items-center space-x-1 text-xs text-text-secondary transition-all duration-300">
              <Clock size={14} />
              <span>{post.totalTime}</span>
            </div>
          )}
          {post.difficulty && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${getDifficultyColor(post.difficulty)}`}>
              {getDifficultyLabel(post.difficulty)}
            </span>
          )}
        </div>
      </div>

      {/* 工具・パーツ情報 */}
      {(post.tools || post.parts) && (
        <div className="mb-3">
          <div className="flex items-center space-x-4 text-xs">
            {post.tools && (
              <div className="flex items-center space-x-1 text-text-secondary transition-all duration-300">
                <Wrench size={12} />
                <span>工具: {post.tools.length}点</span>
              </div>
            )}
            {post.parts && (
              <div className="flex items-center space-x-1 text-text-secondary transition-all duration-300">
                <Package size={12} />
                <span>パーツ: {post.parts.length}点</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* タグ */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-primary/5 text-primary rounded-full transition-all duration-300 hover:scale-105"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-all duration-300 ${
              isLiked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'
            }`}
          >
            <Heart size={16} className={`${isLiked ? 'fill-current' : ''} transition-all duration-300`} />
            <span className="text-xs transition-all duration-300">{likeCount}</span>
          </button>
          <button
            onClick={handleComment}
            className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-all duration-300"
          >
            <MessageCircle size={16} className="transition-all duration-300" />
            <span className="text-xs transition-all duration-300">{post.comments}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
