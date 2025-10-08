// 文字正規化（スペース/大文字小文字/全角半角/かな→カナ など）と
// メーカー/モデルの別名統一用の軽量辞書ベース正規化ユーティリティ

// 全角→半角、ひらがな→カタカナ などの簡易変換
const toWideNarrowNormalized = (input: string): string => {
  let s = input.trim();
  // 全角英数字→半角
  s = s.replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
  // 全角スペース→半角
  s = s.replace(/　/g, ' ');
  // 連続スペースを単一に
  s = s.replace(/\s+/g, ' ');
  // ひらがな→カタカナ
  s = s.replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
  // 長音・ハイフン類を半角ハイフンに統一
  s = s.replace(/[‐‑‒–—―ー−‐]/g, '-');
  return s;
};

// メーカー別名辞書（必要に応じて拡張）
const makerAliasMap: Record<string, string> = {
  'HONDA': 'ホンダ',
  '本田': 'ホンダ',
  'ニッサン': '日産',
  'NISSAN': '日産',
  'トヨタ': 'トヨタ',
  'TOYOTA': 'トヨタ',
  'スズキ': 'スズキ',
  'SUZUKI': 'スズキ',
  'マツダ': 'マツダ',
  'MAZDA': 'マツダ',
  '三菱': '三菱',
  'ミツビシ': '三菱',
  'MITSUBISHI': '三菱',
  'ダイハツ': 'ダイハツ',
  'DAIHATSU': 'ダイハツ',
  'スバル': 'スバル',
  'SUBARU': 'スバル',
  'いすゞ': 'いすゞ',
  'ISUZU': 'いすゞ',
  'レクサス': 'レクサス',
  'LEXUS': 'レクサス',
  '日野': '日野',
  'HINO': '日野',
  'ミニ': 'ミニ',
  'MINI': 'ミニ',
  'メルセデス': 'メルセデス',
  'MERCEDES': 'メルセデス',
};

// 管理UIからの上書き（現状はlocalStorageベース）
const loadOverrides = (): { maker: Record<string,string>; model: Record<string,string> } => {
  try {
    const raw = localStorage.getItem('aliasOverrides');
    if (!raw) return { maker: {}, model: {} };
    const parsed = JSON.parse(raw);
    return { maker: parsed.maker || {}, model: parsed.model || {} };
  } catch {
    return { maker: {}, model: {} };
  }
};

// モデル別名辞書（例示。必要に応じて拡張/生成）
const modelAliasMap: Record<string, string> = {
  'エヌワン': 'N-ONE',
  'N ONE': 'N-ONE',
  'N–ONE': 'N-ONE',
  'N—ONE': 'N-ONE',
  'CIVIC': 'CIVIC', // 大文字統一例
  'シビック': 'CIVIC',
  'TYPE R': 'TYPE R',
};

// 汎用正規化（共通）
export const normalizeBase = (text: string): string => {
  if (!text) return '';
  let s = toWideNarrowNormalized(text);
  // 英字は大文字に統一
  s = s.replace(/[a-z]/g, (c) => c.toUpperCase());
  // 前後の記号や余計なスペースを少し整える
  s = s.replace(/\s*([-\/])\s*/g, '$1'); // ハイフン/スラッシュの前後スペース除去
  s = s.trim();
  return s;
};

export const normalizeMaker = (maker: string): string => {
  const base = normalizeBase(maker);
  const overrides = loadOverrides();
  if (overrides.maker[base]) return overrides.maker[base];
  // 別名辞書適用（完全一致で吸収）
  if (makerAliasMap[base]) return makerAliasMap[base];
  return base;
};

export const normalizeModel = (model: string): string => {
  const base = normalizeBase(model);
  const overrides = loadOverrides();
  if (overrides.model[base]) return overrides.model[base];
  if (modelAliasMap[base]) return modelAliasMap[base];
  return base;
};

export const normalizeMakerAndModel = (maker: string, model: string) => {
  return {
    maker: normalizeMaker(maker),
    model: normalizeModel(model)
  };
};


