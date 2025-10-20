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
exports.getUserCreatorApplicationStatus = exports.reviewCreatorApplication = exports.getCreatorApplications = exports.submitCreatorApplication = exports.getUserShopApplicationStatus = exports.reviewShopApplication = exports.getShopApplications = exports.submitShopApplication = exports.fetchCarBikeNewsScheduled = exports.fetchRSSNewsManual = exports.testSingleFeed = exports.fetchRSSNews = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const params_1 = require("firebase-functions/params");
const rss_parser_1 = __importDefault(require("rss-parser"));
const config_1 = require("./config");
// 環境変数を定義（新しい方法）
const googleApiKey = (0, params_1.defineString)('GOOGLE_API_KEY');
const googleSearchEngineId = (0, params_1.defineString)('GOOGLE_SEARCH_ENGINE_ID');
// Firebase Admin SDKを初期化
admin.initializeApp();
const db = admin.firestore();
// 通知作成のヘルパー関数
const createNotification = async (userId, notification) => {
    try {
        await db.collection('notifications').add({
            userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data || {},
            read: false,
            createdAt: admin.firestore.Timestamp.now()
        });
        console.log(`通知を作成しました: ${userId} - ${notification.title}`);
    }
    catch (error) {
        console.error('通知作成エラー:', error);
    }
};
// 一部メディアのRSSでブロックされないようにUAを指定
const parser = new rss_parser_1.default({
    requestOptions: {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    }
});
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
// UTM等を除去して正規化したリンクで重複判定
function normalizeLink(link) {
    try {
        const url = new URL(link);
        url.search = '';
        url.hash = '';
        return url.toString();
    }
    catch (_) {
        return link;
    }
}
async function isDuplicateArticle(link) {
    try {
        const normalized = normalizeLink(link);
        const snapshot = await db.collection('news')
            .where('link', '==', normalized)
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
// RSSフィードからニュースを取得する関数（最大保存件数を指定可能）
async function fetchNewsFromFeed(feedConfig, maxToSave = Infinity) {
    try {
        console.log(`${feedConfig.source}のRSSフィードを取得中: ${feedConfig.url}`);
        const feed = await parser.parseURL(feedConfig.url);
        if (!feed.items || feed.items.length === 0) {
            console.log(`${feedConfig.source}: 記事が見つかりません`);
            return 0;
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
                // 正規化したリンクで保存
                newsItem.link = normalizeLink(newsItem.link);
                await saveNewsItem(newsItem);
                savedCount++;
                // レート制限を避けるため少し待機
                await new Promise(resolve => setTimeout(resolve, 100));
                // 要求件数に達したら中断
                if (savedCount >= maxToSave) {
                    break;
                }
            }
            catch (itemError) {
                console.error(`記事処理エラー (${item.title}):`, itemError);
                skippedCount++;
            }
        }
        console.log(`${feedConfig.source}: ${savedCount}件保存, ${skippedCount}件スキップ`);
        return savedCount;
    }
    catch (error) {
        console.error(`${feedConfig.source}のRSS取得エラー:`, error);
        return 0;
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
        // 最低保存件数を確保
        const MIN_SAVE = 10;
        let totalSaved = 0;
        for (const feedConfig of config_1.RSS_FEEDS) {
            if (totalSaved >= MIN_SAVE)
                break;
            const remaining = MIN_SAVE - totalSaved;
            try {
                const saved = await fetchNewsFromFeed(feedConfig, remaining);
                totalSaved += saved;
            }
            catch (error) {
                console.error(`${feedConfig.source}の処理でエラーが発生しました:`, error);
                // 続行
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
        // 最低保存件数を確保
        const MIN_SAVE = 10;
        let totalSaved = 0;
        for (const feedConfig of config_1.RSS_FEEDS) {
            if (totalSaved >= MIN_SAVE)
                break;
            const remaining = MIN_SAVE - totalSaved;
            try {
                const saved = await fetchNewsFromFeed(feedConfig, remaining);
                totalSaved += saved;
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
            totalSaved: undefined,
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
// Google Custom Search APIから車・バイクニュースを取得する関数
async function fetchCarBikeNewsFromGoogle() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        console.log('Google Custom Search APIから車・バイクニュースを取得開始');
        const apiKey = googleApiKey.value();
        const searchEngineId = googleSearchEngineId.value();
        if (!apiKey || !searchEngineId) {
            console.error('Google API設定が見つかりません。.envファイルにGOOGLE_API_KEYとGOOGLE_SEARCH_ENGINE_IDを設定してください');
            return { success: false, totalSaved: 0 };
        }
        console.log(`Google API設定確認: SearchEngineId=${searchEngineId}`);
        const keywords = [
            '自動車ニュース', '車ニュース', 'バイクニュース', 'オートバイニュース',
            'トヨタ', 'ホンダ', '日産', 'マツダ', 'スバル',
            'レクサス', 'スズキ', 'ダイハツ', 'ハイブリッド車', 'EV車', '電気自動車'
        ];
        let totalSaved = 0;
        for (const keyword of keywords.slice(0, 8)) {
            try {
                const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(keyword)}&num=10&dateRestrict=d7`;
                const response = await fetch(url);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.log(`Google API エラー (${keyword}):`, response.status, errorText.substring(0, 200));
                    continue;
                }
                const data = await response.json();
                console.log(`Google API データ (${keyword}):`, {
                    totalResults: ((_a = data.searchInformation) === null || _a === void 0 ? void 0 : _a.totalResults) || 0,
                    itemsCount: ((_b = data.items) === null || _b === void 0 ? void 0 : _b.length) || 0
                });
                if (data.error) {
                    console.error(`Google API エラーレスポンス (${keyword}):`, data.error);
                    continue;
                }
                if (data.items && data.items.length > 0) {
                    for (const item of data.items.slice(0, 3)) {
                        if (item.title && item.link) {
                            // 重複チェック
                            const isDuplicate = await isDuplicateArticle(item.link);
                            if (isDuplicate) {
                                console.log('重複記事をスキップ:', item.title.substring(0, 50));
                                continue;
                            }
                            // サムネイル画像を取得
                            let thumbnailUrl = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center';
                            if ((_e = (_d = (_c = item.pagemap) === null || _c === void 0 ? void 0 : _c.cse_image) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.src) {
                                thumbnailUrl = item.pagemap.cse_image[0].src;
                            }
                            else if ((_h = (_g = (_f = item.pagemap) === null || _f === void 0 ? void 0 : _f.cse_thumbnail) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.src) {
                                thumbnailUrl = item.pagemap.cse_thumbnail[0].src;
                            }
                            // Firestoreに保存
                            await db.collection('news').add({
                                title: item.title,
                                link: item.link,
                                summary: (item.snippet || '').substring(0, 500),
                                published: new Date().toISOString(),
                                source: `Google-${keyword}`,
                                thumbnailUrl,
                                createdAt: new Date()
                            });
                            totalSaved++;
                            console.log(`Google記事を保存: ${item.title.substring(0, 50)}...`);
                            // レート制限を避けるため少し待機
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }
                }
            }
            catch (error) {
                console.error(`Google API検索エラー (${keyword}):`, error);
            }
        }
        console.log(`Google API取得完了: ${totalSaved}件保存`);
        return { success: true, totalSaved };
    }
    catch (error) {
        console.error('Google API取得エラー:', error);
        return { success: false, totalSaved: 0 };
    }
}
// 3時間ごとにGoogle Custom Search APIでニュースを取得
exports.fetchCarBikeNewsScheduled = functions.pubsub
    .schedule('0 */3 * * *') // 3時間ごと（0時、3時、6時、9時、12時、15時、18時、21時）
    .timeZone('Asia/Tokyo')
    .onRun(async (context) => {
    console.log('定期ニュース取得処理を開始します（3時間ごと）');
    try {
        const result = await fetchCarBikeNewsFromGoogle();
        if (result.success && result.totalSaved > 0) {
            console.log(`定期ニュース取得完了: ${result.totalSaved}件保存`);
        }
        else {
            console.log('定期ニュース取得: 新規記事なし');
        }
        // 古い記事を削除（30日以上前）
        await cleanupOldArticles();
        console.log('定期ニュース取得処理が完了しました');
    }
    catch (error) {
        console.error('定期ニュース取得処理でエラーが発生しました:', error);
        throw error;
    }
});
// ==================== Shop申請関連のFunctions ====================
// Shop申請を送信
exports.submitShopApplication = functions.https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'ユーザーが認証されていません');
    }
    const userId = context.auth.uid;
    try {
        // 既存の申請があるかチェック
        const existingApplication = await db.collection('shopApplications')
            .where('userId', '==', userId)
            .limit(1)
            .get();
        if (!existingApplication.empty) {
            throw new functions.https.HttpsError('already-exists', '既に申請が存在します');
        }
        // 申請データを作成
        const application = Object.assign(Object.assign({}, data), { userId, status: 'pending', submittedAt: admin.firestore.Timestamp.now() });
        // Firestoreに保存
        const docRef = await db.collection('shopApplications').add(application);
        // ユーザードキュメントを更新
        await db.collection('users').doc(userId).update({
            'shopApplication.status': 'pending',
            'shopApplication.submittedAt': admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        });
        // 申請送信通知を作成
        await createNotification(userId, {
            type: 'shop_application_submitted',
            title: 'Shop申請を送信しました',
            message: '申請内容を審査いたします。審査結果はメールにてお知らせいたします。',
            data: {
                applicationId: docRef.id
            }
        });
        console.log(`Shop申請が送信されました: ${docRef.id} (ユーザー: ${userId})`);
        return {
            success: true,
            applicationId: docRef.id,
            message: '申請が正常に送信されました'
        };
    }
    catch (error) {
        console.error('Shop申請送信エラー:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '申請の送信に失敗しました');
    }
});
// 申請一覧を取得（管理者用）
exports.getShopApplications = functions.https.onCall(async (data, context) => {
    // 管理者権限チェック
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'ユーザーが認証されていません');
    }
    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (!(userData === null || userData === void 0 ? void 0 : userData.isAdmin) && (userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', '管理者権限が必要です');
    }
    try {
        const status = data.status || 'all';
        let query = db.collection('shopApplications').orderBy('submittedAt', 'desc');
        if (status !== 'all') {
            query = query.where('status', '==', status);
        }
        const snapshot = await query.get();
        const applications = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        return {
            success: true,
            applications
        };
    }
    catch (error) {
        console.error('申請一覧取得エラー:', error);
        throw new functions.https.HttpsError('internal', '申請一覧の取得に失敗しました');
    }
});
// 申請を審査（承認/却下）
exports.reviewShopApplication = functions.https.onCall(async (data, context) => {
    // 管理者権限チェック
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'ユーザーが認証されていません');
    }
    const reviewerId = context.auth.uid;
    const userDoc = await db.collection('users').doc(reviewerId).get();
    const userData = userDoc.data();
    if (!(userData === null || userData === void 0 ? void 0 : userData.isAdmin) && (userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', '管理者権限が必要です');
    }
    const { applicationId, status, rejectionReason } = data;
    if (!applicationId || !status || !['approved', 'rejected'].includes(status)) {
        throw new functions.https.HttpsError('invalid-argument', '無効なパラメータです');
    }
    if (status === 'rejected' && !rejectionReason) {
        throw new functions.https.HttpsError('invalid-argument', '却下理由が必要です');
    }
    try {
        // 申請データを取得
        const applicationDoc = await db.collection('shopApplications').doc(applicationId).get();
        if (!applicationDoc.exists) {
            throw new functions.https.HttpsError('not-found', '申請が見つかりません');
        }
        const applicationData = applicationDoc.data();
        // 申請を更新
        await db.collection('shopApplications').doc(applicationId).update(Object.assign({ status, reviewedAt: admin.firestore.Timestamp.now(), reviewedBy: reviewerId }, (status === 'rejected' && { rejectionReason })));
        // ユーザードキュメントを更新
        const updateData = {
            'shopApplication.status': status,
            'shopApplication.reviewedAt': admin.firestore.Timestamp.now(),
            'shopApplication.reviewedBy': reviewerId,
            updatedAt: admin.firestore.Timestamp.now()
        };
        if (status === 'approved') {
            // 承認時はShop情報も保存
            updateData.shopInfo = {
                shopName: applicationData.shopName,
                businessLicense: applicationData.businessLicense,
                taxId: applicationData.taxId,
                contactEmail: applicationData.contactEmail,
                contactPhone: applicationData.contactPhone,
                businessAddress: applicationData.businessAddress
            };
        }
        else if (status === 'rejected') {
            updateData['shopApplication.rejectionReason'] = rejectionReason;
        }
        await db.collection('users').doc(applicationData.userId).update(updateData);
        // 通知を作成
        await createNotification(applicationData.userId, {
            type: 'shop_application_review',
            title: `Shop申請が${status === 'approved' ? '承認' : '却下'}されました`,
            message: status === 'approved'
                ? 'おめでとうございます！Shop申請が承認されました。これでShopとして出品できます。'
                : `申請が却下されました。理由: ${rejectionReason}`,
            data: {
                applicationId,
                status,
                rejectionReason: status === 'rejected' ? rejectionReason : undefined
            }
        });
        console.log(`申請が${status}されました: ${applicationId} (審査者: ${reviewerId})`);
        return {
            success: true,
            message: `申請が${status === 'approved' ? '承認' : '却下'}されました`
        };
    }
    catch (error) {
        console.error('申請審査エラー:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '申請の審査に失敗しました');
    }
});
// ユーザーの申請状況を取得
exports.getUserShopApplicationStatus = functions.https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'ユーザーが認証されていません');
    }
    const userId = context.auth.uid;
    try {
        // ユーザードキュメントから申請状況を取得
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        if (!userData) {
            throw new functions.https.HttpsError('not-found', 'ユーザーが見つかりません');
        }
        const shopApplication = userData.shopApplication || { status: 'none' };
        const shopInfo = userData.shopInfo;
        return {
            success: true,
            applicationStatus: shopApplication.status,
            shopInfo,
            submittedAt: shopApplication.submittedAt,
            reviewedAt: shopApplication.reviewedAt,
            rejectionReason: shopApplication.rejectionReason
        };
    }
    catch (error) {
        console.error('申請状況取得エラー:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '申請状況の取得に失敗しました');
    }
});
// ==================== クリエイター申請関連のFunctions ====================
// クリエイター申請を送信
exports.submitCreatorApplication = functions.https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'ユーザーが認証されていません');
    }
    const userId = context.auth.uid;
    try {
        // 既存の申請があるかチェック
        const existingApplication = await db.collection('creatorApplications')
            .where('userId', '==', userId)
            .limit(1)
            .get();
        if (!existingApplication.empty) {
            throw new functions.https.HttpsError('already-exists', '既に申請が存在します');
        }
        // ユーザー情報を取得
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        // 申請データを作成
        const application = Object.assign(Object.assign({}, data), { userId, userName: (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'ユーザー', userEmail: (userData === null || userData === void 0 ? void 0 : userData.email) || '', userAvatar: (userData === null || userData === void 0 ? void 0 : userData.photoURL) || '', status: 'pending', createdAt: admin.firestore.Timestamp.now(), updatedAt: admin.firestore.Timestamp.now() });
        // Firestoreに保存
        const docRef = await db.collection('creatorApplications').add(application);
        // 管理者通知を作成
        await createNotification('admin', {
            type: 'creator_application',
            title: '新しい動画配信申請',
            message: `${(userData === null || userData === void 0 ? void 0 : userData.displayName) || 'ユーザー'}さんが動画配信申請を提出しました。チャンネル名: ${data.channelName}`,
            data: {
                applicationId: docRef.id,
                channelName: data.channelName,
                contentCategory: data.contentCategory,
                userId
            }
        });
        console.log(`クリエイター申請が送信されました: ${docRef.id} (ユーザー: ${userId})`);
        return {
            success: true,
            applicationId: docRef.id,
            message: '申請が正常に送信されました'
        };
    }
    catch (error) {
        console.error('クリエイター申請送信エラー:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '申請の送信に失敗しました');
    }
});
// クリエイター申請一覧を取得（管理者用）
exports.getCreatorApplications = functions.https.onCall(async (data, context) => {
    // 管理者権限チェック
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'ユーザーが認証されていません');
    }
    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (!(userData === null || userData === void 0 ? void 0 : userData.isAdmin) && (userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', '管理者権限が必要です');
    }
    try {
        const status = data.status || 'all';
        let query = db.collection('creatorApplications').orderBy('createdAt', 'desc');
        if (status !== 'all') {
            query = query.where('status', '==', status);
        }
        const snapshot = await query.get();
        const applications = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        return {
            success: true,
            applications
        };
    }
    catch (error) {
        console.error('クリエイター申請一覧取得エラー:', error);
        throw new functions.https.HttpsError('internal', '申請一覧の取得に失敗しました');
    }
});
// クリエイター申請を審査（承認/却下）
exports.reviewCreatorApplication = functions.https.onCall(async (data, context) => {
    // 管理者権限チェック
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'ユーザーが認証されていません');
    }
    const reviewerId = context.auth.uid;
    const userDoc = await db.collection('users').doc(reviewerId).get();
    const userData = userDoc.data();
    if (!(userData === null || userData === void 0 ? void 0 : userData.isAdmin) && (userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', '管理者権限が必要です');
    }
    const { applicationId, status, adminNotes } = data;
    if (!applicationId || !status || !['approved', 'rejected'].includes(status)) {
        throw new functions.https.HttpsError('invalid-argument', '無効なパラメータです');
    }
    try {
        // 申請データを取得
        const applicationDoc = await db.collection('creatorApplications').doc(applicationId).get();
        if (!applicationDoc.exists) {
            throw new functions.https.HttpsError('not-found', '申請が見つかりません');
        }
        const applicationData = applicationDoc.data();
        // 申請を更新
        await db.collection('creatorApplications').doc(applicationId).update({
            status,
            adminNotes,
            reviewedAt: admin.firestore.Timestamp.now(),
            reviewedBy: reviewerId,
            updatedAt: admin.firestore.Timestamp.now()
        });
        // 承認された場合、ユーザーのロールを更新
        if (status === 'approved') {
            await db.collection('users').doc(applicationData.userId).update({
                role: 'creator',
                updatedAt: admin.firestore.Timestamp.now()
            });
        }
        // 申請者に通知を作成
        await createNotification(applicationData.userId, {
            type: 'creator_application_review',
            title: `動画配信申請が${status === 'approved' ? '承認' : '却下'}されました`,
            message: status === 'approved'
                ? 'おめでとうございます！動画配信申請が承認されました。これで動画を投稿できます。'
                : `申請が却下されました。${adminNotes ? `理由: ${adminNotes}` : ''}`,
            data: {
                applicationId,
                status,
                adminNotes: status === 'rejected' ? adminNotes : undefined
            }
        });
        console.log(`クリエイター申請が${status}されました: ${applicationId} (審査者: ${reviewerId})`);
        return {
            success: true,
            message: `申請が${status === 'approved' ? '承認' : '却下'}されました`
        };
    }
    catch (error) {
        console.error('クリエイター申請審査エラー:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '申請の審査に失敗しました');
    }
});
// ユーザーのクリエイター申請状況を取得
exports.getUserCreatorApplicationStatus = functions.https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'ユーザーが認証されていません');
    }
    const userId = context.auth.uid;
    try {
        // 最新の申請を取得
        const snapshot = await db.collection('creatorApplications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        if (snapshot.empty) {
            return {
                success: true,
                hasApplication: false,
                applicationStatus: 'none'
            };
        }
        const application = snapshot.docs[0].data();
        return {
            success: true,
            hasApplication: true,
            applicationStatus: application.status,
            application: {
                id: snapshot.docs[0].id,
                channelName: application.channelName,
                contentCategory: application.contentCategory,
                createdAt: application.createdAt,
                reviewedAt: application.reviewedAt,
                adminNotes: application.adminNotes
            }
        };
    }
    catch (error) {
        console.error('クリエイター申請状況取得エラー:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', '申請状況の取得に失敗しました');
    }
});
//# sourceMappingURL=index.js.map