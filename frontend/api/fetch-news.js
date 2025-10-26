module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Google Custom Search APIから車・バイクニュースを取得
    const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const searchEngineId = process.env.REACT_APP_GOOGLE_SEARCH_ENGINE_ID;
    
    if (!googleApiKey || !searchEngineId) {
      console.error('Google API設定が見つかりません');
      return res.status(500).json({
        success: false,
        error: 'Google API configuration not found'
      });
    }

    console.log('Google Custom Search APIから車・バイクニュースを取得開始');

    // 車・バイク関連の日本語キーワード
    const keywords = [
      '自動車ニュース', '車ニュース', 'バイクニュース', 'オートバイニュース',
      'トヨタ', 'ホンダ', '日産', 'マツダ', 'スバル',
      'レクサス', 'スズキ', 'ダイハツ', 'ハイブリッド車', 'EV車', '電気自動車'
    ];

    const allNews = [];

    // 各キーワードで検索（1日100件制限を考慮して8キーワードまで）
    for (const keyword of keywords.slice(0, 8)) {
      try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(keyword)}&num=10&dateRestrict=d7`;
        console.log(`Google API リクエスト (${keyword})`);
        
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`Google API エラー (${keyword}):`, response.status, errorText.substring(0, 200));
          continue;
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          data.items.forEach((item) => {
            // 重複チェック
            const isDuplicate = allNews.some(news => news.link === item.link);
            if (!isDuplicate) {
              // サムネイル画像を複数のソースから取得
              const thumbnailUrl = 
                item.pagemap?.cse_thumbnail?.[0]?.src || // Googleのサムネイル
                item.pagemap?.cse_image?.[0]?.src || // 画像検索用
                item.pagemap?.metatags?.[0]?.['og:image'] || // OpenGraph画像
                item.pagemap?.metatags?.[0]?.['twitter:image'] || // Twitter画像
                item.pagemap?.thumbnail?.[0]?.src || // サムネイル
                null;
              
              allNews.push({
                title: item.title || '',
                description: item.snippet || '',
                link: item.link || '',
                pubDate: item.pagemap?.metatags?.[0]?.['article:published_time'] || new Date().toISOString(),
                source: getSourceName(item.displayLink || ''),
                thumbnailUrl: thumbnailUrl
              });
            }
          });
        }

        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`キーワード "${keyword}" の検索エラー:`, error);
        continue;
      }
    }

    // 日付順でソート（新しい順）
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // 最新50件に制限
    const limitedNews = allNews.slice(0, 50);

    console.log(`Google API取得完了: ${limitedNews.length}件のニュースを取得`);

    res.status(200).json({
      success: true,
      totalSaved: limitedNews.length,
      news: limitedNews
    });

  } catch (error) {
    console.error('Error in fetch-news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news'
    });
  }
};

function getSourceName(displayLink) {
  if (displayLink.includes('response.jp')) return 'Response';
  if (displayLink.includes('car.watch.impress.co.jp')) return 'Car Watch';
  if (displayLink.includes('autoc-one.jp')) return 'AUTOC ONE';
  if (displayLink.includes('webcg.net')) return 'WebCG';
  if (displayLink.includes('toyota.co.jp')) return 'トヨタ';
  if (displayLink.includes('honda.co.jp')) return 'ホンダ';
  if (displayLink.includes('nissan.co.jp')) return '日産';
  if (displayLink.includes('mazda.co.jp')) return 'マツダ';
  if (displayLink.includes('subaru.co.jp')) return 'スバル';
  if (displayLink.includes('lexus.co.jp')) return 'レクサス';
  if (displayLink.includes('suzuki.co.jp')) return 'スズキ';
  if (displayLink.includes('daihatsu.co.jp')) return 'ダイハツ';
  if (displayLink.includes('yahoo.co.jp')) return 'Yahoo!ニュース';
  if (displayLink.includes('asahi.com')) return '朝日新聞';
  if (displayLink.includes('mainichi.jp')) return '毎日新聞';
  if (displayLink.includes('sankei.com')) return '産経新聞';
  if (displayLink.includes('nikkei.com')) return '日本経済新聞';
  if (displayLink.includes('reuters.com')) return 'ロイター';
  if (displayLink.includes('bloomberg.com')) return 'ブルームバーグ';
  if (displayLink.includes('autoblog.com')) return 'Autoblog';
  if (displayLink.includes('caranddriver.com')) return 'Car and Driver';
  if (displayLink.includes('motortrend.com')) return 'Motor Trend';
  if (displayLink.includes('carbuzz.com')) return 'CarBuzz';
  if (displayLink.includes('thedrive.com')) return 'The Drive';
  
  // ドメイン名から推測
  const domain = displayLink.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return domain || 'Unknown';
}
