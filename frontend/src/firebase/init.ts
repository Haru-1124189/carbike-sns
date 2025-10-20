import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 開発環境でのみ環境変数の読み込み状況をデバッグ
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase environment variables loaded successfully');
}

// 環境変数から設定を読み込み
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// 認証状態をローカルストレージに永続化
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Auth persistence set to local');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

// NOTE: 機微情報をログに出さない
if (process.env.NODE_ENV !== 'production') {
  // 最小限のヘルスチェックのみ
  // eslint-disable-next-line no-console
  console.log('Firebase initialized');
}
