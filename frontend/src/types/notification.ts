export interface NotificationDoc {
  id: string;
  userId: string; // 通知を受け取るユーザーのUID
  type: 'like' | 'reply' | 'follow' | 'maintenance';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  
  // 通知に関連するデータ
  targetId?: string; // いいね/返信された投稿のID
  targetType?: 'thread' | 'question' | 'maintenance'; // 投稿の種類
  fromUserId?: string; // 通知を送ったユーザーのUID
  fromUserName?: string; // 通知を送ったユーザーの名前
}

export interface CreateNotificationData {
  userId: string;
  type: 'like' | 'reply' | 'follow' | 'maintenance';
  title: string;
  content: string;
  targetId?: string;
  targetType?: 'thread' | 'question' | 'maintenance';
  fromUserId?: string;
  fromUserName?: string;
}
