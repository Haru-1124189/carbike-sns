import React from 'react';

interface NotificationToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  loading = false
}) => {
  const handleToggle = () => {
    if (!disabled && !loading) {
      onChange(!checked);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || loading}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
        ${checked 
          ? 'bg-primary' 
          : 'bg-gray-600'
        }
        ${disabled || loading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:opacity-80'
        }
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-6' : 'translate-x-1'}
          ${loading ? 'animate-pulse' : ''}
        `}
      />
    </button>
  );
};
