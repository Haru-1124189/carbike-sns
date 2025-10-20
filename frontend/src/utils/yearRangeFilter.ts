/**
 * 年式レンジフィルタリングユーティリティ
 * 
 * ユーザーの愛車年式が、投稿の車種年式レンジに含まれるかをチェック
 */

interface YearRange {
  start_year: number;
  start_month: number;
  end_year: number;
  end_month: number;
}

interface CarTag {
  display_name: string;
  selected_year_range_id?: string;
  selected_year_range?: YearRange;
}

/**
 * 二つの年式レンジが重複するかチェック
 * @param range1 ユーザーの愛車年式レンジ
 * @param range2 投稿の年式レンジ
 * @returns 重複する場合true
 */
export function doYearRangesOverlap(
  range1: YearRange,
  range2: YearRange
): boolean {
  const range1Start = range1.start_year * 12 + range1.start_month;
  const range1End = range1.end_year * 12 + range1.end_month;
  const range2Start = range2.start_year * 12 + range2.start_month;
  const range2End = range2.end_year * 12 + range2.end_month;

  // レンジが重複する条件：range1Start <= range2End && range2Start <= range1End
  return range1Start <= range2End && range2Start <= range1End;
}

/**
 * ユーザーの愛車と投稿がマッチするかチェック
 * @param userVehicles ユーザーの愛車リスト
 * @param postCarTags 投稿の車種タグ（年式情報含む）
 * @returns マッチする場合true
 */
export function doesPostMatchUserVehicles(
  userVehicles: Array<{
    name: string;
    selected_year_range_id?: string;
    selected_year_range?: YearRange;
  }>,
  postCarTags?: CarTag[]
): boolean {
  // 投稿にcar_tagsがない場合は、従来通り車名のみでマッチング（後方互換性）
  if (!postCarTags || postCarTags.length === 0) {
    return true; // car_tagsがない投稿はすべてのユーザーに表示
  }

  // ユーザーの愛車のいずれかが投稿の年式レンジに含まれるかチェック
  return userVehicles.some(vehicle => {
    // 投稿のcar_tagsから、ユーザーの愛車名と一致するものを探す
    return postCarTags.some(postCarTag => {
      // 車名の正規化して比較（大文字小文字を無視、スペースを削除）
      const normalizeCarName = (name: string) =>
        name.toLowerCase().replace(/\s/g, '');
      
      const vehicleNameNormalized = normalizeCarName(vehicle.name);
      const postCarNameNormalized = normalizeCarName(postCarTag.display_name);

      // 車名が一致しない場合はスキップ
      if (!postCarNameNormalized.includes(vehicleNameNormalized) &&
          !vehicleNameNormalized.includes(postCarNameNormalized)) {
        return false;
      }

      // 車名が一致した場合、年式レンジをチェック
      // 投稿に年式レンジが指定されている場合のみ年式フィルタリングを行う
      if (postCarTag.selected_year_range && vehicle.selected_year_range) {
        // 両方の年式レンジが重複するかチェック
        return doYearRangesOverlap(
          vehicle.selected_year_range,
          postCarTag.selected_year_range
        );
      }

      // 年式レンジが指定されていない場合は、車名が一致すればOK
      return true;
    });
  });
}

/**
 * スレッド/投稿をユーザーの愛車でフィルタリング
 * @param threads スレッド/投稿のリスト
 * @param userVehicles ユーザーの愛車リスト
 * @returns フィルタリングされたスレッド/投稿のリスト
 */
export function filterThreadsByUserVehicles<T extends { car_tags?: CarTag[] }>(
  threads: T[],
  userVehicles: Array<{
    name: string;
    selected_year_range_id?: string;
    selected_year_range?: YearRange;
  }>
): T[] {
  return threads.filter(thread =>
    doesPostMatchUserVehicles(userVehicles, thread.car_tags)
  );
}

