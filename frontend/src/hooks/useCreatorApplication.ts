import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { CreatorApplication } from '../types';

export const useCreatorApplication = (userId?: string) => {
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [userApplication, setUserApplication] = useState<CreatorApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ユーザーの申請を取得
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'creatorApplications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps: CreatorApplication[] = [];
      snapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() } as CreatorApplication);
      });
      setApplications(apps);
      setUserApplication(apps[0] || null); // 最新の申請を取得
    }, (err) => {
      console.error('Error fetching creator applications:', err);
      setError(err.message);
    });

    return () => unsubscribe();
  }, [userId]);

  // 新しい申請を作成
  const createApplication = async (applicationData: Omit<CreatorApplication, 'id' | 'userId' | 'userName' | 'userEmail' | 'userAvatar' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) {
      throw new Error('ユーザーIDが必要です');
    }

    setLoading(true);
    setError(null);

    try {
      // ユーザーデータを取得
      let userData = null;
      try {
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
        userData = userDoc.docs[0]?.data();
        console.log('User data retrieved:', userData);
      } catch (userErr) {
        console.warn('Failed to retrieve user data:', userErr);
        // ユーザーデータの取得に失敗しても申請は続行
      }

      // ユーザーデータが取得できない場合は、基本的な情報のみで作成
      const newApplication = {
        ...applicationData,
        userId,
        userName: userData?.displayName || 'ユーザー',
        userEmail: userData?.email || '',
        userAvatar: userData?.photoURL || '',
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('Creating application with data:', newApplication);
      const docRef = await addDoc(collection(db, 'creatorApplications'), newApplication);
      console.log('Application created successfully:', docRef.id);
      return docRef.id;
    } catch (err: any) {
      console.error('Error creating creator application:', err);
      
      // より詳細なエラーメッセージを提供
      let errorMessage = '申請の作成に失敗しました';
      if (err.code === 'permission-denied') {
        errorMessage = '権限がありません。ログイン状態を確認してください。';
      } else if (err.code === 'unavailable') {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 申請を更新
  const updateApplication = async (applicationId: string, updates: Partial<CreatorApplication>) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'creatorApplications', applicationId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error updating creator application:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 管理者用：すべての申請を取得
  const getAllApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'creatorApplications'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const apps: CreatorApplication[] = [];
      snapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() } as CreatorApplication);
      });
      return apps;
    } catch (err: any) {
      console.error('Error fetching all creator applications:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 管理者用：申請を承認/拒否
  const reviewApplication = async (applicationId: string, status: 'approved' | 'rejected', adminNotes?: string, adminUserId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'creatorApplications', applicationId);
      await updateDoc(docRef, {
        status,
        adminNotes,
        reviewedAt: serverTimestamp(),
        reviewedBy: adminUserId,
        updatedAt: serverTimestamp(),
      });

      // 承認された場合、ユーザーのロールを更新
      if (status === 'approved') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          const userRef = doc(db, 'users', application.userId);
          await updateDoc(userRef, {
            role: 'creator',
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (err: any) {
      console.error('Error reviewing creator application:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    applications,
    userApplication,
    loading,
    error,
    createApplication,
    updateApplication,
    getAllApplications,
    reviewApplication,
  };
};
