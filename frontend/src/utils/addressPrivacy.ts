import { UserDoc } from '../types/user';

/**
 * 住所情報をプライバシー設定に基づいて表示用にフォーマットする
 * @param userDoc ユーザードキュメント
 * @param currentUserId 現在のユーザーID（自分の場合は詳細表示）
 * @returns 表示用の住所情報（プライベートの場合は制限された情報のみ）
 */
export const getDisplayAddress = (userDoc: UserDoc | null, currentUserId?: string): string | null => {
  // プライバシー保護のため、住所情報は一切表示しない
  return null;
};

/**
 * 住所情報がプライベートかどうかを確認
 * @param userDoc ユーザードキュメント
 * @param currentUserId 現在のユーザーID
 * @returns 住所情報がプライベートかどうか
 */
export const isAddressPrivate = (userDoc: UserDoc | null, currentUserId?: string): boolean => {
  // プライバシー保護のため、住所情報は常にプライベート扱い
  return true;
};

/**
 * 通知用の住所情報を取得（通知システム内部でのみ使用）
 * @param userDoc ユーザードキュメント
 * @returns 通知用の住所情報
 */
export const getNotificationAddress = (userDoc: UserDoc | null) => {
  if (!userDoc?.address) {
    return null;
  }

  return {
    prefecture: userDoc.address.prefecture,
    city: userDoc.address.city,
    notificationRadius: userDoc.address.notificationRadius,
    isNotificationEnabled: userDoc.address.isNotificationEnabled
  };
};
