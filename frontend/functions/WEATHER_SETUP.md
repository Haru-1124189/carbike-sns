# 天気予報機能のセットアップガイド

## 概要
Firebase Cloud Functionsを使用して、OpenWeatherMap APIから天気予報データを定期的に取得し、Firestoreに保存する機能です。

## 必要な環境変数

### 1. OpenWeatherMap API キーの設定

1. [OpenWeatherMap](https://openweathermap.org/api)にアクセスしてアカウントを作成
2. API キーを取得
3. Firebase Functionsの環境変数に設定：

```bash
# Firebase CLIを使用して環境変数を設定
firebase functions:config:set openweather.api_key="your_api_key_here"
```

### 2. 環境変数の確認

```bash
# 設定された環境変数を確認
firebase functions:config:get
```

## デプロイ手順

### 1. Cloud Functionsのビルドとデプロイ

```bash
cd frontend/functions
npm run build
firebase deploy --only functions
```

### 2. 手動テスト

デプロイ後、以下のURLで手動テストが可能：

```
https://your-project-id.cloudfunctions.net/fetchWeatherDataManual?city=熊本市
```

### 3. スケジュール実行の確認

Cloud Functionsのスケジュール実行は自動的に設定されます：
- **実行間隔**: 3時間ごと
- **タイムゾーン**: Asia/Tokyo
- **対象都市**: 熊本市、東京都、大阪市、名古屋市、福岡市

## Firestoreデータ構造

### weather コレクション

```typescript
interface WeatherForecast {
  id: string;              // 例: "熊本市_2024-01-15"
  city: string;            // 例: "熊本市"
  forecastTime: Date;      // 予報日時
  weather: string;         // 例: "晴れ", "曇り", "雨"
  temperature: {
    max: number;           // 最高気温
    min: number;           // 最低気温
    current?: number;      // 現在の気温
  };
  precipitation: number;   // 降水確率（%）
  windSpeed: number;       // 風速（m/s）
  humidity?: number;       // 湿度（%）
  pressure?: number;       // 気圧（hPa）
  updatedAt: Date;         // 更新日時
}
```

## フロントエンドでの使用方法

### 1. カスタムフックの使用

```typescript
import { useWeather } from '../hooks/useWeather';

const { weatherData, loading, error } = useWeather('熊本市');
```

### 2. コンポーネントの使用

```typescript
import { TodayWeatherWidget } from '../components/ui/TodayWeatherWidget';

<TodayWeatherWidget cityName="熊本市" />
```

## トラブルシューティング

### 1. APIキーエラー
- 環境変数が正しく設定されているか確認
- OpenWeatherMap APIキーが有効か確認

### 2. データが取得されない
- Cloud Functionsのログを確認
- Firestoreのセキュリティルールを確認

### 3. スケジュール実行が動かない
- Firebase ConsoleでCloud Functionsの実行履歴を確認
- ログでエラーメッセージを確認

## カスタマイズ

### 対象都市の変更

`frontend/functions/src/index.ts`の`targetCities`配列を編集：

```typescript
const targetCities = ['熊本市', '東京都', '大阪市', '名古屋市', '福岡市'];
```

### 実行間隔の変更

`frontend/functions/src/index.ts`のスケジュール設定を編集：

```typescript
// 現在: 3時間ごと
functions.pubsub.schedule('0 */3 * * *')

// 例: 6時間ごと
functions.pubsub.schedule('0 */6 * * *')
```
