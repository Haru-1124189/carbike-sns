import { ArrowLeft } from 'lucide-react';
import { MotoIcon } from '../components/icons/MotoIcon';
import React from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { InterestedCarCard } from '../components/ui/InterestedCarCard';
import { currentUser } from '../data/dummy';

interface RegisteredInterestedCarsPageProps {
  onBackClick?: () => void;
  onRemoveCar?: (carName: string) => void;
  interestedCars?: string[];
}

export const RegisteredInterestedCarsPage: React.FC<RegisteredInterestedCarsPageProps> = ({
  onBackClick,
  onRemoveCar,
  interestedCars = []
}) => {
  const handleRemoveCar = (carName: string) => {
    onRemoveCar?.(carName);
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader
        user={currentUser}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-20 pt-0">
        {/* ヘッダー */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl hover:bg-surface-light transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">登録済み車種</h1>
            <p className="text-sm text-gray-400">お気に入り車種一覧</p>
          </div>
        </div>

        {/* 登録済み車種一覧 */}
        <div className="space-y-3">
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
              <div className="text-sm text-gray-400">お気に入り車種を追加してみてください</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
