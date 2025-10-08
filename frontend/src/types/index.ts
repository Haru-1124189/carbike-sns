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
  // 分析データ
  analytics?: VideoAnalytics;
}

export interface VideoAnalytics {
  // 基本統計
  totalViews: number;
  totalWatchTime: number; // 秒単位
  averageWatchTime: number; // 秒単位
  revenue: number; // 収益（円）
  
  // 時間帯別データ
  hourlyViews: HourlyViewData[];
  
  // 日別データ（過去30日）
  dailyViews: DailyViewData[];
  
  // エンゲージメント
  likeRate: number; // いいね率（いいね数/視聴回数）
  shareCount: number;
  commentCount: number;
  
  // 最後に更新された日時
  lastUpdated: Date;
}

export interface HourlyViewData {
  hour: number; // 0-23
  views: number;
  watchTime: number; // 秒単位
}

export interface DailyViewData {
  date: string; // YYYY-MM-DD形式
  views: number;
  watchTime: number; // 秒単位
  revenue: number; // 円
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

// ツーリング募集関連の型定義
export interface TouringThread {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  prefecture: string;
  location: string;
  touringDate: string; // ISO string
  applicationDeadline: string; // ISO string
  maxParticipants?: number;
  currentParticipants: number;
  participants: string[]; // 参加者UIDの配列
  replies: number;
  likes: number;
  tags: string[];
  status: 'active' | 'closed' | 'completed' | 'cancelled';
  chatRoomId?: string; // 締切後に作成されるチャットルームID
  createdAt: Date;
  updatedAt: Date;
}

export interface TouringChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: Date;
}

export interface TouringChatRoom {
  id: string;
  touringThreadId: string;
  participants: string[]; // 参加者UIDの配列
  createdAt: Date;
  expiresAt: Date; // ツーリング日時後に自動削除
  status: 'active' | 'expired' | 'deleted';
}

export interface TouringReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
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
  // 住所情報
  address?: UserAddress;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface UserAddress {
  prefecture: string; // 都道府県
  city: string; // 市区町村
  postalCode?: string; // 郵便番号
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  notificationRadius: number; // 通知範囲（km）
  isNotificationEnabled: boolean; // 近くのツーリング通知を有効にするか
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

// 通知関連の型定義
export interface NotificationDoc {
  id: string;
  userId: string; // 通知を受け取るユーザーのUID
  type: 'like' | 'reply' | 'follow' | 'maintenance' | 'vehicle_request' | 'nearby_touring' | 'contact_reply';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  
  // 通知に関連するデータ
  targetId?: string; // いいね/返信された投稿のID
  targetType?: 'thread' | 'question' | 'maintenance' | 'touring'; // 投稿の種類
  fromUserId?: string; // 通知を送ったユーザーのUID
  fromUserName?: string; // 通知を送ったユーザーの名前
  
  // フォロー通知用のデータ
  followData?: {
    followerId: string;
    followerName: string;
  };
  
  // 車種申請通知用のデータ
  requestData?: {
    maker: string;
    model: string;
    year: string;
    notes: string;
  };
  
  // 近くのツーリング通知用のデータ
  data?: {
    threadId?: string;
    prefecture?: string;
    location?: string;
    touringDate?: string;
    [key: string]: any;
  };
}

export interface CreateNotificationData {
  userId: string;
  type: 'like' | 'reply' | 'follow' | 'maintenance' | 'vehicle_request' | 'nearby_touring' | 'contact_reply';
  title: string;
  content: string;
  targetId?: string;
  targetType?: 'thread' | 'question' | 'maintenance' | 'touring';
  fromUserId?: string;
  fromUserName?: string;
  requestData?: {
    maker: string;
    model: string;
    year: string;
    notes: string;
  };
  data?: {
    threadId?: string;
    prefecture?: string;
    location?: string;
    touringDate?: string;
    [key: string]: any;
  };
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  published: string;
  source: string;
  thumbnailUrl?: string;
  createdAt: Date;
}
