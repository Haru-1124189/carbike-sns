import { getFunctions, httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { CreatorApplication } from '../types';

// Firebase Functionsの戻り値の型定義
interface CreatorApplicationStatusResponse {
  success: boolean;
  hasApplication: boolean;
  applicationStatus: string;
  application?: CreatorApplication;
}

interface CreatorApplicationsResponse {
  success: boolean;
  applications: CreatorApplication[];
}

export const useCreatorApplication = (userId?: string) => {
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [userApplication, setUserApplication] = useState<CreatorApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ユーザーの申請状況を取得
  useEffect(() => {
    if (!userId) return;

    const fetchApplicationStatus = async () => {
      try {
        const functions = getFunctions();
        const getUserCreatorApplicationStatus = httpsCallable(functions, 'getUserCreatorApplicationStatus');
        const result = await getUserCreatorApplicationStatus();
        
        const data = result.data as CreatorApplicationStatusResponse;
        if (data && data.hasApplication) {
          setUserApplication(data.application || null);
        } else {
          setUserApplication(null);
        }
      } catch (err: any) {
        console.error('Error fetching creator application status:', err);
        setError(err.message);
      }
    };

    fetchApplicationStatus();
  }, [userId]);

  // 新しい申請を作成
  const createApplication = async (applicationData: Omit<CreatorApplication, 'id' | 'userId' | 'userName' | 'userEmail' | 'userAvatar' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) {
      throw new Error('ユーザーIDが必要です');
    }

    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      const submitCreatorApplication = httpsCallable(functions, 'submitCreatorApplication');
      const result = await submitCreatorApplication(applicationData);
      
      // 申請状況を再取得
      const getUserCreatorApplicationStatus = httpsCallable(functions, 'getUserCreatorApplicationStatus');
      const statusResult = await getUserCreatorApplicationStatus();
      
      const statusData = statusResult.data as CreatorApplicationStatusResponse;
      if (statusData && statusData.hasApplication) {
        setUserApplication(statusData.application || null);
      }

      return result.data;
    } catch (err: any) {
      console.error('Error creating creator application:', err);
      
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

  // 管理者用：すべての申請を取得
  const getAllApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      const getCreatorApplications = httpsCallable(functions, 'getCreatorApplications');
      const result = await getCreatorApplications();
      
      const data = result.data as CreatorApplicationsResponse;
      if (data && data.applications) {
        setApplications(data.applications);
        return data.applications;
      }
      return [];
    } catch (err: any) {
      console.error('Error fetching all creator applications:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 管理者用：申請を承認/拒否
  const reviewApplication = async (applicationId: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      const reviewCreatorApplication = httpsCallable(functions, 'reviewCreatorApplication');
      const result = await reviewCreatorApplication({
        applicationId,
        status,
        adminNotes
      });
      
      // 申請一覧を更新
      await getAllApplications();
      
      return result.data;
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
    getAllApplications,
    reviewApplication,
  };
};
