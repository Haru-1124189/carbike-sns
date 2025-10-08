"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRSSNewsManual = exports.testSingleFeed = exports.fetchRSSNews = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const config_1 = require("./config");
// Firebase Admin SDKを初期化
admin.initializeApp();
const db = admin.firestore();
const parser = new rss_parser_1.default();
// RSSアイテムから画像URLを抽出する関数
function extractImageUrl(item) {
    var _a, _b, _c, _d, _e, _f, _g;
    const title = item.title || 'Unknown';
    // デバッグ情報を収集
    const debugInfo = {
        hasMedia: !!item.media,
        hasEnclosure: !!item.enclosure,
        hasContent: !!item.content,
        hasDescription: !!item.description,
        mediaThumbnail: ((_b = (_a = item.media) === null || _a === void 0 ? void 0 : _a.thumbnail) === null || _b === void 0 ? void 0 : _b.length) || 0,
        mediaContent: ((_d = (_c = item.media) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.length) || 0,
        enclosureType: ((_e = item.enclosure) === null || _e === void 0 ? void 0 : _e.type) || 'none'
    };
    // 1. media.thumbnailから取得
    if (((_f = item.media) === null || _f === void 0 ? void 0 : _f.thumbnail) && item.media.thumbnail.length > 0) {
        console.log(`${title} - media.thumbnailから画像を取得:`, item.media.thumbnail[0].url);
        return item.media.thumbnail[0].url;
    }
    // 2. media.contentから画像を取得
    if (((_g = item.media) === null || _g === void 0 ? void 0 : _g.content) && item.media.content.length > 0) {
        const imageContent = item.media.content.find(content => content.type.startsWith('image/'));
        if (imageContent) {
            console.log(`${title} - media.contentから画像を取得:`, imageContent.url);
            return imageContent.url;
        }
    }
    // 3. enclosureから画像を取得
    if (item.enclosure && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
        console.log(`${title} - enclosureから画像を取得:`, item.enclosure.url);
        return item.enclosure.url;
    }
    // 4. contentからimgタグを抽出
    if (item.content) {
        const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
        if (imgMatch && imgMatch[1]) {
            console.log(`${title} - contentからimgタグを抽出:`, imgMatch[1]);
            return imgMatch[1];
        }
    }
    // 5. descriptionからimgタグを抽出
    if (item.description) {
        const imgMatch = item.description.match(/<img[^>]+src="([^"]+)"/i);
        if (imgMatch && imgMatch[1]) {
            console.log(`${title} - descriptionからimgタグを抽出:`, imgMatch[1]);
            return imgMatch[1];
        }
    }
    // 6. より柔軟なimgタグ抽出（シングルクォート対応）
    const allText = [item.content, item.description, item.contentSnippet].filter(Boolean).join(' ');
    if (allText) {
        const flexibleImgMatch = allText.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (flexibleImgMatch && flexibleImgMatch[1]) {
            console.log(`${title} - 柔軟なimgタグ抽出:`, flexibleImgMatch[1]);
            return flexibleImgMatch[1];
        }
    }
    // 7. 任意のプロパティから画像URLを探す
    const allProps = Object.keys(item);
    for (const prop of allProps) {
        const value = item[prop];
        if (typeof value === 'string' && value.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
            console.log(`${title} - プロパティ${prop}から画像を発見:`, value);
            return value;
        }
    }
    console.log(`${title} - 画像が見つかりません。デバッグ情報:`, debugInfo);
    return null;
}
// RSSアイテムをNewsItemに変換する関数
function convertRSSItemToNewsItem(item, source) {
    const title = item.title || 'タイトルなし';
    const link = item.link || '';
    const summary = item.contentSnippet || item.description || item.content || '';
    // 公開日を処理
    let published = '';
    if (item.pubDate) {
        published = item.pubDate;
    }
    else if (item.published) {
        published = item.published;
    }
    else if (item.isoDate) {
        published = item.isoDate;
    }
    else {
        published = new Date().toISOString();
    }
    return {
        id: '',
        title,
        link,
        summary: summary.substring(0, 500),
        published,
        source,
        thumbnailUrl: extractImageUrl(item) || undefined,
        createdAt: new Date()
    };
}
// 重複チェック関数
async function isDuplicateArticle(link) {
    try {
        const snapshot = await db.collection('news')
            .where('link', '==', link)
            .limit(1)
            .get();
        return !snapshot.empty;
    }
    catch (error) {
        console.error('重複チェックエラー:', error);
        return false;
    }
}
// ニュース記事を保存する関数
async function saveNewsItem(newsItem) {
    try {
        await db.collection('news').add(newsItem);
        console.log(`記事を保存しました: ${newsItem.title}`);
    }
    catch (error) {
        console.error('記事保存エラー:', error);
        throw error;
    }
}
// RSSフィードからニュースを取得する関数
async function fetchNewsFromFeed(feedConfig) {
    try {
        console.log(`${feedConfig.source}のRSSフィードを取得中: ${feedConfig.url}`);
        const feed = await parser.parseURL(feedConfig.url);
        if (!feed.items || feed.items.length === 0) {
            console.log(`${feedConfig.source}: 記事が見つかりません`);
            return;
        }
        // デバッグ: 最初のアイテムの構造を確認
        if (feed.items.length > 0) {
            const firstItem = feed.items[0];
            console.log(`${feedConfig.source} - 最初のアイテムの構造:`, {
                title: firstItem.title,
                hasMedia: !!firstItem.media,
                hasEnclosure: !!firstItem.enclosure,
                hasContent: !!firstItem.content,
                hasDescription: !!firstItem.description,
                mediaKeys: firstItem.media ? Object.keys(firstItem.media) : [],
                enclosureKeys: firstItem.enclosure ? Object.keys(firstItem.enclosure) : []
            });
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
            }
            catch (itemError) {
                console.error(`記事処理エラー (${item.title}):`, itemError);
                skippedCount++;
            }
        }
        console.log(`${feedConfig.source}: ${savedCount}件保存, ${skippedCount}件スキップ`);
    }
    catch (error) {
        console.error(`${feedConfig.source}のRSS取得エラー:`, error);
        throw error;
    }
}
// 古い記事を削除する関数（30日以上前の記事を削除）
async function cleanupOldArticles() {
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
    }
    catch (error) {
        console.error('古い記事の削除エラー:', error);
    }
}
// メインのRSS取得関数
exports.fetchRSSNews = functions.pubsub
    .schedule('0 * * * *') // 毎時0分に実行
    .timeZone('Asia/Tokyo')
    .onRun(async (context) => {
    console.log('RSS取得処理を開始します');
    try {
        // 各RSSフィードからニュースを取得
        for (const feedConfig of config_1.RSS_FEEDS) {
            try {
                await fetchNewsFromFeed(feedConfig);
            }
            catch (error) {
                console.error(`${feedConfig.source}の処理でエラーが発生しました:`, error);
                // 1つのフィードでエラーが発生しても他のフィードは続行
            }
        }
        // 古い記事を削除
        await cleanupOldArticles();
        console.log('RSS取得処理が完了しました');
    }
    catch (error) {
        console.error('RSS取得処理でエラーが発生しました:', error);
        throw error;
    }
});
// テスト用：単一フィードでデバッグ
exports.testSingleFeed = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    try {
        console.log('テスト用RSS取得処理を開始します');
        // 一つのフィードだけをテスト
        const testFeed = { url: 'https://www.kuruma-news.jp/feed', source: 'くるまのニュース' };
        await fetchNewsFromFeed(testFeed);
        res.status(200).json({
            success: true,
            message: 'テストRSS取得処理が完了しました',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('テストRSS取得処理でエラーが発生しました:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
// 手動実行用のHTTP関数
exports.fetchRSSNewsManual = functions.https.onRequest(async (req, res) => {
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
        for (const feedConfig of config_1.RSS_FEEDS) {
            try {
                await fetchNewsFromFeed(feedConfig);
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('手動RSS取得処理でエラーが発生しました:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
//# sourceMappingURL=index.js.map