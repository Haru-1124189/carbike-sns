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
