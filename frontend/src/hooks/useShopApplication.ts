import { useState } from 'react';
import { ShopApplicationData } from '../types/user';

interface ShopApplicationStatus {
  applicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  shopInfo?: {
    shopName: string;
    businessLicense?: string;
    taxId?: string;
    contactEmail: string;
    contactPhone?: string;
    businessAddress: {
      prefecture: string;
      city: string;
      address: string;
      postalCode: string;
    };
  };
  submittedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export const useShopApplication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 申請を送信
  const submitApplication = async (data: ShopApplicationData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shop-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '申請の送信に失敗しました');
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || '申請の送信に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 申請状況を取得
  const getApplicationStatus = async (): Promise<ShopApplicationStatus> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shop-applications');
      const data = await response.json();
      
      if (data.success && data.applications.length > 0) {
        const application = data.applications[0];
        return {
          applicationStatus: application.status,
          shopInfo: application,
          submittedAt: new Date(application.submittedAt),
          reviewedAt: application.reviewedAt ? new Date(application.reviewedAt) : undefined,
          rejectionReason: application.reviewNotes
        };
      }
      
      return { applicationStatus: 'none' };
    } catch (err: any) {
      const errorMessage = err.message || '申請状況の取得に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    submitApplication,
    getApplicationStatus,
    loading,
    error
  };
};

// 管理者用のHook
export const useAdminShopApplication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 申請一覧を取得
  const getApplications = async (status?: 'all' | 'pending' | 'approved' | 'rejected') => {
    setLoading(true);
    setError(null);

    try {
      const url = status && status !== 'all' 
        ? `/api/shop-applications?status=${status}`
        : '/api/shop-applications';
        
      const response = await fetch(url);
      const data = await response.json();
      
      return data as { success: boolean; applications: any[] };
    } catch (err: any) {
      const errorMessage = err.message || '申請一覧の取得に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 申請を審査
  const reviewApplication = async (applicationId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shop-applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status,
          reviewNotes: rejectionReason,
          reviewedBy: 'admin' // 実際の実装では認証されたユーザーIDを使用
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '申請の審査に失敗しました');
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || '申請の審査に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    getApplications,
    reviewApplication,
    loading,
    error
  };
};
