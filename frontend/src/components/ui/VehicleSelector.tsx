import { Bike, Car, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { VehicleModel } from '../../types/vehicleData';
import { VehicleDataService } from '../../utils/vehicleData';

interface VehicleSelectorProps {
  selectedVehicle: VehicleModel | null;
  onVehicleSelect: (vehicle: VehicleModel | null) => void;
  vehicleType?: 'car' | 'motorcycle' | 'all';
  placeholder?: string;
  className?: string;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedVehicle,
  onVehicleSelect,
  vehicleType = 'all',
  placeholder = '車種を検索...',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VehicleModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allModels, setAllModels] = useState<VehicleModel[]>([]);

  // 初期データ読み込み
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const models = await VehicleDataService.getAllVehicleModels();
        setAllModels(models);
      } catch (error) {
        console.error('Failed to load vehicle models:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 検索処理
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await VehicleDataService.searchVehicleModels(
          searchQuery, 
          vehicleType === 'all' ? undefined : vehicleType
        );
        setSearchResults(results.slice(0, 10)); // 最大10件まで表示
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, vehicleType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleVehicleSelect = (vehicle: VehicleModel) => {
    onVehicleSelect(vehicle);
    setSearchQuery(vehicle.displayName);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onVehicleSelect(null);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // 少し遅延させてドロップダウンのクリックイベントを処理
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 検索入力フィールド */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-4 py-3 pl-10 focus:outline-none focus:border-primary transition-colors"
        />
        
        {/* 検索アイコン */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search size={20} className="text-text-secondary" />
        </div>

        {/* クリアボタン */}
        {selectedVehicle && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* ドロップダウン */}
      {showDropdown && (searchQuery.trim() || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-surface-light rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              検索中...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((vehicle, index) => (
                <button
                  key={`${vehicle.displayName}-${index}`}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className="w-full px-4 py-3 text-left hover:bg-surface-light transition-colors flex items-center space-x-3"
                >
                  {vehicle.type === 'car' ? (
                    <Car size={16} className="text-blue-400" />
                  ) : (
                    <Bike size={16} className="text-green-400" />
                  )}
                  <div>
                    <div className="text-white font-medium">{vehicle.displayName}</div>
                    <div className="text-xs text-gray-400">
                      {vehicle.type === 'car' ? '車' : 'バイク'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="p-4 text-center text-gray-400">
              該当する車種が見つかりませんでした
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
