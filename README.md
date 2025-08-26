# Vehicle Catalog Collector

Wikidataから世界の車種・バイク種データを収集してFirestoreに保存するツールです。

## 概要

このツールは以下の機能を提供します：

1. **データ収集**: WikidataのSPARQLエンドポイントから車種・バイク種データを取得
2. **データ整形**: 全角/半角・ハイフンの統一、重複除去、別名統合
3. **Firestore保存**: 5000件単位でバッチ処理してFirestoreに保存

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase設定

Firebase Admin SDKのサービスアカウントキーを取得し、`firebase-service-account.json`として保存してください。

```bash
# Firebase Consoleからサービスアカウントキーをダウンロード
# プロジェクトのルートディレクトリに firebase-service-account.json として保存
```

### 3. ビルド

```bash
npm run build
```

## 使用方法

### データ収集のみ

```bash
npm run collect
```

### Firestoreアップロードのみ

```bash
npm run upload
```

### データ収集からアップロードまで一括実行

```bash
npm run all
```

## 出力ファイル

- `export/cars.jsonl`: 車種データ（JSONL形式）
- `export/bikes.jsonl`: バイク種データ（JSONL形式）
- `export/errors_cars.jsonl`: 車種アップロードエラー
- `export/errors_bikes.jsonl`: バイク種アップロードエラー

## データ構造

### 車種・バイク種データ

```json
{
  "kind": "car" | "bike",
  "maker": {
    "name": "メーカー名",
    "qid": "Qxxxx"
  },
  "model": "モデル名",
  "aka": ["別名1", "別名2"],
  "years": {
    "start": 2001,
    "end": 2006
  },
  "country": "Japan",
  "code": "型式コード",
  "series": "シリーズ名"
}
```

## SPARQLクエリ

### Wikidata SPARQL Query Service

- **URL**: https://query.wikidata.org/sparql
- **エンドポイント**: https://query.wikidata.org/sparql

### 車種取得クエリ

```sparql
# 世界の量産乗用車(Q141292)をメーカー付きで取得
SELECT ?item ?itemLabel ?maker ?makerLabel
       ?startYear ?endYear ?country ?countryLabel
       ?code ?series ?seriesLabel ?akaLabel
WHERE {
  ?item wdt:P31/wdt:P279* wd:Q141292 ;   # 量産乗用車
        wdt:P176 ?maker .               # メーカー
  OPTIONAL { ?item wdt:P577 ?s . BIND(YEAR(?s) AS ?startYear) }  # 生産開始年
  OPTIONAL { ?item wdt:P576 ?e . BIND(YEAR(?e) AS ?endYear) }    # 生産終了年
  OPTIONAL { ?item wdt:P495 ?country . }                         # 原産国
  OPTIONAL { ?item wdt:P528 ?code . }                            # 型式/コード
  OPTIONAL { ?item wdt:P179 ?series . }                          # シリーズ/世代
  OPTIONAL { ?item skos:altLabel ?akaLabel
            FILTER (LANG(?akaLabel) IN ("ja","en")) }            # 別名
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ja,en". }
}
```

### バイク種取得クエリ

```sparql
# 世界のオートバイ(Q34493)をメーカー付きで取得
SELECT ?item ?itemLabel ?maker ?makerLabel
       ?startYear ?endYear
       ?code ?series ?seriesLabel ?akaLabel
WHERE {
  ?item wdt:P31/wdt:P279* wd:Q34493 ;   # オートバイ
        wdt:P176 ?maker .
  OPTIONAL { ?item wdt:P577 ?s . BIND(YEAR(?s) AS ?startYear) }
  OPTIONAL { ?item wdt:P576 ?e . BIND(YEAR(?e) AS ?endYear) }
  OPTIONAL { ?item wdt:P528 ?code . }
  OPTIONAL { ?item wdt:P179 ?series . }
  OPTIONAL { ?item skos:altLabel ?akaLabel
            FILTER (LANG(?akaLabel) IN ("ja","en")) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ja,en". }
}
```

## Firestoreコレクション

- `catalog_cars`: 車種データ
- `catalog_bikes`: バイク種データ

## 注意事項

- WikidataのSPARQLエンドポイントにはレート制限があります
- 大量のデータを取得する場合は時間がかかる場合があります
- エラーが発生した場合は`export/errors_*.jsonl`ファイルを確認してください
- 日本語ラベルが無い場合は英語ラベルが使用されます

## ライセンス

MIT License
