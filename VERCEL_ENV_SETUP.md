# 🔧 Vercel環境変数設定

## 必要な環境変数

Vercel FunctionsでGoogle Custom Search APIを使用するために、以下の環境変数を設定する必要があります：

### 1. **Google Custom Search API設定**

```bash
# Vercelダッシュボードで設定
REACT_APP_GOOGLE_API_KEY=your_google_api_key_here
REACT_APP_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### 2. **Firebase設定（申請管理用）**

```bash
# 既存のFirebase設定を使用
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🔑 Google Custom Search API取得手順

### 1. **Google Cloud Console**
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存プロジェクトを選択
3. 「APIとサービス」→「ライブラリ」で「Custom Search API」を有効化
4. 「APIとサービス」→「認証情報」でAPIキーを作成

### 2. **Custom Search Engine**
1. [Google Custom Search Engine](https://cse.google.com/)にアクセス
2. 「新しい検索エンジンを追加」
3. 検索対象を「ウェブ全体」に設定
4. 検索エンジンIDを取得

## 💰 コスト

### Google Custom Search API
- **無料枠**: 1日100回検索
- **有料**: 100回を超えると$5/1000回

### Vercel Functions
- **無料枠**: 月100GB転送、1000回実行
- **有料**: Proプラン $20/月

## 🚀 デプロイ手順

1. **Vercelにプロジェクトを接続**
2. **環境変数を設定**（`REACT_APP_`プレフィックス付き）
3. **デプロイ実行**
4. **動作確認**

## 📝 注意点

- **フロントエンド環境変数**: `REACT_APP_`プレフィックスが必要
- **Vercel Functions**: `process.env.REACT_APP_*`でアクセス可能
- **既存の`.env.local`**: そのまま使用可能

## 📊 期待される効果

- **月額コスト**: ほぼ0円（無料枠内）
- **ニュース取得**: Google Custom Search APIで高品質なニュース
- **パフォーマンス**: Vercelの高速CDN
- **スケーラビリティ**: 自動スケーリング

これで、Google Custom Search APIを使った高品質なニュース取得がVercel Functionsで実現できます！
