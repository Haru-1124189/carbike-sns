import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/clients';

/**
 * ローカルストレージの車両関連データをクリア
 */
export const clearLocalVehicleData = () => {
  const keysToRemove: string[] = [];
  
  // ローカルストレージから車両関連のキーを検索
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('local_image_') || 
      key.includes('vehicle') ||
      key.includes('blob') ||
      key.includes('image')
    )) {
      keysToRemove.push(key);
    }
  }
  
  // 見つかったキーを削除
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('Removed from localStorage:', key);
  });
  
  console.log(`Cleared ${keysToRemove.length} vehicle-related items from localStorage`);
};

/**
 * Firestoreの車両データをクリア（現在のユーザーのみ）
 */
export const clearFirestoreVehicleData = async (userId: string) => {
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(vehiclesRef, where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'vehicles', docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    console.log(`Cleared ${querySnapshot.size} vehicles from Firestore for user: ${userId}`);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error clearing Firestore vehicle data:', error);
    throw error;
  }
};

/**
 * すべての車両データをクリア
 */
export const clearAllVehicleData = async (userId?: string) => {
  // ローカルストレージをクリア
  clearLocalVehicleData();
  
  // Firestoreをクリア（ユーザーIDが提供されている場合）
  if (userId) {
    await clearFirestoreVehicleData(userId);
  }
  
  console.log('All vehicle data cleared successfully');
};

/**
 * Blob URLを含むすべての古いデータをクリア
 */
export const clearAllImageData = () => {
  const keysToRemove: string[] = [];
  
  // すべてのローカルストレージキーをチェック
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value && (
        value.includes('blob:') ||
        value.includes('local_image_') ||
        value.includes('vehicle') ||
        value.includes('image')
      )) {
        keysToRemove.push(key);
      }
    }
  }
  
  // 見つかったキーを削除
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('Removed old data from localStorage:', key);
  });
  
  console.log(`Cleared ${keysToRemove.length} old image-related items from localStorage`);
};
