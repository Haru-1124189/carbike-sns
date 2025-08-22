export interface ReplyDoc {
  id: string;
  targetId: string;
  targetType: 'thread' | 'question' | 'maintenance';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  isDeleted?: boolean;
}
