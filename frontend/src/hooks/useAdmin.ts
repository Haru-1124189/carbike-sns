import { collection, doc, getDocs, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { AdminStats, ContentManagement, Report, SystemSettings, UserManagement } from '../types/admin';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user, userDoc } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [content, setContent] = useState<ContentManagement[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 管理者権限チェック
  const isAdmin = userDoc?.isAdmin || userDoc?.role === 'admin';

  // 統計データの取得
  const fetchStats = async () => {
    if (!isAdmin) return;

    try {
      // ユーザー数
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // 投稿数
      const threadsSnapshot = await getDocs(collection(db, 'threads'));
      const maintenanceSnapshot = await getDocs(collection(db, 'maintenancePosts'));
      const totalPosts = threadsSnapshot.size + maintenanceSnapshot.size;

      // レポート数
      const reportsSnapshot = await getDocs(query(
        collection(db, 'reports'),
        where('status', '==', 'pending')
      ));
      const totalReports = reportsSnapshot.size;

      // 申請数
      const applicationsSnapshot = await getDocs(query(
        collection(db, 'creatorApplications'),
        where('status', '==', 'pending')
      ));
      const pendingApplications = applicationsSnapshot.size;

      // ダミーデータ（実際のアプリではより詳細な計算が必要）
      const stats: AdminStats = {
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.7), // 70%がアクティブと仮定
        totalPosts,
        totalReports,
        pendingApplications,
        dailyActiveUsers: Math.floor(totalUsers * 0.3), // 30%が日次アクティブと仮定
        weeklyPosts: Math.floor(totalPosts * 0.2), // 週次投稿数
        monthlyNewUsers: Math.floor(totalUsers * 0.1), // 月次新規ユーザー
      };

      setStats(stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('統計データの取得に失敗しました');
    }
  };

  // レポートの取得
  const fetchReports = () => {
    if (!isAdmin) return;

    const q = query(
      collection(db, 'reports'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const reportsData: Report[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reportsData.push({
          id: doc.id,
          type: data.type || 'other',
          content: data.content || '',
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate() || new Date(),
          reporterId: data.reporterId || '',
          reporterName: data.reporterName || '',
          targetId: data.targetId || '',
          targetType: data.targetType || 'thread',
          targetTitle: data.targetTitle,
          targetAuthorId: data.targetAuthorId,
          targetAuthorName: data.targetAuthorName,
          adminNotes: data.adminNotes,
          resolvedAt: data.resolvedAt?.toDate(),
          resolvedBy: data.resolvedBy,
        });
      });
      setReports(reportsData);
    });
  };

  // ユーザー管理データの取得
  const fetchUsers = async () => {
    if (!isAdmin) return;

    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData: UserManagement[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          uid: doc.id,
          displayName: data.displayName || '',
          email: data.email || '',
          photoURL: data.photoURL,
          role: data.role || 'user',
          isAdmin: data.isAdmin || false,
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate() || new Date(),
          lastActiveAt: data.lastActiveAt?.toDate() || new Date(),
          totalPosts: data.totalPosts || 0,
          totalReports: data.totalReports || 0,
          suspensionReason: data.suspensionReason,
          suspensionEndDate: data.suspensionEndDate?.toDate(),
        });
      });

      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('ユーザーデータの取得に失敗しました');
    }
  };

  // コンテンツ管理データの取得
  const fetchContent = async () => {
    if (!isAdmin) return;

    try {
      const contentData: ContentManagement[] = [];

      // スレッドの取得
      const threadsSnapshot = await getDocs(collection(db, 'threads'));
      threadsSnapshot.forEach((doc) => {
        const data = doc.data();
        contentData.push({
          id: doc.id,
          type: 'thread',
          title: data.title || '',
          content: data.content || '',
          authorId: data.authorId || '',
          authorName: data.authorName || '',
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          likeCount: data.likeCount || 0,
          replyCount: data.replyCount || 0,
          reportCount: data.reportCount || 0,
          hiddenAt: data.hiddenAt?.toDate(),
          hiddenBy: data.hiddenBy,
          hiddenReason: data.hiddenReason,
          deletedAt: data.deletedAt?.toDate(),
          deletedBy: data.deletedBy,
          deleteReason: data.deleteReason,
        });
      });

      // メンテナンス投稿の取得
      const maintenanceSnapshot = await getDocs(collection(db, 'maintenancePosts'));
      maintenanceSnapshot.forEach((doc) => {
        const data = doc.data();
        contentData.push({
          id: doc.id,
          type: 'maintenance',
          title: data.title || '',
          content: data.content || '',
          authorId: data.authorId || '',
          authorName: data.authorName || '',
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          likeCount: data.likeCount || 0,
          replyCount: data.replyCount || 0,
          reportCount: data.reportCount || 0,
          hiddenAt: data.hiddenAt?.toDate(),
          hiddenBy: data.hiddenBy,
          hiddenReason: data.hiddenReason,
          deletedAt: data.deletedAt?.toDate(),
          deletedBy: data.deletedBy,
          deleteReason: data.deleteReason,
        });
      });

      setContent(contentData);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('コンテンツデータの取得に失敗しました');
    }
  };

  // システム設定の取得
  const fetchSystemSettings = async () => {
    if (!isAdmin) return;

    try {
      const settingsDoc = await getDocs(collection(db, 'systemSettings'));
      if (!settingsDoc.empty) {
        const data = settingsDoc.docs[0].data();
        setSystemSettings({
          maintenanceMode: data.maintenanceMode || false,
          newUserRegistration: data.newUserRegistration !== false, // デフォルトはtrue
          autoModeration: data.autoModeration || false,
          maxPostsPerDay: data.maxPostsPerDay || 10,
          maxReportsPerUser: data.maxReportsPerUser || 5,
          contentFilterLevel: data.contentFilterLevel || 'medium',
        });
      } else {
        // デフォルト設定
        setSystemSettings({
          maintenanceMode: false,
          newUserRegistration: true,
          autoModeration: false,
          maxPostsPerDay: 10,
          maxReportsPerUser: 5,
          contentFilterLevel: 'medium',
        });
      }
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError('システム設定の取得に失敗しました');
    }
  };

  // レポートのステータス更新
  const updateReportStatus = async (reportId: string, status: 'pending' | 'reviewed' | 'resolved', adminNotes?: string) => {
    if (!isAdmin) throw new Error('管理者権限が必要です');

    try {
      const reportRef = doc(db, 'reports', reportId);
      const updateData: any = {
        status,
        resolvedAt: status === 'resolved' ? Timestamp.now() : null,
        resolvedBy: status === 'resolved' ? user?.uid : null,
      };
      
      // adminNotesがundefinedでない場合のみ追加
      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes;
      }
      
      await updateDoc(reportRef, updateData);
    } catch (err) {
      console.error('Error updating report status:', err);
      throw new Error('レポートの更新に失敗しました');
    }
  };

  // ユーザーのステータス更新
  const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'banned', reason?: string) => {
    if (!isAdmin) throw new Error('管理者権限が必要です');

    try {
      const userRef = doc(db, 'users', userId);
      const updateData: any = {
        status,
        suspensionEndDate: status === 'suspended' ? Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) : null, // 7日間
      };
      
      // reasonがundefinedでない場合のみ追加
      if (reason !== undefined) {
        updateData.suspensionReason = reason;
      }
      
      await updateDoc(userRef, updateData);
    } catch (err) {
      console.error('Error updating user status:', err);
      throw new Error('ユーザー状態の更新に失敗しました');
    }
  };

  // コンテンツのステータス更新
  const updateContentStatus = async (contentId: string, type: 'thread' | 'maintenance', status: 'active' | 'hidden' | 'deleted', reason?: string) => {
    if (!isAdmin) throw new Error('管理者権限が必要です');

    try {
      const collectionName = type === 'thread' ? 'threads' : 'maintenancePosts';
      const contentRef = doc(db, collectionName, contentId);
      
      const updateData: any = { status };
      if (status === 'hidden') {
        updateData.hiddenAt = Timestamp.now();
        updateData.hiddenBy = user?.uid;
        if (reason !== undefined) {
          updateData.hiddenReason = reason;
        }
      } else if (status === 'deleted') {
        updateData.deletedAt = Timestamp.now();
        updateData.deletedBy = user?.uid;
        if (reason !== undefined) {
          updateData.deleteReason = reason;
        }
      }

      await updateDoc(contentRef, updateData);
    } catch (err) {
      console.error('Error updating content status:', err);
      throw new Error('コンテンツ状態の更新に失敗しました');
    }
  };

  // システム設定の更新
  const updateSystemSettings = async (settings: Partial<SystemSettings>) => {
    if (!isAdmin) throw new Error('管理者権限が必要です');

    try {
      const settingsRef = doc(db, 'systemSettings', 'main');
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: Timestamp.now(),
        updatedBy: user?.uid,
      });
      
      // ローカル状態も更新
      if (systemSettings) {
        setSystemSettings({ ...systemSettings, ...settings });
      }
    } catch (err) {
      console.error('Error updating system settings:', err);
      throw new Error('システム設定の更新に失敗しました');
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchStats(),
          fetchUsers(),
          fetchContent(),
          fetchSystemSettings(),
        ]);

        // レポートはリアルタイム更新
        const unsubscribe = fetchReports();
        
        setLoading(false);
        return unsubscribe;
      } catch (err) {
        setLoading(false);
        setError('データの読み込みに失敗しました');
      }
    };

    loadData();
  }, [isAdmin]);

  return {
    isAdmin,
    stats,
    reports,
    users,
    content,
    systemSettings,
    loading,
    error,
    updateReportStatus,
    updateUserStatus,
    updateContentStatus,
    updateSystemSettings,
    refreshData: () => {
      fetchStats();
      fetchUsers();
      fetchContent();
      fetchSystemSettings();
    },
  };
};
