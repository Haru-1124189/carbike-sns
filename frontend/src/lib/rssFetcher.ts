import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase/init';

// RSSフィードの設定（車・バイク関連で実際に動作するフィード）
const RSS_FEEDS = [
  { url: 'https://feeds.feedburner.com/autoblog/', source: 'Autoblog' },
  { url: 'https://feeds.feedburner.com/CarAndDriver/', source: 'Car and Driver' },
  { url: 'https://feeds.feedburner.com/MotorTrend/', source: 'Motor Trend' },
  { url: 'https://feeds.feedburner.com/AutomotiveNews/', source: 'Automotive News' },
  { url: 'https://feeds.feedburner.com/CarBuzz/', source: 'CarBuzz' },
  { url: 'https://feeds.feedburner.com/TheDrive/', source: 'The Drive' }
];

// RSSアイテムの型定義
interface RSSItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  description?: string;
  pubDate?: string;
  published?: string;
  isoDate?: string;
  enclosure?: {
    url: string;
    type?: string;
  };
  media?: {
    content?: Array<{ url: string; type: string; }>;
    thumbnail?: Array<{ url: string; }>;
  };
  [key: string]: any;
}

// ニュースアイテムの型定義
interface NewsItem {
  id?: string;
  title: string;
  link: string;
  summary: string;
  published: string;
  source: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

// RSSアイテムから画像URLを抽出する関数
function extractImageUrl(item: RSSItem): string | null {
  // 1. media.thumbnailから取得
  if (item.media?.thumbnail && item.media.thumbnail.length > 0) {
    return item.media.thumbnail[0].url;
  }
  
  // 2. media.contentから画像を取得
  if (item.media?.content && item.media.content.length > 0) {
    const imageContent = item.media.content.find(content => 
      content.type.startsWith('image/')
    );
    if (imageContent) {
      return imageContent.url;
    }
  }
  
  // 3. enclosureから画像を取得
  if (item.enclosure && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  // 4. contentからimgタグを抽出
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }
  
  // 5. descriptionからimgタグを抽出
  if (item.description) {
    const imgMatch = item.description.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }
  
  return null;
}

// RSSアイテムをNewsItemに変換する関数
function convertRSSItemToNewsItem(item: RSSItem, source: string): Omit<NewsItem, 'id'> {
  const title = item.title || 'タイトルなし';
  const link = item.link || '';
  const summary = item.contentSnippet || item.description || item.content || '';
  
  // 公開日を処理
  let published = '';
  if (item.pubDate) {
    published = item.pubDate;
  } else if (item.published) {
    published = item.published;
  } else if (item.isoDate) {
    published = item.isoDate;
  } else {
    published = new Date().toISOString();
  }

  return {
    title,
    link,
    summary: summary.substring(0, 500), // 要約を500文字に制限
    published,
    source,
    thumbnailUrl: extractImageUrl(item) || undefined,
    createdAt: new Date()
  };
}

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

// RSSフィードからニュースを取得する関数
async function fetchNewsFromFeed(feedConfig: { url: string; source: string }): Promise<number> {
  try {
    console.log(`${feedConfig.source}のRSSフィードを取得中: ${feedConfig.url}`);
    
    // 複数のCORSプロキシを試行
    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(feedConfig.url)}`,
      `https://cors-anywhere.herokuapp.com/${feedConfig.url}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedConfig.url)}`
    ];
    
    let xmlText = '';
    let response;
    
    // 複数のプロキシを順番に試行
    for (const proxyUrl of proxyUrls) {
      try {
        console.log(`プロキシ試行: ${proxyUrl}`);
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
        });
        
        if (response.ok) {
          xmlText = await response.text();
          console.log(`${feedConfig.source}: プロキシ取得成功`);
          break;
        }
      } catch (proxyError) {
        console.log(`${feedConfig.source}: プロキシ失敗`, proxyError);
        continue;
      }
    }
    
    if (!xmlText) {
      console.log(`${feedConfig.source}: すべてのプロキシが失敗`);
      // プロキシが全て失敗した場合は、スキップ
      return 0;
    }
    
    // XMLをパース（簡易版）
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const items = xmlDoc.querySelectorAll('item, entry');
    let savedCount = 0;
    
    // NodeListOf<Element>を配列に変換して反復
    const itemsArray = Array.from(items);
    for (const itemElement of itemsArray) {
      try {
        const title = itemElement.querySelector('title')?.textContent || '';
        const link = itemElement.querySelector('link')?.textContent || itemElement.querySelector('link')?.getAttribute('href') || '';
        const description = itemElement.querySelector('description')?.textContent || itemElement.querySelector('summary')?.textContent || '';
        const pubDate = itemElement.querySelector('pubDate')?.textContent || itemElement.querySelector('published')?.textContent || '';
        
        if (!link) {
          console.log('リンクなしの記事をスキップ:', title);
          continue;
        }

        // 重複チェック
        const isDuplicate = await isDuplicateArticle(link);
        if (isDuplicate) {
          console.log('重複記事をスキップ:', title);
          continue;
        }

        // NewsItemに変換
        const rssItem: RSSItem = {
          title,
          link,
          description,
          pubDate,
          contentSnippet: description
        };
        
        const newsItem = convertRSSItemToNewsItem(rssItem, feedConfig.source);
        
        // Firestoreに保存
        await addDoc(collection(db, 'news'), {
          ...newsItem,
          createdAt: serverTimestamp()
        });
        
        savedCount++;
        console.log(`記事を保存しました: ${newsItem.title}`);

      } catch (itemError) {
        console.error('記事処理エラー:', itemError);
      }
    }

    // RSSから記事が取得できなかった場合はスキップ
    if (savedCount === 0) {
      console.log(`${feedConfig.source}: RSSから記事が取得できませんでした`);
    }

    console.log(`${feedConfig.source}: ${savedCount}件保存`);
    return savedCount;

  } catch (error) {
    console.error(`${feedConfig.source}のRSS取得エラー:`, error);
    // エラーの場合はスキップ
    return 0;
  }
}

// ダミーニュースを生成する関数（RSS取得に失敗した場合のフォールバック）
async function generateDummyNewsForSource(source: string): Promise<number> {
  try {
    const dummyNews = [
      {
        title: `${source} - 最新の車・バイクニュース`,
        link: `https://example.com/news/${source.toLowerCase().replace(/\s+/g, '-')}-1`,
        summary: `${source}からの最新情報をお届けします。車やバイクの最新トレンドや新車情報をチェックしてください。`,
        published: new Date().toISOString(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center'
      },
      {
        title: `${source} - 新車レビュー特集`,
        link: `https://example.com/news/${source.toLowerCase().replace(/\s+/g, '-')}-2`,
        summary: `${source}編集部が厳選した新車レビューをお届けします。気になる車種の詳細情報をチェックしてください。`,
        published: new Date(Date.now() - 86400000).toISOString(), // 1日前
        thumbnailUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center'
      }
    ];

    let savedCount = 0;
    for (const newsItem of dummyNews) {
      // 重複チェック
      const isDuplicate = await isDuplicateArticle(newsItem.link);
      if (!isDuplicate) {
        await addDoc(collection(db, 'news'), {
          ...newsItem,
          source,
          createdAt: serverTimestamp()
        });
        savedCount++;
        console.log(`ダミー記事を保存しました: ${newsItem.title}`);
      }
    }

    return savedCount;
  } catch (error) {
    console.error('ダミーニュース生成エラー:', error);
    return 0;
  }
}

// 手動で追加したニュースデータを削除する関数
export const cleanupManualNewsData = async (): Promise<number> => {
  try {
    console.log('手動追加したニュースデータの削除を開始...');
    
    const manualSources = ['CarBike News', 'Bike News', 'Car News', 'Car Tech News', 'Sports Car News', 'EV News'];
    let deletedCount = 0;
    
    for (const source of manualSources) {
      const q = query(collection(db, 'news'), where('source', '==', source));
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

// Firebase Functionsの手動実行エンドポイントを呼び出す関数
async function callFirebaseFunction(): Promise<{ success: boolean; totalSaved: number }> {
  try {
    console.log('Firebase Functionsの手動実行エンドポイントを呼び出し中...');
    
    // Firebase FunctionsのURL（環境変数から取得またはデフォルト値）
    const functionsUrl = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-carbike-sns.cloudfunctions.net';
    const endpoint = `${functionsUrl}/fetchRSSNewsManual`;
    
    console.log('Functionsエンドポイント:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Firebase Functions実行完了:', result);
      return { success: true, totalSaved: result.savedCount || 0 };
    } else {
      console.error('Firebase Functions実行失敗:', response.statusText);
      return { success: false, totalSaved: 0 };
    }
  } catch (error) {
    console.error('Firebase Functions呼び出しエラー:', error);
    return { success: false, totalSaved: 0 };
  }
}

// RSS取得システムを手動実行する関数
export const fetchRSSNews = async (): Promise<{ success: boolean; totalSaved: number }> => {
  try {
    console.log('RSS取得処理を開始します');
    
    // まずFirebase Functionsを試行
    const functionsResult = await callFirebaseFunction();
    if (functionsResult.success && functionsResult.totalSaved > 0) {
      console.log(`Firebase Functions実行成功: ${functionsResult.totalSaved}件保存`);
      return functionsResult;
    }
    
    console.log('Firebase Functions実行失敗、ブラウザから直接RSS取得を試行');
    
    let totalSaved = 0;
    
    // Firebase Functionsが失敗した場合はブラウザから直接取得
    for (const feedConfig of RSS_FEEDS) {
      try {
        const savedCount = await fetchNewsFromFeed(feedConfig);
        totalSaved += savedCount;
      } catch (error) {
        console.error(`${feedConfig.source}の処理でエラーが発生しました:`, error);
      }
    }
    
    console.log(`RSS取得処理が完了しました。合計${totalSaved}件保存`);
    return { success: true, totalSaved };
    
  } catch (error) {
    console.error('RSS取得処理でエラーが発生しました:', error);
    return { success: false, totalSaved: 0 };
  }
};

// 開発用：ブラウザのコンソールから実行できるようにする
if (typeof window !== 'undefined') {
  (window as any).cleanupManualNewsData = cleanupManualNewsData;
  (window as any).fetchRSSNews = fetchRSSNews;
}
