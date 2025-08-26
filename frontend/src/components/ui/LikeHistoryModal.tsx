import React from 'react';
import { X, Heart, User } from 'lucide-react';
import { useLikeHistory } from '../../hooks/useLikes';
import { PersistentImage } from './PersistentImage';

interface LikeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'thread' | 'maintenance';
  onUserClick?: (userId: string, displayName: string) => void;
}

export const LikeHistoryModal: React.FC<LikeHistoryModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  onUserClick
}) => {
  const { likeHistory, loading, error } = useLikeHistory(targetId, targetType);

  if (!isOpen) return null;

  const handleUserClick = (userId: string, displayName: string) => {
    onUserClick?.(userId, displayName);
    onClose();
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '不明';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) return '今';
      if (minutes < 60) return `${minutes}分前`;
      if (hours < 24) return `${hours}時間前`;
      if (days < 7) return `${days}日前`;
      return date.toLocaleDateString('ja-JP');
    } catch (error) {
      return '不明';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-surface-light w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-surface-light">
          <div className="flex items-center space-x-2">
            <Heart size={20} className="text-red-500" />
            <h2 className="text-lg font-bold text-white">いいね履歴</h2>
            <span className="text-sm text-gray-400">({likeHistory.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-light transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-sm text-gray-400">読み込み中...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-sm text-red-400 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
              >
                再試行
              </button>
            </div>
          ) : likeHistory.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-sm text-gray-400">まだいいねがありません</div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {likeHistory.map((like) => (
                <div
                  key={like.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-light transition-colors cursor-pointer"
                  onClick={() => handleUserClick(like.userId, like.userDisplayName)}
                >
                  {/* ユーザーアイコン */}
                  <div className="flex-shrink-0">
                    {like.userPhotoURL ? (
                      <PersistentImage
                        src={like.userPhotoURL}
                        alt={like.userDisplayName}
                        className="w-10 h-10 rounded-full object-cover"
                        clickable={false}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* ユーザー情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {like.userDisplayName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatTime(like.createdAt)}
                    </div>
                  </div>

                  {/* いいねアイコン */}
                  <div className="flex-shrink-0">
                    <Heart size={16} className="text-red-500 fill-current" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
