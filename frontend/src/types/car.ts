export interface CarYearRange {
  start_year: number;
  start_month: number;
  end_year: number;
  end_month: number;
}

export interface Car {
  id: string; // normalized_name
  display_name: string;
  maker_name: string;
  normalized_name: string;
  aliases: string[];
  ranges: CarYearRange[];
  is_incomplete: boolean;
  display_name_ja?: string;
  display_name_en?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CarApplicationForm {
  maker_name: string;
  model_name: string;
  start_year: number;
  start_month: number;
  end_year: number;
  end_month: number;
}

export interface CarApplicationResult {
  success: boolean;
  message: string;
  car?: Omit<Car, 'updated_at' | 'created_at'> & { updated_at?: any; created_at?: any }; // Firebase FieldValue対応
  isNewCar?: boolean;
  isRangeAdded?: boolean;
}

// 車種の正規化・検索用のユーティリティ型
export interface CarNormalizationResult {
  normalizedName: string;
  displayName: string;
  makerName: string;
}
