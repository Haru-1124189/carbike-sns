import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Parser from 'rss-parser';
import { RSS_FEEDS } from './config';
import { NewsItem, RSSItem } from './types';

// Firebase Admin SDKを初期化
admin.initializeApp();

const db = admin.firestore();
const parser = new Parser();

// RSSアイテムをNewsItemに変換する関数
function convertRSSItemToNewsItem(item: RSSItem, source: string): NewsItem {
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
    id: '', // Firestoreで自動生成されるIDを使用
    title,
    link,
    summary: summary.substring(0, 500), // 要約を500文字に制限
    published,
    source,
    createdAt: new Date()
  };
}

// 重複チェック関数
async function isDuplicateArticle(link: string): Promise<boolean> {
  try {
    const snapshot = await db.collection('news')
      .where('link', '==', link)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  } catch (error) {
    console.error('重複チェックエラー:', error);
    return false;
  }
}

// ニュース記事を保存する関数
async function saveNewsItem(newsItem: Omit<NewsItem, 'id'>): Promise<void> {
  try {
    await db.collection('news').add(newsItem);
    console.log(`記事を保存しました: ${newsItem.title}`);
  } catch (error) {
    console.error('記事保存エラー:', error);
    throw error;
  }
}

// RSSフィードからニュースを取得する関数
async function fetchNewsFromFeed(feedConfig: { url: string; source: string }): Promise<void> {
  try {
    console.log(`${feedConfig.source}のRSSフィードを取得中: ${feedConfig.url}`);
    
    const feed = await parser.parseURL(feedConfig.url);
    
    if (!feed.items || feed.items.length === 0) {
      console.log(`${feedConfig.source}: 記事が見つかりません`);
      return;
    }

    let savedCount = 0;
    let skippedCount = 0;

    for (const item of feed.items) {
      try {
        // リンクが存在しない場合はスキップ
        if (!item.link) {
          console.log('リンクなしの記事をスキップ:', item.title);
          skippedCount++;
          continue;
        }

        // 重複チェック
        const isDuplicate = await isDuplicateArticle(item.link);
        if (isDuplicate) {
          console.log('重複記事をスキップ:', item.title);
          skippedCount++;
          continue;
        }

        // NewsItemに変換して保存
        const newsItem = convertRSSItemToNewsItem(item, feedConfig.source);
        await saveNewsItem(newsItem);
        savedCount++;

        // レート制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (itemError) {
        console.error(`記事処理エラー (${item.title}):`, itemError);
        skippedCount++;
      }
    }

    console.log(`${feedConfig.source}: ${savedCount}件保存, ${skippedCount}件スキップ`);

  } catch (error) {
    console.error(`${feedConfig.source}のRSS取得エラー:`, error);
    throw error;
  }
}

// 古い記事を削除する関数（30日以上前の記事を削除）
async function cleanupOldArticles(): Promise<void> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await db.collection('news')
      .where('createdAt', '<', thirtyDaysAgo)
      .get();

    if (snapshot.empty) {
      console.log('削除対象の古い記事はありません');
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`${snapshot.size}件の古い記事を削除しました`);

  } catch (error) {
    console.error('古い記事の削除エラー:', error);
  }
}

// メインのRSS取得関数
export const fetchRSSNews = functions.pubsub
  .schedule('0 * * * *') // 毎時0分に実行
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    console.log('RSS取得処理を開始します');

    try {
      // 各RSSフィードからニュースを取得
      for (const feedConfig of RSS_FEEDS) {
        try {
          await fetchNewsFromFeed(feedConfig);
        } catch (error) {
          console.error(`${feedConfig.source}の処理でエラーが発生しました:`, error);
          // 1つのフィードでエラーが発生しても他のフィードは続行
        }
      }

      // 古い記事を削除
      await cleanupOldArticles();

      console.log('RSS取得処理が完了しました');

    } catch (error) {
      console.error('RSS取得処理でエラーが発生しました:', error);
      throw error;
    }
  });

// 手動実行用のHTTP関数
export const fetchRSSNewsManual = functions.https.onRequest(async (req, res) => {
  // CORSヘッダーを設定
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    console.log('手動RSS取得処理を開始します');

    // 各RSSフィードからニュースを取得
    for (const feedConfig of RSS_FEEDS) {
      try {
        await fetchNewsFromFeed(feedConfig);
      } catch (error) {
        console.error(`${feedConfig.source}の処理でエラーが発生しました:`, error);
      }
    }

    // 古い記事を削除
    await cleanupOldArticles();

    console.log('手動RSS取得処理が完了しました');
    res.status(200).json({ 
      success: true, 
      message: 'RSS取得処理が完了しました',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('手動RSS取得処理でエラーが発生しました:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
