import { Cloud, CloudRain, CloudSnow, Droplets, Sun, Wind } from 'lucide-react';
import React from 'react';
import { useWeather } from '../../hooks/useWeather';

interface TodayWeatherWidgetProps {
  prefecture?: string;
  city?: string;
}

export const TodayWeatherWidget: React.FC<TodayWeatherWidgetProps> = ({ prefecture = '熊本県', city = '熊本市' }) => {
  // 県名から県庁所在地を取得する関数
  const getPrefectureCapital = (prefecture: string): string => {
    const prefectureCapitals: { [key: string]: string } = {
      '北海道': '札幌市',
      '青森県': '青森市',
      '岩手県': '盛岡市',
      '宮城県': '仙台市',
      '秋田県': '秋田市',
      '山形県': '山形市',
      '福島県': '福島市',
      '茨城県': '水戸市',
      '栃木県': '宇都宮市',
      '群馬県': '前橋市',
      '埼玉県': 'さいたま市',
      '千葉県': '千葉市',
      '東京都': '東京都',
      '神奈川県': '横浜市',
      '新潟県': '新潟市',
      '富山県': '富山市',
      '石川県': '金沢市',
      '福井県': '福井市',
      '山梨県': '甲府市',
      '長野県': '長野市',
      '岐阜県': '岐阜市',
      '静岡県': '静岡市',
      '愛知県': '名古屋市',
      '三重県': '津市',
      '滋賀県': '大津市',
      '京都府': '京都市',
      '大阪府': '大阪市',
      '兵庫県': '神戸市',
      '奈良県': '奈良市',
      '和歌山県': '和歌山市',
      '鳥取県': '鳥取市',
      '島根県': '松江市',
      '岡山県': '岡山市',
      '広島県': '広島市',
      '山口県': '山口市',
      '徳島県': '徳島市',
      '香川県': '高松市',
      '愛媛県': '松山市',
      '高知県': '高知市',
      '福岡県': '福岡市',
      '佐賀県': '佐賀市',
      '長崎県': '長崎市',
      '熊本県': '熊本市',
      '大分県': '大分市',
      '宮崎県': '宮崎市',
      '鹿児島県': '鹿児島市',
      '沖縄県': '那覇市'
    };
    return prefectureCapitals[prefecture] || '熊本市';
  };

  const cityName = getPrefectureCapital(prefecture);
  const { weatherData, loading, error } = useWeather(cityName);

  // 天気アイコンを取得する関数
  const getWeatherIcon = (weather: string) => {
    if (weather.includes('晴')) {
      return <Sun size={20} className="text-yellow-400" />;
    } else if (weather.includes('雨')) {
      return <CloudRain size={20} className="text-blue-500" />;
    } else if (weather.includes('雪')) {
      return <CloudSnow size={20} className="text-blue-300" />;
    } else if (weather.includes('曇')) {
      return <Cloud size={20} className="text-gray-400" />;
    } else {
      return <Cloud size={20} className="text-gray-400" />;
    }
  };

  // 天気アイコンの絵文字を取得する関数
  const getWeatherEmoji = (weather: string) => {
    if (weather.includes('晴')) {
      return '☀️';
    } else if (weather.includes('雨')) {
      return '🌧️';
    } else if (weather.includes('雪')) {
      return '❄️';
    } else if (weather.includes('曇')) {
      return '☁️';
    } else {
      return '🌤️';
    }
  };

  if (loading) {
    return (
      <div className="p-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-xs text-text-secondary">天気情報を読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="p-3 mb-4">
        <div className="flex items-center space-x-2">
          <Cloud size={16} className="text-gray-400" />
          <span className="text-xs text-text-secondary">天気情報が利用できません</span>
        </div>
      </div>
    );
  }

  // 新APIのデータ構造に対応
  const temperature = weatherData.temperature;
  const description = weatherData.description || weatherData.weather;

  return (
    <div className="p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-lg">
            {getWeatherEmoji(description)}
          </div>
           <div>
             <div className="text-sm font-semibold text-text-primary">
               {prefecture}の天気：{description}
             </div>
           </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold text-text-primary">
            {temperature && typeof temperature === 'object' && temperature.max ? (
              <>
                <span className="text-orange-500">最高{Math.round(temperature.max)}℃</span>
                <span className="text-text-secondary mx-1">/</span>
                <span className="text-blue-500">最低{Math.round(temperature.min)}℃</span>
              </>
            ) : (
              <span className="text-orange-500">{temperature}℃</span>
            )}
          </div>
          {weatherData.feelsLike && (
            <div className="text-xs text-text-secondary">
              体感 {weatherData.feelsLike}℃
            </div>
          )}
        </div>
      </div>
      
      {/* 詳細情報 */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-light">
        {weatherData.windSpeed && (
          <div className="flex items-center space-x-1 text-xs text-text-secondary">
            <Wind size={12} />
            <span>風速 {weatherData.windSpeed}m/s</span>
          </div>
        )}
        {weatherData.humidity && (
          <div className="flex items-center space-x-1 text-xs text-text-secondary">
            <Droplets size={12} />
            <span>湿度 {weatherData.humidity}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
