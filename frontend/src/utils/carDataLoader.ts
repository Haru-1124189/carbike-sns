import { Car, CarYearRange } from '../types/car';

// 既存の車種データの型定義
export interface ExistingCarData {
  maker: string;
  model: string;
  codes: string[];
}

/**
 * JSONLファイルから車種データを読み込む
 */
export async function loadCarDataFromJsonl(filePath: string): Promise<ExistingCarData[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
    }
    
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    return lines.map(line => {
      try {
        return JSON.parse(line) as ExistingCarData;
      } catch (error) {
        console.error('Error parsing line:', line, error);
        return null;
      }
    }).filter((item): item is ExistingCarData => item !== null);
  } catch (error) {
    console.error(`Error loading car data from ${filePath}:`, error);
    return [];
  }
}

/**
 * 全ての車種データファイルを読み込む
 */
export async function loadAllCarData(): Promise<ExistingCarData[]> {
  const makers = [
    'acura', 'audi', 'bmw', 'daihatsu', 'eunos', 'ford', 'hino', 'honda', 
    'infiniti', 'isuzu', 'lexus', 'mazda', 'mercedes', 'mini', 'mitsubishi', 
    'mitsuoka', 'nissan', 'smart', 'subaru', 'suzuki', 'toyota', 'volkswagen'
  ];
  
  const allCarData: ExistingCarData[] = [];
  
  for (const maker of makers) {
    try {
      const carData = await loadCarDataFromJsonl(`/export/car_${maker}.jsonl`);
      allCarData.push(...carData);
    } catch (error) {
      console.error(`Failed to load ${maker} data:`, error);
    }
  }
  
  return allCarData;
}

/**
 * 既存の車種データを新しいCar形式に変換
 */
export function convertExistingCarData(
  existingData: ExistingCarData[], 
  defaultYearRange?: CarYearRange
): Car[] {
  const currentYear = new Date().getFullYear();
  const defaultRange: CarYearRange = defaultYearRange || {
    start_year: currentYear - 10,
    start_month: 1,
    end_year: currentYear,
    end_month: 12,
  };
  
  return existingData.map((data, index) => {
    const normalizedName = normalizeCarName(data.maker, data.model);
    
    return {
      id: normalizedName,
      display_name: data.model,
      maker_name: data.maker,
      normalized_name: normalizedName,
      aliases: generateAliases(data.maker, data.model, normalizedName),
      ranges: [defaultRange], // デフォルトの年式レンジを設定
      is_incomplete: true, // 既存データは年式情報がないため不完全としてマーク
      created_at: new Date(),
      updated_at: new Date(),
    };
  });
}

/**
 * 車種名を正規化（簡易版）
 */
function normalizeCarName(maker: string, model: string): string {
  return `${maker}_${model}`
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF]/g, '');
}

/**
 * エイリアスを生成（簡易版）
 */
function generateAliases(maker: string, model: string, normalizedName: string): string[] {
  const aliases = new Set<string>();
  
  aliases.add(normalizedName);
  aliases.add(maker);
  aliases.add(model);
  aliases.add(`${maker} ${model}`);
  aliases.add(`${maker}${model}`);
  
  return Array.from(aliases);
}

/**
 * メーカー別に車種データをグループ化
 */
export function groupCarDataByMaker(carData: ExistingCarData[]): Record<string, ExistingCarData[]> {
  return carData.reduce((groups, car) => {
    const maker = car.maker;
    if (!groups[maker]) {
      groups[maker] = [];
    }
    groups[maker].push(car);
    return groups;
  }, {} as Record<string, ExistingCarData[]>);
}

/**
 * 車種データを検索
 */
export function searchCarData(
  carData: ExistingCarData[], 
  searchTerm: string
): ExistingCarData[] {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  return carData.filter(car => 
    car.maker.toLowerCase().includes(normalizedSearchTerm) ||
    car.model.toLowerCase().includes(normalizedSearchTerm) ||
    car.codes.some(code => code.toLowerCase().includes(normalizedSearchTerm))
  );
}

/**
 * メーカー一覧を取得
 */
export function getMakers(carData: ExistingCarData[]): string[] {
  const makers = new Set(carData.map(car => car.maker));
  return Array.from(makers).sort();
}

/**
 * 指定されたメーカーのモデル一覧を取得
 */
export function getModelsByMaker(carData: ExistingCarData[], maker: string): string[] {
  const models = new Set(
    carData
      .filter(car => car.maker === maker)
      .map(car => car.model)
  );
  return Array.from(models).sort();
}
