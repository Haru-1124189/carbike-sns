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
  // Shop申請関連
  shopApplication?: {
    status: 'none' | 'pending' | 'approved' | 'rejected'; // 申請状態
    submittedAt?: Date; // 申請日時
    reviewedAt?: Date; // 審査日時
    reviewedBy?: string; // 審査者UID
    rejectionReason?: string; // 却下理由
  };
  // Shop情報（承認後）
  shopInfo?: {
    shopName: string; // 屋号・店舗名
    businessLicense?: string; // 事業許可番号
    taxId?: string; // 税務署届出番号
    contactEmail: string; // 連絡先メール
    contactPhone?: string; // 連絡先電話番号
    businessAddress: {
      prefecture: string;
      city: string;
      address: string;
      postalCode: string;
    };
  };
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

// Shop申請フォームデータ
export interface ShopApplicationData {
  shopName: string; // 屋号・店舗名
  businessLicense?: string; // 事業許可番号
  taxId?: string; // 税務署届出番号
  contactEmail: string; // 連絡先メール
  contactPhone?: string; // 連絡先電話番号
  businessAddress: {
    prefecture: string;
    city: string;
    address: string;
    postalCode: string;
  };
  businessDescription: string; // 事業内容説明
  reasonForApplication: string; // 申請理由
}
