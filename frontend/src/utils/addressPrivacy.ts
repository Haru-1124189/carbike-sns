import { UserDoc } from '../types/user';

/**
 * 住所情報をプライバシー設定に基づいて表示用にフォーマットする
 * @param userDoc ユーザードキュメント
 * @param currentUserId 現在のユーザーID（自分の場合は詳細表示）
 * @returns 表示用の住所情報（プライベートの場合は制限された情報のみ）
 */
export const getDisplayAddress = (userDoc: UserDoc | null, currentUserId?: string): string | null => {
  if (!userDoc?.address) {
    return null;
  }

  // 自分のプロフィールの場合は詳細表示
  if (currentUserId && userDoc.uid === currentUserId) {
    return `${userDoc.address.prefecture} ${userDoc.address.city}`;
  }

  // プライバシー設定で住所が非表示の場合は制限された情報のみ表示
  if (userDoc.address.isPrivate) {
    return userDoc.address.prefecture; // 都道府県のみ表示
  }

  // プライバシー設定で住所が表示可能な場合は詳細表示
  return `${userDoc.address.prefecture} ${userDoc.address.city}`;
};

/**
 * 住所情報がプライベートかどうかを確認
 * @param userDoc ユーザードキュメント
 * @param currentUserId 現在のユーザーID
 * @returns 住所情報がプライベートかどうか
 */
export const isAddressPrivate = (userDoc: UserDoc | null, currentUserId?: string): boolean => {
  if (!userDoc?.address) {
    return true; // 住所情報がない場合はプライベート扱い
  }

  // 自分のプロフィールの場合は常に表示可能
  if (currentUserId && userDoc.uid === currentUserId) {
    return false;
  }

  // ユーザーのプライバシー設定に従う
  return userDoc.address.isPrivate;
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
