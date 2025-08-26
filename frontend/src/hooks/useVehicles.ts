import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../firebase/clients';
import { Vehicle } from '../types';
import { useAuth } from './useAuth';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 車両一覧を取得
  const fetchVehicles = useCallback(async () => {
    if (!user?.uid) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const vehiclesRef = collection(db, 'vehicles');
      
      const q = query(
        vehiclesRef,
        where('ownerId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      const vehicleList: Vehicle[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vehicleList.push({
          id: doc.id,
          ...data
        } as Vehicle);
      });
      
      setVehicles(vehicleList);
    } catch (err) {
      console.error('車両データの取得に失敗しました:', err);
      setError('車両データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // 車両を追加
  const addVehicle = useCallback(async (vehicleData: {
    name: string;
    type: 'car' | 'bike';
    image?: string;
    year?: number;
    make?: string;
    model?: string;
    customContent?: string;
  }): Promise<string | null> => {
    if (!user?.uid) {
      throw new Error('ログインが必要です');
    }

    try {
      const vehiclesRef = collection(db, 'vehicles');
      
      // undefinedの値を除外
      const cleanVehicleData = Object.fromEntries(
        Object.entries(vehicleData).filter(([_, value]) => value !== undefined)
      );
      
      const vehicleDoc = {
        ...cleanVehicleData,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(vehiclesRef, vehicleDoc);

      // 新しい車両をローカル状態に追加（即座に反映）
      const newVehicle: Vehicle = {
        id: docRef.id,
        name: cleanVehicleData.name as string,
        type: cleanVehicleData.type as 'car' | 'bike',
        image: cleanVehicleData.image as string | undefined,
        year: cleanVehicleData.year as number | undefined,
        make: cleanVehicleData.make as string | undefined,
        model: cleanVehicleData.model as string | undefined,
        customContent: cleanVehicleData.customContent as string | undefined,
        ownerId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setVehicles(prev => [newVehicle, ...prev]);
      
      return docRef.id;
    } catch (err) {
      console.error('車両の追加に失敗しました:', err);
      console.error('エラーの詳細:', {
        message: err instanceof Error ? err.message : String(err),
        code: (err as any)?.code,
        stack: err instanceof Error ? err.stack : undefined
      });
      throw new Error(`車両の追加に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [user?.uid]);

  // 車両を更新
  const updateVehicle = useCallback(async (vehicleId: string, updates: Partial<Vehicle>): Promise<void> => {
    if (!user?.uid) {
      throw new Error('ログインが必要です');
    }

    try {
      const vehicleRef = doc(db, 'vehicles', vehicleId);
      await updateDoc(vehicleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // ローカル状態を更新
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, ...updates, updatedAt: new Date() }
          : vehicle
      ));
    } catch (err) {
      console.error('車両の更新に失敗しました:', err);
      throw new Error('車両の更新に失敗しました');
    }
  }, [user?.uid]);

  // 車両を削除
  const deleteVehicle = useCallback(async (vehicleId: string): Promise<void> => {
    if (!user?.uid) {
      throw new Error('ログインが必要です');
    }

    try {
      const vehicleRef = doc(db, 'vehicles', vehicleId);
      await deleteDoc(vehicleRef);

      // ローカル状態を更新
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
    } catch (err) {
      console.error('車両の削除に失敗しました:', err);
      throw new Error('車両の削除に失敗しました');
    }
  }, [user?.uid]);

  // 初回読み込み
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refetch: fetchVehicles
  };
};
