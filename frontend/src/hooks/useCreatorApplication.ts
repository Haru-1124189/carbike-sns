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
        const response = await fetch(`/api/creator-applications?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.applications.length > 0) {
          setUserApplication(data.applications[0]);
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
      const response = await fetch('/api/creator-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...applicationData
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 申請状況を再取得
        const statusResponse = await fetch(`/api/creator-applications?userId=${userId}`);
        const statusData = await statusResponse.json();
        
        if (statusData.success && statusData.applications.length > 0) {
          setUserApplication(statusData.applications[0]);
        }
      }

      return result;
    } catch (err: any) {
      console.error('Error creating creator application:', err);
      
      let errorMessage = '申請の作成に失敗しました';
      if (err.message) {
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
      const response = await fetch('/api/creator-applications');
      const data = await response.json();
      
      if (data.success && data.applications) {
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
      const response = await fetch('/api/creator-applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status,
          reviewNotes: adminNotes,
          reviewedBy: 'admin' // 実際の実装では認証されたユーザーIDを使用
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 申請一覧を更新
        await getAllApplications();
      }
      
      return result;
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
