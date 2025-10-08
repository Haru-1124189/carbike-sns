import { ArrowLeft, User, Users } from 'lucide-react';
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFollowData } from '../hooks/useFollowData';

interface FollowersListPageProps {
  onBackClick?: () => void;
  onUserClick?: (userId: string, displayName: string) => void;
}

export const FollowersListPage: React.FC<FollowersListPageProps> = ({
  onBackClick,
  onUserClick
}) => {
  const { user } = useAuth();
  const { followers, loading, error } = useFollowData(user?.uid || '');

  const handleUserClick = (userId: string, displayName: string) => {
    console.log('FollowersListPage - handleUserClick called:', { userId, displayName });
    onUserClick?.(userId, displayName);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        {/* カスタムヘッダー */}
        <header className="bg-background px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">フォロワー</h1>
          </div>
        </header>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-400">読み込み中...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          ) : followers.length > 0 ? (
            <div className="space-y-3">
              {followers.map((userData) => (
                <div
                  key={userData.id}
                  className="flex items-center p-3 rounded-lg bg-surface border border-surface-light cursor-pointer hover:bg-surface-hover transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserClick(userData.id, userData.displayName);
                  }}
                >
                  <User size={24} className="text-white mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{userData.displayName}</p>
                    {userData.username && (
                      <p className="text-xs text-gray-400">@{userData.username}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <div className="text-sm text-gray-400">フォロワーがいません</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
