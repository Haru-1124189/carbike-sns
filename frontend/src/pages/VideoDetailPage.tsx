import { ArrowLeft, MoreVertical, Play, Share, ThumbsDown, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { Video } from '../types';

interface VideoDetailPageProps {
  video: Video;
  onBackClick?: () => void;
  onUserClick?: (author: string) => void;
}

export const VideoDetailPage: React.FC<VideoDetailPageProps> = ({ video, onBackClick, onUserClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setIsLiked(true);
      setIsDisliked(false);
      setLikeCount(likeCount + 1);
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount(likeCount - 1);
      }
    }
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  const handleMore = () => {
    console.log('More clicked');
  };

  const handleUserClick = (author: string) => {
    onUserClick?.(author);
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

              <main className="p-4 pb-24 pt-0">
          {/* 戻るボタン */}
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">動画詳細</h1>
          </div>

          {/* 動画プレイヤー */}
          <div className="relative mb-4">
            <div className="w-full h-48 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center relative overflow-hidden">
              <Play size={40} className="text-white relative z-10" />
              {/* 背景装飾 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
            </div>
            {/* 再生時間 */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </div>
          </div>

          {/* 動画情報 */}
          <div className="px-4">
            <div className="bg-surface rounded-xl border border-surface-light p-4 mb-4">
              {/* タイトルとアクション */}
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-bold text-white flex-1 mr-3">{video.title}</h2>
                <button
                  onClick={handleMore}
                  className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                >
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>

              {/* チャンネル情報 */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{video.author.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => handleUserClick(video.author)}
                    className="text-sm font-semibold text-white hover:text-primary transition-colors"
                  >
                    {video.author}
                  </button>
                  <div className="text-xs text-gray-400">{video.uploadedAt}</div>
                </div>
              </div>

              {/* 説明 */}
              <p className="text-sm text-gray-300 leading-relaxed mb-4">{video.description}</p>

              {/* アクションボタン */}
              <div className="flex items-center justify-between pt-4 border-t border-surface-light">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 transition-colors ${
                      isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <ThumbsUp size={16} className={isLiked ? 'fill-current' : ''} />
                    <span className="text-xs">{likeCount}</span>
                  </button>

                  <button
                    onClick={handleDislike}
                    className={`flex items-center space-x-2 transition-colors ${
                      isDisliked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <ThumbsDown size={16} className={isDisliked ? 'fill-current' : ''} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors"
                  >
                    <Share size={16} />
                  </button>
                </div>

                <div className="text-xs text-gray-400">
                  {video.views.toLocaleString()}回視聴
                </div>
              </div>
            </div>

            {/* コメントセクション */}
            <div className="bg-surface rounded-xl border border-surface-light p-4">
              <h3 className="text-sm font-bold text-white mb-4">コメント</h3>

              {/* コメント入力 */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">U</span>
                </div>
                <div className="flex-1 bg-surface-light rounded-xl px-3 py-2">
                  <input
                    type="text"
                    placeholder="コメントを入力..."
                    className="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
                  />
                </div>
                <button className="text-primary text-sm font-medium">送信</button>
              </div>

              {/* コメント一覧（ダミー） */}
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <button className="text-sm font-semibold text-white hover:text-primary transition-colors">
                        コメント者A
                      </button>
                      <span className="text-xs text-gray-400">2時間前</span>
                    </div>
                    <p className="text-sm text-gray-300">素晴らしい動画ですね！</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">B</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <button className="text-sm font-semibold text-white hover:text-primary transition-colors">
                        コメント者B
                      </button>
                      <span className="text-xs text-gray-400">1時間前</span>
                    </div>
                    <p className="text-sm text-gray-300">参考になりました。</p>
                  </div>
                </div>
              </div>
                         </div>
           </div>
       </main>
    </div>
  );
};
