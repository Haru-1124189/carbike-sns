import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 直接Firebase設定を記述（一時的な解決策）
const firebaseConfig = {
  apiKey: "AIzaSyDPFyH8WWB7boK0s_DsIseBfvwPauM3A7Q",
  authDomain: "carbaike-sns.firebaseapp.com",
  projectId: "carbaike-sns",
  storageBucket: "carbaike-sns.firebasestorage.app",
  messagingSenderId: "794823967964",
  appId: "1:794823967964:web:65bd6acde871f7a8072019"
};

// 環境変数のデバッグ
console.log('Firebase Config Debug:');
console.log('API Key:', firebaseConfig.apiKey);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Project ID:', firebaseConfig.projectId);

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// 初期化の確認
console.log('Firebase App initialized:', app);
console.log('Firebase App name:', app.name);
console.log('Firebase App options:', app.options);
console.log('Firestore db initialized:', db);
console.log('Firebase Auth initialized:', auth);
