import { Car, ChevronDown, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Car as CarType } from '../../types/car';
import { searchCars } from '../../utils/carFirestore';
import { normalizeCarName } from '../../utils/carNormalization';

interface CarTagSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onCarSelect: (car: CarType, yearRange?: any) => void;
  placeholder?: string;
}

export const CarTagSelector: React.FC<CarTagSelectorProps> = ({
  value,
  onChange,
  onCarSelect,
  placeholder = "車名を入力"
}) => {
  const [searchResults, setSearchResults] = useState<CarType[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
  const [showYearRanges, setShowYearRanges] = useState(false);

  // 車名検索のデバウンス処理
  useEffect(() => {
    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        // 入力された車名を正規化して検索
        const normalized = normalizeCarName('', value);
        const results = await searchCars(normalized.normalizedName);
        setSearchResults(results);
        setShowResults(results.length > 0);
      } catch (error) {
        console.error('車種検索エラー:', error);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleCarSelect = useCallback((car: CarType) => {
    setSelectedCar(car);
    setShowYearRanges(true);
    setShowResults(false);
  }, []);

  const handleYearRangeSelect = useCallback((car: CarType, yearRange: any) => {
    // 車名と年式レンジを含むタグを作成
    const tagName = `${car.display_name} ${yearRange.start_year}.${yearRange.start_month}-${yearRange.end_year}.${yearRange.end_month}`;
    onCarSelect(car, yearRange);
    onChange(tagName);
    setSelectedCar(null);
    setShowYearRanges(false);
  }, [onCarSelect, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setSelectedCar(null);
    setShowYearRanges(false);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // 少し遅延させてクリックイベントが発火するようにする
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  return (
    <div className="relative">
      {/* 入力フィールド */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full bg-transparent border border-surface-light rounded-lg p-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary text-sm"
          placeholder={placeholder}
          maxLength={50}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
        {!loading && value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSelectedCar(null);
              setShowYearRanges(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 検索結果ドロップダウン */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-surface-light rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {searchResults.map((car) => (
            <button
              key={car.id}
              type="button"
              onClick={() => handleCarSelect(car)}
              className="w-full px-3 py-2 text-left hover:bg-surface-light transition-colors border-b border-surface-light last:border-b-0"
            >
              <div className="flex items-center space-x-2">
                <Car size={14} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">
                    {car.display_name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {car.ranges.length}個の年式レンジ
                  </div>
                </div>
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 年式レンジ選択モーダル */}
      {showYearRanges && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-surface-light rounded-lg w-full max-w-md max-h-96 overflow-hidden">
            {/* ヘッダー */}
            <div className="p-4 border-b border-surface-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Car size={16} className="text-primary" />
                  <h3 className="text-white font-medium">{selectedCar.display_name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowYearRanges(false);
                    setSelectedCar(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 年式レンジ一覧 */}
            <div className="p-4 max-h-64 overflow-y-auto">
              {selectedCar.ranges.length > 0 ? (
                <div className="space-y-2">
                  {selectedCar.ranges.map((yearRange, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleYearRangeSelect(selectedCar, yearRange)}
                      className="w-full p-3 bg-surface-light border border-surface-light rounded-lg hover:bg-primary/20 hover:border-primary/30 transition-colors text-left"
                    >
                      <div className="text-sm text-white font-medium">
                        {yearRange.start_year}年{yearRange.start_month}月 - {yearRange.end_year}年{yearRange.end_month}月
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        タグ: {selectedCar.display_name} {yearRange.start_year}.{yearRange.start_month}-{yearRange.end_year}.{yearRange.end_month}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">年式レンジが登録されていません</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
