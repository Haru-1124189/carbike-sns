import React from 'react';
import { useUserName } from '../../hooks/useUserName';
import { PersistentImage } from './PersistentImage';

interface ClickableUserNameProps {
  userId: string;
  fallbackName?: string;
  size?: 'sm' | 'md' | 'lg';
  showAvatar?: boolean;
  onClick?: (userId: string, displayName: string) => void;
  className?: string;
}

export const ClickableUserName: React.FC<ClickableUserNameProps> = ({
  userId,
  fallbackName,
  size = 'md',
  showAvatar = true,
  onClick,
  className = ''
}) => {
  const { displayName, photoURL, loading } = useUserName(userId);

  const handleClick = (e: React.MouseEvent) => {
    console.log('ClickableUserName - handleClick called:', { userId, displayName, fallbackName, onClick });
    e.stopPropagation();
    if (onClick && userId) {
      console.log('ClickableUserName - calling onClick with:', userId, displayName || fallbackName || 'Unknown User');
      onClick(userId, displayName || fallbackName || 'Unknown User');
    } else {
      console.log('ClickableUserName - onClick not available or userId missing');
    }
  };

  const sizeClasses = {
    sm: {
      avatar: 'w-6 h-6',
      text: 'text-xs',
      icon: 'text-xs'
    },
    md: {
      avatar: 'w-8 h-8',
      text: 'text-sm',
      icon: 'text-sm'
    },
    lg: {
      avatar: 'w-10 h-10',
      text: 'text-base',
      icon: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 hover:opacity-80 transition-all duration-300 ${className}`}
      disabled={!onClick}
      style={{ zIndex: 10, position: 'relative' }}
    >
      {showAvatar && (
        <div className={`${currentSize.avatar} rounded-full overflow-hidden flex items-center justify-center bg-primary flex-shrink-0`}>
          {photoURL ? (
            <PersistentImage
              src={photoURL}
              alt={displayName || fallbackName || 'User'}
              className="w-full h-full object-cover"
              loading="lazy"
              fallback={
                <span className={`text-white font-medium ${currentSize.icon}`}>
                  {(displayName || fallbackName || 'U').charAt(0).toUpperCase()}
                </span>
              }
            />
          ) : (
            <span className={`text-white font-medium ${currentSize.icon}`}>
              {(displayName || fallbackName || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}
      
      <span className={`font-medium text-text-primary ${currentSize.text} ${onClick ? 'hover:text-primary transition-colors' : ''}`}>
        {loading ? '読み込み中...' : (displayName || fallbackName || 'Unknown User')}
      </span>
    </button>
  );
};
