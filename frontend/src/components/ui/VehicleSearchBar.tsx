import { Car, Loader2, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { UnifiedVehicleModel, VehicleSearchResult } from '../../types/vehicle';

interface VehicleSearchBarProps {
  onVehicleSelect?: (vehicle: VehicleSearchResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const VehicleSearchBar: React.FC<VehicleSearchBarProps> = ({
  onVehicleSelect,
  placeholder = '車種を検索...',
  className = '',
  disabled = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<VehicleSearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // 車種データを読み込む
  const [vehicleData, setVehicleData] = useState<UnifiedVehicleModel[]>([]);

  useEffect(() => {
    const loadVehicleData = async () => {
      try {
        // 統合された車種データを読み込む
        const response = await fetch('/export/unified_models.jsonl');
        if (response.ok) {
          const text = await response.text();
          const lines = text.trim().split('\n');
          const data = lines.map(line => JSON.parse(line)) as UnifiedVehicleModel[];
          setVehicleData(data);
        }
      } catch (error) {
        console.error('Error loading vehicle data:', error);
      }
    };

    loadVehicleData();
  }, []);

  // 検索処理
  useEffect(() => {
    if (!searchQuery.trim() || vehicleData.length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    
    // 検索処理を非同期で実行
    const timeoutId = setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      const results: VehicleSearchResult[] = [];

      vehicleData.forEach((vehicle) => {
        const makerName = vehicle.maker_display;
        const modelName = vehicle.model.name_ja || vehicle.model.name_en || vehicle.model.id_name;
        
        // メーカー名で検索（文字化け対応）
        const makerMatch = makerName.toLowerCase().includes(query) ||
          vehicle.maker.aliases.some((alias: string) => alias.toLowerCase().includes(query));
        
        // モデル名で検索（文字化け対応）
        const modelMatch = modelName.toLowerCase().includes(query) ||
          vehicle.model.aliases.some((alias: string) => alias.toLowerCase().includes(query));
        
        // 完全な車種名で検索
        const fullName = `${makerName} ${modelName}`.toLowerCase();
        const fullNameMatch = fullName.includes(query);

        // エイリアスでの検索（文字化け対応）
        const aliasMatch = vehicle.model.aliases.some((alias: string) => {
          const aliasLower = alias.toLowerCase();
          return aliasLower.includes(query);
        });

        if (makerMatch || modelMatch || fullNameMatch || aliasMatch) {
          // 表示名を正規化（文字化けを修正）
          let displayMakerName = makerName;
          let displayModelName = modelName;
          
          // スズキの文字化け修正
          if (makerName.includes('ススキ') || makerName.includes('スズキ')) {
            displayMakerName = 'スズキ';
          }
          
          // エイリアスから正しい車種名を取得
          const aliasMatch = vehicle.model.aliases.find(alias => {
            const aliasLower = alias.toLowerCase();
            return aliasLower.includes(query);
          });
          
          if (aliasMatch) {
            // エイリアスから車種名を抽出
            const aliasLower = aliasMatch.toLowerCase();
            
            // 主要な車種名の正規化
            const modelNameMap: { [key: string]: string } = {
              'スイフト': 'スイフト',
              'スイフトスポーツ': 'スイフトスポーツ',
              'アルト': 'アルト',
              'ジムニー': 'ジムニー',
              'ワゴンr': 'ワゴンR',
              'フロンテ': 'フロンテ',
              'エスクード': 'エスクード',
              'ビターラ': 'ビターラ',
              'ソリオ': 'ソリオ',
              'スペーシア': 'スペーシア',
              'ハスラー': 'ハスラー',
              'イグニス': 'イグニス',
              'カプチーノ': 'カプチーノ',
              'カルタス': 'カルタス',
              'セレリオ': 'セレリオ',
              'セルボ': 'セルボ',
              'スプラッシュ': 'スプラッシュ',
              'スズライト': 'スズライト',
              'バレーノ': 'バレーノ',
              'パレット': 'パレット',
              'フロンクス': 'フロンクス',
              'クロスビー': 'クロスビー',
              'アヴェニス': 'アヴェニス',
              'アルトラパン': 'アルトラパン',
              'ヴェローナ': 'ヴェローナ',
              'グラディウス': 'グラディウス',
              'グランドエスクード': 'グランドエスクード',
              'グランドビターラ': 'グランドビターラ',
              'シアズ': 'シアズ',
              'ジェベル': 'ジェベル',
              'サベージ': 'サベージ',
              'キザシ': 'キザシ',
              'ガンマ': 'ガンマ',
              'カルタスクレセント': 'カルタスクレセント',
              'カリムン': 'カリムン',
              'カタナ': 'カタナ',
              'エリオ': 'エリオ',
              'ウルフ': 'ウルフ',
              'イントルーダー': 'イントルーダー',
              'イナズマ': 'イナズマ',
              'アルト800': 'アルト800',
              'eビターラ': 'eビターラ'
            };
            
            // マップから車種名を検索（長い車種名を優先）
            const matchedModels = Object.entries(modelNameMap)
              .filter(([key, value]) => aliasLower.includes(key))
              .sort(([a], [b]) => b.length - a.length); // 長い車種名を優先
            
            if (matchedModels.length > 0) {
              displayModelName = matchedModels[0][1];
            }
          }

          results.push({
            id: vehicle.id,
            maker: displayMakerName,
            model: displayModelName,
            displayName: `${displayMakerName} ${displayModelName}`,
            years: vehicle.years.start || vehicle.years.end ? {
              start: vehicle.years.start || undefined,
              end: vehicle.years.end || undefined
            } : undefined,
            aliases: [
              ...vehicle.maker.aliases,
              ...vehicle.model.aliases
            ]
          });
        }
      });

      // 結果をソート（完全一致を優先、その後は文字列長でソート）
      const sortedResults = results.sort((a, b) => {
        const aExact = a.displayName.toLowerCase() === query;
        const bExact = b.displayName.toLowerCase() === query;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return a.displayName.length - b.displayName.length;
      }).slice(0, 10); // 最大10件まで表示

      setSearchResults(sortedResults);
      setShowResults(true);
      setIsLoading(false);
    }, 300); // 300msのデバウンス

    return () => clearTimeout(timeoutId);
  }, [searchQuery, vehicleData]);

  // 外部クリックで結果を閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVehicleSelect = (vehicle: VehicleSearchResult) => {
    setSearchQuery(vehicle.displayName);
    setShowResults(false);
    onVehicleSelect?.(vehicle);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  const formatYears = (years?: { start?: number; end?: number }) => {
    if (!years) return '';
    if (years.start && years.end) {
      return `(${years.start}-${years.end})`;
    }
    if (years.start) {
      return `(${years.start}-)`;
    }
    if (years.end) {
      return `(-${years.end})`;
    }
    return '';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2 bg-surface border border-surface-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 size={16} className="text-gray-400 animate-spin" />
          </div>
        )}
        {searchQuery && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-surface-light rounded-full transition-colors"
          >
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* 検索結果 */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-surface-light rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {searchResults.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => handleVehicleSelect(vehicle)}
              className="w-full px-4 py-3 text-left hover:bg-surface-light transition-colors border-b border-surface-light last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Car size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">
                    {vehicle.displayName}
                  </div>
                  {vehicle.years && (
                    <div className="text-sm text-gray-400">
                      {formatYears(vehicle.years)}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 検索結果なし */}
      {showResults && searchQuery.trim() && !isLoading && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-surface-light rounded-lg shadow-lg z-50 p-4">
          <div className="text-gray-400 text-center">
            該当する車種が見つかりませんでした
          </div>
        </div>
      )}
    </div>
  );
};
