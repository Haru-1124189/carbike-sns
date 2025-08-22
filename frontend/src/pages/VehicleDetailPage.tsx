import { ArrowLeft, Calendar, Car, Edit, MoreVertical, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { PersistentImage } from '../components/ui/PersistentImage';
import { Vehicle } from '../types';
import { useAuth } from '../hooks/useAuth';

interface VehicleDetailPageProps {
  vehicle: Vehicle;
  onBackClick: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

export const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({
  vehicle,
  onBackClick,
  onEditClick,
  onDeleteClick
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();

  const isOwner = user?.uid === vehicle.ownerId;

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    console.log('編集ボタンがクリックされました');
    setShowMenu(false);
    console.log('onEditClick関数を呼び出します:', typeof onEditClick);
    onEditClick?.();
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (window.confirm('この車両を削除しますか？この操作は元に戻せません。')) {
      onDeleteClick?.();
    }
  };

  const getVehicleTypeLabel = (type: 'car' | 'bike') => {
    return type === 'car' ? '車' : 'バイク';
  };

  const getDefaultImage = () => {
    return vehicle.type === 'car' 
      ? 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop'
      : 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop';
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader
        onNotificationClick={() => {}}
        onProfileClick={() => {}}
      />

      <main className="px-4 pb-24 pt-0">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">愛車詳細</h1>
          </div>
          
          {isOwner && (
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
              >
                <MoreVertical size={20} className="text-white" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-surface-light rounded-xl shadow-lg z-10">
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-3 text-left text-white hover:bg-surface-light rounded-t-xl flex items-center space-x-2"
                  >
                    <Edit size={16} />
                    <span>編集</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-3 text-left text-red-400 hover:bg-surface-light rounded-b-xl flex items-center space-x-2"
                  >
                    <Settings size={16} />
                    <span>削除</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 車両画像 */}
        <div className="mb-6">
          <div className="w-full h-64 bg-surface-light rounded-xl overflow-hidden">
            <PersistentImage
              src={vehicle.image || getDefaultImage()}
              alt={vehicle.name}
              className="w-full h-full object-cover"
              loading="eager"
              fallback={
                <div className="w-full h-full bg-surface-light flex items-center justify-center">
                  <Car size={48} className="text-gray-400" />
                </div>
              }
            />
          </div>
        </div>

        {/* 基本情報 */}
        <div className="bg-surface rounded-xl border border-surface-light p-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">基本情報</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">車両名</span>
              <span className="text-sm font-medium text-white">{vehicle.name}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">種類</span>
              <span className="text-sm font-medium text-white">{getVehicleTypeLabel(vehicle.type)}</span>
            </div>
            
            {vehicle.year && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">年式</span>
                <div className="flex items-center space-x-2">
                  <Calendar size={14} className="text-primary" />
                  <span className="text-sm font-medium text-white">{vehicle.year}年</span>
                </div>
              </div>
            )}
            
            {vehicle.make && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">メーカー</span>
                <span className="text-sm font-medium text-white">{vehicle.make}</span>
              </div>
            )}
            
            {vehicle.model && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">モデル</span>
                <span className="text-sm font-medium text-white">{vehicle.model}</span>
              </div>
            )}
          </div>
        </div>

        {/* カスタム内容 */}
        {vehicle.customContent && (
          <div className="bg-surface rounded-xl border border-surface-light p-4 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">カスタム内容</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {vehicle.customContent}
            </p>
          </div>
        )}

        {/* 登録日時 */}
        <div className="bg-surface rounded-xl border border-surface-light p-4">
          <h2 className="text-lg font-bold text-white mb-4">登録情報</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">登録日</span>
              <span className="text-sm font-medium text-white">
                {vehicle.createdAt ? new Date(vehicle.createdAt.seconds * 1000).toLocaleDateString('ja-JP') : '不明'}
              </span>
            </div>
            
            {vehicle.updatedAt && vehicle.updatedAt !== vehicle.createdAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">最終更新</span>
                <span className="text-sm font-medium text-white">
                  {new Date(vehicle.updatedAt.seconds * 1000).toLocaleDateString('ja-JP')}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};