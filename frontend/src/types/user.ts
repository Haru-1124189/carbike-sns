export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'creator' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  cars: string[];
  interestedCars: string[];
  blockedUsers: string[];
  mutedWords: string[];
}
