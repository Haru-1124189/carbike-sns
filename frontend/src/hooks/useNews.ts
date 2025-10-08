import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { NewsItem } from '../types';

export const useNews = (limitCount: number = 10) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newsRef = collection(db, 'news');
    const q = query(
      newsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newsData: NewsItem[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const newsItem: NewsItem = {
            id: doc.id,
            title: data.title || '',
            link: data.link || '',
            summary: data.summary || '',
            published: data.published || '',
            source: data.source || '',
            thumbnailUrl: data.thumbnailUrl || undefined,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
          };
          
          // デバッグ情報を出力
          console.log('ニュースアイテム:', {
            title: newsItem.title,
            hasThumbnail: !!newsItem.thumbnailUrl,
            thumbnailUrl: newsItem.thumbnailUrl
          });
          
          newsData.push(newsItem);
        });

        setNews(newsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('ニュース取得エラー:', err);
        setError('ニュースの取得に失敗しました');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limitCount]);

  return { news, loading, error };
};

export const useNewsCount = () => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newsRef = collection(db, 'news');
    const q = query(newsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setCount(snapshot.size);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('ニュース件数取得エラー:', err);
        setError('ニュース件数の取得に失敗しました');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { count, loading, error };
};
