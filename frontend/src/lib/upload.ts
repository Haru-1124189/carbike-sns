import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase/init';

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

// Firebase Storageに画像をアップロードする関数
const uploadImageToFirebaseStorage = async (file: File, userId: string, isProfileImage: boolean = false, isMaintenanceImage: boolean = false): Promise<string> => {
  try {
    // プロフィール画像の場合は小さくリサイズ
    let processedFile = file;
    
    if (isProfileImage && file.size > 100 * 1024) {
      // プロフィール画像は150x150にリサイズ
      const resizedBlob = await resizeImage(file, 150, 150, 0.6);
      processedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
    } else if (file.size > 512 * 1024) {
      // 512KB以上の画像は600x400にリサイズ
      const resizedBlob = await resizeImage(file, 600, 400, 0.7);
      processedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
    }
    
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    
    // Firebase Storageのパスを決定
    let storagePath: string;
    if (isProfileImage) {
      storagePath = `profile-images/${userId}/${fileName}`;
    } else if (isMaintenanceImage) {
      storagePath = `maintenance-images/${userId}/${fileName}`;
    } else {
      storagePath = `post-images/${userId}/${fileName}`;
    }
    
    const storageRef = ref(storage, storagePath);
    
    // ファイルをアップロード
    const snapshot = await uploadBytes(storageRef, processedFile);
    
    // ダウンロードURLを取得
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Image uploaded to Firebase Storage:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
};

// Firebase Storageに動画やバイナリをアップロードする関数（リサイズなし）
const uploadBinaryToFirebaseStorage = async (file: File, userId: string, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const isVideo = file.type.startsWith('video/');
    const storagePath = isVideo ? `videos/${userId}/${fileName}` : `files/${userId}/${fileName}`;
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file);
    await new Promise<void>((resolve, reject) => {
      task.on('state_changed', (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
        onProgress?.(pct);
      }, reject, resolve);
    });
    const downloadURL = await getDownloadURL(task.snapshot.ref);
    console.log('Binary uploaded to Firebase Storage:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading binary to Firebase Storage:', error);
    throw error;
  }
};

// フォールバック用のローカルストレージ関数
const saveToLocalStorage = async (file: File, userId: string, isProfileImage: boolean = false, isMaintenanceImage: boolean = false): Promise<string> => {
  try {
    // プロフィール画像の場合は小さくリサイズ
    let processedFile = file;
    
    if (isProfileImage && file.size > 100 * 1024) {
      const resizedBlob = await resizeImage(file, 150, 150, 0.6);
      processedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
    } else if (file.size > 512 * 1024) {
      const resizedBlob = await resizeImage(file, 600, 400, 0.7);
      processedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
    }
    
    // Base64に変換
    const base64Data = await fileToBase64(processedFile);
    
    const timestamp = Date.now();
    const key = `local_image_${userId}_${timestamp}`;
    
    // ローカルストレージにBase64データを保存
    localStorage.setItem(key, JSON.stringify({
      base64: base64Data,
      name: processedFile.name,
      size: processedFile.size,
      type: processedFile.type,
      timestamp: timestamp,
      isProfileImage: isProfileImage
    }));
    
    console.log('Image saved as Base64 to localStorage:', key);
    
    return base64Data;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    throw error;
  }
};

// ファイルをBase64に変換する関数
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const uploadToStorage = async (userId: string, file: File, isProfileImage: boolean = false, isMaintenanceImage: boolean = false, onProgress?: (progress: number) => void): Promise<string> => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  try {
    console.log('Attempting to upload to Firebase Storage...');
    if (isImage) {
      return await uploadImageToFirebaseStorage(file, userId, isProfileImage, isMaintenanceImage);
    }
    // 動画/その他はそのままアップロード
    if (isVideo || !isImage) {
      return await uploadBinaryToFirebaseStorage(file, userId, onProgress);
    }
    // フォールバックで画像扱い
    return await uploadImageToFirebaseStorage(file, userId, isProfileImage, isMaintenanceImage);
  } catch (error) {
    console.error('Firebase Storage upload failed:', error);
    // 画像のみローカルフォールバック、動画はフォールバックしない（再生不可のため）
    if (isImage) {
      return await saveToLocalStorage(file, userId, isProfileImage, isMaintenanceImage);
    }
    throw error;
  }
};
