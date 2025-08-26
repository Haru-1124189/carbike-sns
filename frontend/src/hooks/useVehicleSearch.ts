import { useCallback, useEffect, useMemo, useState } from 'react';
import { UnifiedVehicleModel, VehicleSearchResult } from '../types/vehicle';

// 車種データを読み込む関数
const loadVehicleData = async (): Promise<UnifiedVehicleModel[]> => {
  try {
    const response = await fetch('/export/unified_models.jsonl');
    if (!response.ok) {
      throw new Error('Failed to load vehicle data');
    }
    const text = await response.text();
    const lines = text.trim().split('\n');
    return lines.map(line => JSON.parse(line)) as UnifiedVehicleModel[];
  } catch (error) {
    console.error('Error loading vehicle data:', error);
    return [];
  }
};

// 車種検索用のカスタムフック
export const useVehicleSearch = () => {
  const [vehicleData, setVehicleData] = useState<UnifiedVehicleModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 車種データを読み込む
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await loadVehicleData();
        setVehicleData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicle data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 検索結果を計算
  const searchResults = useMemo((): VehicleSearchResult[] => {
    if (!searchQuery.trim() || vehicleData.length === 0) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const results: VehicleSearchResult[] = [];

    vehicleData.forEach((vehicle) => {
      const makerName = vehicle.maker_display;
      const modelName = vehicle.model.name_ja || vehicle.model.name_en || vehicle.model.id_name;
      
      // メーカー名で検索
      const makerMatch = makerName.toLowerCase().includes(query) ||
        vehicle.maker.aliases.some(alias => alias.toLowerCase().includes(query));
      
      // モデル名で検索
      const modelMatch = modelName.toLowerCase().includes(query) ||
        vehicle.model.aliases.some(alias => alias.toLowerCase().includes(query));
      
      // 完全な車種名で検索
      const fullName = `${makerName} ${modelName}`.toLowerCase();
      const fullNameMatch = fullName.includes(query);

      if (makerMatch || modelMatch || fullNameMatch) {
        results.push({
          id: vehicle.id,
          maker: makerName,
          model: modelName,
          displayName: `${makerName} ${modelName}`,
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
    return results.sort((a, b) => {
      const aExact = a.displayName.toLowerCase() === query;
      const bExact = b.displayName.toLowerCase() === query;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return a.displayName.length - b.displayName.length;
    }).slice(0, 20); // 最大20件まで表示
  }, [vehicleData, searchQuery]);

  // 検索クエリをクリア
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    clearSearch,
    isSearching: searchQuery.trim().length > 0
  };
};
