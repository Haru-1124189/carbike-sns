import { ArrowLeft, Car } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { CarModel } from '../types';

interface VehicleDetailPageProps {
  vehicle: CarModel;
  onBackClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

export const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({ 
  vehicle, 
  onBackClick, 
  onEditClick, 
  onDeleteClick 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteClick?.();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader 
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />
      
              <main className="p-4 pb-24 pt-0">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-lg font-bold text-white">車両詳細</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEditClick}
                className="px-3 py-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm text-sm text-white"
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl bg-red-600 border border-red-500 hover:scale-95 active:scale-95 transition-transform shadow-sm text-sm text-white"
              >
                削除
              </button>
            </div>
          </div>

          {/* 車両画像 */}
          <div className="mb-6">
            <div className="w-full h-48 rounded-xl overflow-hidden relative">
              {vehicle.backgroundImage ? (
                <img
                  src={vehicle.backgroundImage}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <Car size={48} className="text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          </div>

          {/* 車両情報 */}
          <div className="bg-surface rounded-xl border border-surface-light p-4 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Car size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{vehicle.name}</h2>
                <p className="text-sm text-gray-400">愛車</p>
              </div>
            </div>

            {/* 基本情報 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-surface-light">
                <span className="text-sm text-gray-400">車種</span>
                <span className="text-sm text-white">車</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-surface-light">
                <span className="text-sm text-gray-400">年式</span>
                <span className="text-sm text-white">2020年</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-surface-light">
                <span className="text-sm text-gray-400">走行距離</span>
                <span className="text-sm text-white">50,000 km</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">登録日</span>
                <span className="text-sm text-white">2024年1月</span>
              </div>
            </div>
          </div>

          {/* メンテナンス記録 */}
          <div className="bg-surface rounded-xl border border-surface-light p-4 mb-6">
            <h3 className="text-sm font-bold text-white mb-4">メンテナンス記録</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-white">オイル交換</h4>
                  <p className="text-xs text-gray-400">2024年12月15日</p>
                </div>
                <span className="text-xs text-gray-400">¥8,000</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-white">タイヤ交換</h4>
                  <p className="text-xs text-gray-400">2024年11月20日</p>
                </div>
                <span className="text-xs text-gray-400">¥120,000</span>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3">
            <button className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:scale-95 active:scale-95 transition-transform">
              メンテナンス記録を追加
            </button>
            <button className="w-full py-3 bg-surface border border-surface-light text-white rounded-xl font-medium hover:scale-95 active:scale-95 transition-transform">
              写真を追加
            </button>
                     </div>
       </main>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-4">車両を削除</h3>
            <p className="text-sm text-gray-300 mb-6">
              「{vehicle.name}」を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-2 bg-surface-light text-white rounded-lg font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
