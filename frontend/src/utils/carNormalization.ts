/**
 * 車種名の正規化とエイリアス生成のためのユーティリティ
 */

// 日本語から英語へのメーカー名マッピング
const JAPANESE_TO_ENGLISH_MAKERS: Record<string, string> = {
  'トヨタ': 'Toyota',
  'ホンダ': 'Honda',
  '日産': 'Nissan',
  'マツダ': 'Mazda',
  'スバル': 'Subaru',
  'スズキ': 'Suzuki',
  'ダイハツ': 'Daihatsu',
  '三菱': 'Mitsubishi',
  'いすゞ': 'Isuzu',
  '日野': 'Hino',
  '光岡': 'Mitsuoka',
  'メルセデス': 'Mercedes',
  'BMW': 'BMW',
  'アウディ': 'Audi',
  'フォルクスワーゲン': 'Volkswagen',
  'フォード': 'Ford',
  'レクサス': 'Lexus',
  'インフィニティ': 'Infiniti',
  'アキュラ': 'Acura',
  'スマート': 'Smart',
  'ミニ': 'Mini',
};

// 日本語から英語へのモデル名マッピング
const JAPANESE_TO_ENGLISH_MODELS: Record<string, string> = {
  'カローラ': 'Corolla',
  'プリウス': 'Prius',
  'ヴィッツ': 'Vitz',
  'ハイラックス': 'Hilux',
  'ランドクルーザー': 'Land Cruiser',
  'ハリアー': 'Harrier',
  'RAV4': 'RAV4',
  'シビック': 'Civic',
  'フィット': 'Fit',
  'CR-V': 'CR-V',
  'NSX': 'NSX',
  'S2000': 'S2000',
  'GT-R': 'GT-R',
  'フェアレディZ': 'Fairlady Z',
  'スカイライン': 'Skyline',
  'マーチ': 'March',
  'エルグランド': 'Elgrand',
  'RX-7': 'RX-7',
  'RX-8': 'RX-8',
  'MX-5': 'MX-5',
  'ロードスター': 'Roadster',
  'インプレッサ': 'Impreza',
  'レガシィ': 'Legacy',
  'フォレスター': 'Forester',
  'WRX': 'WRX',
  'スイフト': 'Swift',
  'ワゴンR': 'Wagon R',
  'ジムニー': 'Jimny',
  'ミラ': 'Mira',
  'タント': 'Tanto',
  'エブリイ': 'Every',
  'ランサーエボリューション': 'Lancer Evolution',
  'ランサー': 'Lancer',
  'アウトランダー': 'Outlander',
  'デリカ': 'Delica',
  'エルフ': 'Elf',
  'ギガ': 'Giga',
  'プロフィア': 'Profia',
  'オロチ': 'Orochi',
  'ヒメラ': 'Himera',
  'ロッキー': 'Rocky',
  'コペン': 'Copen',
};

/**
 * 車種名を正規化する
 * @param makerName メーカー名
 * @param modelName モデル名
 * @returns 正規化結果のオブジェクト
 */
export function normalizeCarName(makerName: string, modelName: string): {
  normalizedName: string;
  displayName: string;
  makerName: string;
} {
  const displayName = `${makerName} ${modelName}`;
  
  let normalized = modelName.toLowerCase();

  // 全角を半角に変換
  normalized = normalized.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
  );
  // 全角スペースを半角スペースに変換
  normalized = normalized.replace(/　/g, ' ');
  // 不要な記号を削除
  normalized = normalized.replace(/[-_().,]/g, '');
  // 複数のスペースを1つに
  normalized = normalized.replace(/\s+/g, ' ');
  // 前後の空白を削除
  normalized = normalized.trim();

  // メーカー名を削除
  const allMakers = Object.keys(JAPANESE_TO_ENGLISH_MAKERS).concat(
    Object.values(JAPANESE_TO_ENGLISH_MAKERS)
  );
  for (const m of allMakers) {
    const regex = new RegExp(`\\b${m.toLowerCase()}\\b`, 'g');
    normalized = normalized.replace(regex, '').trim();
  }

  // 日本語モデル名を英語モデル名に変換
  for (const [jp, en] of Object.entries(JAPANESE_TO_ENGLISH_MODELS)) {
    if (normalized.includes(jp.toLowerCase())) {
      normalized = normalized.replace(jp.toLowerCase(), en.toLowerCase());
    }
  }

  // 最終的なクリーンアップ
  normalized = normalized.replace(/\s+/g, '').trim();

  return {
    normalizedName: `${makerName.toUpperCase()}_${normalized.toUpperCase()}`,
    displayName,
    makerName
  };
}

/**
 * エイリアスを生成する
 * @param makerName メーカー名
 * @param modelName モデル名
 * @returns エイリアスの配列
 */
export function generateAliases(makerName: string, modelName: string): string[] {
  const aliases = new Set<string>();

  // Normalize maker and model names
  const normalization = normalizeCarName(makerName, modelName);
  const normalizedMaker = makerName.toUpperCase();
  const normalizedModel = normalization.normalizedName;

  // Add original names
  aliases.add(makerName);
  aliases.add(modelName);

  // Add normalized names (uppercase)
  if (normalizedMaker) aliases.add(normalizedMaker);
  if (normalizedModel) aliases.add(normalizedModel);
  
  // Add lowercase versions too for search flexibility
  aliases.add(makerName.toLowerCase());
  aliases.add(modelName.toLowerCase());

  // Add combined names
  if (makerName && modelName) {
    aliases.add(`${makerName} ${modelName}`);
    aliases.add(`${modelName} ${makerName}`);
  }
  if (normalizedMaker && normalizedModel) {
    aliases.add(`${normalizedMaker}${normalizedModel}`);
    aliases.add(`${normalizedModel}${normalizedMaker}`);
  }

  // Add Japanese to English mappings
  const englishMaker = JAPANESE_TO_ENGLISH_MAKERS[makerName.toLowerCase()] || makerName;
  const englishModel = JAPANESE_TO_ENGLISH_MODELS[modelName.toLowerCase()] || modelName;

  aliases.add(englishMaker);
  aliases.add(englishModel);
  if (englishMaker && englishModel) {
    aliases.add(`${englishMaker} ${englishModel}`);
    aliases.add(`${englishModel} ${englishMaker}`);
  }

  // Add common variations (e.g., removing spaces, different cases)
  aliases.add(modelName.toLowerCase());
  aliases.add(modelName.toUpperCase());
  aliases.add(modelName.replace(/\s/g, ''));
  aliases.add(modelName.replace(/\s/g, '').toLowerCase());

  return Array.from(aliases).filter(Boolean); // Remove empty strings
}

