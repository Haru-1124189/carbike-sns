export interface CarModel {
  id: string;
  name: string;
  backgroundImage?: string; // 愛車の背景画像
}

export interface MaintenanceRecord {
  id: string;
  title: string;
  date: string;
  description: string;
  mileage: number;
  cost: number;
}

export interface Thread {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string; // 投稿者のUID
  replies: number;
  likes: number;
  tags: string[];
  createdAt: Date | string;
  type: 'post' | 'question' | 'ad';
  adType?: 'parts' | 'video' | 'service' | 'contest' | 'event';
  vehicleKey?: string; // 車種キー
  images?: string[]; // 画像URLの配列
  isDeleted?: boolean; // 削除フラグ
  isPinned?: boolean; // 固定フラグ
  pinnedAt?: Date | string; // 固定日時
}

export interface ThreadDoc {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  replies: number;
  likes: number;
  tags: string[];
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  type: 'post' | 'question' | 'ad';
  adType?: 'parts' | 'video' | 'service' | 'contest' | 'event';
  vehicleKey?: string; // 車種キー
  isDeleted?: boolean;
  images?: string[]; // 画像URLの配列
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  author: string;
  authorId: string;
  channelId: string;
  uploadedAt: string;
  createdAt: Date;
  status: 'active' | 'hidden' | 'deleted';
  tags: string[];
  category: 'car' | 'bike' | 'maintenance' | 'review' | 'other';
}

export interface CreateVideoData {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  tags: string[];
  category: 'car' | 'bike' | 'maintenance' | 'review' | 'other';
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  subscriberCount: number;
  isSubscribed: boolean;
  description: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'like' | 'reply' | 'follow' | 'maintenance';
  isRead: boolean;
  time: string;
}

export type Theme = 'blue' | 'dark' | 'light';

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: any; // Firestore Timestamp
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isPrivate: boolean; // 鍵アカウント設定
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'car' | 'bike';
  image?: string;
  year?: number;
  make?: string;
  model?: string;
  customContent?: string;
  ownerId: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  cars: string[];
  interestedCars: string[];
}

export interface PrivateGroup {
  id: string;
  name: string;
  memberCount: number;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export interface MaintenanceStep {
  id: string;
  order: number;
  title: string;
  description: string;
  image?: string;
  tips?: string;
}

export interface MaintenancePost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string; // 投稿者のUID
  authorAvatar: string;
  carModel: string;
  carImage?: string;
  mileage: number;
  cost: number;
  workDate: string;
  category: 'engine' | 'suspension' | 'brake' | 'electrical' | 'body' | 'tire' | 'oil' | 'custom' | 'other';
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  images?: string[];
  steps: MaintenanceStep[];
  totalTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tools?: string[];
  parts?: string[];
  isPinned?: boolean; // 固定フラグ
  pinnedAt?: string; // 固定日時
}

export interface MaintenancePostDoc {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  carModel: string;
  carImage?: string;
  mileage: number;
  cost: number;
  workDate: string;
  category: 'engine' | 'suspension' | 'brake' | 'electrical' | 'body' | 'tire' | 'oil' | 'custom' | 'other';
  tags: string[];
  likes: number;
  comments: number;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  images?: string[];
  steps: MaintenanceStep[];
  totalTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tools?: string[];
  parts?: string[];
  isDeleted?: boolean;
  isPinned?: boolean; // 固定フラグ
  pinnedAt?: any; // 固定日時
}

// 動画配信申請の型定義
export interface CreatorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  channelName: string;
  channelDescription: string;
  contentCategory: 'car_review' | 'maintenance' | 'racing' | 'custom' | 'news' | 'other';
  experience: string;
  motivation: string;
  socialMediaLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  reviewedAt?: any; // Firestore Timestamp
  reviewedBy?: string; // 管理者のUID
}
