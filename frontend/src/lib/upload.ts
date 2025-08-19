import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase/clients';

export const uploadToStorage = async (userId: string, file: File): Promise<string> => {
  try {
    // ファイル名をユニークにするためのタイムスタンプを追加
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}_${file.name}`;
    
    // Storageの参照を作成
    const storageRef = ref(storage, `uploads/${userId}/${fileName}`);
    
    // ファイルをアップロード
    const snapshot = await uploadBytes(storageRef, file);
    
    // ダウンロードURLを取得
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
