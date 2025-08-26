import { Lock, Unlock, Loader2 } from 'lucide-react';
import React from 'react';
import { usePrivacy } from '../../hooks/usePrivacy';

interface PrivacyToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  className = '',
  showLabel = true,
  size = 'md'
}) => {
  const { isPrivate, loading, error, updatePrivacy } = usePrivacy();

  const handleToggle = async () => {
    if (loading) return;
    await updatePrivacy(!isPrivate);
  };

  const getSizeClasses = () => {
    switch (size) {
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

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`
          ${getSizeClasses()}
          flex items-center justify-center space-x-2
          font-medium rounded-xl
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isPrivate 
            ? 'bg-yellow-600 text-white hover:bg-yellow-700 border border-yellow-600' 
            : 'bg-green-600 text-white hover:bg-green-700 border border-green-600'
          }
        `}
      >
        {loading ? (
          <Loader2 size={getIconSize()} className="animate-spin" />
        ) : (
          <>
            {isPrivate ? (
              <Lock size={getIconSize()} />
            ) : (
              <Unlock size={getIconSize()} />
            )}
            {showLabel && (
              <span>
                {isPrivate ? '鍵アカウント' : '公開アカウント'}
              </span>
            )}
          </>
        )}
      </button>
      
      {error && (
        <div className="text-red-500 text-xs">
          {error}
        </div>
      )}
      
      {showLabel && (
        <div className="text-xs text-text-secondary">
          {isPrivate 
            ? 'フォロワーのみが投稿を見ることができます'
            : '誰でも投稿を見ることができます'
          }
        </div>
      )}
    </div>
  );
};
