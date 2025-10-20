import { collection, limit, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';

// 天気データの型定義（フロントエンド用）
export interface WeatherForecast {
  id: string;
  city: string;
  forecastTime: Timestamp | Date;
  weather: string;
  temperature: {
    max: number;
    min: number;
    current?: number;
  };
  precipitation: number;
  windSpeed: number;
  humidity?: number;
  pressure?: number;
  updatedAt: Timestamp | Date;
}

/**
 * 指定都市の天気予報データを取得するカスタムフック
 */
export const useWeather = (cityName: string = '熊本市') => {
  const [weatherData, setWeatherData] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityName) {
      setLoading(false);
      return;
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
    const weatherId = `${cityName}_${todayString}`;

    const q = query(
      collection(db, 'weather'),
      where('id', '==', weatherId),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setLoading(false);
        
        if (snapshot.empty) {
          setWeatherData(null);
          setError(`今日の${cityName}の天気データが見つかりません`);
          return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data() as WeatherForecast;
        
        // TimestampをDateに変換
        const weatherForecast: WeatherForecast = {
          ...data,
          forecastTime: data.forecastTime instanceof Timestamp 
            ? data.forecastTime.toDate() 
            : new Date(data.forecastTime),
          updatedAt: data.updatedAt instanceof Timestamp 
            ? data.updatedAt.toDate() 
            : new Date(data.updatedAt)
        };

        setWeatherData(weatherForecast);
        setError(null);
      },
      (err) => {
        console.error('Weather data fetch error:', err);
        setLoading(false);
        setError('天気データの取得に失敗しました');
      }
    );

    return () => unsubscribe();
  }, [cityName]);

  return { weatherData, loading, error };
};

/**
 * 複数都市の天気予報データを取得するカスタムフック
 */
export const useMultipleWeather = (cityNames: string[] = ['熊本市']) => {
  const [weatherDataList, setWeatherDataList] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityNames.length) {
      setLoading(false);
      return;
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
    
    const weatherIds = cityNames.map(city => `${city}_${todayString}`);

    const q = query(
      collection(db, 'weather'),
      where('id', 'in', weatherIds),
      orderBy('city')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setLoading(false);
        
        const forecasts: WeatherForecast[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data() as WeatherForecast;
          
          // TimestampをDateに変換
          const weatherForecast: WeatherForecast = {
            ...data,
            forecastTime: data.forecastTime instanceof Timestamp 
              ? data.forecastTime.toDate() 
              : new Date(data.forecastTime),
            updatedAt: data.updatedAt instanceof Timestamp 
              ? data.updatedAt.toDate() 
              : new Date(data.updatedAt)
          };
          
          forecasts.push(weatherForecast);
        });

        setWeatherDataList(forecasts);
        setError(null);
      },
      (err) => {
        console.error('Multiple weather data fetch error:', err);
        setLoading(false);
        setError('天気データの取得に失敗しました');
      }
    );

    return () => unsubscribe();
  }, [cityNames.join(',')]); // 配列を文字列に変換して依存関係とする

  return { weatherDataList, loading, error };
};
