import { Search, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { UserDoc } from '../../types/user';
import { searchUsersByUsername } from '../../utils/mentions';
import { PersistentImage } from './PersistentImage';

interface MentionSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserDoc) => void;
  searchTerm: string;
  position?: { x: number; y: number };
}

export const MentionSearch: React.FC<MentionSearchProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  searchTerm,
  position
}) => {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !searchTerm) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        const results = await searchUsersByUsername(searchTerm);
        setUsers(results);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, users.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (users[selectedIndex]) {
            onSelectUser(users[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, users, selectedIndex, onSelectUser, onClose]);

  if (!isOpen) return null;

  const handleUserClick = (user: UserDoc) => {
    onSelectUser(user);
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-surface border border-surface-light rounded-lg shadow-lg max-w-sm w-full max-h-64 overflow-hidden"
      style={{
        left: position?.x || 0,
        top: position?.y || 0,
      }}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-3 border-b border-surface-light">
        <div className="flex items-center space-x-2">
          <Search size={16} className="text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">ユーザーを検索</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-surface-light transition-colors"
        >
          <X size={16} className="text-text-secondary" />
        </button>
      </div>

      {/* 検索結果 */}
      <div className="max-h-48 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="text-sm text-text-secondary">検索中...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-sm text-text-secondary">
              {searchTerm ? 'ユーザーが見つかりませんでした' : 'ユーザー名を入力してください'}
            </div>
          </div>
        ) : (
          <div className="py-1">
            {users.map((user, index) => (
              <div
                key={user.uid}
                className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-primary/10' : 'hover:bg-surface-light'
                }`}
                onClick={() => handleUserClick(user)}
              >
                {/* ユーザーアイコン */}
                <div className="flex-shrink-0">
                  {user.photoURL ? (
                    <PersistentImage
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full object-cover"
                      clickable={false}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>

                {/* ユーザー情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {user.displayName}
                    </span>
                    {user.username && (
                      <span className="text-xs text-text-secondary">
                        @{user.username}
                      </span>
                    )}
                  </div>
                  {user.bio && (
                    <div className="text-xs text-text-secondary truncate mt-1">
                      {user.bio}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ヘルプ */}
      <div className="p-2 border-t border-surface-light bg-surface-light/30">
        <div className="text-xs text-text-secondary">
          ↑↓ キーで選択、Enter で確定、Esc でキャンセル
        </div>
      </div>
    </div>
  );
};
