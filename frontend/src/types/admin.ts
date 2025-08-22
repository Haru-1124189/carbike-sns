export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalReports: number;
  pendingApplications: number;
  dailyActiveUsers: number;
  weeklyPosts: number;
  monthlyNewUsers: number;
}

export interface Report {
  id: string;
  type: 'spam' | 'inappropriate' | 'harassment' | 'other';
  content: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: 'thread' | 'maintenance' | 'user';
  targetTitle?: string;
  targetAuthorId?: string;
  targetAuthorName?: string;
  adminNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  newUserRegistration: boolean;
  autoModeration: boolean;
  maxPostsPerDay: number;
  maxReportsPerUser: number;
  contentFilterLevel: 'low' | 'medium' | 'high';
}

export interface UserManagement {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'creator' | 'admin';
  isAdmin?: boolean;
  status: 'active' | 'suspended' | 'banned';
  createdAt: Date;
  lastActiveAt: Date;
  totalPosts: number;
  totalReports: number;
  suspensionReason?: string;
  suspensionEndDate?: Date;
}

export interface ContentManagement {
  id: string;
  type: 'thread' | 'maintenance';
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  status: 'active' | 'hidden' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  replyCount: number;
  reportCount: number;
  hiddenAt?: Date;
  hiddenBy?: string;
  hiddenReason?: string;
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
}
