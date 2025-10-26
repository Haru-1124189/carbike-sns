import { useEffect, useState } from 'react';
import { NewsItem } from '../types';

export const useNews = (limitCount: number = 10) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // VercelのAPI Routesを使用
        const response = await fetch('/api/fetch-news');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          const newsData: NewsItem[] = data.news.slice(0, limitCount).map((item: any) => ({
            id: item.link, // リンクをIDとして使用
            title: item.title,
            link: item.link,
            summary: item.description,
            published: item.pubDate,
            source: item.source,
            thumbnailUrl: undefined, // 必要に応じて追加
            createdAt: new Date(item.pubDate)
          }));
          
          setNews(newsData);
          setError(null);
        } else {
          setError('ニュースの取得に失敗しました');
        }
      } catch (err) {
        console.error('ニュース取得エラー:', err);
        setError('ニュースの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [limitCount]);

  return { news, loading, error };
};

export const useNewsCount = () => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // VercelではバックエンドAPIが使えないため、ニュース機能を無効化
    setLoading(false);
    setError('ニュース機能は現在ご利用いただけません');
  }, []);

  return { count, loading, error };
};
