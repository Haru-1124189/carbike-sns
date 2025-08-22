export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: 'user' | 'creator' | 'admin';
  isAdmin?: boolean; // 管理者権限フラグ
  createdAt: Date;
  updatedAt: Date;
  cars: string[];
  interestedCars: string[];
  blockedUsers: string[];
  mutedWords: string[];
}
