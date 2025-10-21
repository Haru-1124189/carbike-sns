import {
    collection,
    DocumentData,
    DocumentSnapshot,
    getDocs,
    limit,
    onSnapshot,
    query,
    Query,
    QueryConstraint,
    startAfter
} from 'firebase/firestore';
import { db } from '../firebase/init';

// クエリキャッシュ
class QueryCache {
  private cache = new Map<string, { data: any[]; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分

  set(key: string, data: any[], ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  // パターンマッチでキャッシュを削除
  deletePattern(pattern: string) {
    const regex = new RegExp(pattern);
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const queryCache = new QueryCache();

/**
 * 最適化されたFirestoreクエリ実行
 */
export const executeOptimizedQuery = async <T>(
  collectionName: string,
  constraints: QueryConstraint[],
  options: {
    useCache?: boolean;
    cacheKey?: string;
    cacheTTL?: number;
    batchSize?: number;
  } = {}
): Promise<T[]> => {
  const {
    useCache = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5分
    batchSize = 20
  } = options;

  // キャッシュキーの生成
  const key = cacheKey || generateCacheKey(collectionName, constraints);
  
  // キャッシュチェック
  if (useCache) {
    const cached = queryCache.get(key);
    if (cached) {
      console.log(`📦 キャッシュヒット: ${collectionName}`);
      return cached;
    }
  }

  try {
    // バッチサイズを考慮したクエリ制約
    const optimizedConstraints = [...constraints];
    if (!constraints.some(c => c.type === 'limit')) {
      optimizedConstraints.push(limit(batchSize));
    }

    const q = query(collection(db, collectionName), ...optimizedConstraints);
    const snapshot = await getDocs(q);
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];

    // キャッシュに保存
    if (useCache) {
      queryCache.set(key, data, cacheTTL);
    }

    console.log(`📊 クエリ実行: ${collectionName} (${data.length}件)`);
    return data;
  } catch (error) {
    console.error(`❌ クエリエラー: ${collectionName}`, error);
    throw error;
  }
};

/**
 * ページネーション対応の最適化クエリ
 */
export const executePaginatedQuery = async <T>(
  collectionName: string,
  constraints: QueryConstraint[],
  lastDoc: DocumentSnapshot | null = null,
  pageSize: number = 20
): Promise<{
  data: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> => {
  try {
    const paginatedConstraints = [...constraints];
    
    if (lastDoc) {
      paginatedConstraints.push(startAfter(lastDoc));
    }
    
    paginatedConstraints.push(limit(pageSize + 1)); // 1つ多く取得してhasMore判定

    const q = query(collection(db, collectionName), ...paginatedConstraints);
    const snapshot = await getDocs(q);
    
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const data = docs.slice(0, pageSize).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];

    return {
      data,
      lastDoc: docs[pageSize - 1] || null,
      hasMore
    };
  } catch (error) {
    console.error(`❌ ページネーションクエリエラー: ${collectionName}`, error);
    throw error;
  }
};

/**
 * バッチクエリの実行（複数コレクションを並列取得）
 */
export const executeBatchQueries = async <T>(
  queries: Array<{
    collectionName: string;
    constraints: QueryConstraint[];
    cacheKey?: string;
  }>
): Promise<{ [key: string]: T[] }> => {
  const promises = queries.map(async ({ collectionName, constraints, cacheKey }) => {
    const data = await executeOptimizedQuery<T>(collectionName, constraints, {
      cacheKey: cacheKey || `${collectionName}_${Date.now()}`
    });
    return { [collectionName]: data };
  });

  const results = await Promise.allSettled(promises);
  
  return results.reduce((acc, result) => {
    if (result.status === 'fulfilled') {
      return { ...acc, ...result.value };
    } else {
      console.error('バッチクエリエラー:', result.reason);
      return acc;
    }
  }, {});
};

/**
 * キャッシュキーの生成
 */
const generateCacheKey = (collectionName: string, constraints: QueryConstraint[]): string => {
  const constraintStr = constraints
    .map(c => {
      switch (c.type) {
        case 'where':
          return `w_${(c as any).field}_${(c as any).op}_${(c as any).value}`;
        case 'orderBy':
          return `o_${(c as any).field}_${(c as any).direction}`;
        case 'limit':
          return `l_${(c as any).limit}`;
        case 'startAfter':
          return `sa_${(c as any).document?.id || 'null'}`;
        default:
          return c.type;
      }
    })
    .join('|');
  
  return `${collectionName}_${constraintStr}`;
};

/**
 * インデックス最適化のためのクエリ分析
 */
export const analyzeQuery = (collectionName: string, constraints: QueryConstraint[]) => {
  const analysis = {
    collection: collectionName,
    whereClauses: constraints.filter(c => c.type === 'where').length,
    orderByClauses: constraints.filter(c => c.type === 'orderBy').length,
    hasLimit: constraints.some(c => c.type === 'limit'),
    complexity: 'low' as 'low' | 'medium' | 'high'
  };

  // 複雑度の判定
  if (analysis.whereClauses > 2 || analysis.orderByClauses > 1) {
    analysis.complexity = 'high';
  } else if (analysis.whereClauses > 1 || analysis.orderByClauses > 0) {
    analysis.complexity = 'medium';
  }

  console.log(`🔍 クエリ分析: ${collectionName}`, analysis);
  return analysis;
};

/**
 * リアルタイムリスナーの最適化
 */
export class OptimizedListener {
  private listeners = new Map<string, () => void>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  subscribe<T>(
    key: string,
    query: Query<DocumentData>,
    callback: (data: T[]) => void,
    debounceMs: number = 300
  ) {
    // 既存のリスナーをクリーンアップ
    this.unsubscribe(key);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: any) => {
        // デバウンス処理
        if (this.debounceTimers.has(key)) {
          clearTimeout(this.debounceTimers.get(key)!);
        }

        this.debounceTimers.set(key, setTimeout(() => {
          const data = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
          })) as T[];

          callback(data);
          this.debounceTimers.delete(key);
        }, debounceMs));
      },
      (error: any) => {
        console.error(`❌ リスナーエラー: ${key}`, error);
      }
    );

    this.listeners.set(key, unsubscribe);
  }

  unsubscribe(key: string) {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }

    // デバウンスタイマーもクリーンアップ
    const timer = this.debounceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(key);
    }
  }

  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

export const optimizedListener = new OptimizedListener();
