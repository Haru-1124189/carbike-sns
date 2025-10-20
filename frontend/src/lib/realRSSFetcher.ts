import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase/init';

// 重複チェック関数
async function isDuplicateArticle(link: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'news'), where('link', '==', link));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('重複チェックエラー:', error);
    return false;
  }
}

// Google Custom Search APIから車・バイクニュースを取得
async function fetchCarBikeNewsFromGoogle(): Promise<{ success: boolean; totalSaved: number }> {
  try {
    console.log('Google Custom Search APIから車・バイクニュースを取得開始');

    const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY_HERE';
    const searchEngineId = process.env.REACT_APP_GOOGLE_SEARCH_ENGINE_ID || 'YOUR_SEARCH_ENGINE_ID_HERE';
    
    console.log(`Google API設定確認: APIキー=${googleApiKey.substring(0, 10)}..., SearchEngineId=${searchEngineId}`);
    
    // 車・バイク関連の日本語キーワード
    const keywords = [
      '自動車ニュース', '車ニュース', 'バイクニュース', 'オートバイニュース',
      'トヨタ', 'ホンダ', '日産', 'マツダ', 'スバル',
      'レクサス', 'スズキ', 'ダイハツ', 'ハイブリッド車', 'EV車', '電気自動車'
    ];

    let totalSaved = 0;

    for (const keyword of keywords.slice(0, 8)) { // 1日100件制限を考慮して8キーワードまで
      try {
        // lr=lang_ja を削除して、ウェブ全体から日本語コンテンツを検索
        // siteSearchFilterパラメータも削除して広範囲に検索
        const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(keyword)}&num=10&dateRestrict=d7`;
        console.log(`Google API リクエスト (${keyword}):`, url.replace(googleApiKey, 'API_KEY'));
        
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`Google API エラー (${keyword}):`, response.status, errorText.substring(0, 200));
          continue;
        }

        const data = await response.json();
        console.log(`Google API データ (${keyword}):`, {
          totalResults: data.searchInformation?.totalResults || 0,
          itemsCount: data.items?.length || 0,
          queries: data.queries
        });

        if (data.error) {
          console.error(`Google API エラーレスポンス (${keyword}):`, data.error);
          continue;
        }

        if (data.items && data.items.length > 0) {
          for (const item of data.items.slice(0, 3)) { // 1キーワードにつき3記事まで
            if (item.title && item.link) {
              // 重複チェック
              const isDuplicate = await isDuplicateArticle(item.link);
              if (isDuplicate) {
                console.log('重複記事をスキップ:', item.title.substring(0, 50));
                continue;
              }

              // サムネイル画像を取得
              let thumbnailUrl = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center';
              if (item.pagemap?.cse_image?.[0]?.src) {
                thumbnailUrl = item.pagemap.cse_image[0].src;
              } else if (item.pagemap?.cse_thumbnail?.[0]?.src) {
                thumbnailUrl = item.pagemap.cse_thumbnail[0].src;
              }

              // Firestoreに保存
              await addDoc(collection(db, 'news'), {
                title: item.title,
                link: item.link,
                summary: (item.snippet || '').substring(0, 500),
                published: new Date().toISOString(),
                source: `Google-${keyword}`,
                thumbnailUrl,
                createdAt: serverTimestamp()
              });

              totalSaved++;
              console.log(`Google記事を保存: ${item.title.substring(0, 50)}...`);
            }
          }
        }
      } catch (error) {
        console.error(`Google API検索エラー (${keyword}):`, error);
      }
    }

    console.log(`Google API取得完了: ${totalSaved}件保存`);
    return { success: true, totalSaved };

  } catch (error) {
    console.error('Google API取得エラー:', error);
    return { success: false, totalSaved: 0 };
  }
}

// NewsAPI削除済み（日本語ニュースが取得できないため）

// Firebase Functions呼び出し（RSS取得用）
async function callFirebaseFunction(): Promise<{ success: boolean; totalSaved: number }> {
  try {
    console.log('Firebase Functions呼び出し: https://us-central1-carbike-sns.cloudfunctions.net/fetchRSSNewsManual');
    
    const response = await fetch('https://us-central1-carbike-sns.cloudfunctions.net/fetchRSSNewsManual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      console.log('Firebase Functions呼び出し失敗:', response.status);
      return { success: false, totalSaved: 0 };
    }

    const result = await response.json();
    console.log('Firebase Functions結果:', result);
    return { success: true, totalSaved: result.totalSaved || 0 };
    
  } catch (error) {
    console.error('Firebase Functions呼び出しエラー:', error);
    return { success: false, totalSaved: 0 };
  }
}

// 実際のニュース取得（Google Custom Search APIのみ）
export const fetchRealRSS = async (): Promise<{ success: boolean; totalSaved: number }> => {
  try {
    console.log('ニュース取得を開始');

    // Google Custom Search APIを実行
    const googleResult = await fetchCarBikeNewsFromGoogle();
    if (googleResult.success && googleResult.totalSaved > 0) {
      console.log(`Google API実行成功: ${googleResult.totalSaved}件保存`);
      return googleResult;
    }

    console.log('Google API実行失敗、Firebase Functionsを試行');

    // Firebase Functionsをフォールバック
    const functionsResult = await callFirebaseFunction();
    if (functionsResult.success && functionsResult.totalSaved > 0) {
      console.log(`Firebase Functions実行成功: ${functionsResult.totalSaved}件保存`);
      return functionsResult;
    }

    console.log('Google APIとFirebase Functions両方失敗');
    return { success: false, totalSaved: 0 };
    
  } catch (error) {
    console.error('ニュース取得エラー:', error);
    return { success: false, totalSaved: 0 };
  }
};

// 開発用：ブラウザのコンソールから実行できるようにする
if (typeof window !== 'undefined') {
  (window as any).fetchRealRSS = fetchRealRSS;
}