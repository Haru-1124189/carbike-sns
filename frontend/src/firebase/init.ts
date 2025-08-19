import { initializeApp } from 'firebase/app';

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
