import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../firebase/init';
import { Car, CarApplicationForm, CarApplicationResult, CarYearRange } from '../types/car';
import { generateAliases, normalizeCarName } from './carNormalization';
import { addYearRange, hasGapsInRanges, isValidYearRange } from './carYearRange';

const CARS_COLLECTION = 'cars';

/**
 * 車種ドキュメントのIDを生成（normalized_name）
 */
function generateCarId(normalizedName: string): string {
  return normalizedName;
}

/**
 * 既存の車種を検索
 */
export async function findExistingCar(normalizedName: string): Promise<Car | null> {
  try {
    const carDoc = await getDoc(doc(db, CARS_COLLECTION, normalizedName));
    
    if (carDoc.exists()) {
      const data = carDoc.data();
      return {
        id: carDoc.id,
        ...data,
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
      } as Car;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding existing car:', error);
    throw new Error('車種の検索に失敗しました');
  }
}

/**
 * 車種のエイリアスで検索
 */
export async function findCarByAlias(alias: string): Promise<Car | null> {
  try {
    const q = query(
      collection(db, CARS_COLLECTION),
      where('aliases', 'array-contains', alias),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
      } as Car;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding car by alias:', error);
    throw new Error('車種の検索に失敗しました');
  }
}

/**
 * 新しい車種を作成
 */
export async function createNewCar(
  makerName: string,
  modelName: string,
  yearRange: CarYearRange
): Promise<Car> {
  const normalization = normalizeCarName(makerName, modelName);
  const aliases = generateAliases(makerName, modelName);
  
  const newCar: Omit<Car, 'id'> = {
    display_name: normalization.displayName,
    maker_name: makerName,
    normalized_name: normalization.normalizedName,
    aliases,
    ranges: [yearRange],
    is_incomplete: true, // 新規作成時は常に不完全としてマーク
    created_at: new Date(),
    updated_at: new Date(),
  };
  
  const carId = generateCarId(normalization.normalizedName);
  
  try {
    await setDoc(doc(db, CARS_COLLECTION, carId), {
      ...newCar,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    
    return {
      id: carId,
      ...newCar,
    };
  } catch (error) {
    console.error('Error creating new car:', error);
    throw new Error('車種の作成に失敗しました');
  }
}

/**
 * 既存の車種に年式レンジを追加
 */
export async function addYearRangeToExistingCar(
  existingCar: Car,
  newYearRange: CarYearRange
): Promise<Car> {
  // 新しい年式レンジを追加
  const updatedRanges = addYearRange(existingCar.ranges, newYearRange);
  
  // 空白があるかチェック
  const hasGaps = hasGapsInRanges(updatedRanges);
  
  // エイリアスを更新（新しいバリエーションを追加）
  const modelName = existingCar.display_name.replace(`${existingCar.maker_name} `, '');
  const newAliases = generateAliases(
    existingCar.maker_name,
    modelName
  );
  
  const updatedCar: Partial<Car> = {
    ranges: updatedRanges,
    is_incomplete: hasGaps,
    aliases: newAliases,
    updated_at: new Date(),
  };
  
  try {
    await updateDoc(doc(db, CARS_COLLECTION, existingCar.id), {
      ...updatedCar,
      updated_at: serverTimestamp(),
    });
    
    return {
      ...existingCar,
      ...updatedCar,
    };
  } catch (error) {
    console.error('Error updating existing car:', error);
    throw new Error('車種の更新に失敗しました');
  }
}

/**
 * 車種申請を処理（メイン関数）
 */
export async function processCarApplication(
  formData: CarApplicationForm
): Promise<CarApplicationResult> {
  // バリデーション
  if (!formData.maker_name.trim() || !formData.model_name.trim()) {
    return {
      success: false,
      message: 'メーカー名とモデル名は必須です',
    };
  }
  
  const yearRange: CarYearRange = {
    start_year: formData.start_year,
    start_month: formData.start_month,
    end_year: formData.end_year,
    end_month: formData.end_month,
  };
  
  if (!isValidYearRange(yearRange)) {
    return {
      success: false,
      message: '年式の範囲が無効です（開始年月が終了年月より後になっています）',
    };
  }
  
  try {
    // トランザクションで処理
    const result = await runTransaction(db, async (transaction) => {
      // 正規化
      const normalization = normalizeCarName(formData.maker_name, formData.model_name);
      
      // 既存車種を検索
      const carRef = doc(db, CARS_COLLECTION, normalization.normalizedName);
      const carDoc = await transaction.get(carRef);
      
      if (carDoc.exists()) {
        // 既存車種が見つかった場合
        const existingCar = carDoc.data() as Car;
        
        // 重複チェック
        const isDuplicate = existingCar.ranges.some(existingRange =>
          existingRange.start_year === yearRange.start_year &&
          existingRange.start_month === yearRange.start_month &&
          existingRange.end_year === yearRange.end_year &&
          existingRange.end_month === yearRange.end_month
        );
        
        if (isDuplicate) {
          throw new Error('既に登録済みの車種・年式です');
        }
        
        // 年式レンジを追加
        const updatedRanges = addYearRange(existingCar.ranges, yearRange);
        const hasGaps = hasGapsInRanges(updatedRanges);
        
        // エイリアスを更新
        const modelName = existingCar.display_name.replace(`${existingCar.maker_name} `, '');
        const newAliases = generateAliases(
          existingCar.maker_name,
          modelName
        );
        
        const updatedCar = {
          ...existingCar,
          ranges: updatedRanges,
          is_incomplete: hasGaps,
          aliases: newAliases,
          updated_at: serverTimestamp(),
        };
        
        transaction.update(carRef, updatedCar);
        
        return {
          success: true,
          message: '年式レンジが追加されました',
          car: updatedCar,
          isNewCar: false,
          isRangeAdded: true,
        };
      } else {
        // 新規車種を作成
        const aliases = generateAliases(
          formData.maker_name,
          formData.model_name
        );
        
        const newCar = {
          display_name: normalization.displayName,
          maker_name: formData.maker_name,
          normalized_name: normalization.normalizedName,
          aliases,
          ranges: [yearRange],
          is_incomplete: true, // 新規作成時は常に不完全
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        };
        
        transaction.set(carRef, newCar);
        
        return {
          success: true,
          message: '新しい車種が作成されました',
          car: { id: normalization.normalizedName, ...newCar },
          isNewCar: true,
          isRangeAdded: false,
        };
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error processing car application:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    
    return {
      success: false,
      message: '車種申請の処理に失敗しました',
    };
  }
}

/**
 * 全ての車種を取得
 */
export async function getAllCars(): Promise<Car[]> {
  try {
    const q = query(
      collection(db, CARS_COLLECTION),
      orderBy('maker_name'),
      orderBy('display_name')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
      } as Car;
    });
  } catch (error) {
    console.error('Error getting all cars:', error);
    throw new Error('車種一覧の取得に失敗しました');
  }
}

/**
 * メーカー名で車種を検索
 */
export async function getCarsByMaker(makerName: string): Promise<Car[]> {
  try {
    const q = query(
      collection(db, CARS_COLLECTION),
      where('maker_name', '==', makerName),
      orderBy('display_name')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
      } as Car;
    });
  } catch (error) {
    console.error('Error getting cars by maker:', error);
    throw new Error('車種の検索に失敗しました');
  }
}

/**
 * 車種を検索（部分一致）
 */
export async function searchCars(searchTerm: string): Promise<Car[]> {
  try {
    const normalizedTerm = normalizeCarName('', searchTerm).normalizedName.replace('_', '');
    
    // エイリアスで検索
    const q = query(
      collection(db, CARS_COLLECTION),
      where('aliases', 'array-contains-any', [searchTerm, normalizedTerm]),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
      } as Car;
    });
  } catch (error) {
    console.error('Error searching cars:', error);
    throw new Error('車種の検索に失敗しました');
  }
}

/**
 * 不完全な車種を取得
 */
export async function getIncompleteCars(): Promise<Car[]> {
  try {
    const q = query(
      collection(db, CARS_COLLECTION),
      where('is_incomplete', '==', true),
      orderBy('updated_at', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
      } as Car;
    });
  } catch (error) {
    console.error('Error getting incomplete cars:', error);
    throw new Error('不完全な車種の取得に失敗しました');
  }
}

/**
 * 車種の完全性を更新
 */
export async function updateCarCompleteness(carId: string, isComplete: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, CARS_COLLECTION, carId), {
      is_incomplete: !isComplete,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating car completeness:', error);
    throw new Error('車種の完全性更新に失敗しました');
  }
}
