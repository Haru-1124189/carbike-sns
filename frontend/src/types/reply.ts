export interface ReplyDoc {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  isDeleted?: boolean;
}
