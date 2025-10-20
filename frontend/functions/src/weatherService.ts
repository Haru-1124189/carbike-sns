import { defineString } from 'firebase-functions/params';
import { OpenWeatherMapResponse, WeatherForecast } from './types';

// 環境変数を定義（新しい方法）
const openWeatherApiKey = defineString('OPENWEATHER_API_KEY');

// 都市IDマッピング（主要都市）
const CITY_IDS: { [key: string]: number } = {
  '熊本市': 1858421,
  '玉名市': 1858421, // 玉名市は熊本市と同じIDを使用（近隣地域）
  '東京都': 1850147,
  '大阪市': 1853909,
  '名古屋市': 1856057,
  '札幌市': 2130037,
  '仙台市': 2113014,
  '福岡市': 1859894,
  '広島市': 1862415,
  '北九州市': 1859642,
  '静岡市': 1857352,
  '神戸市': 1859171,
  '京都市': 1857910,
  '横浜市': 1848354,
  '川崎市': 1859730,
  'さいたま市': 6940394,
  '千葉市': 2113014,
  '堺市': 1853293,
  '新潟市': 1855431,
  '浜松市': 1860827,
  '岡山市': 1854383,
  '相模原市': 1853293,
  '鹿児島市': 1860827,
  '宇都宮市': 1849053,
  '松山市': 1864226,
  '東大阪市': 1853909,
  '船橋市': 2113014,
  '姫路市': 1859171,
  '西宮市': 1859171,
  '高槻市': 1853909,
  '大津市': 1857907,
  '豊田市': 1856057,
  '岐阜市': 1863640,
  '金沢市': 1853574,
  '富山市': 1850315,
  '福山市': 1862415,
  '高松市': 1856177,
  '徳島市': 1849796,
  '松江市': 1852442,
  '鳥取市': 1849892,
  '山口市': 1848689,
  '那覇市': 1854345
};

// 天気コードを日本語に変換
const WEATHER_TRANSLATION: { [key: string]: string } = {
  'Clear': '晴れ',
  'Clouds': '曇り',
  'Rain': '雨',
  'Drizzle': '霧雨',
  'Thunderstorm': '雷雨',
  'Snow': '雪',
  'Mist': '霧',
  'Fog': '濃霧',
  'Haze': '煙霧',
  'Dust': '砂塵',
  'Sand': '砂嵐',
  'Ash': '火山灰',
  'Squall': '突風',
  'Tornado': '竜巻'
};

/**
 * OpenWeatherMap APIから天気予報データを取得
 */
export const fetchWeatherForecast = async (cityName: string): Promise<WeatherForecast[]> => {
  const apiKey = openWeatherApiKey.value();
  if (!apiKey) {
    throw new Error('OpenWeatherMap API key is not configured. Please set it in .env file as OPENWEATHER_API_KEY="your_key"');
  }

  const cityId = CITY_IDS[cityName];
  if (!cityId) {
    throw new Error(`City "${cityName}" not found in city mapping`);
  }

  try {
    // 5日間の天気予報を取得（3時間間隔）
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${apiKey}&units=metric&lang=ja`
    );

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
    }

    const data: OpenWeatherMapResponse = await response.json();
    
    // 日付ごとにデータをグループ化
    const dailyForecasts = new Map<string, WeatherForecast>();
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD形式
      
      const weatherDescription = WEATHER_TRANSLATION[item.weather[0].main] || item.weather[0].description;
      
      if (dailyForecasts.has(dateKey)) {
        // 既存の日付データを更新（最高・最低気温を比較）
        const existing = dailyForecasts.get(dateKey)!;
        existing.temperature.max = Math.max(existing.temperature.max, item.main.temp_max);
        existing.temperature.min = Math.min(existing.temperature.min, item.main.temp_min);
        
        // 降水確率の最大値を記録
        existing.precipitation = Math.max(existing.precipitation, Math.round(item.pop * 100));
        
        // 風速の最大値を記録
        existing.windSpeed = Math.max(existing.windSpeed, item.wind.speed);
      } else {
        // 新しい日付のデータを作成
        const forecast: WeatherForecast = {
          id: `${cityName}_${dateKey}`,
          city: cityName,
          forecastTime: new Date(dateKey + 'T00:00:00Z'),
          weather: weatherDescription,
          temperature: {
            max: item.main.temp_max,
            min: item.main.temp_min,
            current: item.main.temp
          },
          precipitation: Math.round(item.pop * 100),
          windSpeed: item.wind.speed,
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          updatedAt: new Date()
        };
        
        dailyForecasts.set(dateKey, forecast);
      }
    });
    
    return Array.from(dailyForecasts.values());
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

/**
 * 天気データをFirestoreに保存
 */
export const saveWeatherForecasts = async (
  forecasts: WeatherForecast[], 
  db: FirebaseFirestore.Firestore
): Promise<void> => {
  const batch = db.batch();
  const weatherCollection = db.collection('weather');
  
  try {
    for (const forecast of forecasts) {
      // 既存のドキュメントIDで保存（同じ日付のデータを上書き）
      const docRef = weatherCollection.doc(forecast.id);
      
      // Firestore用にDateをTimestampに変換
      const firestoreData = {
        ...forecast,
        forecastTime: new Date(forecast.forecastTime),
        updatedAt: new Date(forecast.updatedAt)
      };
      
      batch.set(docRef, firestoreData);
    }
    
    await batch.commit();
    console.log(`Successfully saved ${forecasts.length} weather forecasts`);
  } catch (error) {
    console.error('Error saving weather forecasts:', error);
    throw error;
  }
};

/**
 * 古い天気データを削除（7日以上前のデータ）
 */
export const cleanupOldWeatherData = async (db: FirebaseFirestore.Firestore): Promise<void> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  try {
    const query = db.collection('weather')
      .where('forecastTime', '<', sevenDaysAgo);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log('No old weather data to cleanup');
      return;
    }
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Cleaned up ${snapshot.size} old weather records`);
  } catch (error) {
    console.error('Error cleaning up old weather data:', error);
    throw error;
  }
};
