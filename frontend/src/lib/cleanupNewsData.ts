import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/init';

// 手動で追加したニュースデータを削除する関数
export const cleanupManualNewsData = async () => {
  try {
    console.log('手動追加したニュースデータの削除を開始...');
    
    // 手動で追加したニュースデータのソースを特定
    const manualSources = ['CarBike News', 'Bike News', 'Car News', 'Car Tech News', 'Sports Car News', 'EV News'];
    
    let deletedCount = 0;
    
    for (const source of manualSources) {
      const q = query(
        collection(db, 'news'),
        where('source', '==', source)
      );
      
      const snapshot = await getDocs(q);
      
      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, 'news', docSnapshot.id));
        deletedCount++;
        console.log(`削除: ${docSnapshot.data().title}`);
      }
    }
    
    console.log(`${deletedCount}件の手動ニュースデータを削除しました`);
    return deletedCount;
  } catch (error) {
    console.error('ニュースデータの削除中にエラーが発生:', error);
    return 0;
  }
};

// RSS取得システムを手動実行する関数
export const triggerRSSFetch = async () => {
  try {
    console.log('RSS取得システムを手動実行中...');
    
    // 環境変数からFirebase FunctionsのURLを取得
    const functionsUrl = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-carbike-sns.cloudfunctions.net';
    const endpoint = `${functionsUrl}/fetchRSSNewsManual`;
    
    console.log('RSS取得エンドポイント:', endpoint);
    
    // Firebase Functionsの手動実行エンドポイントを呼び出し
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('RSS取得完了:', result);
      return true;
    } else {
      console.error('RSS取得に失敗:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('RSS取得の実行中にエラーが発生:', error);
    return false;
  }
};

// 開発用：ブラウザのコンソールから実行できるようにする
if (typeof window !== 'undefined') {
  (window as any).cleanupManualNewsData = cleanupManualNewsData;
  (window as any).triggerRSSFetch = triggerRSSFetch;
}
