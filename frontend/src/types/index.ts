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
  isDeleted?: boolean; // 削除フラグ
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
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  author: string;
  createdAt: string;
  uploadedAt: string;
  channelId: string; // チャンネルIDを追加
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
}
