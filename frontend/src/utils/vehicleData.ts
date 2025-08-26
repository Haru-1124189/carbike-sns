import { VehicleModel } from '../types/vehicleData';

// 利用可能なメーカーリスト（データファイルが存在するもののみ）
const AVAILABLE_MANUFACTURERS = [
  'toyota',
  'honda',
  'nissan',
  'mazda',
  'suzuki',
  'subaru',
  'mitsubishi',
  'daihatsu'
];

// メーカー別の車種データを動的に読み込む
const loadManufacturerData = async (manufacturer: string): Promise<VehicleModel[]> => {
  try {
    const data = await import(`../data/vehicleModels/${manufacturer.toLowerCase()}.json`);
    return data.default.models || [];
  } catch (error) {
    console.warn(`Failed to load data for manufacturer: ${manufacturer}`, error);
    return [];
  }
};

// 詳細データを動的に読み込む
const loadDetailedManufacturerData = async (manufacturer: string): Promise<VehicleModel[]> => {
  try {
    const data = await import(`../data/vehicleModels/${manufacturer.toLowerCase()}-detailed.json`);
    return data.default.models || [];
  } catch (error) {
    console.warn(`Failed to load detailed data for manufacturer: ${manufacturer}`, error);
    return [];
  }
};

export class VehicleDataService {
  private static cache: Map<string, VehicleModel[]> = new Map();

  // 全車種データを取得（キャッシュ付き）
  static async getAllVehicleModels(): Promise<VehicleModel[]> {
    const allModels: VehicleModel[] = [];
    
    for (const manufacturer of AVAILABLE_MANUFACTURERS) {
      if (!this.cache.has(manufacturer)) {
        const models = await loadManufacturerData(manufacturer);
        this.cache.set(manufacturer, models);
      }
      allModels.push(...this.cache.get(manufacturer)!);
    }
    
    return allModels;
  }

  // メーカー別車種データを取得
  static async getVehicleModelsByManufacturer(manufacturer: string): Promise<VehicleModel[]> {
    const key = manufacturer.toLowerCase();
    
    if (!this.cache.has(key)) {
      const models = await loadManufacturerData(manufacturer);
      this.cache.set(key, models);
    }
    
    return this.cache.get(key) || [];
  }

  // 車種名で検索（基本データと詳細データを統合）
  static async searchVehicleModels(query: string, type?: 'car' | 'motorcycle'): Promise<VehicleModel[]> {
    const allModels = await this.getAllVehicleModels();
    const detailedModels = await this.getDetailedVehicleModels();
    
    // 基本データと詳細データを統合
    const combinedModels = [...allModels];
    
    // 詳細データを追加（重複を避ける）
    detailedModels.forEach(detailedModel => {
      const existingIndex = combinedModels.findIndex(model => 
        model.name === detailedModel.name && model.manufacturer === detailedModel.manufacturer
      );
      
      if (existingIndex >= 0) {
        // 既存のモデルを詳細データで置き換え
        combinedModels[existingIndex] = detailedModel;
      } else {
        // 新しい詳細モデルを追加
        combinedModels.push(detailedModel);
      }
    });
    
    return combinedModels.filter(model => {
      const matchesQuery = model.name.toLowerCase().includes(query.toLowerCase()) ||
                          model.displayName.toLowerCase().includes(query.toLowerCase()) ||
                          model.manufacturer?.toLowerCase().includes(query.toLowerCase());
      const matchesType = !type || model.type === type;
      
      return matchesQuery && matchesType;
    });
  }

  // 詳細データを含む車種検索
  static async searchDetailedVehicleModels(query: string, type?: 'car' | 'motorcycle'): Promise<VehicleModel[]> {
    const detailedModels = await this.getDetailedVehicleModels();
    
    return detailedModels.filter(model => {
      const matchesQuery = model.name.toLowerCase().includes(query.toLowerCase()) ||
                          model.displayName.toLowerCase().includes(query.toLowerCase());
      const matchesType = !type || model.type === type;
      
      return matchesQuery && matchesType;
    });
  }

  // 詳細データを取得
  static async getDetailedVehicleModels(): Promise<VehicleModel[]> {
    const detailedModels: VehicleModel[] = [];
    
    // 現在はマツダのみ詳細データあり
    const mazdaDetailed = await loadDetailedManufacturerData('mazda');
    detailedModels.push(...mazdaDetailed);
    
    return detailedModels;
  }

  // 特定の車種の詳細情報を取得
  static async getVehicleDetails(manufacturer: string, modelName: string): Promise<VehicleModel | null> {
    const detailedModels = await this.getDetailedVehicleModels();
    return detailedModels.find(model => 
      model.manufacturer.toLowerCase() === manufacturer.toLowerCase() && 
      model.name.toLowerCase() === modelName.toLowerCase()
    ) || null;
  }

  // エンジン排気量で検索
  static async searchByEngine(engineQuery: string): Promise<VehicleModel[]> {
    const detailedModels = await this.getDetailedVehicleModels();
    const results: VehicleModel[] = [];
    
    detailedModels.forEach(model => {
      if (model.generations) {
        model.generations.forEach(generation => {
          generation.grades.forEach(grade => {
            if (grade.engine && grade.engine.toLowerCase().includes(engineQuery.toLowerCase())) {
              // 該当するグレードが見つかった場合、その車種を結果に追加
              if (!results.find(r => r.name === model.name)) {
                results.push(model);
              }
            }
          });
        });
      }
    });
    
    return results;
  }

  // 駆動方式で検索
  static async searchByDrivetrain(drivetrain: string): Promise<VehicleModel[]> {
    const detailedModels = await this.getDetailedVehicleModels();
    const results: VehicleModel[] = [];
    
    detailedModels.forEach(model => {
      if (model.generations) {
        model.generations.forEach(generation => {
          generation.grades.forEach(grade => {
            if (grade.drivetrain && grade.drivetrain.toLowerCase().includes(drivetrain.toLowerCase())) {
              if (!results.find(r => r.name === model.name)) {
                results.push(model);
              }
            }
          });
        });
      }
    });
    
    return results;
  }

  // メーカーリストを取得
  static getManufacturers(): string[] {
    return AVAILABLE_MANUFACTURERS.map(m => m.charAt(0).toUpperCase() + m.slice(1));
  }

  // 人気車種を取得
  static async getPopularModels(): Promise<VehicleModel[]> {
    const popularModelNames = [
      'トヨタ カローラ',
      'トヨタ プリウス',
      'ホンダ シビック',
      'ホンダ フィット',
      '日産 リーフ',
      '日産 スカイライン',
      'マツダ CX-5',
      'スバル フォレスター',
      '三菱 アウトランダー',
      'ダイハツ タント'
    ];

    const allModels = await this.getAllVehicleModels();
    return allModels.filter(model => 
      popularModelNames.includes(model.displayName)
    );
  }

  // キャッシュをクリア
  static clearCache(): void {
    this.cache.clear();
  }

  // デバッグ用：現在のキャッシュ状態を確認
  static getCacheStatus(): { [key: string]: number } {
    const status: { [key: string]: number } = {};
    this.cache.forEach((models, key) => {
      status[key] = models.length;
    });
    return status;
  }
}

// 後方互換性のため、既存の関数も残す
export const getVehicleModels = VehicleDataService.getAllVehicleModels.bind(VehicleDataService);
export const searchVehicleModels = VehicleDataService.searchVehicleModels.bind(VehicleDataService);
export const getManufacturers = VehicleDataService.getManufacturers.bind(VehicleDataService);
export const getPopularModels = VehicleDataService.getPopularModels.bind(VehicleDataService);

// 新しい詳細検索関数
export const searchDetailedVehicleModels = VehicleDataService.searchDetailedVehicleModels.bind(VehicleDataService);
export const getVehicleDetails = VehicleDataService.getVehicleDetails.bind(VehicleDataService);
export const searchByEngine = VehicleDataService.searchByEngine.bind(VehicleDataService);
export const searchByDrivetrain = VehicleDataService.searchByDrivetrain.bind(VehicleDataService);
