import { ArrowLeft, Car, Plus, Search } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { carModels } from '../data/dummy';

interface CarListPageProps {
  onBackClick: () => void;
  onAddCar: (carName: string) => void;
  interestedCars?: string[];
}

export const CarListPage: React.FC<CarListPageProps> = ({
  onBackClick,
  onAddCar,
  interestedCars = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddCar = (carName: string) => {
    onAddCar(carName);
  };

  const filteredCars = carModels.filter(carName =>
    carName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

              <main className="p-4 pb-24 pt-0 fade-in">
        {/* ヘッダー */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">車種一覧</h1>
        </div>

        {/* 検索バー */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="車種を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all duration-300"
            />
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mb-6">
          <div className="bg-surface rounded-xl p-4 border border-surface-light transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">登録状況</h3>
                <p className="text-xs text-gray-400">{interestedCars.length}台登録中</p>
              </div>
              <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Car size={20} className="text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* 車種リスト */}
        <div className="space-y-2">
          {filteredCars.map((carName) => {
            const isRegistered = interestedCars.includes(carName);
            return (
              <div
                key={carName}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 fade-in hover:scale-105 ${
                  isRegistered
                    ? 'bg-primary bg-opacity-20 border-primary border-opacity-30'
                    : 'bg-surface border-surface-light hover:bg-surface-light'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <Car size={20} className="text-primary transition-all duration-300" />
                  </div>
                  <span className="text-white font-medium transition-all duration-300">{carName}</span>
                </div>
                {!isRegistered && (
                  <button
                    onClick={() => handleAddCar(carName)}
                    className="p-2 rounded-lg bg-primary hover:bg-primary-dark transition-all duration-300 hover:scale-110 icon-button"
                  >
                    <Plus size={16} className="text-white transition-all duration-300" />
                  </button>
                )}
                {isRegistered && (
                  <span className="text-sm text-primary transition-all duration-300">登録済み</span>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
