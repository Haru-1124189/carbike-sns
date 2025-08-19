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
}
