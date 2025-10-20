import { CarYearRange } from '../types/car';

/**
 * 年式レンジを月単位の数値に変換（比較用）
 */
function yearRangeToMonths(range: CarYearRange): number {
  return range.start_year * 12 + range.start_month - 1;
}

/**
 * 月単位の数値を年式レンジに変換
 */
function monthsToYearRange(months: number): CarYearRange {
  const year = Math.floor(months / 12);
  const month = (months % 12) + 1;
  return {
    start_year: year,
    start_month: month,
    end_year: year,
    end_month: month,
  };
}

/**
 * 2つの年式レンジが重複しているかチェック
 */
export function rangesOverlap(range1: CarYearRange, range2: CarYearRange): boolean {
  const start1 = yearRangeToMonths(range1);
  const end1 = yearRangeToMonths({ 
    start_year: range1.end_year, 
    start_month: range1.end_month, 
    end_year: 0, 
    end_month: 0 
  });
  
  const start2 = yearRangeToMonths(range2);
  const end2 = yearRangeToMonths({ 
    start_year: range2.end_year, 
    start_month: range2.end_month, 
    end_year: 0, 
    end_month: 0 
  });
  
  return start1 <= end2 && start2 <= end1;
}

/**
 * 2つの年式レンジが隣接しているかチェック（1ヶ月差以内）
 */
export function rangesAdjacent(range1: CarYearRange, range2: CarYearRange): boolean {
  const end1 = yearRangeToMonths({ 
    start_year: range1.end_year, 
    start_month: range1.end_month, 
    end_year: 0, 
    end_month: 0 
  });
  
  const start2 = yearRangeToMonths(range2);
  
  // 終了月の翌月が開始月と一致する場合
  return end1 + 1 === start2;
}

/**
 * 2つの年式レンジをマージ（重複・隣接している場合）
 */
export function mergeRanges(range1: CarYearRange, range2: CarYearRange): CarYearRange | null {
  if (!rangesOverlap(range1, range2) && !rangesAdjacent(range1, range2)) {
    return null; // マージできない
  }
  
  const start1 = yearRangeToMonths(range1);
  const end1 = yearRangeToMonths({ 
    start_year: range1.end_year, 
    start_month: range1.end_month, 
    end_year: 0, 
    end_month: 0 
  });
  
  const start2 = yearRangeToMonths(range2);
  const end2 = yearRangeToMonths({ 
    start_year: range2.end_year, 
    start_month: range2.end_month, 
    end_year: 0, 
    end_month: 0 
  });
  
  const mergedStart = Math.min(start1, start2);
  const mergedEnd = Math.max(end1, end2);
  
  const startRange = monthsToYearRange(mergedStart);
  const endRange = monthsToYearRange(mergedEnd);
  
  return {
    start_year: startRange.start_year,
    start_month: startRange.start_month,
    end_year: endRange.start_year,
    end_month: endRange.start_month,
  };
}

/**
 * 年式レンジの配列をソート（開始年月順）
 */
export function sortRanges(ranges: CarYearRange[]): CarYearRange[] {
  return [...ranges].sort((a, b) => {
    const startA = yearRangeToMonths(a);
    const startB = yearRangeToMonths(b);
    return startA - startB;
  });
}

/**
 * 年式レンジの配列をマージ（重複・隣接を統合）
 */
export function mergeRangeArray(ranges: CarYearRange[]): CarYearRange[] {
  if (ranges.length <= 1) {
    return ranges;
  }
  
  const sortedRanges = sortRanges(ranges);
  const mergedRanges: CarYearRange[] = [];
  let currentRange = sortedRanges[0];
  
  for (let i = 1; i < sortedRanges.length; i++) {
    const nextRange = sortedRanges[i];
    const merged = mergeRanges(currentRange, nextRange);
    
    if (merged) {
      currentRange = merged;
    } else {
      mergedRanges.push(currentRange);
      currentRange = nextRange;
    }
  }
  
  mergedRanges.push(currentRange);
  return mergedRanges;
}

/**
 * 新しい年式レンジを既存の配列に追加
 */
export function addYearRange(existingRanges: CarYearRange[], newRange: CarYearRange): CarYearRange[] {
  const allRanges = [...existingRanges, newRange];
  return mergeRangeArray(allRanges);
}

/**
 * 年式レンジに空白（抜け）があるかチェック
 */
export function hasGapsInRanges(ranges: CarYearRange[]): boolean {
  if (ranges.length <= 1) {
    return false;
  }
  
  const sortedRanges = sortRanges(ranges);
  
  for (let i = 0; i < sortedRanges.length - 1; i++) {
    const current = sortedRanges[i];
    const next = sortedRanges[i + 1];
    
    const currentEnd = yearRangeToMonths({ 
      start_year: current.end_year, 
      start_month: current.end_month, 
      end_year: 0, 
      end_month: 0 
    });
    
    const nextStart = yearRangeToMonths(next);
    
    // 2ヶ月以上の空白がある場合
    if (nextStart - currentEnd > 1) {
      return true;
    }
  }
  
  return false;
}

/**
 * 年式レンジが有効かチェック（開始 <= 終了）
 */
export function isValidYearRange(range: CarYearRange): boolean {
  const start = yearRangeToMonths(range);
  const end = yearRangeToMonths({ 
    start_year: range.end_year, 
    start_month: range.end_month, 
    end_year: 0, 
    end_month: 0 
  });
  
  return start <= end;
}

/**
 * 年式レンジの文字列表現を生成
 */
export function formatYearRange(range: CarYearRange): string {
  const startMonth = range.start_month.toString().padStart(2, '0');
  const endMonth = range.end_month.toString().padStart(2, '0');
  
  if (range.start_year === range.end_year && range.start_month === range.end_month) {
    return `${range.start_year}年${startMonth}月`;
  } else if (range.start_year === range.end_year) {
    return `${range.start_year}年${startMonth}月〜${endMonth}月`;
  } else {
    return `${range.start_year}年${startMonth}月〜${range.end_year}年${endMonth}月`;
  }
}

/**
 * 現在の年式レンジと新しいレンジを比較して変更を検出
 */
export function detectRangeChanges(
  oldRanges: CarYearRange[], 
  newRanges: CarYearRange[]
): {
  added: CarYearRange[];
  removed: CarYearRange[];
  modified: CarYearRange[];
} {
  const oldSorted = sortRanges(oldRanges);
  const newSorted = sortRanges(newRanges);
  
  const added: CarYearRange[] = [];
  const removed: CarYearRange[] = [];
  const modified: CarYearRange[] = [];
  
  // 新しいレンジで追加されたものを検出
  for (const newRange of newSorted) {
    const exists = oldSorted.some(oldRange => 
      oldRange.start_year === newRange.start_year &&
      oldRange.start_month === newRange.start_month &&
      oldRange.end_year === newRange.end_year &&
      oldRange.end_month === newRange.end_month
    );
    
    if (!exists) {
      added.push(newRange);
    }
  }
  
  // 古いレンジで削除されたものを検出
  for (const oldRange of oldSorted) {
    const exists = newSorted.some(newRange => 
      oldRange.start_year === newRange.start_year &&
      oldRange.start_month === newRange.start_month &&
      oldRange.end_year === newRange.end_year &&
      oldRange.end_month === newRange.end_month
    );
    
    if (!exists) {
      removed.push(oldRange);
    }
  }
  
  return { added, removed, modified };
}
