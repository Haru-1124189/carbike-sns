export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  username?: string; // @username（メンション用、英数字のみ）
  photoURL?: string | null;
  bio?: string; // 自己紹介文（120文字制限）
  role: 'user' | 'creator' | 'admin';
  isAdmin?: boolean; // 管理者権限フラグ
  createdAt: Date;
  updatedAt: Date;
  cars: string[];
  interestedCars: string[];
  blockedUsers: string[];
  mutedWords: string[];
}
