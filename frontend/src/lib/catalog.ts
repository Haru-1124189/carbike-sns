import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { normalizeMakerAndModel } from '../utils/normalizer';

export interface VehicleCatalogEntry {
  maker: string; // canonical
  model: string; // canonical
  years: string[]; // "1999.4～2004.3" 等の行配列
  updatedAt?: any;
}

const buildId = (maker: string, model: string) => `${maker}__${model}`;

// 文字列の年式行を正規化し、重複を除去して並べ替え（開始年月の昇順）
const normalizeYearLines = (lines: string[]): string[] => {
  const set = new Set<string>();
  for (const l of lines) {
    const line = (l || '').trim();
    if (!line) continue;
    set.add(line);
  }
  const arr = Array.from(set);
  // ソート: 行頭の yyyy.mm を抽出して昇順
  arr.sort((a, b) => {
    const m = a.match(/^(\d{4})(?:\.(\d{1,2}))?/);
    const n = b.match(/^(\d{4})(?:\.(\d{1,2}))?/);
    const ay = m ? Number(m[1]) : 0;
    const am = m && m[2] ? Number(m[2]) : 1;
    const by = n ? Number(n[1]) : 0;
    const bm = n && n[2] ? Number(n[2]) : 1;
    return ay === by ? am - bm : ay - by;
  });
  return arr;
};

// 承認時に呼び出し: 既存エントリがあればyearsをマージ、なければ新規作成
export const upsertVehicleCatalogEntry = async (
  rawMaker: string,
  rawModel: string,
  yearMultiline: string
): Promise<VehicleCatalogEntry> => {
  const db = getFirestore();
  const { maker, model } = normalizeMakerAndModel(rawMaker, rawModel);
  const id = buildId(maker, model);
  const ref = doc(db, 'vehicle_catalog', id);
  const snap = await getDoc(ref);
  const newLines = (yearMultiline || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (snap.exists()) {
    const data = snap.data() as VehicleCatalogEntry;
    const merged = normalizeYearLines([...(data.years || []), ...newLines]);
    const updated: VehicleCatalogEntry = { maker, model, years: merged, updatedAt: serverTimestamp() };
    await setDoc(ref, updated, { merge: true });
    return updated;
  } else {
    const created: VehicleCatalogEntry = { maker, model, years: normalizeYearLines(newLines), updatedAt: serverTimestamp() };
    await setDoc(ref, created, { merge: true });
    return created;
  }
};


