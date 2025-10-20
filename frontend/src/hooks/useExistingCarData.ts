import { useCallback, useEffect, useState } from 'react';
import { Car } from '../types/car';
import {
    convertExistingCarData,
    ExistingCarData,
    getMakers,
    getModelsByMaker,
    groupCarDataByMaker,
    loadAllCarData,
    searchCarData
} from '../utils/carDataLoader';

interface UseExistingCarDataReturn {
  carData: ExistingCarData[];
  cars: Car[];
  makers: string[];
  groupedData: Record<string, ExistingCarData[]>;
  loading: boolean;
  error: string | null;
  searchCars: (searchTerm: string) => ExistingCarData[];
  getModels: (maker: string) => string[];
  refreshData: () => Promise<void>;
}

export function useExistingCarData(): UseExistingCarDataReturn {
  const [carData, setCarData] = useState<ExistingCarData[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [makers, setMakers] = useState<string[]>([]);
  const [groupedData, setGroupedData] = useState<Record<string, ExistingCarData[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await loadAllCarData();
      setCarData(data);
      
      // 新しいCar形式に変換
      const convertedCars = convertExistingCarData(data);
      setCars(convertedCars);
      
      // メーカー一覧を取得
      const makersList = getMakers(data);
      setMakers(makersList);
      
      // メーカー別にグループ化
      const grouped = groupCarDataByMaker(data);
      setGroupedData(grouped);
      
    } catch (err) {
      console.error('Error loading car data:', err);
      setError(err instanceof Error ? err.message : '車種データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCars = useCallback((searchTerm: string): ExistingCarData[] => {
    return searchCarData(carData, searchTerm);
  }, [carData]);

  const getModels = useCallback((maker: string): string[] => {
    return getModelsByMaker(carData, maker);
  }, [carData]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    carData,
    cars,
    makers,
    groupedData,
    loading,
    error,
    searchCars,
    getModels,
    refreshData,
  };
}
