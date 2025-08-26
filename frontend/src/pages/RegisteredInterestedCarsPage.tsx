import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { MotoIcon } from '../components/icons/MotoIcon';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { InterestedCarCard } from '../components/ui/InterestedCarCard';
import { VehicleSearchBar } from '../components/ui/VehicleSearchBar';
import { VehicleSearchResult } from '../types/vehicle';

interface RegisteredInterestedCarsPageProps {
  onBackClick?: () => void;
  onRemoveCar?: (carName: string) => void;
  onAddCar?: (carName: string) => void;
  interestedCars?: string[];
}

export const RegisteredInterestedCarsPage: React.FC<RegisteredInterestedCarsPageProps> = ({
  onBackClick,
  onRemoveCar,
  onAddCar,
  interestedCars = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleRemoveCar = (carName: string) => {
    onRemoveCar?.(carName);
  };

  const handleAddCar = (vehicle: VehicleSearchResult) => {
    onAddCar?.(vehicle.displayName);
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
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">お気に入り車種</h1>
            <p className="text-sm text-gray-400">車種を検索・登録・管理</p>
          </div>
        </div>

        {/* 検索バー */}
        <div className="mb-6">
          <VehicleSearchBar
            onVehicleSelect={handleAddCar}
            placeholder="車種名を入力（例：カローラ、シビック、RX-7）..."
            className="w-full"
          />
        </div>

        {/* 登録済み車種一覧 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">登録済み車種</h2>
            <span className="text-sm text-gray-400">{interestedCars.length}台</span>
          </div>
          
          {interestedCars.length > 0 ? (
            interestedCars.map((carName) => (
              <InterestedCarCard
                key={carName}
                carName={carName}
                onRemove={handleRemoveCar}
                onClick={() => console.log('Car clicked:', carName)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <MotoIcon size={48} className="text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-white mb-2">登録済み車種がありません</div>
              <div className="text-sm text-gray-400">上記の検索バーからお気に入り車種を追加してみてください</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
