import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { normalizeMakerAndModel } from '../utils/normalizer';

export const useVehicleYears = (maker?: string, model?: string) => {
  const [years, setYears] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!maker || !model) { setYears(null); return; }
      setLoading(true);
      try {
        const { maker: m, model: md } = normalizeMakerAndModel(maker, model);
        const id = `${m}__${md}`;
        const db = getFirestore();
        const ref = doc(db, 'vehicle_catalog', id);
        const snap = await getDoc(ref);
        if (!cancelled) {
          if (snap.exists()) {
            const data = snap.data() as any;
            setYears((data.years as string[]) || []);
          } else {
            setYears([]);
          }
        }
      } catch {
        if (!cancelled) setYears([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [maker, model]);

  return { years: years || [], loading };
};


