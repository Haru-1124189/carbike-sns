import { Loader2, UserMinus, UserPlus } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFollow } from '../../hooks/useFollow';

interface FollowButtonProps {
  targetUserId: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  variant = 'primary',
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { isFollowing, loading, toggleFollow } = useFollow(targetUserId);



  // 自分自身の場合は表示しない
  if (!user || user.uid === targetUserId) {
    return null;
  }

  const getVariantClasses = () => {
    if (isFollowing) {
      switch (variant) {
        case 'primary':
          return 'bg-surface-light text-text-primary border border-border hover:bg-red-600 hover:text-white hover:border-red-600';
        case 'secondary':
          return 'bg-surface text-text-primary border border-border hover:bg-red-600 hover:text-white hover:border-red-600';
        case 'outline':
          return 'bg-transparent text-text-primary border border-border hover:bg-red-600 hover:text-white hover:border-red-600';
        case 'ghost':
          return 'bg-transparent text-text-secondary hover:bg-red-600 hover:text-white border-0';
        default:
          return 'bg-surface-light text-text-primary border border-border hover:bg-red-600 hover:text-white hover:border-red-600';
      }
    } else {
      switch (variant) {
        case 'primary':
          return 'bg-primary text-white border border-primary hover:bg-primary-dark hover:border-primary-dark';
        case 'secondary':
          return 'bg-surface-light text-text-primary border border-border hover:bg-primary hover:text-white hover:border-primary';
        case 'outline':
          return 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white';
        case 'ghost':
          return 'bg-transparent text-text-secondary hover:bg-primary hover:text-white border-0';
        default:
          return 'bg-primary text-white border border-primary hover:bg-primary-dark hover:border-primary-dark';
      }
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-0.5 text-xs';
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 12;
      case 'sm':
        return 14;
      case 'md':
        return 16;
      case 'lg':
        return 18;
      default:
        return 16;
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('FollowButton clicked:', { 
      targetUserId, 
      currentUser: user?.uid, 
      loading 
    });
    
    if (loading) return;
    
    try {
      await toggleFollow();
    } catch (error) {
      console.error('FollowButton error:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        font-medium rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center space-x-2
        ${size === 'xs' ? 'min-w-[60px]' : 'min-w-[80px]'}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 size={getIconSize()} className="animate-spin" />
      ) : (
        <>
          {showIcon && size !== 'xs' && (
            isFollowing ? 
              <UserMinus size={getIconSize()} /> : 
              <UserPlus size={getIconSize()} />
          )}
          <span>
            {isFollowing ? 'フォロー中' : 'フォロー'}
          </span>
        </>
      )}
    </button>
  );
};
