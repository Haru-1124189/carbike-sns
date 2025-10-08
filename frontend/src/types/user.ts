export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  username?: string; // @username（メンション用、英数字のみ）
  photoURL?: string | null;
  bio?: string; // 自己紹介文（120文字制限）
  role: 'user' | 'creator' | 'admin';
  isAdmin?: boolean; // 管理者権限フラグ
  isPrivate?: boolean; // プロフィールの公開/非公開設定
  // 住所情報（プライベート情報）
  address?: {
    prefecture: string; // 都道府県
    city: string; // 市区町村
    postalCode?: string; // 郵便番号
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    notificationRadius: number; // 通知範囲（km）
    isNotificationEnabled: boolean; // 近くのツーリング通知を有効にするか
    isPrivate: boolean; // 住所情報を他のユーザーに表示するか（デフォルト: true = 非表示）
  };
  createdAt: Date;
  updatedAt: Date;
  cars: string[];
  interestedCars: string[];
  blockedUsers: string[];
  mutedWords: string[];
}
