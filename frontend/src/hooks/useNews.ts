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
        const response = await fetch('/api/fetch-news');
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
    const fetchNewsCount = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/fetch-news');
        const data = await response.json();
        
        if (data.success) {
          setCount(data.totalSaved);
          setError(null);
        } else {
          setError('ニュース件数の取得に失敗しました');
        }
      } catch (err) {
        console.error('ニュース件数取得エラー:', err);
        setError('ニュース件数の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsCount();
  }, []);

  return { count, loading, error };
};
