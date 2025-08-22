import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase/clients';

// 画像をプリロードする関数
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to preload image'));
    img.src = url;
  });
};

// 画像をリサイズする関数
const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // アスペクト比を保持しながらリサイズ
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', quality);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// ローカルストレージに画像を保存する関数（高速版）
const saveToLocalStorage = async (file: File, userId: string, isProfileImage: boolean = false): Promise<string> => {
  try {
    // プロフィール画像の場合は小さくリサイズ
    let processedFile = file;
    
    if (isProfileImage && file.size > 100 * 1024) {
      // プロフィール画像は150x150にリサイズ（さらに小さく）
      const resizedBlob = await resizeImage(file, 150, 150, 0.6);
      processedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
    } else if (file.size > 512 * 1024) {
      // 512KB以上の画像は600x400にリサイズ
      const resizedBlob = await resizeImage(file, 600, 400, 0.7);
      processedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
    }
    
    const timestamp = Date.now();
    const key = `local_image_${userId}_${timestamp}`;
    const url = URL.createObjectURL(processedFile);
    
    // ローカルストレージにメタデータを保存
    localStorage.setItem(key, JSON.stringify({
      url: url,
      name: processedFile.name,
      size: processedFile.size,
      type: processedFile.type,
      timestamp: timestamp,
      isProfileImage: isProfileImage
    }));
    
    // 画像をプリロードして表示速度を向上
    try {
      await preloadImage(url);
    } catch (error) {
      console.warn('Failed to preload image:', error);
    }
    
    return url;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    // エラーの場合は元のファイルをそのまま使用
    return URL.createObjectURL(file);
  }
};

export const uploadToStorage = async (userId: string, file: File, isProfileImage: boolean = false): Promise<string> => {
  try {
    // プロフィール画像の場合はローカルストレージを優先使用
    if (isProfileImage) {
      console.log('Using local storage for profile image (fast mode)');
      return await saveToLocalStorage(file, userId, true);
    }
    
    // 通常の画像の場合も、まずローカルストレージに保存してからFirebaseにアップロード
    const localUrl = await saveToLocalStorage(file, userId, false);
    
    // Firebaseへのアップロードは非同期で実行（バックグラウンド）
    uploadToFirebase(userId, file).catch(error => {
      console.warn('Firebase upload failed, but local storage is available:', error);
    });
    
    return localUrl;
  } catch (error) {
    console.error('Error in uploadToStorage:', error);
    // エラーの場合はローカルストレージに保存
    return await saveToLocalStorage(file, userId, isProfileImage);
  }
};

// Firebaseへのアップロード（バックグラウンド処理）
const uploadToFirebase = async (userId: string, file: File): Promise<string> => {
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
    
    console.log('Firebase upload successful:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw error;
  }
};
