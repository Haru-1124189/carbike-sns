import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/clients';

/**
 * 現在のユーザーの車両データを詳細にデバッグ
 */
export const debugVehicleData = async (userId: string) => {
  try {
    console.log('=== 車両データデバッグ開始 ===');
    console.log('ユーザーID:', userId);
    
    // Firestoreから車両データを取得
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(vehiclesRef, where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    console.log('Firestore車両数:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('車両ID:', doc.id);
      console.log('車両データ:', data);
      console.log('画像データ:', {
        hasImage: !!data.image,
        imageType: typeof data.image,
        imageLength: data.image ? data.image.length : 0,
        isBase64: data.image ? data.image.startsWith('data:image') : false,
        isBlob: data.image ? data.image.startsWith('blob:') : false,
        imagePreview: data.image ? data.image.substring(0, 100) + '...' : 'なし'
      });
      console.log('---');
    });
    
    // ローカルストレージの確認
    console.log('=== ローカルストレージ確認 ===');
    const localKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('local_image_') || key.includes('vehicle'))) {
        localKeys.push(key);
        const value = localStorage.getItem(key);
        console.log('ローカルキー:', key);
        console.log('ローカル値:', value ? value.substring(0, 100) + '...' : 'なし');
      }
    }
    console.log('ローカルストレージ車両関連キー数:', localKeys.length);
    
    console.log('=== デバッグ完了 ===');
    
    return {
      firestoreCount: querySnapshot.size,
      localCount: localKeys.length,
      vehicles: querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }))
    };
  } catch (error) {
    console.error('デバッグエラー:', error);
    throw error;
  }
};

/**
 * 車両データをクリアしてリセット
 */
export const resetVehicleData = async (userId: string) => {
  try {
    console.log('=== 車両データリセット開始 ===');
    
    // ローカルストレージをクリア
    const localKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('local_image_') || key.includes('vehicle'))) {
        localKeys.push(key);
        localStorage.removeItem(key);
      }
    }
    console.log('ローカルストレージクリア完了:', localKeys.length, '件');
    
    // Firestoreから車両データを削除
    const { deleteDoc } = await import('firebase/firestore');
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(vehiclesRef, where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    console.log('Firestore車両データ削除完了:', querySnapshot.size, '件');
    
    console.log('=== リセット完了 ===');
    
    return {
      localCleared: localKeys.length,
      firestoreCleared: querySnapshot.size
    };
  } catch (error) {
    console.error('リセットエラー:', error);
    throw error;
  }
};
