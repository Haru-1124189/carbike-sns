import { User } from 'lucide-react';
import React from 'react';
import { PersistentImage } from './PersistentImage';

interface UserCardProps {
  user: {
    id: string;
    displayName: string;
    username?: string;
    avatar?: string;
    bio?: string;
  };
  onClick?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  return (
    <div
      className="flex items-center space-x-3 p-3 bg-surface rounded-lg cursor-pointer hover:bg-surface-hover transition-colors"
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        {user.avatar ? (
          <PersistentImage
            src={user.avatar}
            alt={user.displayName}
            className="w-12 h-12 rounded-full object-cover"
            clickable={false}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-text-primary truncate">
            {user.displayName}
          </h3>
          {user.username && (
            <span className="text-sm text-text-secondary">@{user.username}</span>
          )}
        </div>
        
        {user.bio && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
};
