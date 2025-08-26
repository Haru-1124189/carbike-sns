// 統合された車種データの型定義
export interface UnifiedVehicleModel {
  id: string;
  maker_display: string;
  model: {
    name_en: string | null;
    name_ja: string | null;
    aliases: string[];
    id_name: string;
  };
  years: {
    start: number | null;
    end: number | null;
  };
  sources: string[];
  kinds_seen: string[];
  maker: {
    id: string;
    aliases: string[];
    display_candidates: string[];
  };
}

// 検索結果の型定義
export interface VehicleSearchResult {
  id: string;
  maker: string;
  model: string;
  displayName: string;
  years?: {
    start?: number;
    end?: number;
  };
  aliases: string[];
}

// 車種検索の状態
export interface VehicleSearchState {
  query: string;
  results: VehicleSearchResult[];
  isLoading: boolean;
  error: string | null;
}
