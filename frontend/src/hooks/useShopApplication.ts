import { getFunctions, httpsCallable } from 'firebase/functions';
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
      const functions = getFunctions();
      const submitShopApplication = httpsCallable(functions, 'submitShopApplication');
      const result = await submitShopApplication(data);
      
      return result.data;
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
      const functions = getFunctions();
      const getUserShopApplicationStatus = httpsCallable(functions, 'getUserShopApplicationStatus');
      const result = await getUserShopApplicationStatus();
      
      return result.data as ShopApplicationStatus;
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
      const functions = getFunctions();
      const getShopApplications = httpsCallable(functions, 'getShopApplications');
      const result = await getShopApplications({ status: status || 'all' });
      
      return result.data as { success: boolean; applications: any[] };
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
      const functions = getFunctions();
      const reviewShopApplication = httpsCallable(functions, 'reviewShopApplication');
      const result = await reviewShopApplication({
        applicationId,
        status,
        rejectionReason
      });
      
      return result.data;
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
