import { useEffect, useMemo, useState } from 'react';

interface CatalogEntry {
  maker: string;
  model: string;
}

// export配下（public側）に置かれたJSON/JSONLを読み込み、メーカー/モデル一覧を構築
// 期待するファイル例: /export/wd_cars.jsonl, /export/wd_bikes.jsonl

const parseJSONL = async (url: string): Promise<any[]> => {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const text = await res.text();
    // JSON配列で来る場合
    const trimmed = text.trim();
    if (trimmed.startsWith('[')) {
      try { return JSON.parse(trimmed); } catch { /* fallthrough */ }
    }
    // JSONLとしてパース
    return text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try { return JSON.parse(l); } catch { return null; }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

export const useVehicleCatalog = () => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<CatalogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // 最低限、cars/bikesの2本を見る。json/jsonl両対応。
      const urls = [
        '/export/wd_cars.jsonl',
        '/export/wd_cars.json',
        '/export/wd_bikes.jsonl',
        '/export/wd_bikes.json'
      ];
      // フォールバック: メーカー別ファイル（存在する場合のみヒット）
      const carBrands = ['acura','audi','bmw','daihatu','eunos','ford','hino','honda','infiniti','isuzu','lexus','mazda','mercedes','mini','mitsubishi','mitsuoka','nissan','smart','subaru','suzuki','toyota','volkswagen'];
      const bikeBrands = ['aprilia','bimota','bmw','buell','ducati','harley_davidson','honda','husqvarna','indian','kawasaki','ktm','moto_guzzi','mv_agusta','royal_enfield','suzuki','triumph','yamaha'];
      carBrands.forEach(b => { urls.push(`/export/car_${b}.jsonl`); urls.push(`/export/car_${b}.json`); });
      bikeBrands.forEach(b => { urls.push(`/export/bike_${b}.jsonl`); urls.push(`/export/bike_${b}.json`); });
      const all: CatalogEntry[] = [];
      for (const url of urls) {
        const rows = await parseJSONL(url);
        for (const r of rows) {
          // 行の構造はプロジェクトのexportに合わせて柔軟に
          const maker = r.maker || r.brand || r.make || r.manufacturer || r.company || '';
          const model = r.model || r.name || r.model_name || r.full_name || r.displayName || r.code || '';
          if (maker && model) all.push({ maker, model });
        }
      }
      if (!cancelled) {
        setEntries(all);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const makers = useMemo(() => {
    const s = new Set(entries.map(e => e.maker));
    return Array.from(s).sort();
  }, [entries]);

  const makerToModels = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const e of entries) {
      if (!map[e.maker]) map[e.maker] = [];
      map[e.maker].push(e.model);
    }
    for (const k of Object.keys(map)) {
      map[k] = Array.from(new Set(map[k])).sort();
    }
    return map;
  }, [entries]);

  return { loading, makers, makerToModels };
};


