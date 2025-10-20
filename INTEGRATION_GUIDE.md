# 🚀 動画アップロード最適化 - 統合ガイド

## 📋 実装概要

この最適化により以下の改善が期待できます：
- **アップロード時間**: 50%以上短縮
- **ストレージ容量**: 50%以上削減
- **重複ファイル**: 完全排除
- **自動クリーンアップ**: 未使用ファイルの自動削除

## 🔧 インストール手順

### 1. フロントエンド依存関係

```bash
cd frontend
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

### 2. バックエンド依存関係

```bash
cd backend
npm install fluent-ffmpeg multer sharp bull redis
```

### 3. システム依存関係（FFmpeg）

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
```bash
# Chocolateyを使用
choco install ffmpeg

# または手動ダウンロード
# https://ffmpeg.org/download.html
```

## ⚙️ 環境変数設定

### バックエンド (.env)

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json

# Video Compression Settings
MAX_CONCURRENT_COMPRESSION_JOBS=3
TEMP_DIR=./temp
MAX_FILE_SIZE_MB=500

# Cleanup Settings
CLEANUP_UNUSED_FILES_AFTER_DAYS=30
CLEANUP_OLD_FILES_AFTER_DAYS=90
```

### フロントエンド (.env.local)

```env
# バックエンドAPI URL
NEXT_PUBLIC_API_URL=http://localhost:3003
```

## 🗂️ ファイル構造

```
backend/
├── utils/
│   └── videoCompression.js          # FFmpeg圧縮ユーティリティ
├── workers/
│   └── compressionWorker.js         # ワーカースレッド
├── services/
│   ├── compressionQueue.js          # 圧縮ジョブ管理
│   └── fileDeduplication.js         # 重複ファイル管理
├── routes/
│   └── videoUpload.js               # 動画アップロードAPI
├── scripts/
│   └── cleanupStorage.js            # ストレージクリーンアップ
└── temp/                            # 一時ファイルディレクトリ

frontend/
├── utils/
│   └── videoCompression.ts          # フロントエンド圧縮
└── lib/
    └── upload.ts                    # 統合アップロード関数
```

## 🔄 統合手順

### 1. 既存のUploadVideoPageを更新

```typescript
// UploadVideoPage.tsx の変更点
import { compressVideo, getVideoMetadata, shouldCompress } from '../utils/videoCompression';

// handleVideoSelect関数を更新
const handleVideoSelect = async (file: File) => {
  setVideoFile(file);
  
  // メタデータを取得
  const metadata = await getVideoMetadata(file);
  setDurationSec(metadata.duration);
  
  // 圧縮の必要性を表示
  const needsCompression = shouldCompress(file, metadata);
  if (needsCompression) {
    console.log('この動画は圧縮されます');
  }
};
```

### 2. アップロード処理の更新

既存の`uploadToStorage`関数は自動的に新しい圧縮機能を使用します。
変更は不要です。

### 3. バックエンドAPIの統合

`server.js`に新しいルートが追加されています：
- `POST /api/video/upload` - 動画アップロード
- `GET /api/video/job/:jobId` - ジョブ状態確認
- `GET /api/video/queue/stats` - キュー統計

## 🚀 使用方法

### 基本的な動画アップロード

```typescript
// フロントエンド（既存のコードと同様）
const videoUrl = await uploadToStorage(userId, videoFile, false, false, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});
```

### 圧縮ジョブの監視

```typescript
// ジョブ状態を確認
const response = await fetch(`/api/video/job/${jobId}`);
const jobStatus = await response.json();

if (jobStatus.status === 'completed') {
  const downloadUrl = jobStatus.result.downloadUrl;
}
```

## 🛠️ 管理コマンド

### ストレージクリーンアップ

```bash
# 未参照ファイルを削除
node scripts/cleanupStorage.js

# 古いファイル（90日以上）を削除
node scripts/cleanupStorage.js --delete-old 90

# 統計のみ表示
node scripts/cleanupStorage.js --stats-only
```

### 重複ファイル統合

```bash
curl -X POST http://localhost:3003/api/video/files/merge-duplicates
```

## 📊 監視とメトリクス

### キュー統計の確認

```bash
curl http://localhost:3003/api/video/queue/stats
```

### ファイル統計の確認

```bash
curl http://localhost:3003/api/video/files/stats
```

## ⚠️ 注意点とトラブルシューティング

### 1. FFmpegのインストール確認

```bash
ffmpeg -version
```

### 2. 一時ディレクトリの権限

```bash
mkdir -p backend/temp
chmod 755 backend/temp
```

### 3. メモリ使用量の監視

大量の動画圧縮時はメモリ使用量が増加します。
必要に応じて`MAX_CONCURRENT_COMPRESSION_JOBS`を調整してください。

### 4. ストレージ容量の監視

Firebase Storageの使用量を定期的に確認し、クリーンアップスクリプトを実行してください。

### 5. エラーハンドリング

圧縮に失敗した場合は、元のファイルがアップロードされます。
ログを確認して問題を特定してください。

## 🔧 パフォーマンス最適化

### 1. 圧縮設定の調整

`backend/utils/videoCompression.js`の`COMPRESSION_CONFIG`を調整：

```javascript
const COMPRESSION_CONFIG = {
  video: {
    crf: 23,        // 品質 (18-28)
    preset: 'fast', // 速度 (ultrafast, fast, medium, slow)
    maxrate: '1500k' // ビットレート制限
  }
};
```

### 2. 同時実行数の調整

```javascript
// backend/services/compressionQueue.js
this.maxConcurrentJobs = 3; // CPUコア数に応じて調整
```

### 3. フロントエンド圧縮の無効化

軽量な動画の場合は、フロントエンド圧縮をスキップできます：

```typescript
// フロントエンド圧縮をスキップ
const processedFile = needsCompression ? 
  await compressVideo(file, options, onProgress) : 
  file;
```

## 📈 期待される改善効果

### アップロード時間
- **圧縮前**: 100MB動画 = 約10分（低速回線）
- **圧縮後**: 30MB動画 = 約3分（50%以上短縮）

### ストレージ容量
- **平均圧縮率**: 60-70%
- **1TB動画**: 300-400MBに削減

### 重複排除
- **同じファイル**: 2回目以降は即座に完了
- **類似ファイル**: ハッシュ比較で重複検出

## 🔄 段階的導入

1. **フェーズ1**: フロントエンド圧縮のみ導入
2. **フェーズ2**: バックエンド圧縮を追加
3. **フェーズ3**: 重複チェック機能を追加
4. **フェーズ4**: 自動クリーンアップを追加

各フェーズで動作確認を行い、問題がなければ次のフェーズに進んでください。
