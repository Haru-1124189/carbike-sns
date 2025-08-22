import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/init';

export interface CreateReportData {
  type: 'spam' | 'inappropriate' | 'harassment' | 'other';
  content: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: 'thread' | 'maintenance' | 'user';
  targetTitle?: string;
  targetAuthorId?: string;
  targetAuthorName?: string;
}

export const createReport = async (reportData: CreateReportData) => {
  try {
    // 通報を作成
    const reportRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    // 管理者通知を作成
    await addDoc(collection(db, 'notifications'), {
      type: 'report',
      title: '新しい通報が届きました',
      content: `${reportData.targetType === 'thread' ? '投稿' : reportData.targetType === 'maintenance' ? '整備記録' : 'ユーザー'}「${reportData.targetTitle || '無題'}」が通報されました`,
      userId: 'admin', // 管理者用の特別なID
      isRead: false,
      createdAt: Timestamp.now(),
      reportId: reportRef.id,
      reportData: {
        type: reportData.type,
        targetType: reportData.targetType,
        targetId: reportData.targetId,
        targetTitle: reportData.targetTitle,
        reporterName: reportData.reporterName,
        content: reportData.content
      }
    });
    
    return reportRef.id;
  } catch (error) {
    console.error('Error creating report:', error);
    throw new Error('レポートの作成に失敗しました');
  }
};
