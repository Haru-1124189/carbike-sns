import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { useAuth } from './useAuth';

export interface FavoriteCar {
    id: string;
    carName: string;
    carModel?: string;
    make?: string;
    model?: string;
    year?: number;
    yearRange?: string; // 年式レンジ（例: "2001.6-2005.8"）
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    // フィルタリング用の互換性フィールド
    name: string; // carNameのエイリアス
    selected_year_range_id?: string;
    selected_year_range?: {
        start_year: number;
        start_month: number;
        end_year: number;
        end_month: number;
    };
}

export const useFavoriteCars = () => {
    const [favoriteCars, setFavoriteCars] = useState<FavoriteCar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // お気に入り車種一覧を取得
    const fetchFavoriteCars = useCallback(async () => {
        if (!user?.uid) {
            setFavoriteCars([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const favoriteCarsRef = collection(db, 'favoriteCars');
            
            const q = query(
                favoriteCarsRef,
                where('userId', '==', user.uid)
            );
            
            const querySnapshot = await getDocs(q);
            
            const carList: FavoriteCar[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                carList.push({
                    id: doc.id,
                    carName: data.carName,
                    carModel: data.carModel,
                    make: data.make,
                    model: data.model,
                    year: data.year,
                    yearRange: data.yearRange,
                    imageUrl: data.imageUrl,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date(),
                    // フィルタリング用の互換性フィールド
                    name: data.carName,
                    selected_year_range_id: data.selected_year_range_id,
                    selected_year_range: data.selected_year_range
                });
            });
            
            setFavoriteCars(carList);
        } catch (err) {
            console.error('お気に入り車種データの取得に失敗しました:', err);
            setError('お気に入り車種データの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    // お気に入り車種を追加
    const addFavoriteCar = useCallback(async (carData: {
        carName: string;
        carModel?: string;
        make?: string;
        model?: string;
        year?: number;
        imageUrl?: string;
    }): Promise<string | null> => {
        if (!user?.uid) {
            throw new Error('ログインが必要です');
        }

        try {
            const favoriteCarsRef = collection(db, 'favoriteCars');
            
            const carDoc = {
                ...carData,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            const docRef = await addDoc(favoriteCarsRef, carDoc);

            // 新しいお気に入り車種をローカル状態に追加
            const newFavoriteCar: FavoriteCar = {
                id: docRef.id,
                carName: carData.carName,
                carModel: carData.carModel,
                make: carData.make,
                model: carData.model,
                year: carData.year,
                yearRange: undefined, // carDataにyearRangeが存在しない場合のデフォルト値
                imageUrl: carData.imageUrl,
                createdAt: new Date(),
                updatedAt: new Date(),
                // フィルタリング用の互換性フィールド
                name: carData.carName,
                selected_year_range_id: undefined, // carDataにselected_year_range_idが存在しない場合のデフォルト値
                selected_year_range: undefined // carDataにselected_year_rangeが存在しない場合のデフォルト値
            };
            
            setFavoriteCars(prev => [newFavoriteCar, ...prev]);
            
            return docRef.id;
        } catch (err) {
            console.error('お気に入り車種の追加に失敗しました:', err);
            throw new Error('お気に入り車種の追加に失敗しました');
        }
    }, [user?.uid]);

    // お気に入り車種を削除
    const removeFavoriteCar = useCallback(async (favoriteCarId: string): Promise<void> => {
        if (!user?.uid) {
            throw new Error('ログインが必要です');
        }

        try {
            const favoriteCarRef = doc(db, 'favoriteCars', favoriteCarId);
            await deleteDoc(favoriteCarRef);

            // ローカル状態を更新
            setFavoriteCars(prev => prev.filter(car => car.id !== favoriteCarId));
        } catch (err) {
            console.error('お気に入り車種の削除に失敗しました:', err);
            throw new Error('お気に入り車種の削除に失敗しました');
        }
    }, [user?.uid]);

    // 車種名の配列を取得（フィルタリング用）
    const getCarNames = useCallback((): string[] => {
        return favoriteCars.map(car => car.carName);
    }, [favoriteCars]);

    // 車種モデルの配列を取得（フィルタリング用）
    const getCarModels = useCallback((): string[] => {
        return favoriteCars
            .map(car => car.carModel || car.carName)
            .filter(Boolean);
    }, [favoriteCars]);

    // 初回読み込み
    useEffect(() => {
        fetchFavoriteCars();
    }, [fetchFavoriteCars]);

    return {
        favoriteCars,
        loading,
        error,
        addFavoriteCar,
        removeFavoriteCar,
        getCarNames,
        getCarModels,
        refetch: fetchFavoriteCars
    };
};
