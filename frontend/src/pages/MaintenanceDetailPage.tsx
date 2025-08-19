import { AlertTriangle, ArrowLeft, Calendar, Clock, DollarSign, Heart, Image, MapPin, MessageCircle, MoreHorizontal, Package, Share, Wrench } from 'lucide-react';
import React, { useState } from 'react';
import { MotoIcon } from '../components/icons/MotoIcon';
import { BannerAd } from '../components/ui/BannerAd';
import { MaintenancePost } from '../types';
import { useSwipeBack } from '../hooks/useSwipeBack';

interface MaintenanceDetailPageProps {
  post: MaintenancePost;
  onBackClick: () => void;
  onUserClick?: (author: string) => void;
}

export const MaintenanceDetailPage: React.FC<MaintenanceDetailPageProps> = ({ 
  post, 
  onBackClick, 
  onUserClick 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  // スワイプバック機能を有効化
  useSwipeBack({
    onSwipeBack: onBackClick
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleUserClick = () => {
    onUserClick?.(post.author);
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
    <div className="min-h-screen bg-background container-mobile">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-background z-10 border-b border-surface-light">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">整備記録</h1>
          <button className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm">
            <MoreHorizontal size={20} className="text-white" />
          </button>
        </div>
      </div>

      <main className="p-4 pb-20">
        <BannerAd />
        
        {/* 投稿者情報 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleUserClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="text-base font-semibold text-white">{post.author}</div>
              <div className="text-sm text-gray-400">{post.createdAt}</div>
            </div>
          </button>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(post.category)}`}>
            {getCategoryLabel(post.category)}
          </span>
        </div>

        {/* 車種情報 */}
        <div className="flex items-center space-x-2 mb-4">
          <MotoIcon size={20} className="text-primary" />
          <span className="text-lg text-white font-medium">{post.carModel}</span>
        </div>

        {/* メイン画像 */}
        {post.carImage && (
          <div className="mb-4">
            <img
              src={post.carImage}
              alt={post.carModel}
              className="w-full h-64 object-cover rounded-xl"
            />
          </div>
        )}

        {/* タイトルとコンテンツ */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-3">{post.title}</h2>
          <p className="text-base text-gray-300 leading-relaxed">{post.content}</p>
        </div>

        {/* 詳細情報 */}
        <div className="bg-surface rounded-xl border border-surface-light p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-primary" />
              <div>
                <div className="text-xs text-gray-400">作業日</div>
                <div className="text-sm text-white font-medium">{post.workDate}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={18} className="text-primary" />
              <div>
                <div className="text-xs text-gray-400">走行距離</div>
                <div className="text-sm text-white font-medium">{post.mileage.toLocaleString()}km</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign size={18} className="text-primary" />
              <div>
                <div className="text-xs text-gray-400">費用</div>
                <div className="text-sm text-white font-medium">¥{post.cost.toLocaleString()}</div>
              </div>
            </div>
            {post.totalTime && (
              <div className="flex items-center space-x-2">
                <Clock size={18} className="text-primary" />
                <div>
                  <div className="text-xs text-gray-400">作業時間</div>
                  <div className="text-sm text-white font-medium">{post.totalTime}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 作業情報 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <Wrench size={16} />
              <span>{post.steps.length}手順</span>
            </div>
            {post.difficulty && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(post.difficulty)}`}>
                {getDifficultyLabel(post.difficulty)}
              </span>
            )}
          </div>
        </div>

        {/* 工具・パーツ情報 */}
        {(post.tools || post.parts) && (
          <div className="bg-surface rounded-xl border border-surface-light p-4 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">必要な工具・パーツ</h3>
            <div className="space-y-3">
              {post.tools && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Wrench size={16} className="text-primary" />
                    <span className="text-sm font-medium text-white">工具 ({post.tools.length}点)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tools.map((tool, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-primary bg-opacity-20 text-primary rounded-full">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {post.parts && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Package size={16} className="text-primary" />
                    <span className="text-sm font-medium text-white">パーツ ({post.parts.length}点)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.parts.map((part, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-green-500 bg-opacity-20 text-green-400 rounded-full">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 作業手順 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">作業手順</h3>
          <div className="space-y-6">
            {post.steps.map((step, index) => (
              <div key={step.id} className="bg-surface rounded-xl border border-surface-light p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{step.order}</span>
                  </div>
                  <h4 className="text-base font-semibold text-white">{step.title}</h4>
                </div>
                
                <p className="text-sm text-gray-300 leading-relaxed mb-3">{step.description}</p>
                
                {step.image && (
                  <div className="mb-3">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-64 object-cover rounded-lg transition-all duration-300 hover:scale-105"
                    />
                  </div>
                )}
                
                {!step.image && (
                  <div className="mb-3">
                    <div className="w-full h-32 bg-surface-light rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Image size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">写真がありません</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {step.tips && (
                  <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle size={16} className="text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">ポイント</span>
                    </div>
                    <p className="text-sm text-yellow-300">{step.tips}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* タグ */}
        {post.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-2">タグ</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-primary bg-opacity-20 text-primary rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex items-center justify-between py-4 border-t border-surface-light">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart size={20} className={isLiked ? 'fill-current' : ''} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors">
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors">
              <Share size={20} />
              <span className="text-sm font-medium">シェア</span>
            </button>
          </div>
        </div>

        {/* コメントセクション */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">コメント ({post.comments})</h3>
          
          {/* コメント入力 */}
          <div className="flex items-center space-x-3 mb-6">
            <img
              src="https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=U"
              alt="User"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <input
                type="text"
                placeholder="コメントを入力..."
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </div>
            <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
              投稿
            </button>
          </div>

          {/* ダミーコメント */}
          <div className="space-y-4">
            <div className="flex space-x-3">
              <img
                src="https://via.placeholder.com/32x32/10B981/FFFFFF?text=E"
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-white">EK9整備</span>
                  <span className="text-xs text-gray-400">1時間前</span>
                </div>
                <p className="text-sm text-gray-300">素晴らしい整備記録ですね！手順が分かりやすくて参考になります。</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <img
                src="https://via.placeholder.com/32x32/8B5CF6/FFFFFF?text=R"
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-white">R34オーナー</span>
                  <span className="text-xs text-gray-400">2時間前</span>
                </div>
                <p className="text-sm text-gray-300">同じ車種なので、とても参考になりました。写真付きで分かりやすいです！</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
