import { Plus, Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { carList } from '../../data/dummy';

interface InterestedCarSelectorProps {
  selectedCars: string[];
  onAddCar: (carName: string) => void;
  onRemoveCar: (carName: string) => void;
  onClose: () => void;
}

export const InterestedCarSelector: React.FC<InterestedCarSelectorProps> = ({
  selectedCars,
  onAddCar,
  onRemoveCar,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // ブランド別に車種をグループ化
  const carBrands = useMemo(() => {
    const brands: Record<string, string[]> = {};
    carList.forEach(car => {
      const brand = car.split(' ')[0];
      if (!brands[brand]) {
        brands[brand] = [];
      }
      brands[brand].push(car);
    });
    return brands;
  }, []);

  // フィルタリングされた車種リスト
  const filteredCars = useMemo(() => {
    let cars = carList;
    
    // ブランドでフィルタリング
    if (selectedBrand !== 'all') {
      cars = cars.filter(car => car.startsWith(selectedBrand));
    }
    
    // 検索クエリでフィルタリング
    if (searchQuery) {
      cars = cars.filter(car => 
        car.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return cars;
  }, [selectedBrand, searchQuery]);

  const handleAddCar = (carName: string) => {
    if (!selectedCars.includes(carName)) {
      onAddCar(carName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-xl border border-surface-light w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-surface-light">
          <h2 className="text-lg font-bold text白">お気に入り車種を追加</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-light transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* 検索バー */}
        <div className="p-4 border-b border-surface-light">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="車種を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-4 py-3 pl-10 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* ブランドフィルター */}
        <div className="p-4 border-b border-surface-light">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedBrand === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-surface-light text-gray-400 hover:text-white'
              }`}
            >
              すべて
            </button>
            {Object.keys(carBrands).map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedBrand === brand
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-gray-400 hover:text-white'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* 車種リスト */}
        <div className="flex-1 overflow-y-auto max-h-96">
          <div className="p-4 space-y-2">
            {filteredCars.map((carName) => {
              const isSelected = selectedCars.includes(carName);
              return (
                <div
                  key={carName}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary bg-opacity-20 border-primary border-opacity-30'
                      : 'bg-surface-light border-surface-light hover:bg-surface-light hover:border-primary hover:border-opacity-30'
                  }`}
                  onClick={() => handleAddCar(carName)}
                >
                  <span className="text-white font-medium">{carName}</span>
                  {isSelected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCar(carName);
                      }}
                      className="p-1 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  ) : (
                    <Plus size={20} className="text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 選択済み車種 */}
        {selectedCars.length > 0 && (
          <div className="p-4 border-t border-surface-light">
            <h3 className="text-sm font-medium text-white mb-2">選択済み車種</h3>
            <div className="flex flex-wrap gap-2">
              {selectedCars.map((carName) => (
                <div
                  key={carName}
                  className="flex items-center space-x-2 px-3 py-2 bg-primary bg-opacity-20 border border-primary border-opacity-30 rounded-lg"
                >
                  <span className="text-sm text-white">{carName}</span>
                  <button
                    onClick={() => onRemoveCar(carName)}
                    className="p-1 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
