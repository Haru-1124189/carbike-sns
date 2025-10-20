import { Clock, Loader2, UserMinus, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFollow } from '../../hooks/useFollow';
import { useFollowRequests, useIsPrivateAccount } from '../../hooks/useFollowRequests';

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
  const { isPrivate: isTargetPrivate } = useIsPrivateAccount(targetUserId);
  const { followRequest, loading: requestLoading, sendRequest, cancelRequest } = useFollowRequests(targetUserId);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');



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
      loading,
      isTargetPrivate,
      followRequest
    });
    
    if (loading || requestLoading) return;
    
    try {
      // 既にフォローしている場合はアンフォロー
      if (isFollowing) {
        await toggleFollow();
        return;
      }

      // フォロー申請が送信済みの場合はキャンセル
      if (followRequest?.status === 'pending') {
        await cancelRequest();
        return;
      }

      // 鍵アカウントの場合はフォロー申請
      if (isTargetPrivate) {
        setShowRequestModal(true);
        return;
      }

      // 公開アカウントの場合は直接フォロー
      await toggleFollow();
    } catch (error) {
      console.error('FollowButton error:', error);
    }
  };

  const handleSendRequest = async () => {
    if (!requestMessage.trim()) {
      alert('申請メッセージを入力してください');
      return;
    }

    try {
      await sendRequest(requestMessage);
      setShowRequestModal(false);
      setRequestMessage('');
    } catch (error) {
      console.error('Error sending follow request:', error);
    }
  };

  // ボタンの状態を決定
  const getButtonState = () => {
    if (loading || requestLoading) return 'loading';
    if (isFollowing) return 'following';
    if (followRequest?.status === 'pending') return 'requested';
    if (followRequest?.status === 'approved') return 'following';
    if (followRequest?.status === 'rejected') return 'follow';
    return 'follow';
  };

  const buttonState = getButtonState();

  const getButtonText = () => {
    switch (buttonState) {
      case 'loading':
        return '処理中...';
      case 'following':
        return 'フォロー中';
      case 'requested':
        return '申請中';
      default:
        return 'フォロー';
    }
  };

  const getButtonIcon = () => {
    if (buttonState === 'loading') return <Loader2 size={getIconSize()} className="animate-spin" />;
    if (buttonState === 'following') return <UserMinus size={getIconSize()} />;
    if (buttonState === 'requested') return <Clock size={getIconSize()} />;
    return <UserPlus size={getIconSize()} />;
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading || requestLoading}
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
        {showIcon && size !== 'xs' && getButtonIcon()}
        <span>{getButtonText()}</span>
      </button>

      {/* フォロー申請モーダル */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-white mb-4">フォロー申請</h3>
            <p className="text-sm text-gray-400 mb-4">
              このアカウントは鍵アカウントです。フォローするには申請が必要です。
            </p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="申請メッセージ（必須）"
              className="w-full p-3 bg-surface border border-surface-light rounded-lg text-white placeholder-gray-400 mb-4 resize-none"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestMessage('');
                }}
                className="flex-1 py-2 px-4 bg-surface-light text-white rounded-lg hover:bg-surface transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSendRequest}
                disabled={!requestMessage.trim() || requestLoading}
                className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {requestLoading ? '送信中...' : '申請する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
