import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/init';

// シンプルなRSS取得関数（テスト用）
export const fetchSimpleRSS = async (): Promise<{ success: boolean; totalSaved: number }> => {
  try {
    console.log('シンプルRSS取得を開始');
    
    // テスト用の実際に動作するRSSフィード
    const testFeeds = [
      'https://feeds.feedburner.com/autoblog/',
      'https://feeds.feedburner.com/CarAndDriver/',
      'https://feeds.feedburner.com/MotorTrend/'
    ];
    
    let totalSaved = 0;
    
    for (const feedUrl of testFeeds) {
      try {
        console.log(`RSS取得中: ${feedUrl}`);
        
        // 直接fetchを試行（CORSが許可されている場合）
        const response = await fetch(feedUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
        });
        
        if (response.ok) {
          const xmlText = await response.text();
          console.log('RSS取得成功:', feedUrl);
          
          // 簡単なXML解析
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          
          const items = xmlDoc.querySelectorAll('item');
          const itemsArray = Array.from(items).slice(0, 3); // 最初の3件のみ
          
          for (const itemElement of itemsArray) {
            try {
              const title = itemElement.querySelector('title')?.textContent || '';
              const link = itemElement.querySelector('link')?.textContent || '';
              const description = itemElement.querySelector('description')?.textContent || '';
              const pubDate = itemElement.querySelector('pubDate')?.textContent || '';
              
              if (title && link) {
                const newsItem = {
                  title,
                  link,
                  summary: description.substring(0, 500),
                  published: pubDate || new Date().toISOString(),
                  source: 'RSS Feed',
                  thumbnailUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center',
                  createdAt: serverTimestamp()
                };
                
                await addDoc(collection(db, 'news'), newsItem);
                totalSaved++;
                console.log(`記事保存: ${title}`);
              }
            } catch (itemError) {
              console.error('記事処理エラー:', itemError);
            }
          }
        } else {
          console.log('RSS取得失敗:', feedUrl, response.status);
        }
      } catch (feedError) {
        console.error('フィード取得エラー:', feedUrl, feedError);
      }
    }
    
    console.log(`シンプルRSS取得完了: ${totalSaved}件保存`);
    return { success: true, totalSaved };
    
  } catch (error) {
    console.error('シンプルRSS取得エラー:', error);
    return { success: false, totalSaved: 0 };
  }
};

// 開発用：ブラウザのコンソールから実行できるようにする
if (typeof window !== 'undefined') {
  (window as any).fetchSimpleRSS = fetchSimpleRSS;
}
