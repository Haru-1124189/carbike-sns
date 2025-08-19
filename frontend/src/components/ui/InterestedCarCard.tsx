import { X } from 'lucide-react';
import React from 'react';

interface InterestedCarCardProps {
  carName: string;
  onRemove?: (carName: string) => void;
  onClick?: (carName: string) => void;
}

// 車名に応じた画像URLのマッピング - より多様で魅力的な写真
const getCarImageUrl = (carName: string): string => {
  const carImages: { [key: string]: string } = {
    'Nissan S13': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=150&fit=crop',
    'Civic EK9': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=150&fit=crop',
    'Swift Sport ZC32S': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200&h=150&fit=crop',
    'Skyline R34': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&h=150&fit=crop',
    'RX-7 FD3S': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200&h=150&fit=crop',
    'Trueno AE86': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&h=150&fit=crop',
    'S2000 AP1': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=150&fit=crop',
    'Supra A80': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=150&fit=crop',
  };
  
  return carImages[carName] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&h=150&fit=crop';
};

export const InterestedCarCard: React.FC<InterestedCarCardProps> = ({
  carName,
  onRemove,
  onClick
}) => {
  const handleClick = () => {
    onClick?.(carName);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(carName);
  };

  const imageUrl = getCarImageUrl(carName);

  return (
    <div
      onClick={handleClick}
      className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative fade-in hover:scale-105"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* 車の写真 */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-light flex-shrink-0">
            <img 
              src={imageUrl}
              alt={carName}
              className="w-full h-full object-cover transition-all duration-300 hover:scale-110"
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white transition-all duration-300">{carName}</h3>
            <p className="text-sm text-gray-400 transition-all duration-300">お気に入り車種</p>
          </div>
        </div>
        
        {onRemove && (
          <button
            onClick={handleRemove}
            className="p-2 rounded-lg bg-red-500 bg-opacity-20 hover:bg-red-500 hover:bg-opacity-30 transition-all duration-300 hover:scale-110 icon-button"
          >
            <X size={16} className="text-red-400 transition-all duration-300" />
          </button>
        )}
      </div>
    </div>
  );
};
